import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface MemberAccess {
  id: string
  tier: string | null
  role: string | null
}

interface EventAccess {
  id: string
  event_type: string | null
  tier_required: string | null
  status: string | null
  start_time: string | null
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const attendanceTypes = ['in-person', 'virtual'] as const
type AttendanceType = typeof attendanceTypes[number]

function canAccessEvent(member: MemberAccess, event: EventAccess) {
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

function normalizeAttendanceType(eventType: string | null, requested: unknown): AttendanceType {
  if (eventType === 'online') return 'virtual'
  if (eventType === 'in-person') return 'in-person'

  if (typeof requested === 'string' && attendanceTypes.includes(requested as AttendanceType)) {
    return requested as AttendanceType
  }

  return 'in-person'
}

async function getRegistrationContext(eventId: string) {
  if (!uuidPattern.test(eventId)) {
    return { error: NextResponse.json({ error: 'Invalid event id' }, { status: 400 }) }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
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
      .select('id, event_type, tier_required, status, start_time')
      .eq('id', eventId)
      .maybeSingle(),
  ])

  if (memberError) {
    console.error('Partner event registration member lookup failed:', memberError)
    return { error: NextResponse.json({ error: 'Unable to load member profile' }, { status: 500 }) }
  }

  if (!member) {
    return { error: NextResponse.json({ error: 'Member profile required' }, { status: 403 }) }
  }

  if (eventError) {
    console.error('Partner event registration event lookup failed:', eventError)
    return { error: NextResponse.json({ error: 'Unable to load event' }, { status: 500 }) }
  }

  if (!event || event.status !== 'upcoming') {
    return { error: NextResponse.json({ error: 'Event is not available for registration' }, { status: 404 }) }
  }

  if (!canAccessEvent(member as MemberAccess, event as EventAccess)) {
    return { error: NextResponse.json({ error: 'This event requires partner access' }, { status: 403 }) }
  }

  return {
    admin,
    member: member as MemberAccess,
    event: event as EventAccess,
  }
}

export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  const context = await getRegistrationContext(params.eventId)
  if ('error' in context) return context.error

  const body = await request.json().catch(() => ({}))
  const attendanceType = normalizeAttendanceType(context.event.event_type, body?.attendanceType)
  const { data, error } = await context.admin
    .from('event_registrations')
    .upsert({
      event_id: context.event.id,
      user_id: context.member.id,
      attendance_type: attendanceType,
      status: 'registered',
      registered_at: new Date().toISOString(),
    }, {
      onConflict: 'event_id,user_id',
    })
    .select('id, event_id, status, attendance_type, registered_at')
    .single()

  if (error) {
    console.error('Partner event registration failed:', error)
    return NextResponse.json({ error: 'Unable to register for event' }, { status: 500 })
  }

  return NextResponse.json({ success: true, registration: data })
}

export async function DELETE(_request: NextRequest, { params }: { params: { eventId: string } }) {
  const context = await getRegistrationContext(params.eventId)
  if ('error' in context) return context.error

  const { data, error } = await context.admin
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', context.event.id)
    .eq('user_id', context.member.id)
    .select('id, event_id, status')
    .maybeSingle()

  if (error) {
    console.error('Partner event cancellation failed:', error)
    return NextResponse.json({ error: 'Unable to update registration' }, { status: 500 })
  }

  return NextResponse.json({ success: true, registration: data })
}
