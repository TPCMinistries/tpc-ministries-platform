'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plane,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Heart,
  Shield,
  Stethoscope,
  Phone,
  Mail,
  ChevronRight,
  Download,
  ExternalLink,
  RefreshCw,
  Star,
  CheckSquare,
  Square,
  Sun,
  BookOpen,
  Briefcase,
  GraduationCap,
  Utensils,
  Package,
  HandHeart,
  TreePine,
  Camera,
  Compass,
  Home,
  Sparkles,
  Gift,
  Upload,
  File,
  Trash2,
  Eye,
  Copy,
  Link,
  Edit3,
  Plus,
  Share2,
  Wand2,
  Video,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
  Palette,
  Type,
  Eye as EyeIcon,
} from 'lucide-react'

interface Trip {
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

interface Participant {
  id: string
  trip_id: string
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
  // Fundraising
  fundraising_slug: string | null
  fundraising_page_enabled: boolean
  fundraising_story: string | null
  fundraising_photo_url: string | null
  fundraising_headline: string | null
  fundraising_video_url: string | null
  fundraising_why_going: string | null
  fundraising_personal_message: string | null
  // From application
  notes: string | null
}

interface Donation {
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

interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  publish_at: string
  is_pinned: boolean
}

interface Document {
  id: string
  name: string
  description: string
  category: string
  file_url: string
  is_required: boolean
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

interface DailyFocus {
  id: string
  focus_date: string
  phase: string
  theme: string
  scripture_reference: string
  scripture_text: string
  prayer_focus: string
}

interface PackingItem {
  id: string
  item_name: string
  category: string
  is_required: boolean
  description: string
}

interface PackingStatus {
  packing_item_id: string
  is_packed: boolean
}

interface Member {
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

// Trip details from tpcmin.org/kenya
const TRIP_INFO = {
  dates: 'April 23 – May 6, 2026',
  duration: '14 days',
  locations: [
    { name: 'Nairobi', description: 'Capital city, 4.4+ million people' },
    { name: 'Mombasa', description: 'Coastal city, Indian Ocean port' },
    { name: 'Kakamega', description: 'Rural western Kenya, near tropical rainforest' },
  ],
  itinerary: [
    { phase: 'Arrival', dates: 'April 21-22', description: 'Meet in Nairobi for welcome and orientation' },
    { phase: 'Immersion', dates: 'April 23-24', description: 'Cultural experiences and safari adventure' },
    { phase: 'Sabbath', dates: 'April 25', description: 'Worship, rest, and spiritual preparation' },
    { phase: 'Service', dates: 'April 26–May 7', description: 'Kingdom impact across three cities' },
  ],
  whatsIncluded: [
    'Round-trip international flights',
    'Quality accommodations throughout',
    'All meals and ground transportation',
    'Safari and cultural experiences',
    'Ministry supplies and materials',
    'Travel insurance coverage',
    'Pre-trip training and preparation',
    '24/7 on-ground support team',
  ],
  serviceTracks: [
    { value: 'ministry_spiritual', label: 'Ministry & Spiritual Care', icon: HandHeart, description: 'Lead worship, prayer, and pastoral care' },
    { value: 'education_youth', label: 'Education & Youth', icon: GraduationCap, description: 'Work with schools and youth programs' },
    { value: 'medical_missions', label: 'Medical Missions', icon: Stethoscope, description: 'Healthcare professionals providing care' },
    { value: 'business_development', label: 'Business Development', icon: Briefcase, description: 'Entrepreneurship training and microfinance' },
    { value: 'food_security', label: 'Food Security', icon: Utensils, description: 'Agricultural projects and nutrition programs' },
    { value: 'material_support', label: 'Material Support', icon: Package, description: 'Distribution of supplies and resources' },
  ],
  contact: {
    email: 'info@tpcmin.org',
    website: 'https://tpcmin.org/kenya',
  },
}

// Fundraising Section Component with AI-Assisted Personalization
function FundraisingSection({
  participant,
  fundraisingPercent,
  onUpdate,
}: {
  participant: Participant
  fundraisingPercent: number
  onUpdate: () => void
}) {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loadingDonations, setLoadingDonations] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState<'overview' | 'personalize' | 'donations'>('overview')

  // Personalization state
  const [story, setStory] = useState(participant.fundraising_story || '')
  const [headline, setHeadline] = useState(participant.fundraising_headline || '')
  const [videoUrl, setVideoUrl] = useState(participant.fundraising_video_url || '')
  const [pageEnabled, setPageEnabled] = useState(participant.fundraising_page_enabled)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // AI Story Generation state
  const [generatingStory, setGeneratingStory] = useState(false)
  const [storyTone, setStoryTone] = useState<'heartfelt' | 'professional' | 'casual' | 'inspiring'>('heartfelt')
  const [showAiOptions, setShowAiOptions] = useState(false)

  // Manual donation state
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualDonation, setManualDonation] = useState({
    donor_name: '',
    amount: '',
    message: '',
    is_anonymous: false,
  })
  const [submittingManual, setSubmittingManual] = useState(false)

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const fundraisingUrl = participant.fundraising_slug
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'}/kenya/support/${participant.fundraising_slug}`
    : null

  useEffect(() => {
    fetchDonations()
  }, [participant.id])

  // Track changes
  useEffect(() => {
    const changed =
      story !== (participant.fundraising_story || '') ||
      headline !== (participant.fundraising_headline || '') ||
      videoUrl !== (participant.fundraising_video_url || '') ||
      pageEnabled !== participant.fundraising_page_enabled
    setHasChanges(changed)
  }, [story, headline, videoUrl, pageEnabled, participant])

