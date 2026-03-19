// ========== Delegate Portal Types ==========

export interface Trip {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: string
  fundraising_goal: number
  participant_goal: number
  registration_deadline: string
}

export interface Participant {
  id: string
  trip_id: string
  member_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  passport_status: string
  passport_expiry: string | null
  visa_status: string
  vaccinations: any[]
  allergies: string | null
  medications: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  service_track: string | null
  ministry_role: string | null
  team_leader: boolean
  fundraising_goal: number
  amount_raised: number
  payment_status: string
  application_status: string
  application_date: string
  // Document URLs
  passport_document_url: string | null
  visa_document_url: string | null
  vaccination_document_url: string | null
  insurance_document_url: string | null
  medical_form_url: string | null
  // Document verification (from migration 057)
  passport_document_verified: boolean
  visa_document_verified: boolean
  vaccination_document_verified: boolean
  insurance_document_verified: boolean
  // Payment tracking (from migration 057)
  next_payment_due_date: string | null
  next_payment_amount: number | null
  // Fundraising
  fundraising_slug: string | null
  fundraising_page_enabled: boolean
  fundraising_story: string | null
  fundraising_photo_url: string | null
  fundraising_headline: string | null
  fundraising_video_url: string | null
  fundraising_why_going: string | null
  fundraising_personal_message: string | null
  // Extended fields
  honorific?: string
  legal_full_name?: string
  date_of_birth?: string
  organization?: string
  org_title?: string
  mailing_address?: string
  location?: string
  travel_accommodation_type?: string
  travel_date_in?: string
  travel_date_out?: string
  departure_airport?: string
  return_airport?: string
  special_assistance?: string
  tsa_known_traveler_number?: string
  travel_notes?: string
  interest_form_completed_at?: string
  travel_form_completed_at?: string
  medical_form_completed_at?: string
  waiver_signed_at?: string
  trip_cost?: number
  amount_paid?: number
  scholarship_amount?: number
  admin_credits_total?: number
  flight_status?: string
  hotel_status?: string
  booking_type?: string
  notes: string | null
}

export interface Member {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  tier: string
  role: string | null
  occupation: string | null
  bio: string | null
  city: string | null
  state: string | null
  country: string | null
  date_of_birth: string | null
  created_at: string
}

export interface Donation {
  id: string
  donor_name: string
  is_anonymous: boolean
  amount: number
  net_amount: number
  message: string | null
  status: string
  created_at: string
  is_manual_entry: boolean
}

export interface Announcement {
  id: string
  trip_id: string
  title: string
  content: string
  priority: string
  target_audience: string
  publish_at: string
  is_pinned: boolean
}

export interface Document {
  id: string
  name: string
  description: string
  category: string
  file_url: string
  is_required: boolean
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export interface DailyFocus {
  id: string
  focus_date: string
  phase: string
  theme: string
  scripture_reference: string
  scripture_text: string
  prayer_focus: string
  leadership_notes?: string
}

export interface PackingItem {
  id: string
  item_name: string
  category: string
  is_required: boolean
  description: string
  quantity?: number
  notes?: string
}

export interface PackingStatus {
  packing_item_id: string
  is_packed: boolean
}

export interface ItineraryItem {
  id: string
  trip_id: string
  day_number: number
  date: string
  title: string
  description: string
  location: string
  start_time: string
  end_time: string
  category: string
}

export interface ConferenceSession {
  id: string
  trip_id: string
  conference_name: string
  conference_date: string
  start_time: string
  end_time: string
  session_type: string
  title: string
  speaker: string | null
  track: string | null
  materials_url: string | null
  notes: string | null
  sort_order: number
}

export interface Lodging {
  id: string
  trip_id: string
  name: string
  city: string
  check_in_date: string
  check_out_date: string
  total_rooms: number
  booking_status?: string
  rate_per_night?: number
  notes?: string
}

export interface Contact {
  id: string
  trip_id: string
  name: string
  role: string
  organization: string
  phone: string
  email: string
  city: string
  is_primary: boolean
}

export interface LogisticsMatrix {
  id: string
  trip_id: string
  day_date: string
  track: string
  content: string
  notes: string | null
}

// ========== Track Lead Types (from migration 057) ==========

export interface TrackLeadNote {
  id: string
  participant_id: string
  author_id: string
  note: string
  created_at: string
  updated_at: string
}

export interface TrackPlan {
  id: string
  trip_id: string
  service_track: string
  title: string
  content: string | null
  plan_type: string
  author_id: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface TrackDetail {
  id: string
  trip_id: string
  track: string
  objectives: string
  scope: string
  notes: string
  created_at: string
  updated_at: string
}

export interface TrackMaterial {
  id: string
  track_detail_id: string
  item_name: string
  is_checked: boolean
  sort_order: number
  created_at: string
}

// ========== Tab Types ==========

export type DelegateTabType = 'dashboard' | 'prepare' | 'finances' | 'itinerary' | 'community' | 'prayer' | 'resources' | 'journal'

export type TrackLeadTabType = 'overview' | 'roster' | 'schedule' | 'prep' | 'comms' | 'plan'

// ========== Readiness Types ==========

export interface ReadinessItem {
  key: string
  label: string
  done: boolean
  urgent: boolean
  dueDate?: string
}

export interface ActionItem {
  id: string
  label: string
  type: 'overdue' | 'urgent' | 'upcoming' | 'info'
  dueDate?: string
  link?: DelegateTabType
}

// ========== Document Types ==========

export interface DocumentType {
  key: 'passport' | 'visa' | 'vaccination' | 'insurance' | 'medical_form'
  label: string
  description: string
  required: boolean
}

// ========== Kenya Partner Types ==========

export interface KenyaPartner {
  id: string
  trip_id: string
  member_id: string
  partner_type: string
  organization: string | null
  title: string | null
  city: string | null
  responsibilities: string | null
  can_propose_changes: boolean
  is_active: boolean
  invited_by_member_id: string | null
  created_at: string
  updated_at: string
}

export interface PartnerProposal {
  id: string
  trip_id: string
  partner_id: string
  proposal_type: string
  title: string
  description: string
  status: string
  admin_response: string | null
  resolved_by_member_id: string | null
  created_at: string
  resolved_at: string | null
  updated_at: string
}

export type PartnerTabType = 'overview' | 'delegation' | 'schedule' | 'logistics' | 'coordination' | 'resources'
