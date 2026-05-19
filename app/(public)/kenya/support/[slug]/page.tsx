'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plane,
  Heart,
  DollarSign,
  Calendar,
  MapPin,
  User,
  RefreshCw,
  CheckCircle,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

interface Participant {
  id: string
  fundraising_slug: string
  first_name: string
  last_name: string
  fundraising_story: string | null
  fundraising_photo_url: string | null
  fundraising_headline: string | null
  fundraising_video_url: string | null
  fundraising_personal_message: string | null
  fundraising_goal: number
  amount_raised: number
  service_track: string | null
  trip_name: string
  start_date: string
  end_date: string
}

interface Donation {
  id: string
  donor_name: string
  amount: number
  message: string | null
  is_anonymous: boolean
  show_name_publicly: boolean
  created_at: string
}

const DONATION_AMOUNTS = [25, 50, 100, 250, 500]
const STRIPE_FEE_PERCENT = 0.029
const STRIPE_FEE_FIXED = 0.30

export default function FundraisingPage() {
  const params = useParams()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [recentDonations, setRecentDonations] = useState<Donation[]>([])
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [coverFees, setCoverFees] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [slug])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch participant from public view
    const { data: participantData, error } = await supabase
      .from('kenya_trip_fundraising_public')
      .select('*')
      .eq('fundraising_slug', slug)
      .single()

    if (participantData) {
      setParticipant(participantData)

      // Fetch recent donations
      const { data: donations } = await supabase
        .from('kenya_trip_donations')
        .select('id, donor_name, amount, message, is_anonymous, show_name_publicly, created_at')
        .eq('participant_id', participantData.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentDonations(donations || [])
    }

    setLoading(false)
  }

  const getDonationAmount = () => {
    if (customAmount) return parseFloat(customAmount)
    return selectedAmount || 0
  }

  const calculateFees = (amount: number) => {
    return Math.round((amount * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED) * 100) / 100
  }

  const getTotalWithFees = () => {
    const amount = getDonationAmount()
    if (coverFees) {
      return Math.round((amount + calculateFees(amount)) * 100) / 100
    }
    return amount
  }

  const handleDonate = async () => {
    const amount = getDonationAmount()
    if (!amount || amount < 10) {
      alert('Minimum donation is $10')
      return
    }
    if (!donorEmail) {
      alert('Please enter your email')
      return
    }

    setProcessing(true)

    try {
      const response = await fetch('/api/kenya/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participant?.id,
          amount: getTotalWithFees(),
          netAmount: getDonationAmount(),
          feesCovered: coverFees ? calculateFees(amount) : 0,
          donorName: isAnonymous ? 'Anonymous' : donorName,
          donorEmail,
          message,
          isAnonymous,
          showNamePublicly: !isAnonymous,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout')
      }
    } catch (error) {
      console.error('Donation error:', error)
      alert('Failed to process donation. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  const shareOnTwitter = () => {
    const text = `Help ${participant?.first_name} reach their fundraising goal for the Kenya Mission Trip!`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Plane className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-navy mb-2">Page Not Found</h2>
            <p className="text-gray-600 mb-4">This fundraising page doesn't exist or is not active.</p>
            <Link href="/kenya">
              <Button>Learn About Kenya Trip</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = participant.fundraising_goal > 0
    ? Math.min(100, Math.round((participant.amount_raised / participant.fundraising_goal) * 100))
    : 0

  const serviceTrackLabels: Record<string, string> = {
    ministry_spiritual: 'Ministry & Spiritual Care',
    education_youth: 'Education & Youth',
    medical_missions: 'Medical Missions',
    business_development: 'Business Development',
    food_security: 'Food Security',
    material_support: 'Material Support',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/5 to-white">
      {/* Header */}
      <div className="bg-navy text-white py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-gold" />
            <span className="font-bold">TPC Ministries</span>
          </Link>
          <Badge className="bg-gold text-navy">Kenya 2025</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Hero Card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-navy to-navy-800 p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  {participant.fundraising_photo_url ? (
                    <img
                      src={participant.fundraising_photo_url}
                      alt={participant.first_name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gold shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gold flex items-center justify-center text-navy text-3xl font-bold shadow-lg">
                      {participant.first_name[0]}{participant.last_name[0]}
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {participant.fundraising_headline || `Help ${participant.first_name} Get to Kenya!`}
                    </h1>
                    <p className="text-white/80 flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      Kenya Kingdom Impact Trip 2025
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      {participant.first_name} {participant.last_name}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-bold text-gold">${participant.amount_raised.toLocaleString()}</span>
                    <span className="text-white/70">of ${participant.fundraising_goal.toLocaleString()}</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-white/20" />
                  <p className="text-sm text-white/70 mt-2">{progress}% funded</p>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Trip Info */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    April 23 – May 6, 2026 (complete)
                  </div>
                  {participant.service_track && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Heart className="h-4 w-4" />
                      {serviceTrackLabels[participant.service_track] || participant.service_track}
                    </div>
                  )}
                </div>

                {/* Video Embed */}
                {participant.fundraising_video_url && (
                  <div className="mb-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      {participant.fundraising_video_url.includes('youtube.com') || participant.fundraising_video_url.includes('youtu.be') ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${
                            participant.fundraising_video_url.includes('youtu.be')
                              ? participant.fundraising_video_url.split('/').pop()?.split('?')[0]
                              : new URL(participant.fundraising_video_url).searchParams.get('v')
                          }`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : participant.fundraising_video_url.includes('vimeo.com') ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${participant.fundraising_video_url.split('/').pop()?.split('?')[0]}`}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video src={participant.fundraising_video_url} controls className="w-full h-full" />
                      )}
                    </div>
                  </div>
                )}

                {/* Story */}
                {participant.fundraising_story ? (
                  <div className="prose prose-navy max-w-none">
                    <h3 className="text-lg font-semibold text-navy mb-3">My Story</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{participant.fundraising_story}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-600">
                      {participant.first_name} is raising funds to join the Kenya Kingdom Impact Trip 2025,
                      serving communities through {serviceTrackLabels[participant.service_track || ''] || 'ministry work'}.
                    </p>
                  </div>
                )}

                {participant.fundraising_personal_message && (
                  <div className="mt-6 p-4 bg-gold/10 border-l-4 border-gold rounded-r-lg">
                    <p className="text-gray-700 italic text-lg">"{participant.fundraising_personal_message}"</p>
                    <p className="text-sm text-gray-500 mt-2">— {participant.first_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Donations */}
            {recentDonations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Supporters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentDonations.map((donation) => (
                      <div key={donation.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {donation.is_anonymous || !donation.show_name_publicly
                                ? 'Anonymous'
                                : donation.donor_name || 'A Supporter'}
                            </p>
                            <span className="text-green-600 font-semibold">${donation.amount}</span>
                          </div>
                          {donation.message && (
                            <p className="text-sm text-gray-600 mt-1">"{donation.message}"</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Donation Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
                <CardDescription>Support {participant.first_name}'s mission trip</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Amount Selection */}
                <div>
                  <Label className="mb-2 block">Select Amount</Label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {DONATION_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount && !customAmount ? 'default' : 'outline'}
                        className={selectedAmount === amount && !customAmount ? 'bg-navy' : ''}
                        onClick={() => {
                          setSelectedAmount(amount)
                          setCustomAmount('')
                        }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="Other amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setSelectedAmount(null)
                      }}
                      className="pl-8"
                      min="10"
                    />
                  </div>
                </div>

                {/* Donor Info */}
                <div className="space-y-3">
                  <div>
                    <Label>Your Name</Label>
                    <Input
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="John Smith"
                      disabled={isAnonymous}
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label>Message (optional)</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Leave an encouraging message..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                    />
                    <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                      Make my donation anonymous
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="coverFees"
                      checked={coverFees}
                      onCheckedChange={(checked) => setCoverFees(!!checked)}
                    />
                    <Label htmlFor="coverFees" className="text-sm cursor-pointer">
                      Cover processing fees (${calculateFees(getDonationAmount()).toFixed(2)})
                    </Label>
                  </div>
                </div>

                {/* Total */}
                {getDonationAmount() > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span>Donation</span>
                      <span>${getDonationAmount().toFixed(2)}</span>
                    </div>
                    {coverFees && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Processing fees</span>
                        <span>${calculateFees(getDonationAmount()).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>${getTotalWithFees().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-gold hover:bg-gold-dark text-white py-6 text-lg"
                  onClick={handleDonate}
                  disabled={processing || getDonationAmount() < 10}
                >
                  {processing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5 mr-2" />
                      Donate ${getTotalWithFees().toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  TPC Ministries is a 501(c)(3) nonprofit. Your donation is tax-deductible.
                </p>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Share This Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={copyLink}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={shareOnFacebook}>
                  <ExternalLink className="h-4 w-4" />
                  Share on Facebook
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={shareOnTwitter}>
                  <ExternalLink className="h-4 w-4" />
                  Share on X/Twitter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} TPC Ministries. All donations are tax-deductible.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/kenya" className="text-white/80 hover:text-white text-sm">
              About the Trip
            </Link>
            <Link href="/" className="text-white/80 hover:text-white text-sm">
              TPC Ministries
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
