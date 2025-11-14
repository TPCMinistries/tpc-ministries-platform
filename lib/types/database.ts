// Database type definitions for TPC Ministries Platform

export interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  tier: 'free' | 'partner' | 'covenant'
  bio?: string
  location?: string
  joined_at: string
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface Donation {
  id: string
  amount: number
  type: 'general' | 'missions' | 'leadership'
  frequency: 'once' | 'monthly'
  user_id?: string
  donor_email?: string
  donor_name: string
  stripe_session_id?: string
  stripe_payment_intent?: string
  stripe_invoice_id?: string
  stripe_subscription_id?: string
  subscription_status?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
}

export interface PrayerRequest {
  id: string
  user_id: string
  title: string
  description: string
  category?: 'personal' | 'family' | 'health' | 'finances' | 'ministry' | 'other'
  is_anonymous: boolean
  is_answered: boolean
  answered_at?: string
  answer_testimony?: string
  prayer_count: number
  status: 'active' | 'answered' | 'archived'
  created_at: string
  updated_at: string
  member?: Member
}

export interface PrayerSupporter {
  id: string
  prayer_request_id: string
  user_id: string
  prayed_at: string
}

export interface Teaching {
  id: string
  title: string
  description?: string
  speaker: string
  series?: string
  scripture_reference?: string
  video_url?: string
  audio_url?: string
  thumbnail_url?: string
  duration_minutes?: number
  tier_required: 'free' | 'partner' | 'covenant'
  category?: 'sermon' | 'teaching' | 'prophecy' | 'testimony' | 'other'
  view_count: number
  published_at: string
  created_at: string
  updated_at: string
}

export interface TeachingProgress {
  id: string
  user_id: string
  teaching_id: string
  progress_seconds: number
  completed: boolean
  last_watched_at: string
  created_at: string
  updated_at: string
  teaching?: Teaching
}

export interface Event {
  id: string
  title: string
  description?: string
  event_type: 'in-person' | 'online' | 'hybrid'
  location?: string
  virtual_link?: string
  start_time: string
  end_time: string
  image_url?: string
  max_attendees?: number
  registration_required: boolean
  tier_required: 'free' | 'partner' | 'covenant'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  attendance_type: 'in-person' | 'virtual'
  status: 'registered' | 'attended' | 'cancelled'
  registered_at: string
  created_at: string
  updated_at: string
  event?: Event
}

export interface Assessment {
  id: string
  title: string
  slug: string
  description?: string
  category?: 'spiritual' | 'leadership' | 'ministry' | 'personal'
  tier_required: 'free' | 'partner' | 'covenant'
  estimated_minutes?: number
  questions: any // JSONB
  results_config?: any // JSONB
  published: boolean
  created_at: string
  updated_at: string
}

export interface AssessmentResult {
  id: string
  user_id: string
  assessment_id: string
  answers: any // JSONB
  score?: number
  result_category?: string
  result_description?: string
  completed_at: string
  created_at: string
  assessment?: Assessment
}

export interface Prophecy {
  id: string
  title: string
  content: string
  prophet_name?: string
  prophecy_date?: string
  category?: 'personal' | 'church' | 'nation' | 'global' | 'end-times'
  scripture_reference?: string
  tier_required: 'free' | 'partner' | 'covenant'
  published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  title: string
  description?: string
  type: 'guide' | 'worksheet' | 'ebook' | 'document' | 'other'
  file_url?: string
  thumbnail_url?: string
  category?: string
  tier_required: 'free' | 'partner' | 'covenant'
  download_count: number
  created_at: string
  updated_at: string
}
