'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Heart,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Copy,
  Link,
  ExternalLink,
  Plus,
  Share2,
  Wand2,
  Video,
  ImageIcon,
  Palette,
  Type,
  BookOpen,
  Upload,
  Gift,
  Sparkles,
  Mail,
  Eye as EyeIcon,
} from 'lucide-react'
import type { Participant, Donation } from './types'

interface FundraisingManagerProps {
  participant: Participant
  donations: Donation[]
  onUpdate: () => void
  onSubmitManualDonation: (donation: { donor_name: string; amount: string; message: string; is_anonymous: boolean }) => Promise<boolean>
  onSavePersonalization: (updates: { story?: string; headline?: string; videoUrl?: string; pageEnabled?: boolean }) => Promise<boolean>
  onUploadPhoto: (file: File) => Promise<void>
  uploadingPhoto: boolean
}

export function FundraisingManager({
  participant,
  donations,
  onUpdate,
  onSubmitManualDonation,
  onSavePersonalization,
  onUploadPhoto,
  uploadingPhoto,
}: FundraisingManagerProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'personalize' | 'donations'>('overview')
  const [copied, setCopied] = useState(false)

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

  const fundraisingPercent = participant.fundraising_goal > 0
    ? Math.round((participant.amount_raised / participant.fundraising_goal) * 100)
    : 0

  const fundraisingUrl = participant.fundraising_slug
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'}/kenya/support/${participant.fundraising_slug}`
    : null

  // Track changes
  useEffect(() => {
    const changed =
      story !== (participant.fundraising_story || '') ||
      headline !== (participant.fundraising_headline || '') ||
      videoUrl !== (participant.fundraising_video_url || '') ||
      pageEnabled !== participant.fundraising_page_enabled
    setHasChanges(changed)
  }, [story, headline, videoUrl, pageEnabled, participant])

  // Reset on participant change
  useEffect(() => {
    setStory(participant.fundraising_story || '')
    setHeadline(participant.fundraising_headline || '')
    setVideoUrl(participant.fundraising_video_url || '')
    setPageEnabled(participant.fundraising_page_enabled)
  }, [participant])

  const copyLink = () => {
    if (fundraisingUrl) {
      navigator.clipboard.writeText(fundraisingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
          whyGoing: participant.notes,
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

  const saveChanges = async () => {
    setSaving(true)
    const success = await onSavePersonalization({
      story: story || undefined,
      headline: headline || undefined,
      videoUrl: videoUrl || undefined,
      pageEnabled,
    })
    if (success) {
      setHasChanges(false)
    }
    setSaving(false)
  }

  const handleSubmitManualDonation = async () => {
    if (!manualDonation.donor_name || !manualDonation.amount) {
      alert('Please enter donor name and amount')
      return
    }

    setSubmittingManual(true)
    const success = await onSubmitManualDonation(manualDonation)
    if (success) {
      setManualDonation({ donor_name: '', amount: '', message: '', is_anonymous: false })
      setShowManualEntry(false)
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
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Help me reach my goal for the Kenya Kingdom Impact Trip 2026!`)}&url=${encodeURIComponent(fundraisingUrl)}`, '_blank')}
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
                        if (file) onUploadPhoto(file)
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
                        onClick={() => setStoryTone(tone.value as typeof storyTone)}
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
                    <Button onClick={handleSubmitManualDonation} disabled={submittingManual} className="bg-green-600 hover:bg-green-700">
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
              {donations.length === 0 ? (
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
                          <p className="text-xs text-gray-500 mt-1">&quot;{donation.message}&quot;</p>
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
