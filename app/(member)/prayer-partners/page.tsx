'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Heart,
  Sparkles,
  UserPlus,
  MessageCircle,
  CheckCircle,
  Clock,
  Star,
  Gift,
  Loader2,
  X,
  Mail
} from 'lucide-react'

interface PrayerPartner {
  id: string
  partnerId: string
  partnerName: string
  partnerEmail: string
  matchedAt: string
  status: 'active' | 'paused' | 'ended'
}

interface PotentialMatch {
  memberId: string
  memberName: string
  compatibilityScore: number
  sharedInterests: string[]
  spiritualGift: string | null
  currentSeason: string | null
  matchReason: string
}

export default function PrayerPartnersPage() {
  const [currentPartner, setCurrentPartner] = useState<PrayerPartner | null>(null)
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [findingMatches, setFindingMatches] = useState(false)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [memberId, setMemberId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) return
    setMemberId(member.id)

    // Fetch current prayer partnership
    const { data: partnerships } = await supabase
      .from('prayer_partnerships')
      .select(`
        id, status, matched_at,
        partner:partner_id (id, first_name, last_name, email)
      `)
      .eq('member_id', member.id)
      .eq('status', 'active')
      .single()

    if (partnerships && partnerships.partner) {
      const partner = partnerships.partner as any
      setCurrentPartner({
        id: partnerships.id,
        partnerId: partner.id,
        partnerName: `${partner.first_name} ${partner.last_name}`,
        partnerEmail: partner.email,
        matchedAt: partnerships.matched_at,
        status: partnerships.status
      })
    }

    setLoading(false)
  }

  const findMatches = async () => {
    if (!memberId) return
    setFindingMatches(true)

    try {
      const res = await fetch(`/api/ai/prayer-partner?memberId=${memberId}`)
      if (res.ok) {
        const data = await res.json()
        setPotentialMatches(data.potentialMatches || [])
      }
    } catch (error) {
      console.error('Error finding matches:', error)
    }

    setFindingMatches(false)
  }

  const requestPartnership = async (partnerId: string) => {
    if (!memberId) return
    setRequesting(partnerId)

    try {
      const res = await fetch('/api/ai/prayer-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, partnerId })
      })

      if (res.ok) {
        // Refresh data
        await fetchData()
        setPotentialMatches([])
      }
    } catch (error) {
      console.error('Error requesting partnership:', error)
    }

    setRequesting(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-blue-100 text-blue-700'
    return 'bg-amber-100 text-amber-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-navy">Prayer Partners</h1>
          </div>
          <p className="text-gray-600">Connect with a spiritual companion for mutual prayer support</p>
        </div>

        {/* Current Partner */}
        {currentPartner ? (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Your Prayer Partner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {currentPartner.partnerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy">{currentPartner.partnerName}</h3>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {currentPartner.partnerEmail}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Partners since {new Date(currentPartner.matchedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button className="bg-navy hover:bg-navy/90">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg">
                <h4 className="font-medium text-navy mb-2">Prayer Commitment</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pray for each other daily
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Share prayer requests weekly
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Celebrate answered prayers together
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* No Partner - Find One */}
            <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-navy mb-2">Find Your Prayer Partner</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Our AI will match you with a compatible prayer partner based on your spiritual profile,
                  gifts, and current season of life.
                </p>
                <Button
                  onClick={findMatches}
                  disabled={findingMatches}
                  className="bg-navy hover:bg-navy/90"
                  size="lg"
                >
                  {findingMatches ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Find My Match
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Potential Matches */}
            {potentialMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold" />
                  Potential Matches
                </h2>
                <div className="space-y-4">
                  {potentialMatches.map((match, index) => (
                    <Card key={match.memberId} className={index === 0 ? 'border-gold border-2' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-navy to-navy/70 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {match.memberName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-navy">{match.memberName}</h3>
                              {index === 0 && (
                                <Badge className="bg-gold text-navy">Best Match</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className={getScoreColor(match.compatibilityScore)}>
                                {match.compatibilityScore}% Compatible
                              </Badge>
                              {match.spiritualGift && (
                                <Badge variant="outline">
                                  <Gift className="h-3 w-3 mr-1" />
                                  {match.spiritualGift}
                                </Badge>
                              )}
                              {match.currentSeason && (
                                <Badge variant="outline">
                                  Season: {match.currentSeason}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-purple-600 mb-3">{match.matchReason}</p>
                            {match.sharedInterests.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {match.sharedInterests.map(interest => (
                                  <span key={interest} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => requestPartnership(match.memberId)}
                            disabled={requesting === match.memberId}
                            className="bg-navy hover:bg-navy/90"
                          >
                            {requesting === match.memberId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Prayer Partnership Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-navy" />
                </div>
                <h4 className="font-semibold text-navy mb-2">1. AI Matching</h4>
                <p className="text-sm text-gray-600">
                  Our AI analyzes your spiritual profile to find the most compatible partner
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-navy" />
                </div>
                <h4 className="font-semibold text-navy mb-2">2. Connect</h4>
                <p className="text-sm text-gray-600">
                  Choose a partner and commit to praying for each other regularly
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-navy" />
                </div>
                <h4 className="font-semibold text-navy mb-2">3. Grow Together</h4>
                <p className="text-sm text-gray-600">
                  Share requests, pray together, and celebrate answered prayers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
