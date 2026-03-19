import {
  LayoutDashboard,
  ClipboardCheck,
  DollarSign,
  Calendar,
  Users,
  Heart,
  BookOpen,
  PenLine,
  Target,
  List,
  CalendarDays,
  Layers,
  MessageSquare,
  FileText,
  Stethoscope,
  GraduationCap,
  Briefcase,
  HandHeart,
  Utensils,
  Package,
  Star,
} from 'lucide-react'
import type { DelegateTabType, TrackLeadTabType, DocumentType } from './types'

// ========== Delegate Tabs ==========

export const delegateTabs: { key: DelegateTabType; label: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'prepare', label: 'Prepare', icon: ClipboardCheck },
  { key: 'finances', label: 'Finances', icon: DollarSign },
  { key: 'itinerary', label: 'Itinerary', icon: Calendar },
  { key: 'community', label: 'Community', icon: Users },
  { key: 'prayer', label: 'Prayer', icon: Heart },
  { key: 'resources', label: 'Resources', icon: BookOpen },
  { key: 'journal', label: 'Journal', icon: PenLine },
]

// ========== Track Lead Tabs ==========

export const trackLeadTabs: { key: TrackLeadTabType; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: Target },
  { key: 'roster', label: 'Roster', icon: List },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays },
  { key: 'prep', label: 'Prep', icon: Layers },
  { key: 'comms', label: 'Comms', icon: MessageSquare },
  { key: 'plan', label: 'Plan', icon: FileText },
]

// ========== Trip Info ==========

export const TRIP_DATES = {
  start: '2026-04-22',
  end: '2026-05-07',
  displayDates: 'April 22 – May 7, 2026',
  duration: '16 days',
}

export const TRIP_LOCATIONS = [
  { name: 'Nairobi', description: 'Capital city, 4.4+ million people' },
  { name: 'Mombasa', description: 'Coastal city, Indian Ocean port' },
  { name: 'Kakamega', description: 'Rural western Kenya, near tropical rainforest' },
]

export const TRIP_ITINERARY_PHASES = [
  { phase: 'Arrival', dates: 'April 21-22', description: 'Meet in Nairobi for welcome and orientation' },
  { phase: 'Immersion', dates: 'April 23-24', description: 'Cultural experiences and safari adventure' },
  { phase: 'Sabbath', dates: 'April 25', description: 'Worship, rest, and spiritual preparation' },
  { phase: 'Service', dates: 'April 26–May 7', description: 'Kingdom impact across three cities' },
]

export const WHATS_INCLUDED = [
  'Round-trip international flights',
  'Quality accommodations throughout',
  'All meals and ground transportation',
  'Safari and cultural experiences',
  'Ministry supplies and materials',
  'Travel insurance coverage',
  'Pre-trip training and preparation',
  '24/7 on-ground support team',
]

// ========== Service Tracks ==========

export const SERVICE_TRACKS = [
  { value: 'ministry_spiritual', label: 'Ministry & Spiritual Care', icon: HandHeart, description: 'Lead worship, prayer, and pastoral care', color: 'bg-purple-500', colorLight: 'bg-purple-100 text-purple-800' },
  { value: 'education_youth', label: 'Education & Youth', icon: GraduationCap, description: 'Work with schools and youth programs', color: 'bg-blue-500', colorLight: 'bg-blue-100 text-blue-800' },
  { value: 'medical_missions', label: 'Medical Missions', icon: Stethoscope, description: 'Healthcare professionals providing care', color: 'bg-green-500', colorLight: 'bg-green-100 text-green-800' },
  { value: 'business_development', label: 'Business Development', icon: Briefcase, description: 'Entrepreneurship training and microfinance', color: 'bg-yellow-500', colorLight: 'bg-yellow-100 text-yellow-800' },
  { value: 'food_security', label: 'Food Security', icon: Utensils, description: 'Agricultural projects and nutrition programs', color: 'bg-orange-500', colorLight: 'bg-orange-100 text-orange-800' },
  { value: 'material_support', label: 'Material Support', icon: Package, description: 'Distribution of supplies and resources', color: 'bg-pink-500', colorLight: 'bg-pink-100 text-pink-800' },
] as const

// Admin tracks (display names for admin command center)
export const DELEGATION_TRACKS = [
  { value: 'Ministry', label: 'Ministry', color: 'bg-purple-500' },
  { value: 'Medical', label: 'Medical', color: 'bg-green-500' },
  { value: 'Education', label: 'Education', color: 'bg-blue-500' },
  { value: 'Business', label: 'Business', color: 'bg-yellow-500' },
  { value: 'Media', label: 'Media', color: 'bg-pink-500' },
  { value: 'Flex', label: 'Flex', color: 'bg-gray-500' },
] as const

// ========== Document Types ==========

export const DOCUMENT_TYPES: DocumentType[] = [
  { key: 'passport', label: 'Passport Copy', description: 'Upload a clear copy of your passport photo page', required: true },
  { key: 'visa', label: 'Kenya Visa', description: 'Upload your approved Kenya visa or eVisa confirmation', required: true },
  { key: 'vaccination', label: 'Vaccination Records', description: 'Yellow fever certificate and other vaccination records', required: true },
  { key: 'insurance', label: 'Travel Insurance', description: 'Proof of travel/medical insurance coverage', required: true },
  { key: 'medical_form', label: 'Medical Form', description: 'Completed medical information form (if required)', required: false },
]

// ========== Packing Categories ==========

export const PACKING_CATEGORIES = [
  'documents',
  'clothing',
  'toiletries',
  'medical',
  'electronics',
  'ministry',
  'other',
] as const

// ========== Key Deadlines ==========

export const DEADLINES = {
  passport: '2026-03-25',
  visa: '2026-04-01',
  vaccination: '2026-04-01',
  insurance: '2026-04-08',
  travelForm: '2026-03-25',
  healthForm: '2026-03-25',
  waiverForm: '2026-04-01',
  finalPayment: '2026-04-01',
  packingComplete: '2026-04-15',
} as const

// ========== Contact Info ==========

export const TRIP_CONTACT = {
  email: 'info@tpcmin.org',
  website: 'https://tpcmin.org/kenya',
}

// ========== Track Colors (for track lead dashboard) ==========

export const TRACK_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  Ministry: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100' },
  Medical: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
  Healthcare: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
  Education: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
  Business: { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100' },
  Media: { bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-100' },
  Flex: { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' },
}
