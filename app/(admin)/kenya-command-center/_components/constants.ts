import {
  Target, Users, Calendar, DollarSign, MessageSquare, Heart,
  Stethoscope, BookOpen, Building, Star, Briefcase,
  Truck, Package, Camera, UserPlus,
  ClipboardList, Layers, StickyNote
} from 'lucide-react'
import type { TabType } from './types'

export const serviceTracks = [
  { value: 'Ministry', label: 'Ministry', icon: Heart },
  { value: 'Medical', label: 'Medical', icon: Stethoscope },
  { value: 'Education', label: 'Education', icon: BookOpen },
  { value: 'Business', label: 'Business', icon: Building },
  { value: 'Media', label: 'Media', icon: Star },
  { value: 'Flex', label: 'Flex', icon: Briefcase },
] as const

export const tabs: { key: TabType; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: Target },
  { key: 'people', label: 'People', icon: Users },
  { key: 'actions', label: 'Actions', icon: ClipboardList },
  { key: 'itinerary', label: 'Itinerary', icon: Calendar },
  { key: 'logistics', label: 'Logistics', icon: Truck },
  { key: 'tracks', label: 'Tracks', icon: Layers },
  { key: 'budget', label: 'Budget', icon: DollarSign },
  { key: 'supplies', label: 'Supplies', icon: Package },
  { key: 'comms', label: 'Comms', icon: MessageSquare },
  { key: 'media', label: 'Media', icon: Camera },
  { key: 'prayer', label: 'Prayer', icon: Heart },
  { key: 'notes', label: 'Notes', icon: StickyNote },
]

export const packingCategories = [
  'documents',
  'clothing',
  'toiletries',
  'medical',
  'electronics',
  'ministry',
  'other',
] as const

export const logisticsTracks = [
  'all',
  'ministry',
  'healthcare',
  'business',
  'education',
  'media',
  'meals',
  'transport',
] as const

export const actionCategories = [
  { value: 'conference', label: 'Conference', color: 'bg-purple-100 text-purple-800' },
  { value: 'travel', label: 'Travel', color: 'bg-blue-100 text-blue-800' },
  { value: 'people', label: 'People', color: 'bg-green-100 text-green-800' },
  { value: 'programming', label: 'Programming', color: 'bg-orange-100 text-orange-800' },
  { value: 'supplies', label: 'Supplies', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'media', label: 'Media', color: 'bg-pink-100 text-pink-800' },
] as const

export const emojiStatuses = {
  booking: [
    { value: 'not_booked', label: '\u2B1C Not Booked' },
    { value: 'confirming', label: '\u2753 Confirm' },
    { value: 'searching', label: '\uD83D\uDD04 Searching' },
    { value: 'booked', label: '\u2705 Booked' },
  ],
  passport: [
    { value: 'not_started', label: '\u2B1C Not Started' },
    { value: 'in_progress', label: '\uD83D\uDD04 In Progress' },
    { value: 'verified', label: '\u2705 Verified' },
    { value: 'expired', label: '\uD83D\uDED1 Expired' },
  ],
  visa: [
    { value: 'not_started', label: '\u2B1C Not Started' },
    { value: 'in_progress', label: '\uD83D\uDD04 In Progress' },
    { value: 'approved', label: '\u2705 Approved' },
    { value: 'denied', label: '\u274C Denied' },
  ],
  actionStatus: [
    { value: 'not_started', label: '\u2B1C Not Started' },
    { value: 'in_progress', label: '\uD83D\uDD04 In Progress' },
    { value: 'done', label: '\u2705 Done' },
  ],
  actionPriority: [
    { value: 'high', label: '\uD83D\uDD34 High' },
    { value: 'medium', label: '\uD83D\uDFE1 Medium' },
    { value: 'low', label: '\u26AA Low' },
  ],
  lodging: [
    { value: 'pending', label: '\u2B1C Pending' },
    { value: 'confirmed', label: '\u2705 Confirmed' },
    { value: 'cancelled', label: '\u274C Cancelled' },
  ],
} as const

export const delegationTracks = [
  { value: 'Ministry', label: 'Ministry', color: 'bg-purple-500' },
  { value: 'Medical', label: 'Medical', color: 'bg-green-500' },
  { value: 'Education', label: 'Education', color: 'bg-blue-500' },
  { value: 'Business', label: 'Business', color: 'bg-yellow-500' },
  { value: 'Media', label: 'Media', color: 'bg-pink-500' },
  { value: 'Flex', label: 'Flex', color: 'bg-gray-500' },
] as const
