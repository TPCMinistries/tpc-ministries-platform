// Admin-specific database queries
import { createClient } from '@/lib/supabase/server'

// =====================================================
// DASHBOARD STATS
// =====================================================

export async function getAdminDashboardStats() {
  const supabase = await createClient()

  // Get total members
  const { count: totalMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  // Get members from this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count: membersThisWeek } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString())

  // Get active members (active in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: activeMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', thirtyDaysAgo.toISOString())

  // Get this month's donations
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const { data: monthlyDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', firstDayOfMonth.toISOString())

  const revenueThisMonth = monthlyDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  // Get active prayer requests
  const { count: pendingPrayerRequests } = await supabase
    .from('prayer_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get total teachings
  const { count: totalTeachings } = await supabase
    .from('teachings')
    .select('*', { count: 'exact', head: true })

  return {
    totalMembers: totalMembers || 0,
    membersThisWeek: membersThisWeek || 0,
    activeMembers: activeMembers || 0,
    revenueThisMonth,
    pendingPrayerRequests: pendingPrayerRequests || 0,
    totalTeachings: totalTeachings || 0,
  }
}

export async function getRecentActivity(limit: number = 10) {
  const supabase = await createClient()

  // Get recent donations
  const { data: recentDonations } = await supabase
    .from('donations')
    .select('id, amount, donor_name, type, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  // Get recent prayer requests
  const { data: recentPrayers } = await supabase
    .from('prayer_requests')
    .select('id, title, created_at, member:members(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  // Get recent members
  const { data: recentMembers } = await supabase
    .from('members')
    .select('id, first_name, last_name, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  // Combine and sort by date
  const activities = [
    ...(recentDonations?.map(d => ({
      type: 'donation',
      id: d.id,
      title: `${d.donor_name} donated $${d.amount}`,
      subtitle: d.type,
      timestamp: d.created_at,
    })) || []),
    ...(recentPrayers?.map(p => ({
      type: 'prayer',
      id: p.id,
      title: `New prayer: ${p.title}`,
      subtitle: p.member ? `${p.member.first_name} ${p.member.last_name}` : 'Anonymous',
      timestamp: p.created_at,
    })) || []),
    ...(recentMembers?.map(m => ({
      type: 'member',
      id: m.id,
      title: `${m.first_name} ${m.last_name} joined`,
      subtitle: 'New member',
      timestamp: m.created_at,
    })) || []),
  ]

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

// =====================================================
// TEACHINGS ADMIN
// =====================================================

export async function getAllTeachings(page: number = 1, limit: number = 20) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('teachings')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return {
    teachings: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function createTeaching(teaching: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('teachings')
    .insert(teaching)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTeaching(id: string, updates: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('teachings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTeaching(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('teachings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// =====================================================
// PROPHECIES ADMIN
// =====================================================

export async function getAllProphecies(page: number = 1, limit: number = 20) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('prophecies')
    .select('*', { count: 'exact' })
    .order('prophecy_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return {
    prophecies: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function createProphecy(prophecy: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prophecies')
    .insert(prophecy)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProphecy(id: string, updates: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prophecies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProphecy(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('prophecies')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// =====================================================
// MEMBERS ADMIN
// =====================================================

export async function getAllMembers(page: number = 1, limit: number = 20, searchQuery?: string) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })

  if (searchQuery) {
    query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return {
    members: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getMemberDetails(id: string) {
  const supabase = await createClient()

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (memberError) throw memberError

  // Get donations
  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // Get prayer requests
  const { data: prayers } = await supabase
    .from('prayer_requests')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // Get teaching progress
  const { data: progress } = await supabase
    .from('teaching_progress')
    .select('*, teaching:teachings(*)')
    .eq('user_id', id)

  return {
    member,
    donations: donations || [],
    prayers: prayers || [],
    progress: progress || [],
  }
}

export async function updateMemberTier(id: string, tier: 'free' | 'partner' | 'covenant') {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .update({ tier })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// ADMIN ROLE MANAGEMENT
// =====================================================

export interface AdminMember {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
  tier: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all members with admin access
 */
export async function getAllAdmins() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('is_admin', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminMember[]
}

/**
 * Search members by name or email
 * @param query - Search term for name or email
 * @param excludeAdmins - Whether to exclude members who are already admins
 */
export async function searchMembers(query: string, excludeAdmins: boolean = false) {
  const supabase = await createClient()

  let queryBuilder = supabase
    .from('members')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(20)

  if (excludeAdmins) {
    queryBuilder = queryBuilder.eq('is_admin', false)
  }

  const { data, error } = await queryBuilder.order('first_name', { ascending: true })

  if (error) throw error
  return data as AdminMember[]
}

/**
 * Grant admin access to a user
 * @param userId - The member ID to grant admin access to
 */
export async function grantAdminAccess(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .update({
      is_admin: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Revoke admin access from a user
 * @param userId - The member ID to revoke admin access from
 */
export async function revokeAdminAccess(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .update({
      is_admin: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('members')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (error) return false

  return data?.is_admin || false
}

/**
 * Get current user's member record
 */
export async function getCurrentMember() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data as AdminMember
}
