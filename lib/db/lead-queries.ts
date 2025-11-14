import { createClient } from '@/lib/supabase/client'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  source: 'website' | 'event' | 'referral' | 'social_media' | 'other'
  status: 'new' | 'contacted' | 'nurturing' | 'converted' | 'inactive'
  interest_level: 'cold' | 'warm' | 'hot'
  interests?: string[]
  notes?: string
  assigned_to?: string
  last_contacted_at?: string
  converted_to_member_id?: string
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  activity_type: string
  description: string
  performed_by?: string
  created_at: string
}

export interface LeadFilters {
  search?: string
  status?: string
  interestLevel?: string
  source?: string
  dateRange?: string
}

export interface LeadStats {
  newThisWeek: number
  newThisMonth: number
  hotLeads: number
  conversionRate: number
}

/**
 * Get all leads with optional filters
 */
export async function getLeads(filters?: LeadFilters) {
  const supabase = createClient()

  let query = supabase
    .from('leads')
    .select('*')

  // Apply search filter
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  // Apply status filter
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply interest level filter
  if (filters?.interestLevel && filters.interestLevel !== 'all') {
    query = query.eq('interest_level', filters.interestLevel)
  }

  // Apply source filter
  if (filters?.source && filters.source !== 'all') {
    query = query.eq('source', filters.source)
  }

  // Apply date range filter
  if (filters?.dateRange && filters.dateRange !== 'all') {
    const now = new Date()
    let startDate: Date

    switch (filters.dateRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // All time
    }

    query = query.gte('created_at', startDate.toISOString())
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as Lead[]
}

/**
 * Get lead statistics for dashboard
 */
export async function getLeadStats(): Promise<LeadStats> {
  const supabase = createClient()

  // Get total leads
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  // Get converted leads
  const { count: convertedLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'converted')

  // Get new leads this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count: newThisWeek } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString())

  // Get new leads this month
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const { count: newThisMonth } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth.toISOString())

  // Get hot leads needing follow-up
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: hotLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('interest_level', 'hot')
    .or(`last_contacted_at.is.null,last_contacted_at.lt.${sevenDaysAgo.toISOString()}`)

  const conversionRate = totalLeads && totalLeads > 0
    ? ((convertedLeads || 0) / totalLeads) * 100
    : 0

  return {
    newThisWeek: newThisWeek || 0,
    newThisMonth: newThisMonth || 0,
    hotLeads: hotLeads || 0,
    conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
  }
}

/**
 * Get single lead by ID with activities
 */
export async function getLeadById(id: string) {
  const supabase = createClient()

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (leadError) throw leadError

  const { data: activities, error: activitiesError } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  if (activitiesError) throw activitiesError

  return {
    lead: lead as Lead,
    activities: activities as LeadActivity[],
  }
}

/**
 * Create new lead from homepage form
 */
export async function createLead(data: {
  name: string
  email: string
  phone?: string
  interests: string[]
  source?: string
}) {
  const supabase = createClient()

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      interests: data.interests,
      source: data.source || 'website',
      status: 'new',
      interest_level: 'warm',
    })
    .select()
    .single()

  if (error) throw error
  return lead as Lead
}

/**
 * Update lead
 */
export async function updateLead(id: string, data: Partial<Lead>) {
  const supabase = createClient()

  const { data: lead, error } = await supabase
    .from('leads')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return lead as Lead
}

/**
 * Delete lead
 */
export async function deleteLead(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Convert lead to member
 */
export async function convertLeadToMember(leadId: string) {
  const supabase = createClient()

  // Get lead details
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError) throw leadError

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: lead.email,
    email_confirm: true,
    user_metadata: {
      name: lead.name,
    },
  })

  if (authError) throw authError

  // Create member record
  const [firstName, ...lastNameParts] = lead.name.split(' ')
  const lastName = lastNameParts.join(' ')

  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({
      user_id: authData.user.id,
      first_name: firstName,
      last_name: lastName || '',
      phone_number: lead.phone,
      tier: 'free',
      is_active: true,
    })
    .select()
    .single()

  if (memberError) throw memberError

  // Update lead status
  await supabase
    .from('leads')
    .update({
      status: 'converted',
      converted_to_member_id: member.id,
    })
    .eq('id', leadId)

  return member
}

/**
 * Get recent leads for dashboard
 */
export async function getRecentLeads(limit: number = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Lead[]
}

/**
 * Get new leads count for sidebar badge
 */
export async function getNewLeadsCount() {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  if (error) return 0
  return count || 0
}
