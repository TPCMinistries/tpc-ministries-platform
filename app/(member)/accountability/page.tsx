'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Heart,
  BookOpen,
  Utensils,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  Send,
  Calendar,
  Sparkles
} from 'lucide-react'

interface Partner {
  id: string
  partnership_type: string
  status: string
  started_at: string
  meeting_frequency: string
  partner: {
    id: string
    first_name: string
    last_name: string
  }
}

interface PartnerPreference {
  seeking_partner: boolean
  preferred_types: string[]
  bio: string
}

interface PotentialMatch {
  id: string
  first_name: string
  last_name: string
  preferences: {
    preferred_types: string[]
    bio: string
  }
}

export default function AccountabilityPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([])
  const [myPreferences, setMyPreferences] = useState<PartnerPreference>({
    seeking_partner: false,
    preferred_types: ['prayer'],
    bio: ''
  })
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [savingPrefs, setSavingPrefs] = useState(false)

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

    if (member) {
      setMemberId(member.id)

      // Fetch my partnerships
      const { data: partnerships } = await supabase
        .from('accountability_partnerships')
        .select(`
          *,
          partner1:members!accountability_partnerships_member1_id_fkey(id, first_name, last_name),
          partner2:members!accountability_partnerships_member2_id_fkey(id, first_name, last_name)
        `)
        .or(`member1_id.eq.${member.id},member2_id.eq.${member.id}`)
        .eq('status', 'active')

      if (partnerships) {
        const formattedPartners = partnerships.map((p: any) => ({
          id: p.id,
          partnership_type: p.partnership_type,
          status: p.status,
          started_at: p.started_at,
          meeting_frequency: p.meeting_frequency,
          partner: p.member1_id === member.id ? p.partner2 : p.partner1
        }))
        setPartners(formattedPartners)
      }

      // Fetch my preferences
      const { data: prefs } = await supabase
        .from('partner_preferences')
        .select('*')
        .eq('member_id', member.id)
        .single()

      if (prefs) {
        setMyPreferences({
          seeking_partner: prefs.seeking_partner,
          preferred_types: prefs.preferred_types || ['prayer'],
          bio: prefs.bio || ''
        })
      }

      // Fetch potential matches (members seeking partners)
      const { data: matches } = await supabase
        .from('partner_preferences')
        .select(`
          member_id,
          preferred_types,
          bio,
          member:members(id, first_name, last_name)
        `)
        .eq('seeking_partner', true)
        .neq('member_id', member.id)
        .limit(10)

      if (matches) {
        const formattedMatches = matches.map((m: any) => ({
          id: m.member_id,
          first_name: m.member?.first_name,
          last_name: m.member?.last_name,
          preferences: {
            preferred_types: m.preferred_types,
            bio: m.bio
          }
        })).filter((m: PotentialMatch) => m.first_name)
        setPotentialMatches(formattedMatches)
      }
    }

    setLoading(false)
  }

  const savePreferences = async () => {
    if (!memberId) return

    setSavingPrefs(true)
    const supabase = createClient()

    await supabase
      .from('partner_preferences')
      .upsert({
        member_id: memberId,
        seeking_partner: myPreferences.seeking_partner,
        preferred_types: myPreferences.preferred_types,
        bio: myPreferences.bio,
        updated_at: new Date().toISOString()
      })

    setSavingPrefs(false)
    fetchData()
  }

  const requestPartnership = async (partnerId: string, type: string) => {
    if (!memberId) return

    const supabase = createClient()

    await supabase.from('accountability_partnerships').insert({
      member1_id: memberId,
      member2_id: partnerId,
      partnership_type: type,
      status: 'pending',
      initiated_by: memberId
    })

    fetchData()
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      prayer: Heart,
      reading: BookOpen,
      fasting: Utensils,
      general: Users,
      mentorship: Sparkles
    }
    return icons[type] || Users
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      prayer: 'bg-red-100 text-red-800',
      reading: 'bg-blue-100 text-blue-800',
      fasting: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800',
      mentorship: 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const partnershipTypes = [
    { id: 'prayer', label: 'Prayer Partner', icon: Heart, description: 'Pray for and with each other regularly' },
    { id: 'reading', label: 'Reading Partner', icon: BookOpen, description: 'Read Scripture together and discuss' },
    { id: 'fasting', label: 'Fasting Partner', icon: Utensils, description: 'Fast together and encourage each other' },
    { id: 'general', label: 'Accountability Partner', icon: Users, description: 'General spiritual accountability' },
    { id: 'mentorship', label: 'Mentorship', icon: Sparkles, description: 'Mentoring relationship' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Accountability Partners</h1>
          </div>
          <p className="text-gray-600">
            Connect with fellow believers for mutual encouragement and growth
          </p>
        </div>

        <Tabs defaultValue="my-partners" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-partners">My Partners</TabsTrigger>
            <TabsTrigger value="find-partner">Find a Partner</TabsTrigger>
            <TabsTrigger value="preferences">My Preferences</TabsTrigger>
          </TabsList>

          {/* My Partners */}
          <TabsContent value="my-partners">
            {partners.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Active Partners Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Find an accountability partner to grow together in faith
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {partners.map((partner) => {
                  const TypeIcon = getTypeIcon(partner.partnership_type)

                  return (
                    <Card key={partner.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-navy">
                              {partner.partner.first_name?.[0]}{partner.partner.last_name?.[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-navy">
                              {partner.partner.first_name} {partner.partner.last_name}
                            </h3>
                            <Badge className={`${getTypeColor(partner.partnership_type)} mt-1`}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {partner.partnership_type}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {partner.meeting_frequency} check-ins
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" className="flex-1 bg-navy hover:bg-navy/90">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Check-in
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Find a Partner */}
          <TabsContent value="find-partner">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-navy mb-2">
                Members Looking for Partners
              </h2>
              <p className="text-sm text-gray-600">
                Connect with others who are seeking accountability relationships
              </p>
            </div>

            {potentialMatches.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Matches Available
                  </h3>
                  <p className="text-gray-500">
                    Check back later or update your preferences to be found by others
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {potentialMatches.map((match) => (
                  <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-navy">
                            {match.first_name?.[0]}{match.last_name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-navy">
                            {match.first_name} {match.last_name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {match.preferences.preferred_types?.map((type: string) => (
                              <Badge key={type} className={getTypeColor(type)} variant="outline">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {match.preferences.bio && (
                        <p className="text-sm text-gray-600 mb-4 italic">
                          "{match.preferences.bio}"
                        </p>
                      )}

                      <Button
                        onClick={() => requestPartnership(match.id, match.preferences.preferred_types?.[0] || 'prayer')}
                        className="w-full bg-gold hover:bg-gold/90 text-navy"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Request Partnership
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Partnership Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seeking Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-navy">Looking for a Partner?</h3>
                    <p className="text-sm text-gray-600">
                      Enable this to be visible to others seeking partners
                    </p>
                  </div>
                  <Button
                    variant={myPreferences.seeking_partner ? 'default' : 'outline'}
                    onClick={() => setMyPreferences({ ...myPreferences, seeking_partner: !myPreferences.seeking_partner })}
                    className={myPreferences.seeking_partner ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {myPreferences.seeking_partner ? 'Seeking' : 'Not Seeking'}
                  </Button>
                </div>

                {/* Partnership Types */}
                <div>
                  <h3 className="font-medium text-navy mb-3">
                    What type of accountability are you looking for?
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {partnershipTypes.map((type) => {
                      const isSelected = myPreferences.preferred_types.includes(type.id)
                      const Icon = type.icon

                      return (
                        <button
                          key={type.id}
                          onClick={() => {
                            const newTypes = isSelected
                              ? myPreferences.preferred_types.filter(t => t !== type.id)
                              : [...myPreferences.preferred_types, type.id]
                            setMyPreferences({ ...myPreferences, preferred_types: newTypes })
                          }}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-navy bg-navy/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-navy' : 'text-gray-400'}`} />
                            <div>
                              <p className={`font-medium ${isSelected ? 'text-navy' : 'text-gray-700'}`}>
                                {type.label}
                              </p>
                              <p className="text-xs text-gray-500">{type.description}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="font-medium text-navy block mb-2">
                    About You (visible to potential partners)
                  </label>
                  <Textarea
                    placeholder="Share a bit about yourself, your faith journey, and what you're looking for in an accountability partner..."
                    value={myPreferences.bio}
                    onChange={(e) => setMyPreferences({ ...myPreferences, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={savePreferences}
                  disabled={savingPrefs}
                  className="w-full bg-navy hover:bg-navy/90"
                >
                  {savingPrefs ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
