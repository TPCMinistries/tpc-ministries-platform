import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface MemberAccess {
  id: string
  tier: string | null
  role: string | null
}

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  event_type: string | null
  location: string | null
  virtual_link: string | null
  start_time: string | null
  end_time: string | null
  tier_required: string | null
  status: string | null
}

type CalendarEventWithStart = CalendarEvent & {
  start_time: string
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function canAccessEvent(member: MemberAccess, event: CalendarEvent) {
  if (member.role === 'admin' || member.role === 'staff') return true

  switch (event.tier_required) {
    case 'covenant':
      return member.tier === 'covenant'
    case 'partner':
      return member.tier === 'partner' || member.tier === 'covenant'
    case 'free':
    case null:
    default:
      return true
  }
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function formatIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function foldIcsLine(line: string) {
  const maxLength = 74
  if (line.length <= maxLength) return line

  const chunks: string[] = []
  let remaining = line
  while (remaining.length > maxLength) {
    chunks.push(remaining.slice(0, maxLength))
    remaining = ` ${remaining.slice(maxLength)}`
  }
  chunks.push(remaining)
  return chunks.join('\r\n')
}

export async function GET(_request: Request, { params }: { params: { eventId: string } }) {
  if (!uuidPattern.test(params.eventId)) {
    return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const admin = createAdminClient()
  const [{ data: member, error: memberError }, { data: event, error: eventError }] = await Promise.all([
    admin
      .from('members')
      .select('id, tier, role')
      .eq('user_id', user.id)
      .maybeSingle(),
    admin
      .from('events')
      .select('id, title, description, event_type, location, virtual_link, start_time, end_time, tier_required, status')
      .eq('id', params.eventId)
      .maybeSingle(),
  ])

  if (memberError) {
    console.error('Calendar member lookup failed:', memberError)
    return NextResponse.json({ error: 'Unable to load member profile' }, { status: 500 })
  }

  if (!member) {
    return NextResponse.json({ error: 'Member profile required' }, { status: 403 })
  }

  if (eventError) {
    console.error('Calendar event lookup failed:', eventError)
    return NextResponse.json({ error: 'Unable to load event' }, { status: 500 })
  }

  if (!event || !event.start_time || event.status === 'cancelled' || event.status === 'draft') {
    return NextResponse.json({ error: 'Event is not available' }, { status: 404 })
  }

  const calendarEvent = event as CalendarEventWithStart
  if (!canAccessEvent(member as MemberAccess, calendarEvent)) {
    return NextResponse.json({ error: 'This event requires partner access' }, { status: 403 })
  }

  const startDate = new Date(calendarEvent.start_time)
  const endDate = calendarEvent.end_time
    ? new Date(calendarEvent.end_time)
    : new Date(startDate.getTime() + 60 * 60 * 1000)
  const location = calendarEvent.location || (calendarEvent.virtual_link ? 'Online gathering' : 'TPC Ministries')
  const descriptionParts = [
    calendarEvent.description || 'TPC Ministries gathering.',
    calendarEvent.virtual_link ? `Join online: ${calendarEvent.virtual_link}` : '',
  ].filter(Boolean)
  const now = formatIcsDate(new Date().toISOString())

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TPC Ministries//Partner Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${calendarEvent.id}@tpcmin.org`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsDate(startDate.toISOString())}`,
    `DTEND:${formatIcsDate(endDate.toISOString())}`,
    `SUMMARY:${escapeIcsText(calendarEvent.title)}`,
    `DESCRIPTION:${escapeIcsText(descriptionParts.join('\n\n'))}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'}/partner-hub`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  const body = lines.map(foldIcsLine).join('\r\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${calendarEvent.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-tpc.ics"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
