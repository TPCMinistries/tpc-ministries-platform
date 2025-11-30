import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to check admin status
async function checkAdminStatus(supabase: any, userId: string) {
  const { data: adminMember } = await supabase
    .from('members')
    .select('is_admin')
    .eq('user_id', userId)
    .single()

  return adminMember?.is_admin === true
}

// Parse CSV content
function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
  const rows = lines.slice(1).map(line => {
    // Handle quoted values with commas
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''))
    return values
  })

  return { headers, rows }
}

// Map CSV headers to member fields
function mapHeaders(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}

  headers.forEach((header, index) => {
    // Normalize common variations
    const normalized = header.toLowerCase().replace(/[_\s-]/g, '')

    if (['firstname', 'first', 'fname'].includes(normalized)) {
      mapping['first_name'] = index
    } else if (['lastname', 'last', 'lname'].includes(normalized)) {
      mapping['last_name'] = index
    } else if (['email', 'emailaddress'].includes(normalized)) {
      mapping['email'] = index
    } else if (['phone', 'phonenumber', 'mobile', 'cell'].includes(normalized)) {
      mapping['phone'] = index
    } else if (['tier', 'level', 'membership', 'membershiplevel'].includes(normalized)) {
      mapping['tier'] = index
    } else if (['admin', 'isadmin', 'administrator'].includes(normalized)) {
      mapping['is_admin'] = index
    } else if (['notes', 'note', 'comments'].includes(normalized)) {
      mapping['notes'] = index
    } else if (['tags', 'tag'].includes(normalized)) {
      mapping['tags'] = index
    }
  })

  return mapping
}

// Validate tier value
function normalizeTier(value: string): string {
  const normalized = value.toLowerCase().trim()
  if (['covenant', 'premium', 'annual'].includes(normalized)) return 'covenant'
  if (['partner', 'monthly', 'paid'].includes(normalized)) return 'partner'
  return 'free'
}

// Parse boolean value
function parseBoolean(value: string): boolean {
  const normalized = value.toLowerCase().trim()
  return ['true', 'yes', '1', 'y'].includes(normalized)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminStatus(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    // Read file content
    const content = await file.text()
    const { headers, rows } = parseCSV(content)
    const headerMapping = mapHeaders(headers)

    // Validate required fields
    if (headerMapping['first_name'] === undefined ||
        headerMapping['last_name'] === undefined ||
        headerMapping['email'] === undefined) {
      return NextResponse.json({
        success: false,
        error: 'CSV must contain first_name, last_name, and email columns'
      }, { status: 400 })
    }

    // Fetch existing tags for tag matching
    const { data: existingTags } = await supabase
      .from('tags')
      .select('id, name')

    const tagMap = new Map(existingTags?.map(t => [t.name.toLowerCase(), t.id]) || [])

    // Process rows
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // Account for header row and 0-indexing

      try {
        const firstName = row[headerMapping['first_name']]?.trim()
        const lastName = row[headerMapping['last_name']]?.trim()
        const email = row[headerMapping['email']]?.trim().toLowerCase()

        if (!firstName || !lastName || !email) {
          results.errors.push(`Row ${rowNum}: Missing required fields`)
          results.skipped++
          continue
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          results.errors.push(`Row ${rowNum}: Invalid email format`)
          results.skipped++
          continue
        }

        // Check for existing email
        const { data: existing } = await supabase
          .from('members')
          .select('id')
          .eq('email', email)
          .single()

        if (existing) {
          results.errors.push(`Row ${rowNum}: Email ${email} already exists`)
          results.skipped++
          continue
        }

        // Build member object
        const memberData: Record<string, any> = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }

        if (headerMapping['phone'] !== undefined) {
          memberData.phone = row[headerMapping['phone']]?.trim() || null
        }
        if (headerMapping['tier'] !== undefined) {
          memberData.tier = normalizeTier(row[headerMapping['tier']] || '')
        } else {
          memberData.tier = 'free'
        }
        if (headerMapping['is_admin'] !== undefined) {
          memberData.is_admin = parseBoolean(row[headerMapping['is_admin']] || '')
        }
        if (headerMapping['notes'] !== undefined) {
          memberData.notes = row[headerMapping['notes']]?.trim() || null
        }

        // Insert member
        const { data: newMember, error: memberError } = await supabase
          .from('members')
          .insert(memberData)
          .select()
          .single()

        if (memberError) {
          results.errors.push(`Row ${rowNum}: ${memberError.message}`)
          results.skipped++
          continue
        }

        // Handle tags if provided
        if (headerMapping['tags'] !== undefined && newMember) {
          const tagNames = row[headerMapping['tags']]?.split(';').map(t => t.trim().toLowerCase()) || []
          const tagIds: string[] = []

          for (const tagName of tagNames) {
            if (tagName && tagMap.has(tagName)) {
              tagIds.push(tagMap.get(tagName)!)
            }
          }

          if (tagIds.length > 0) {
            const tagInserts = tagIds.map(tagId => ({
              member_id: newMember.id,
              tag_id: tagId
            }))
            await supabase.from('member_tags').insert(tagInserts)
          }
        }

        results.imported++
      } catch (error) {
        results.errors.push(`Row ${rowNum}: Unexpected error`)
        results.skipped++
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        imported: results.imported,
        skipped: results.skipped,
        total: rows.length,
        errors: results.errors.slice(0, 10) // Limit errors shown
      }
    })
  } catch (error) {
    console.error('Error importing members:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import members' },
      { status: 500 }
    )
  }
}
