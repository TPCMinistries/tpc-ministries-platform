import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactId, name, email, phone, whatsapp, organization, role, city, region, notes } = body

    // Validate contactId is required
    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }

    // Build update object with only provided (non-empty) fields
    const updateData: Record<string, string> = {}

    if (name && name.trim()) updateData.name = name.trim()
    if (email && email.trim()) updateData.email = email.trim()
    if (phone && phone.trim()) updateData.phone = phone.trim()
    if (whatsapp && whatsapp.trim()) updateData.whatsapp = whatsapp.trim()
    if (organization && organization.trim()) updateData.organization = organization.trim()
    if (role && role.trim()) updateData.role = role.trim()
    if (city && city.trim()) updateData.city = city.trim()
    if (region && region.trim()) updateData.region = region.trim()
    if (notes && notes.trim()) updateData.notes = notes.trim()

    // At least one field must be provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Validate contactId exists
    const { data: contact, error: contactError } = await adminClient
      .from('kenya_trip_contacts')
      .select('id')
      .eq('id', contactId)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Update the contact with provided fields
    const { error: updateError } = await adminClient
      .from('kenya_trip_contacts')
      .update(updateData)
      .eq('id', contactId)

    if (updateError) {
      console.error('Error updating partner info:', updateError)
      return NextResponse.json({ error: 'Failed to update contact information' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Partner info form error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
