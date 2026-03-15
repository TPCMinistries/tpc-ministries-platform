import {
  Target, Users, Calendar, DollarSign, MessageSquare, Heart,
  Stethoscope, BookOpen, Building, Star, Briefcase,
  Truck, Package, Camera, UserPlus
} from 'lucide-react'
import type { TabType } from './types'

export const serviceTracks = [
  { value: 'medical', label: 'Medical', icon: Stethoscope },
  { value: 'education', label: 'Education', icon: BookOpen },
  { value: 'construction', label: 'Construction', icon: Building },
  { value: 'evangelism', label: 'Evangelism', icon: Heart },
  { value: 'worship', label: 'Worship', icon: Star },
  { value: 'admin', label: 'Administration', icon: Briefcase },
] as const

export const tabs: { key: TabType; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: Target },
  { key: 'people', label: 'People', icon: Users },
  { key: 'itinerary', label: 'Itinerary', icon: Calendar },
  { key: 'logistics', label: 'Logistics', icon: Truck },
  { key: 'budget', label: 'Budget', icon: DollarSign },
  { key: 'packing', label: 'Packing', icon: Package },
  { key: 'comms', label: 'Comms', icon: MessageSquare },
  { key: 'media', label: 'Media', icon: Camera },
  { key: 'pipeline', label: 'Pipeline', icon: UserPlus },
  { key: 'prayer', label: 'Prayer', icon: Heart },
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