  const fetchDonations = async () => {
    setLoadingDonations(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('kenya_trip_donations')
      .select('id, donor_name, is_anonymous, amount, net_amount, message, status, created_at, is_manual_entry')
      .eq('participant_id', participant.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)

    setDonations(data || [])
    setLoadingDonations(false)
  }

  const copyLink = () => {
    if (fundraisingUrl) {
      navigator.clipboard.writeText(fundraisingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Generate AI Story
  const generateStory = async () => {
    setGeneratingStory(true)
    try {
      const response = await fetch('/api/kenya/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: participant.first_name,
          lastName: participant.last_name,
          serviceTrack: participant.service_track,
          whyGoing: participant.notes, // From application
          fundraisingGoal: participant.fundraising_goal,
          tone: storyTone,
          includeCallToAction: true,
        }),
      })

      const data = await response.json()
      if (data.story) {
        setStory(data.story)
        setShowAiOptions(false)
      } else {
        alert('Failed to generate story. Please try again.')
      }
    } catch (error) {
      console.error('Story generation error:', error)
      alert('Failed to generate story. Please try again.')
    }
    setGeneratingStory(false)
  }

  // Save all personalization changes
  const saveChanges = async () => {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('kenya_trip_participants')
      .update({
        fundraising_story: story || null,
        fundraising_headline: headline || null,
        fundraising_video_url: videoUrl || null,
        fundraising_page_enabled: pageEnabled,
      })
      .eq('id', participant.id)

    if (!error) {
      setHasChanges(false)
      onUpdate()
    } else {
      alert('Failed to save changes. Please try again.')
    }
    setSaving(false)
  }

  // Upload photo
  const uploadPhoto = async (file: File) => {
    setUploadingPhoto(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/fundraising_photo_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('kenya-trip-documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = await supabase.storage
        .from('kenya-trip-documents')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365)

      const photoUrl = urlData?.signedUrl

      await supabase
        .from('kenya_trip_participants')
        .update({ fundraising_photo_url: photoUrl })
        .eq('id', participant.id)

      onUpdate()
    } catch (error) {
      console.error('Photo upload error:', error)
      alert('Failed to upload photo. Please try again.')
    }
    setUploadingPhoto(false)
  }

  const submitManualDonation = async () => {
    if (!manualDonation.donor_name || !manualDonation.amount) {
      alert('Please enter donor name and amount')
      return
    }

    const amount = parseFloat(manualDonation.amount)
    if (isNaN(amount) || amount < 1) {
      alert('Please enter a valid amount')
      return
    }

    setSubmittingManual(true)
    const supabase = createClient()

    const { error } = await supabase.from('kenya_trip_donations').insert({
      participant_id: participant.id,
      trip_id: participant.trip_id,
      donor_name: manualDonation.is_anonymous ? 'Anonymous' : manualDonation.donor_name,
      donor_email: null,
      is_anonymous: manualDonation.is_anonymous,
      show_name_publicly: !manualDonation.is_anonymous,
      amount: amount,
      fees_covered: 0,
      net_amount: amount,
      payment_method: 'offline',
      status: 'completed',
      message: manualDonation.message || null,
      is_manual_entry: true,
    })

    if (!error) {
      setManualDonation({ donor_name: '', amount: '', message: '', is_anonymous: false })
      setShowManualEntry(false)
      fetchDonations()
      onUpdate()
    } else {
      console.error('Manual donation error:', error)
      alert('Failed to add donation. Please try again.')
    }
    setSubmittingManual(false)
  }

  const toneOptions = [
    { value: 'heartfelt', label: 'Heartfelt', description: 'Warm and emotionally resonant' },
    { value: 'professional', label: 'Professional', description: 'Polished yet personable' },
    { value: 'casual', label: 'Casual', description: 'Friendly, like talking to a friend' },
    { value: 'inspiring', label: 'Inspiring', description: 'Uplifting and motivational' },
  ]

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-gold" />
              My Fundraising Page
            </CardTitle>
            <CardDescription>
              Personalize and share your fundraising page
            </CardDescription>
          </div>
          {/* Page Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Page {pageEnabled ? 'Live' : 'Hidden'}</span>
            <button
              onClick={() => setPageEnabled(!pageEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                pageEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  pageEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeSection === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection('overview')}
            className={activeSection === 'overview' ? 'bg-navy' : ''}
          >
            Overview
          </Button>
          <Button
            variant={activeSection === 'personalize' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection('personalize')}
            className={activeSection === 'personalize' ? 'bg-navy' : ''}
          >
            <Palette className="h-4 w-4 mr-1" />
            Personalize Page
          </Button>
          <Button
            variant={activeSection === 'donations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection('donations')}
            className={activeSection === 'donations' ? 'bg-navy' : ''}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Donations
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OVERVIEW SECTION */}
        {activeSection === 'overview' && (
          <>
            {/* Progress */}
            <div className="p-4 bg-gradient-to-br from-gold/10 to-amber-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Fundraising Progress</span>
                <span className="text-sm font-medium">{fundraisingPercent}%</span>
              </div>
              <Progress value={fundraisingPercent} className="h-3 mb-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-2xl font-bold text-navy">${participant.amount_raised.toLocaleString()}</span>
                <span className="text-gray-500">of ${participant.fundraising_goal.toLocaleString()} goal</span>
              </div>
            </div>

            {/* Shareable Link */}
            {fundraisingUrl && pageEnabled && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Your Personal Fundraising Page
                </p>
                <div className="flex gap-2">
                  <Input value={fundraisingUrl} readOnly className="bg-white text-sm" />
                  <Button variant="outline" onClick={copyLink} className="shrink-0">
                    {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <a href={fundraisingUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fundraisingUrl)}`, '_blank')}
                  >
                    <Share2 className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Help me reach my goal for the Kenya Kingdom Impact Trip 2025!`)}&url=${encodeURIComponent(fundraisingUrl)}`, '_blank')}
                  >
                    <Share2 className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(`Support my Kenya Mission Trip`)}&body=${encodeURIComponent(`I'm going on a mission trip to Kenya and would love your support! Learn more and donate here: ${fundraisingUrl}`)}`, '_blank')}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>
            )}

