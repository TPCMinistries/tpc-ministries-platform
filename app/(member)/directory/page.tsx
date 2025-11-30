'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Search,
  Cake,
  Heart,
  MessageCircle,
  Calendar,
  Star,
  Gift,
  PartyPopper,
  User,
  Mail
} from 'lucide-react'

interface MemberProfile {
  id: string
  first_name: string
  last_name: string
  email?: string
  birth_date?: string
  spiritual_birthday?: string
  membership_date?: string
  profile?: {
    bio?: string
    testimony?: string
    spiritual_gifts?: string[]
    interests?: string[]
    profile_photo_url?: string
  }
}

interface Celebration {
  id: string
  member_id: string
  celebration_type: string
  celebration_date: string
  member: {
    first_name: string
    last_name: string
  }
}

export default function DirectoryPage() {
  const [members, setMembers] = useState<MemberProfile[]>([])
  const [celebrations, setCelebrations] = useState<Celebration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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

    if (member) {
      setMemberId(member.id)
    }

    // Fetch all members with profiles
    const { data: membersData } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        birth_date,
        spiritual_birthday,
        membership_date,
        profile:member_profiles(
          bio,
          testimony,
          spiritual_gifts,
          interests,
          profile_photo_url
        )
      `)
      .order('first_name')

    if (membersData) {
      // Process to flatten profile array
      const processed = membersData.map((m: any) => ({
        ...m,
        profile: Array.isArray(m.profile) ? m.profile[0] : m.profile
      }))
      setMembers(processed)
    }

    // Fetch upcoming celebrations (birthdays, anniversaries, etc.)
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    const { data: celebrationsData } = await supabase
      .from('member_celebrations')
      .select(`
        *,
        member:members(first_name, last_name)
      `)
      .eq('is_public', true)
      .order('celebration_date')

    if (celebrationsData) {
      // Filter to show celebrations in the next 30 days (ignoring year)
      const upcoming = celebrationsData.filter((c: any) => {
        const celebDate = new Date(c.celebration_date)
        const thisYearDate = new Date(
          today.getFullYear(),
          celebDate.getMonth(),
          celebDate.getDate()
        )
        const daysDiff = Math.ceil((thisYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff >= 0 && daysDiff <= 30
      })
      setCelebrations(upcoming)
    }

    setLoading(false)
  }

  const getCelebrationIcon = (type: string) => {
    const icons: Record<string, any> = {
      birthday: Cake,
      spiritual_birthday: Star,
      anniversary: Heart,
      membership_anniversary: Gift,
      baptism: Heart
    }
    return icons[type] || PartyPopper
  }

  const getCelebrationColor = (type: string) => {
    const colors: Record<string, string> = {
      birthday: 'bg-pink-100 text-pink-800',
      spiritual_birthday: 'bg-purple-100 text-purple-800',
      anniversary: 'bg-red-100 text-red-800',
      membership_anniversary: 'bg-blue-100 text-blue-800',
      baptism: 'bg-teal-100 text-teal-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getCelebrationLabel = (type: string) => {
    const labels: Record<string, string> = {
      birthday: 'Birthday',
      spiritual_birthday: 'Spiritual Birthday',
      anniversary: 'Wedding Anniversary',
      membership_anniversary: 'Membership Anniversary',
      baptism: 'Baptism Anniversary'
    }
    return labels[type] || type
  }

  const filteredMembers = members.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Today's celebrations
  const todayStr = new Date().toISOString().split('T')[0].slice(5) // MM-DD
  const todayCelebrations = celebrations.filter(c => {
    const celebStr = c.celebration_date.slice(5)
    return celebStr === todayStr
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Member Directory</h1>
          </div>
          <p className="text-gray-600">
            Connect with fellow members of our church family
          </p>
        </div>

        {/* Today's Celebrations Banner */}
        {todayCelebrations.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-gold/20 to-pink-100 border-gold">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <PartyPopper className="h-6 w-6 text-gold" />
                <h2 className="text-lg font-bold text-navy">Today's Celebrations!</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                {todayCelebrations.map((c) => {
                  const Icon = getCelebrationIcon(c.celebration_type)
                  return (
                    <div key={c.id} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                      <Icon className="h-5 w-5 text-gold" />
                      <span className="font-medium text-navy">
                        {c.member.first_name} {c.member.last_name}
                      </span>
                      <Badge className={getCelebrationColor(c.celebration_type)}>
                        {getCelebrationLabel(c.celebration_type)}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList>
            <TabsTrigger value="directory">
              <Users className="h-4 w-4 mr-2" />
              Directory
            </TabsTrigger>
            <TabsTrigger value="celebrations">
              <Cake className="h-4 w-4 mr-2" />
              Upcoming Celebrations
            </TabsTrigger>
          </TabsList>

          {/* Directory */}
          <TabsContent value="directory">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {member.profile?.profile_photo_url ? (
                          <img
                            src={member.profile.profile_photo_url}
                            alt=""
                            className="w-14 h-14 object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-navy">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy truncate">
                          {member.first_name} {member.last_name}
                        </h3>

                        {member.profile?.spiritual_gifts && member.profile.spiritual_gifts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.profile.spiritual_gifts.slice(0, 2).map((gift, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {gift}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {member.profile?.bio && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {member.profile.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {member.id !== memberId && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Heart className="h-4 w-4 mr-1" />
                          Pray
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Members Found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search query
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upcoming Celebrations */}
          <TabsContent value="celebrations">
            {celebrations.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Cake className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Upcoming Celebrations
                  </h3>
                  <p className="text-gray-500">
                    Check back later for birthdays and anniversaries
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Group by type */}
                {['birthday', 'spiritual_birthday', 'anniversary', 'membership_anniversary', 'baptism'].map(type => {
                  const typeCelebrations = celebrations.filter(c => c.celebration_type === type)
                  if (typeCelebrations.length === 0) return null

                  const Icon = getCelebrationIcon(type)

                  return (
                    <Card key={type}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon className="h-5 w-5 text-gold" />
                          {getCelebrationLabel(type)}s This Month
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {typeCelebrations.map((c) => {
                            const celebDate = new Date(c.celebration_date)
                            const thisYearDate = new Date(
                              new Date().getFullYear(),
                              celebDate.getMonth(),
                              celebDate.getDate()
                            )

                            return (
                              <div
                                key={c.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                    <span className="text-sm font-bold text-gold">
                                      {c.member.first_name?.[0]}{c.member.last_name?.[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-navy">
                                      {c.member.first_name} {c.member.last_name}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {thisYearDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Gift className="h-4 w-4 mr-1" />
                                  Wish
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
