// ========== Existing Types (from current page.tsx) ==========

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
  service_track: string | null
  ministry_role: string | null
  team_leader: boolean
  fundraising_goal: number
  amount_raised: number
  payment_status: string
  application_status: string
  application_date: string
  // Extended fields from migration 043
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

export interface Flight {
  id: string
  trip_id: string
  flight_type: string
  direction: string
  airline: string
  flight_number: string
  departure_airport: string
  arrival_airport: string
  departure_datetime: string
  arrival_datetime: string
  booking_status: string
}

export interface Lodging {
  id: string
  trip_id: string
  name: string
  city: string
  check_in_date: string
  check_out_date: string
  total_rooms: number
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

export interface BudgetCategory {
  id: string
  trip_id: string
  name: string
  budgeted_amount: number
  spent_amount?: number
}

export interface Expense {
  id: string
  trip_id: string
  category_id: string
  description: string
  amount: number
  expense_date: string
  status: string
  paid_by: string
  payment_method?: string
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
  trip_id: string
  name: string
  category: string
  file_url: string
  is_required: boolean
}

export interface FAQ {
  id: string
  trip_id: string
  question: string
  answer: string
  category: string
}

export interface DailyFocus {
  id: string
  trip_id: string
  focus_date: string
  phase: string
  theme: string
  scripture_reference: string
  scripture_text: string
  prayer_focus: string
  leadership_notes: string
}

export interface Stats {
  totalParticipants: number
  approvedParticipants: number
  pendingApplications: number
  teamLeaders: number
  totalRaised: number
  fundraisingGoal: number
  passportsVerified: number
  visasApproved: number
  fullyPaid: number
  daysUntilTrip: number
}

// ========== NEW Types for Phase 2 & 3 ==========

export interface PackingItem {
  id: string
  trip_id: string
  item_name: string
  category: string
  description: string | null
  is_required: boolean
  quantity: number
  notes: string | null
  sort_order: number
}

export interface PackingStatus {
  id: string
  participant_id: string
  packing_item_id: string
  is_packed: boolean
  packed_at: string | null
  notes: string | null
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

export interface LogisticsMatrix {
  id: string
  trip_id: string
  day_date: string
  track: string
  content: string
  notes: string | null
}

export interface MediaCalendarItem {
  id: string
  trip_id: string
  post_date: string
  platform: string
  content_type: string
  title: string
  description: string | null
  assigned_to: string | null
  status: string
  asset_url: string | null
}

export interface MediaAssignment {
  id: string
  trip_id: string
  day_date: string
  track: string
  assigned_to: string
  role: string | null
  notes: string | null
}

export interface ShotListItem {
  id: string
  trip_id: string
  description: string
  location: string | null
  priority: string
  is_captured: boolean
  captured_by: string | null
  asset_url: string | null
  notes: string | null
}

export interface WaitingListEntry {
  id: string
  trip_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  source: string
  interest_level: string
  status: string
  follow_up_date: string | null
  follow_up_notes: string | null
  promoted_to_participant_id: string | null
  notes: string | null
  created_at: string
}

export type TabType = 'overview' | 'people' | 'itinerary' | 'logistics' | 'budget' | 'packing' | 'comms' | 'media' | 'pipeline' | 'prayer'
