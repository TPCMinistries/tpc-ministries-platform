// Database query functions for TPC Ministries Platform
import { createClient } from '@/lib/supabase/server'
import type {
  Teaching,
  Event,
  PrayerRequest,
  Member,
  Donation,
  TeachingProgress,
  EventRegistration,
  Assessment,
  Prophecy,
  Resource
} from '@/lib/types/database'

// =====================================================
// TEACHINGS
// =====================================================

export async function getRecentTeachings(limit: number = 6) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teachings')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Teaching[]
}

export async function getTeachingById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teachings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Teaching
}

// =====================================================
// EVENTS
// =====================================================

export async function getUpcomingEvents(limit: number = 6) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as Event[]
}

export async function getEventById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Event
}

// =====================================================
// PRAYER REQUESTS
// =====================================================

export async function getRecentPrayerRequests(limit: number = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prayer_requests')
    .select(`
      *,
      member:members(first_name, last_name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as (PrayerRequest & { member: Partial<Member> })[]
}

export async function getUserPrayerRequests(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as PrayerRequest[]
}

export async function createPrayerRequest(request: {
  user_id: string
  title: string
  description: string
  category?: string
  is_anonymous?: boolean
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prayer_requests')
    .insert(request)
    .select()
    .single()

  if (error) throw error
  return data as PrayerRequest
}

export async function updatePrayerRequest(id: string, updates: Partial<PrayerRequest>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prayer_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as PrayerRequest
}

export async function incrementPrayerCount(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('increment_prayer_count', {
    prayer_id: id
  })

  if (error) {
    // Fallback if RPC doesn't exist
    const { data: current } = await supabase
      .from('prayer_requests')
      .select('prayer_count')
      .eq('id', id)
      .single()

    if (current) {
      await supabase
        .from('prayer_requests')
        .update({ prayer_count: (current.prayer_count || 0) + 1 })
        .eq('id', id)
    }
  }
}

// =====================================================
// MEMBERS
// =====================================================

export async function getMemberById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Member
}

export async function updateMember(id: string, updates: Partial<Member>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Member
}

// =====================================================
// DONATIONS
// =====================================================

export async function getUserDonations(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Donation[]
}

export async function getTotalDonations(userId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('donations')
    .select('amount')
    .eq('status', 'completed')

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error

  const total = data.reduce((sum, d) => sum + Number(d.amount), 0)
  return total
}

// =====================================================
// TEACHING PROGRESS
// =====================================================

export async function getUserTeachingProgress(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teaching_progress')
    .select(`
      *,
      teaching:teachings(*)
    `)
    .eq('user_id', userId)
    .order('last_watched_at', { ascending: false })

  if (error) throw error
  return data as (TeachingProgress & { teaching: Teaching })[]
}

export async function upsertTeachingProgress(progress: {
  user_id: string
  teaching_id: string
  progress_seconds: number
  completed: boolean
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teaching_progress')
    .upsert(progress, { onConflict: 'user_id,teaching_id' })
    .select()
    .single()

  if (error) throw error
  return data as TeachingProgress
}

// =====================================================
// EVENT REGISTRATIONS
// =====================================================

export async function getUserEventRegistrations(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_registrations')
    .select(`
      *,
      event:events(*)
    `)
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })

  if (error) throw error
  return data as (EventRegistration & { event: Event })[]
}

export async function registerForEvent(registration: {
  event_id: string
  user_id: string
  attendance_type: 'in-person' | 'virtual'
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_registrations')
    .insert(registration)
    .select()
    .single()

  if (error) throw error
  return data as EventRegistration
}

export async function cancelEventRegistration(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as EventRegistration
}

// =====================================================
// ASSESSMENTS
// =====================================================

export async function getPublishedAssessments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Assessment[]
}

export async function getAssessmentBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) throw error
  return data as Assessment
}

// =====================================================
// PROPHECIES
// =====================================================

export async function getRecentProphecies(limit: number = 6) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prophecies')
    .select('*')
    .eq('published', true)
    .order('prophecy_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Prophecy[]
}

// =====================================================
// RESOURCES
// =====================================================

export async function getResources() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Resource[]
}
