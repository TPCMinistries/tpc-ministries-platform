import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface RegistrationMember {
  first_name: string | null
  last_name: string | null
  email: string | null
  phone?: string | null
  tier?: string | null
}

interface RegistrationRow {
  id: string
  user_id: string | null
  attendance_type: string | null
  status: string | null
  registered_at: string | null
  notes: string | null
  members: RegistrationMember | RegistrationMember[] | null
}

interface CheckinRow {
  member_id: string | null
  checked_in_at: string | null
  check_in_method: string | null
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

function fileSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'event'
}

export async function GET(_request: Request, { params }: { params: { eventId: string } }) {
  const authResult = await requireStaff()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (!uuidPattern.test(params.eventId)) {
    return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const [{ data: event, error: eventError }, { data: registrations, error: registrationsError }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, start_time')
      .eq('id', params.eventId)
      .maybeSingle(),
    supabase
      .from('event_registrations')
      .select(`
        id,
        user_id,
        attendance_type,
        status,
        registered_at,
        notes,
        members:user_id (
          first_name,
          last_name,
          email,
          phone,
          tier
        )
      `)
      .eq('event_id', params.eventId)
      .order('registered_at', { ascending: true }),
  ])

  if (eventError) {
    console.error('Registration export event lookup failed:', eventError)
    return NextResponse.json({ error: 'Unable to load event' }, { status: 500 })
  }

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (registrationsError) {
    console.error('Registration export lookup failed:', registrationsError)
    return NextResponse.json({ error: 'Unable to load registrations' }, { status: 500 })
  }

  const memberIds = ((registrations || []) as RegistrationRow[])
    .map(registration => registration.user_id)
    .filter((id): id is string => Boolean(id))

  const { data: checkins, error: checkinsError } = memberIds.length > 0
    ? await supabase
        .from('event_checkins')
        .select('member_id, checked_in_at, check_in_method')
        .eq('event_id', params.eventId)
        .in('member_id', memberIds)
    : { data: [], error: null }

  if (checkinsError) {
    console.error('Registration export check-in lookup failed:', checkinsError)
    return NextResponse.json({ error: 'Unable to load check-ins' }, { status: 500 })
  }

  const checkinsByMember = ((checkins || []) as CheckinRow[]).reduce<Record<string, CheckinRow>>((acc, checkin) => {
    if (checkin.member_id) acc[checkin.member_id] = checkin
    return acc
  }, {})

  const rows = [
    [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Tier',
      'Attendance Type',
      'Registration Status',
      'Registered At',
      'Checked In',
      'Checked In At',
      'Check-In Method',
      'Notes',
    ],
    ...((registrations || []) as RegistrationRow[]).map(registration => {
      const member = Array.isArray(registration.members) ? registration.members[0] : registration.members
      const checkin = registration.user_id ? checkinsByMember[registration.user_id] : null

      return [
        member?.first_name || '',
        member?.last_name || '',
        member?.email || '',
        member?.phone || '',
        member?.tier || '',
        registration.attendance_type || '',
        registration.status || '',
        formatDate(registration.registered_at),
        checkin ? 'Yes' : 'No',
        formatDate(checkin?.checked_in_at),
        checkin?.check_in_method || '',
        registration.notes || '',
      ]
    }),
  ]

  const body = rows.map(row => row.map(csvCell).join(',')).join('\r\n')
  const filename = `${fileSlug(event.title)}-rsvps.csv`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