            {!pageEnabled && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Your fundraising page is currently hidden. Toggle it on above to make it visible to supporters.
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-navy">{donations.length}</p>
                <p className="text-xs text-gray-500">Donations</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-navy">
                  ${donations.length > 0 ? Math.round(participant.amount_raised / donations.length) : 0}
                </p>
                <p className="text-xs text-gray-500">Avg. Gift</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-navy">
                  ${(participant.fundraising_goal - participant.amount_raised).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">To Go</p>
              </div>
            </div>

            {/* Fundraising Tips */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                Fundraising Tips
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800">Personalize Your Page</p>
                  <p className="text-xs text-amber-700">Add your story and photo to connect with donors.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Share Often</p>
                  <p className="text-xs text-blue-700">Post updates on social media and text friends directly.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Make It Personal</p>
                  <p className="text-xs text-green-700">Personal asks get 3x better response than generic posts.</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">Say Thank You</p>
                  <p className="text-xs text-purple-700">Send a personal thank you within 24 hours.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PERSONALIZE SECTION */}
        {activeSection === 'personalize' && (
          <>
            {/* Preview Link */}
            {fundraisingUrl && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Preview your page as supporters will see it</span>
                </div>
                <a href={fundraisingUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
                </a>
              </div>
            )}

            {/* Photo Upload */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Profile Photo
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {participant.fundraising_photo_url ? (
                    <img
                      src={participant.fundraising_photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Add a photo to make your page more personal. Supporters connect better with a face!
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadPhoto(file)
                      }}
                      disabled={uploadingPhoto}
                    />
                    <Button variant="outline" size="sm" disabled={uploadingPhoto} asChild>
                      <span>
                        {uploadingPhoto ? (
                          <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />Upload Photo</>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Headline */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Custom Headline
              </h4>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={`Help ${participant.first_name} reach Kenya!`}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {headline.length}/200 characters. Leave blank for default headline.
              </p>
            </div>

            {/* My Story with AI */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-navy flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  My Story
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAiOptions(!showAiOptions)}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4 text-purple-600" />
                  AI Help
                </Button>
              </div>

              {/* AI Options Panel */}
              {showAiOptions && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800 mb-3">
                    Let AI help write your fundraising story
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => setStoryTone(tone.value as any)}
                        className={`p-2 rounded-lg text-left border-2 transition-colors ${
                          storyTone === tone.value
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <p className="text-sm font-medium">{tone.label}</p>
                        <p className="text-xs text-gray-500">{tone.description}</p>
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={generateStory}
                    disabled={generatingStory}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {generatingStory ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                    ) : (
                      <><Wand2 className="h-4 w-4 mr-2" />Generate Story</>
                    )}
                  </Button>
                  <p className="text-xs text-purple-600 mt-2 text-center">
                    You can edit the generated story after
                  </p>
                </div>
              )}

              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Share why this trip matters to you and how supporters can help make a difference..."
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tell supporters why you're going, what you'll be doing, and how their gift will make a difference.
              </p>
            </div>

            {/* Video URL */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video (Optional)
              </h4>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Add a YouTube or Vimeo link to make your page more engaging.
              </p>
            </div>

            {/* Save Button */}
            {hasChanges && (
              <div className="sticky bottom-0 bg-white p-4 border-t -mx-6 -mb-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStory(participant.fundraising_story || '')
                    setHeadline(participant.fundraising_headline || '')
                    setVideoUrl(participant.fundraising_video_url || '')
                    setPageEnabled(participant.fundraising_page_enabled)
                  }}
                >
                  Discard Changes
                </Button>
                <Button onClick={saveChanges} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            )}
          </>
        )}

        {/* DONATIONS SECTION */}
        {activeSection === 'donations' && (
          <>
            {/* Add Offline Donation */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-navy flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Offline Donation
                </h4>
                {!showManualEntry && (
                  <Button variant="outline" size="sm" onClick={() => setShowManualEntry(true)}>
                    Add Donation
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Received cash, check, or donations outside the platform? Add them here to track your total.
              </p>

              {showManualEntry && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Donor Name *</Label>
                      <Input
                        value={manualDonation.donor_name}
                        onChange={(e) => setManualDonation({ ...manualDonation, donor_name: e.target.value })}
                        placeholder="John Smith"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Amount ($) *</Label>
                      <Input
                        type="number"
                        value={manualDonation.amount}
                        onChange={(e) => setManualDonation({ ...manualDonation, amount: e.target.value })}
                        placeholder="100"
                        className="mt-1"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Message (optional)</Label>
                    <Textarea
                      value={manualDonation.message}
                      onChange={(e) => setManualDonation({ ...manualDonation, message: e.target.value })}
                      placeholder="Any note from the donor..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="manual_anonymous"
                      checked={manualDonation.is_anonymous}
                      onCheckedChange={(checked) => setManualDonation({ ...manualDonation, is_anonymous: !!checked })}
                    />
                    <Label htmlFor="manual_anonymous" className="text-sm cursor-pointer">
                      Donor prefers to remain anonymous
                    </Label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                      Cancel
                    </Button>
                    <Button onClick={submitManualDonation} disabled={submittingManual} className="bg-green-600 hover:bg-green-700">
                      {submittingManual ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Add Donation
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Donations */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Recent Donations ({donations.length})
              </h4>
              {loadingDonations ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No donations yet</p>
                  <p className="text-sm text-gray-400">Share your page to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        donation.is_manual_entry ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Heart className={`h-5 w-5 ${donation.is_manual_entry ? 'text-blue-600' : 'text-green-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                          </p>
                          {donation.is_manual_entry && (
                            <Badge variant="outline" className="text-xs">Offline</Badge>
                          )}
                        </div>
                        {donation.message && (
                          <p className="text-xs text-gray-500 mt-1">"{donation.message}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${donation.net_amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function KenyaTripPage() {
  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [dailyFocus, setDailyFocus] = useState<DailyFocus[]>([])
  const [packingItems, setPackingItems] = useState<PackingItem[]>([])
  const [packingStatus, setPackingStatus] = useState<PackingStatus[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)

  // Application form state
  const [applying, setApplying] = useState(false)
  const [applicationForm, setApplicationForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    service_track: '',
    why_interested: '',
    previous_missions: '',
    special_skills: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    allergies: '',
    medications: '',
    medical_conditions: '',
    dietary_restrictions: '',
    needs_scholarship: false,
    scholarship_reason: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get member info with full details
    let memberData = null
    if (user) {
      const { data } = await supabase
        .from('members')
        .select('id, user_id, first_name, last_name, email, phone, tier, role, occupation, bio, city, state, country, date_of_birth, created_at')
        .eq('user_id', user.id)
        .single()
      memberData = data
      if (data) {
        setMember(data)
      }
    }

    // Get trip
    const { data: tripData } = await supabase
      .from('kenya_trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (tripData) {
      setTrip(tripData)

      // Pre-fill application form with member data - make it intelligent
      if (memberData) {
        setApplicationForm(prev => ({
          ...prev,
          first_name: memberData.first_name || '',
          last_name: memberData.last_name || '',
          email: memberData.email || '',
          phone: memberData.phone || '',
          // Pre-select service track based on occupation if available
          service_track: getRecommendedTrack(memberData.occupation),
        }))
      }

      // Check if user has already applied
      if (memberData) {
        const { data: participantData } = await supabase
          .from('kenya_trip_participants')
          .select('*, fundraising_slug, fundraising_page_enabled, fundraising_story, fundraising_photo_url')
          .eq('trip_id', tripData.id)
          .eq('member_id', memberData.id)
          .single()

        if (participantData) {
          setParticipant(participantData)

          // Fetch packing status for this participant
          const { data: statusData } = await supabase
            .from('kenya_trip_packing_status')
            .select('packing_item_id, is_packed')
            .eq('participant_id', participantData.id)

          setPackingStatus(statusData || [])
        }
      }

      // Fetch public data
      const [announcementsRes, documentsRes, faqsRes, dailyFocusRes, packingRes] = await Promise.all([
        supabase.from('kenya_trip_announcements').select('*').eq('trip_id', tripData.id).order('publish_at', { ascending: false }).limit(10),
        supabase.from('kenya_trip_documents').select('*').eq('trip_id', tripData.id).order('sort_order'),
        supabase.from('kenya_trip_faqs').select('*').eq('trip_id', tripData.id).eq('is_published', true).order('sort_order'),
        supabase.from('kenya_trip_daily_focus').select('*').eq('trip_id', tripData.id).order('focus_date'),
        supabase.from('kenya_trip_packing_items').select('*').eq('trip_id', tripData.id).order('sort_order'),
      ])

      setAnnouncements(announcementsRes.data || [])
      setDocuments(documentsRes.data || [])
      setFaqs(faqsRes.data || [])
      setDailyFocus(dailyFocusRes.data || [])
      setPackingItems(packingRes.data || [])
    }

    setLoading(false)
  }

  const handleApply = async () => {
    if (!trip) return

    setApplying(true)
    const supabase = createClient()

    // Get current user and member
    const { data: { user } } = await supabase.auth.getUser()
    let memberId = null

    if (user) {
      const { data: memberData } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      memberId = memberData?.id
    }

    // Build notes field with additional info
    const applicationNotes = [
      applicationForm.why_interested && `Why interested: ${applicationForm.why_interested}`,
      applicationForm.previous_missions && `Previous missions: ${applicationForm.previous_missions}`,
      applicationForm.special_skills && `Special skills: ${applicationForm.special_skills}`,
      applicationForm.dietary_restrictions && `Dietary restrictions: ${applicationForm.dietary_restrictions}`,
      applicationForm.needs_scholarship && `Scholarship requested: ${applicationForm.scholarship_reason || 'Yes'}`,
    ].filter(Boolean).join('\n\n')

    const { error } = await supabase.from('kenya_trip_participants').insert({
      trip_id: trip.id,
      member_id: memberId,
      first_name: applicationForm.first_name,
      last_name: applicationForm.last_name,
      email: applicationForm.email,
      phone: applicationForm.phone,
      service_track: applicationForm.service_track || null,
      emergency_contact_name: applicationForm.emergency_contact_name || null,
      emergency_contact_phone: applicationForm.emergency_contact_phone || null,
      emergency_contact_relationship: applicationForm.emergency_contact_relationship || null,
      allergies: applicationForm.allergies || null,
      medications: applicationForm.medications || null,
      medical_conditions: applicationForm.medical_conditions || null,
      notes: applicationNotes || null,
      scholarship_requested: applicationForm.needs_scholarship,
      application_status: 'pending',
    })

    if (!error) {
      // Show success and refresh
      fetchData()
      setActiveTab('apply') // Stay on apply tab to show status
    } else {
      console.error('Application error:', error)
      alert('Failed to submit application. Please try again.')
    }

    setApplying(false)
  }

  const togglePackingItem = async (itemId: string) => {
    if (!participant) return

    const supabase = createClient()
    const currentStatus = packingStatus.find(s => s.packing_item_id === itemId)
    const newStatus = !currentStatus?.is_packed

    if (currentStatus) {
      await supabase
        .from('kenya_trip_packing_status')
        .update({ is_packed: newStatus, packed_at: newStatus ? new Date().toISOString() : null })
        .eq('participant_id', participant.id)
        .eq('packing_item_id', itemId)
    } else {
      await supabase.from('kenya_trip_packing_status').insert({
        participant_id: participant.id,
        packing_item_id: itemId,
        is_packed: true,
        packed_at: new Date().toISOString(),
      })
    }

    setPackingStatus(prev => {
      const existing = prev.find(s => s.packing_item_id === itemId)
      if (existing) {
        return prev.map(s => s.packing_item_id === itemId ? { ...s, is_packed: newStatus } : s)
      }
      return [...prev, { packing_item_id: itemId, is_packed: true }]
    })
  }

  // Document upload handler
  const uploadDocument = async (
    file: File,
    documentType: 'passport' | 'visa' | 'vaccination' | 'insurance' | 'medical_form'
  ) => {
    if (!participant || !member) return

    setUploadingDoc(documentType)
    const supabase = createClient()

    try {
      // Get current user for folder path
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kenya-trip-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL (signed URL for private bucket)
      const { data: urlData } = await supabase.storage
        .from('kenya-trip-documents')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry

      const documentUrl = urlData?.signedUrl || uploadData.path

      // Update participant record with document URL
      const columnName = `${documentType}_document_url` as const
      const { error: updateError } = await supabase
        .from('kenya_trip_participants')
        .update({ [columnName]: documentUrl })
        .eq('id', participant.id)

      if (updateError) throw updateError

      // Refresh participant data
      fetchData()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploadingDoc(null)
    }
  }

  // Delete document handler
  const deleteDocument = async (documentType: 'passport' | 'visa' | 'vaccination' | 'insurance' | 'medical_form') => {
    if (!participant) return

    if (!confirm('Are you sure you want to delete this document?')) return

    const supabase = createClient()

    try {
      const columnName = `${documentType}_document_url` as const
      const { error } = await supabase
        .from('kenya_trip_participants')
        .update({ [columnName]: null })
        .eq('id', participant.id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document.')
    }
  }

  // Document types configuration
  const documentTypes = [
    { key: 'passport' as const, label: 'Passport Copy', description: 'Upload a clear copy of your passport photo page', required: true },
    { key: 'visa' as const, label: 'Kenya Visa', description: 'Upload your approved Kenya visa or eVisa confirmation', required: true },
    { key: 'vaccination' as const, label: 'Vaccination Records', description: 'Yellow fever certificate and other vaccination records', required: true },
    { key: 'insurance' as const, label: 'Travel Insurance', description: 'Proof of travel/medical insurance coverage', required: true },
    { key: 'medical_form' as const, label: 'Medical Form', description: 'Completed medical information form (if required)', required: false },
  ]

  // Intelligently recommend a service track based on occupation/profession
  const getRecommendedTrack = (occupation: string | null | undefined): string => {
    if (!occupation) return ''
    const occ = occupation.toLowerCase()

    if (occ.includes('doctor') || occ.includes('nurse') || occ.includes('medical') || occ.includes('health') || occ.includes('physician') || occ.includes('therapist')) {
      return 'medical_missions'
    }
    if (occ.includes('teacher') || occ.includes('professor') || occ.includes('education') || occ.includes('tutor') || occ.includes('school')) {
      return 'education_youth'
    }
    if (occ.includes('pastor') || occ.includes('minister') || occ.includes('missionary') || occ.includes('chaplain') || occ.includes('worship')) {
      return 'ministry_spiritual'
    }
    if (occ.includes('business') || occ.includes('entrepreneur') || occ.includes('finance') || occ.includes('accountant') || occ.includes('consultant')) {
      return 'business_development'
    }
    if (occ.includes('agriculture') || occ.includes('farm') || occ.includes('food') || occ.includes('nutrition')) {
      return 'food_security'
    }
    return ''
  }

  // Check if member might be eligible for scholarship based on profile
  const getScholarshipEligibility = (): { eligible: boolean; reasons: string[] } => {
    if (!member) return { eligible: false, reasons: [] }

    const reasons: string[] = []
    const memberAge = member.date_of_birth
      ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null

    // Students/young adults (priority per website)
    if (memberAge && memberAge >= 18 && memberAge <= 30) {
      reasons.push('Young adult with calling')
    }

    // Medical/education professionals (priority per website)
    const occ = member.occupation?.toLowerCase() || ''
    if (occ.includes('doctor') || occ.includes('nurse') || occ.includes('medical') || occ.includes('health')) {
      reasons.push('Medical professional')
    }
    if (occ.includes('teacher') || occ.includes('education') || occ.includes('professor')) {
      reasons.push('Education professional')
    }

    // First-time missionaries - check if they're newer members
    const memberSince = new Date(member.created_at)
    const monthsAsMember = (Date.now() - memberSince.getTime()) / (30 * 24 * 60 * 60 * 1000)
    if (monthsAsMember < 24) {
      reasons.push('Potential first-time missionary')
    }

    return { eligible: reasons.length > 0, reasons }
  }

  // Generate personalized "why you should go" message
  const getPersonalizedMessage = (): string => {
    if (!member) return ''

    const occ = member.occupation?.toLowerCase() || ''
    const firstName = member.first_name

    if (occ.includes('doctor') || occ.includes('nurse') || occ.includes('medical') || occ.includes('health')) {
      return `${firstName}, your medical expertise could transform lives in Kenya. Our Medical Missions track is looking for healthcare professionals just like you to provide care in underserved communities.`
    }
    if (occ.includes('teacher') || occ.includes('education') || occ.includes('professor')) {
      return `${firstName}, your passion for education could impact hundreds of young Kenyans. The Education & Youth track needs dedicated educators to inspire the next generation.`
    }
    if (occ.includes('pastor') || occ.includes('minister') || occ.includes('missionary')) {
      return `${firstName}, your ministry experience makes you an ideal candidate for our Ministry & Spiritual Care track. Help lead worship and provide pastoral care across three cities.`
    }
    if (occ.includes('business') || occ.includes('entrepreneur') || occ.includes('finance')) {
      return `${firstName}, your business acumen could help Kenyan entrepreneurs build sustainable businesses. Join our Business Development track to create lasting economic impact.`
    }

    return `${firstName}, this trip is more than travel—it's a Kingdom assignment. Your unique gifts and experiences can transform lives in Kenya while transforming yours.`
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <Plane className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-navy mb-2">No Upcoming Trip</h2>
          <p className="text-gray-600">Check back soon for information about our next mission trip!</p>
        </div>
      </div>
    )
  }

  const daysUntilTrip = Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const tripDuration = Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))
  const fundraisingPercent = participant && participant.fundraising_goal > 0
    ? Math.round((participant.amount_raised / participant.fundraising_goal) * 100)
    : 0

  // Get today's prayer focus
  const today = new Date().toISOString().split('T')[0]
  const todaysFocus = dailyFocus.find(df => df.focus_date === today)

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-navy to-navy-800 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge className="bg-gold text-navy mb-3">Mission Trip 2026</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{trip.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
                  {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Kenya, East Africa
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {tripDuration} days
                </span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-5xl font-bold text-gold">{daysUntilTrip}</p>
              <p className="text-white/70">days to go</p>
            </div>
          </div>
        </div>

        {/* Application Status Banner */}
        {participant && (
          <Card className={`mb-6 ${
            participant.application_status === 'approved' ? 'border-green-500 bg-green-50' :
            participant.application_status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
            participant.application_status === 'waitlisted' ? 'border-blue-500 bg-blue-50' :
            'border-red-500 bg-red-50'
          }`}>
            <CardContent className="p-4 flex items-center gap-4">
              {participant.application_status === 'approved' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : participant.application_status === 'pending' ? (
                <Clock className="h-8 w-8 text-yellow-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-navy">
                  {participant.application_status === 'approved' && "You're going to Kenya!"}
                  {participant.application_status === 'pending' && "Application Under Review"}
                  {participant.application_status === 'waitlisted' && "You're on the Waitlist"}
                  {participant.application_status === 'declined' && "Application Not Accepted"}
                </p>
                <p className="text-sm text-gray-600">
                  {participant.application_status === 'approved' && "Complete your requirements below to prepare for the trip."}
                  {participant.application_status === 'pending' && "We'll notify you once your application has been reviewed."}
                  {participant.application_status === 'waitlisted' && "We'll contact you if a spot opens up."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="apply">{participant ? 'My Status' : 'Apply'}</TabsTrigger>
            <TabsTrigger value="docs">Documents</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="prayer">Prayer</TabsTrigger>
            {participant?.application_status === 'approved' && (
              <TabsTrigger value="packing">Packing</TabsTrigger>
            )}
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid gap-6">
              {/* Personalized Message - Only show if not already applied */}
              {!participant && member && (
                <Card className="border-gold bg-gradient-to-br from-gold/10 to-amber-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy text-lg mb-2">Why This Trip Is For You</h3>
                        <p className="text-gray-700">{getPersonalizedMessage()}</p>
                        {getScholarshipEligibility().eligible && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                            <Gift className="h-4 w-4" />
                            <span>You may qualify for a partial scholarship!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* About the Trip */}
                <Card>
                  <CardHeader>
                    <CardTitle>About the Trip</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{trip.description || "Transform Lives. Be Transformed. Join us for a 14-day Kingdom assignment across three Kenyan cities."}</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-navy" />
                        <span>{TRIP_INFO.dates} ({TRIP_INFO.duration})</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 text-navy" />
                        <span>Team Size: Up to {trip.participant_goal} people</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-navy" />
                        <span>Registration Deadline: {new Date(trip.registration_deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Locations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gold" />
                      Where We're Going
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {TRIP_INFO.locations.map((loc, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-navy">{loc.name}</p>
                            <p className="text-sm text-gray-600">{loc.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Itinerary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-gold" />
                    Trip Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {TRIP_INFO.itinerary.map((phase, idx) => (
                      <div key={idx} className="relative">
                        <div className={`p-4 rounded-lg border-2 ${
                          phase.phase === 'Service' ? 'border-gold bg-gold/5' : 'border-gray-200'
                        }`}>
                          <Badge className={`mb-2 ${
                            phase.phase === 'Arrival' ? 'bg-blue-100 text-blue-800' :
                            phase.phase === 'Immersion' ? 'bg-purple-100 text-purple-800' :
                            phase.phase === 'Sabbath' ? 'bg-green-100 text-green-800' :
                            'bg-gold text-white'
                          }`}>
                            {phase.phase}
                          </Badge>
                          <p className="text-sm font-medium text-navy">{phase.dates}</p>
                          <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                        </div>
                        {idx < TRIP_INFO.itinerary.length - 1 && (
                          <ChevronRight className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Service Tracks */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Tracks</CardTitle>
                  <CardDescription>Choose your area of ministry impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {TRIP_INFO.serviceTracks.map(track => {
                      const Icon = track.icon
                      const isRecommended = member && getRecommendedTrack(member.occupation) === track.value
                      return (
                        <div
                          key={track.value}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            isRecommended ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isRecommended ? 'bg-gold/20' : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-5 w-5 ${isRecommended ? 'text-gold' : 'text-navy'}`} />
                            </div>
                            <div>
                              <p className="font-medium text-navy">{track.label}</p>
                              {isRecommended && (
                                <Badge className="bg-gold/20 text-gold-dark text-xs">Recommended for you</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{track.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {TRIP_INFO.whatsIncluded.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Prayer Focus */}
              {todaysFocus && (
                <Card className="border-gold bg-gradient-to-br from-gold/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-gold" />
                      Today's Prayer Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold text-navy mb-2">{todaysFocus.theme}</h3>
                    {todaysFocus.scripture_reference && (
                      <div className="bg-white p-4 rounded-lg border-l-4 border-gold mb-3">
                        <p className="font-medium text-gold-dark">{todaysFocus.scripture_reference}</p>
                        {todaysFocus.scripture_text && (
                          <p className="text-gray-700 italic mt-1">"{todaysFocus.scripture_text}"</p>
                        )}
                      </div>
                    )}
                    {todaysFocus.prayer_focus && (
                      <p className="text-gray-600">{todaysFocus.prayer_focus}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-navy mb-1">Questions?</h3>
                      <p className="text-gray-600">We'd love to help you learn more about this trip.</p>
                    </div>
                    <div className="flex gap-3">
                      <a href={`mailto:${TRIP_INFO.contact.email}`}>
                        <Button variant="outline" className="gap-2">
                          <Mail className="h-4 w-4" />
                          {TRIP_INFO.contact.email}
                        </Button>
                      </a>
                      <a href={TRIP_INFO.contact.website} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-navy hover:bg-navy/90 gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Full Details
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* APPLY / MY STATUS TAB */}
          <TabsContent value="apply">
            {participant ? (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Status Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Status</span>
                      <Badge className={`${
                        participant.application_status === 'approved' ? 'bg-green-100 text-green-800' :
                        participant.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.application_status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Service Track</span>
                      <span className="font-medium capitalize">{participant.service_track || 'Not assigned'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Applied</span>
                      <span>{new Date(participant.application_date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Fundraising - Full Section */}
                {participant.application_status === 'approved' && (
                  <FundraisingSection
                    participant={participant}
                    fundraisingPercent={fundraisingPercent}
                    onUpdate={fetchData}
                  />
                )}

                {/* Requirements Checklist */}
                {participant.application_status === 'approved' && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Requirements Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                          participant.passport_status === 'verified' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                        }`}>
                          {participant.passport_status === 'verified' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-medium">Passport</p>
                            <p className="text-sm text-gray-600 capitalize">{participant.passport_status}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                          participant.visa_status === 'approved' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                        }`}>
                          {participant.visa_status === 'approved' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-medium">Visa</p>
                            <p className="text-sm text-gray-600 capitalize">{participant.visa_status.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                          participant.payment_status === 'paid' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                        }`}>
                          {participant.payment_status === 'paid' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-medium">Payment</p>
                            <p className="text-sm text-gray-600 capitalize">{participant.payment_status}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                          participant.emergency_contact_name ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}>
                          {participant.emergency_contact_name ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">Emergency Contact</p>
                            <p className="text-sm text-gray-600">
                              {participant.emergency_contact_name || 'Required'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Document Uploads */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      My Documents
                    </CardTitle>
                    <CardDescription>
                      Upload required documents for trip verification. All file formats accepted.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {documentTypes.map((docType) => {
                        const docUrl = participant[`${docType.key}_document_url` as keyof Participant] as string | null
                        const isUploading = uploadingDoc === docType.key

                        return (
                          <div
                            key={docType.key}
                            className={`p-4 rounded-lg border-2 ${
                              docUrl ? 'border-green-200 bg-green-50' : docType.required ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium flex items-center gap-2">
                                  {docUrl ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <File className="h-4 w-4 text-gray-400" />
                                  )}
                                  {docType.label}
                                  {docType.required && !docUrl && (
                                    <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">Required</Badge>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{docType.description}</p>
                              </div>
                            </div>

                            {docUrl ? (
                              <div className="flex items-center gap-2 mt-3">
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1"
                                >
                                  <Button variant="outline" size="sm" className="w-full gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Document
                                  </Button>
                                </a>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteDocument(docType.key)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="mt-3">
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) uploadDocument(file, docType.key)
                                    }}
                                    disabled={isUploading}
                                  />
                                  <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed transition-colors ${
                                    isUploading
                                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                      : 'border-navy/30 hover:border-navy hover:bg-navy/5 cursor-pointer'
                                  }`}>
                                    {isUploading ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Uploading...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4 text-navy" />
                                        <span className="text-sm text-navy font-medium">Upload File</span>
                                      </>
                                    )}
                                  </div>
                                </label>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Accepted formats: PDF, JPG, PNG, DOC, DOCX, and more. Max 10MB per file.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Application Form */
              <div className="space-y-6">
                {/* Pre-filled notice */}
                {member && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <p className="text-blue-800">
                        We've pre-filled your information from your profile. Please review and complete the remaining fields.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Apply for Kenya 2026</CardTitle>
                    <CardDescription>Complete the form below to apply for the mission trip</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Personal Info */}
                      <div>
                        <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Personal Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>First Name *</Label>
                            <Input
                              value={applicationForm.first_name}
                              onChange={(e) => setApplicationForm({ ...applicationForm, first_name: e.target.value })}
                              className="mt-1"
                              disabled={!!member}
                            />
                          </div>
                          <div>
                            <Label>Last Name *</Label>
                            <Input
                              value={applicationForm.last_name}
                              onChange={(e) => setApplicationForm({ ...applicationForm, last_name: e.target.value })}
                              className="mt-1"
                              disabled={!!member}
                            />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={applicationForm.email}
                              onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                              className="mt-1"
                              disabled={!!member}
                            />
                          </div>
                          <div>
                            <Label>Phone *</Label>
                            <Input
                              value={applicationForm.phone}
                              onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ministry Interest */}
                      <div>
                        <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Ministry Interest
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label>Preferred Service Track *</Label>
                            <Select
                              value={applicationForm.service_track}
                              onValueChange={(value) => setApplicationForm({ ...applicationForm, service_track: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a track..." />
                              </SelectTrigger>
                              <SelectContent>
                                {TRIP_INFO.serviceTracks.map(track => {
                                  const isRecommended = member && getRecommendedTrack(member.occupation) === track.value
                                  return (
                                    <SelectItem key={track.value} value={track.value}>
                                      {track.label} {isRecommended && '(Recommended)'}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            {applicationForm.service_track && (
                              <p className="text-sm text-gray-500 mt-2">
                                {TRIP_INFO.serviceTracks.find(t => t.value === applicationForm.service_track)?.description}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Why are you interested in this trip? *</Label>
                            <Textarea
                              value={applicationForm.why_interested}
                              onChange={(e) => setApplicationForm({ ...applicationForm, why_interested: e.target.value })}
                              placeholder="Share what draws you to this mission and how you hope to serve..."
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Previous mission trip experience</Label>
                            <Textarea
                              value={applicationForm.previous_missions}
                              onChange={(e) => setApplicationForm({ ...applicationForm, previous_missions: e.target.value })}
                              placeholder="List any previous mission trips or international service experiences (or write 'None' if this is your first)"
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Special skills or qualifications</Label>
                            <Textarea
                              value={applicationForm.special_skills}
                              onChange={(e) => setApplicationForm({ ...applicationForm, special_skills: e.target.value })}
                              placeholder="Languages spoken, certifications, professional skills relevant to your chosen track..."
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Scholarship */}
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                          <Gift className="h-4 w-4 text-amber-600" />
                          Scholarship Information
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Limited partial scholarships are available. Priority is given to students/young adults, medical/education professionals, and first-time missionaries.
                        </p>
                        {getScholarshipEligibility().eligible && (
                          <div className="bg-white p-3 rounded-lg border border-amber-300 mb-4">
                            <p className="text-sm font-medium text-amber-800 mb-2">Based on your profile, you may qualify:</p>
                            <ul className="text-sm text-amber-700 list-disc list-inside">
                              {getScholarshipEligibility().reasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <Checkbox
                            id="needs_scholarship"
                            checked={applicationForm.needs_scholarship}
                            onCheckedChange={(checked) => setApplicationForm({ ...applicationForm, needs_scholarship: !!checked })}
                          />
                          <Label htmlFor="needs_scholarship" className="cursor-pointer">
                            I would like to be considered for a partial scholarship
                          </Label>
                        </div>
                        {applicationForm.needs_scholarship && (
                          <div>
                            <Label>Please share your story and financial need</Label>
                            <Textarea
                              value={applicationForm.scholarship_reason}
                              onChange={(e) => setApplicationForm({ ...applicationForm, scholarship_reason: e.target.value })}
                              placeholder="Share your calling to this trip and why financial assistance would help you participate..."
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      <div>
                        <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Emergency Contact
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>Contact Name *</Label>
                            <Input
                              value={applicationForm.emergency_contact_name}
                              onChange={(e) => setApplicationForm({ ...applicationForm, emergency_contact_name: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Contact Phone *</Label>
                            <Input
                              value={applicationForm.emergency_contact_phone}
                              onChange={(e) => setApplicationForm({ ...applicationForm, emergency_contact_phone: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Relationship *</Label>
                            <Input
                              value={applicationForm.emergency_contact_relationship}
                              onChange={(e) => setApplicationForm({ ...applicationForm, emergency_contact_relationship: e.target.value })}
                              placeholder="e.g., Spouse, Parent"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Medical */}
                      <div>
                        <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Medical Information
                        </h3>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Allergies</Label>
                              <Textarea
                                value={applicationForm.allergies}
                                onChange={(e) => setApplicationForm({ ...applicationForm, allergies: e.target.value })}
                                placeholder="Food, medication, environmental..."
                                rows={2}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Dietary Restrictions</Label>
                              <Textarea
                                value={applicationForm.dietary_restrictions}
                                onChange={(e) => setApplicationForm({ ...applicationForm, dietary_restrictions: e.target.value })}
                                placeholder="Vegetarian, vegan, gluten-free..."
                                rows={2}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Current Medications</Label>
                            <Textarea
                              value={applicationForm.medications}
                              onChange={(e) => setApplicationForm({ ...applicationForm, medications: e.target.value })}
                              placeholder="List any medications you take regularly"
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Medical Conditions</Label>
                            <Textarea
                              value={applicationForm.medical_conditions}
                              onChange={(e) => setApplicationForm({ ...applicationForm, medical_conditions: e.target.value })}
                              placeholder="Any conditions we should be aware of (asthma, diabetes, heart conditions, etc.)"
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          className="w-full bg-gold hover:bg-gold-dark text-white py-6 text-lg"
                          onClick={handleApply}
                          disabled={applying || !applicationForm.first_name || !applicationForm.last_name || !applicationForm.email || !applicationForm.service_track || !applicationForm.why_interested}
                        >
                          {applying ? (
                            <>
                              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Plane className="h-5 w-5 mr-2" />
                              Submit My Application
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-gray-500 text-center mt-3">
                          Our team will contact you within 48 hours of submission
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="docs">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Important files and forms</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No documents available yet</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <a
                          key={doc.id}
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-navy" />
                          <div className="flex-1">
                            <p className="font-medium">{doc.name}</p>
                            {doc.description && (
                              <p className="text-sm text-gray-500">{doc.description}</p>
                            )}
                          </div>
                          {doc.is_required && (
                            <Badge className="bg-red-100 text-red-800">Required</Badge>
                          )}
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>FAQs</CardTitle>
                  <CardDescription>Frequently asked questions</CardDescription>
                </CardHeader>
                <CardContent>
                  {faqs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No FAQs available yet</p>
                  ) : (
                    <div className="space-y-4">
                      {faqs.map(faq => (
                        <div key={faq.id} className="border-b pb-4 last:border-0">
                          <p className="font-medium text-navy mb-1">{faq.question}</p>
                          <p className="text-sm text-gray-600">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* UPDATES TAB */}
          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle>Team Updates</CardTitle>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No announcements yet</p>
                ) : (
                  <div className="space-y-4">
                    {announcements.map(ann => (
                      <div
                        key={ann.id}
                        className={`p-4 rounded-lg border ${
                          ann.is_pinned ? 'border-gold bg-gold/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            ann.priority === 'urgent' ? 'bg-red-500' :
                            ann.priority === 'high' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-navy">{ann.title}</h4>
                              {ann.is_pinned && <Star className="h-4 w-4 text-gold" />}
                            </div>
                            <p className="text-gray-600">{ann.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(ann.publish_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRAYER TAB */}
          <TabsContent value="prayer">
            <div className="grid gap-6">
              {dailyFocus.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Prayer focus content coming soon</p>
                  </CardContent>
                </Card>
              ) : (
                dailyFocus.slice(0, 7).map(df => (
                  <Card key={df.id} className={df.focus_date === today ? 'border-gold ring-2 ring-gold/20' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${
                          df.phase === 'pre_trip' ? 'bg-blue-100 text-blue-800' :
                          df.phase === 'during_trip' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {df.phase.replace('_', '-')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(df.focus_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        {df.focus_date === today && (
                          <Badge className="bg-gold text-white">Today</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-navy mb-3">{df.theme}</h3>
                      {df.scripture_reference && (
                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gold mb-3">
                          <p className="font-medium text-gold-dark">{df.scripture_reference}</p>
                          {df.scripture_text && (
                            <p className="text-gray-700 italic mt-1">"{df.scripture_text}"</p>
                          )}
                        </div>
                      )}
                      {df.prayer_focus && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Prayer Focus</p>
                          <p className="text-gray-600">{df.prayer_focus}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* PACKING TAB - Only for approved participants */}
          {participant?.application_status === 'approved' && (
            <TabsContent value="packing">
              <Card>
                <CardHeader>
                  <CardTitle>Packing Checklist</CardTitle>
                  <CardDescription>
                    Track your packing progress - {packingStatus.filter(s => s.is_packed).length} of {packingItems.length} items packed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={(packingStatus.filter(s => s.is_packed).length / packingItems.length) * 100}
                    className="h-2 mb-6"
                  />

                  {packingItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Packing list coming soon</p>
                  ) : (
                    <div className="space-y-6">
                      {Array.from(new Set(packingItems.map(i => i.category))).map(category => (
                        <div key={category}>
                          <h3 className="font-semibold text-navy capitalize mb-3">{category}</h3>
                          <div className="space-y-2">
                            {packingItems.filter(i => i.category === category).map(item => {
                              const isPacked = packingStatus.find(s => s.packing_item_id === item.id)?.is_packed
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => togglePackingItem(item.id)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                                    isPacked ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  {isPacked ? (
                                    <CheckSquare className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400" />
                                  )}
                                  <div className="flex-1">
                                    <p className={`font-medium ${isPacked ? 'line-through text-gray-500' : ''}`}>
                                      {item.item_name}
                                    </p>
                                    {item.description && (
                                      <p className="text-sm text-gray-500">{item.description}</p>
                                    )}
                                  </div>
                                  {item.is_required && (
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
