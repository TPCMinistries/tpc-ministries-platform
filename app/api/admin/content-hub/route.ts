import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { getContentType, CONTENT_TYPES, generateSlug } from '@/lib/content/content-types'

export const dynamic = 'force-dynamic'

// GET - List content by type
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createAdminClient()

    // If type specified, query that table
    if (type) {
      const config = getContentType(type)
      if (!config) {
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
      }

      let query = supabase
        .from(config.table)
        .select('*', { count: 'exact' })

      if (search) {
        query = query.ilike(config.titleField, `%${search}%`)
      }

      const start = (page - 1) * limit
      query = query
        .order('created_at', { ascending: false })
        .range(start, start + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error(`Error fetching ${type}:`, error)
        return NextResponse.json({ error: `Failed to fetch ${type}` }, { status: 500 })
      }

      return NextResponse.json({
        data: (data || []).map(item => ({ ...item, _type: type })),
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      })
    }

    // If no type, fetch recent from all types
    const allContent: any[] = []
    for (const config of CONTENT_TYPES) {
      const { data } = await supabase
        .from(config.table)
        .select(`id, ${config.titleField}, created_at, updated_at`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        allContent.push(...data.map(item => ({
          ...item,
          _type: config.id,
          _title: item[config.titleField],
          _table: config.table,
        })))
      }
    }

    // Sort by created_at desc
    allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      data: allContent.slice(0, 50),
      types: CONTENT_TYPES.map(t => ({ id: t.id, label: t.label, pluralLabel: t.pluralLabel, icon: t.icon })),
    })
  } catch (error) {
    console.error('Content hub list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create content in appropriate table
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { type, ...fields } = body

    const config = getContentType(type)
    if (!config) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    // Build insert data from config fields
    const insertData: Record<string, any> = {}
    for (const field of config.fields) {
      if (fields[field.name] !== undefined) {
        insertData[field.name] = fields[field.name]
      }
    }

    // Handle rich text: if body field has HTML, store format
    if (config.formatField && insertData[config.bodyField]) {
      insertData[config.formatField] = 'html'
    }
    if (config.bodyHtmlField && insertData[config.bodyField]) {
      insertData[config.bodyHtmlField] = insertData[config.bodyField]
    }

    // Auto-generate slug
    if (config.slugField && !insertData[config.slugField] && insertData[config.titleField]) {
      insertData[config.slugField] = generateSlug(insertData[config.titleField])
    }

    // Set published date
    if (config.publishedField && !insertData[config.publishedField]) {
      insertData[config.publishedField] = new Date().toISOString()
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from(config.table)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Content create error:', error)
      return NextResponse.json({ error: 'Failed to create content', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { ...data, _type: type } }, { status: 201 })
  } catch (error) {
    console.error('Content hub create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
