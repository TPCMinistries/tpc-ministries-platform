'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Music,
  Baby,
  Heart,
  Camera,
  HandHeart,
  Mic,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Star
} from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string
  category: string
  meeting_schedule?: string
  requirements?: string
  image_url?: string
  is_accepting_volunteers: boolean
  leader?: {
    first_name: string
    last_name: string
  }
}

interface MyTeam {
  id: string
  team_id: string
  role: string
  status: string
  joined_at: string
  team: Team
}

interface Opportunity {
  id: string
  team_id: string
  title: string
  description?: string
  service_date?: string
  start_time?: string
  end_time?: string
  location?: string
  spots_available: number
  spots_filled: number
  team: {
    name: string
    category: string
  }
}

interface VolunteerStats {
  totalHours: number
  monthlyHours: number
  teamsJoined: number
}

export default function ServePage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [myTeams, setMyTeams] = useState<MyTeam[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState<VolunteerStats>({ totalHours: 0, monthlyHours: 0, teamsJoined: 0 })
  const [loading, setLoading] = useState(true)
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

      // Fetch my teams
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select(`
          *,
          team:ministry_teams(*)
        `)
        .eq('member_id', member.id)
        .eq('status', 'active')

      if (teamMemberships) {
        setMyTeams(teamMemberships as any)
      }

      // Fetch volunteer hours
      const { data: hours } = await supabase
        .from('volunteer_hours')
        .select('hours_served, service_date')
        .eq('member_id', member.id)

      if (hours) {
        const thisMonth = new Date().toISOString().slice(0, 7)
        const totalHours = hours.reduce((sum, h) => sum + (h.hours_served || 0), 0)
        const monthlyHours = hours
          .filter(h => h.service_date?.startsWith(thisMonth))
          .reduce((sum, h) => sum + (h.hours_served || 0), 0)

        setStats({
          totalHours,
          monthlyHours,
          teamsJoined: teamMemberships?.length || 0
        })
      }
    }

    // Fetch all teams
    const { data: teamsData } = await supabase
      .from('ministry_teams')
      .select(`
        *,
        leader:members!ministry_teams_leader_id_fkey(first_name, last_name)
      `)
      .order('name')

    if (teamsData) {
      setTeams(teamsData as any)
    }

    // Fetch upcoming opportunities
    const { data: opps } = await supabase
      .from('service_opportunities')
      .select(`
        *,
        team:ministry_teams(name, category)
      `)
      .gte('service_date', new Date().toISOString().split('T')[0])
      .order('service_date')
      .limit(10)

    if (opps) {
      setOpportunities(opps as any)
    }

    setLoading(false)
  }

  const joinTeam = async (teamId: string) => {
    if (!memberId) return

    const supabase = createClient()

    await supabase.from('team_members').insert({
      team_id: teamId,
      member_id: memberId,
      role: 'volunteer',
      status: 'pending'
    })

    fetchData()
  }

  const signUpForOpportunity = async (opportunityId: string) => {
    if (!memberId) return

    const supabase = createClient()

    await supabase.from('opportunity_signups').insert({
      opportunity_id: opportunityId,
      member_id: memberId,
      status: 'signed_up'
    })

    fetchData()
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      worship: Music,
      children: Baby,
      youth: Users,
      prayer: Heart,
      media: Camera,
      outreach: HandHeart,
      hospitality: Mic
    }
    return icons[category] || Users
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      worship: 'bg-purple-100 text-purple-800',
      children: 'bg-pink-100 text-pink-800',
      youth: 'bg-blue-100 text-blue-800',
      prayer: 'bg-red-100 text-red-800',
      media: 'bg-indigo-100 text-indigo-800',
      outreach: 'bg-green-100 text-green-800',
      hospitality: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

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
            <HandHeart className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Serve</h1>
          </div>
          <p className="text-gray-600">
            Use your gifts to serve God and others through ministry teams
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-navy to-navy/80 text-white">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.totalHours}</p>
              <p className="text-sm opacity-80">Total Hours</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gold to-amber-500 text-navy">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.monthlyHours}</p>
              <p className="text-sm opacity-80">This Month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.teamsJoined}</p>
              <p className="text-sm opacity-80">Teams Joined</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teams">Ministry Teams</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="my-service">My Service</TabsTrigger>
          </TabsList>

          {/* Ministry Teams */}
          <TabsContent value="teams">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => {
                const Icon = getCategoryIcon(team.category)
                const isJoined = myTeams.some(t => t.team_id === team.id)

                return (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(team.category)}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-navy">{team.name}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {team.category}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {team.description}
                      </p>

                      {team.leader && (
                        <p className="text-xs text-gray-500 mb-4">
                          Led by {team.leader.first_name} {team.leader.last_name}
                        </p>
                      )}

                      {team.meeting_schedule && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                          <Calendar className="h-3 w-3" />
                          {team.meeting_schedule}
                        </p>
                      )}

                      {isJoined ? (
                        <Button variant="outline" className="w-full" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Joined
                        </Button>
                      ) : team.is_accepting_volunteers ? (
                        <Button
                          onClick={() => joinTeam(team.id)}
                          className="w-full bg-navy hover:bg-navy/90"
                        >
                          Join Team
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          Not Accepting
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Opportunities */}
          <TabsContent value="opportunities">
            {opportunities.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Upcoming Opportunities
                  </h3>
                  <p className="text-gray-500">
                    Check back later for serving opportunities
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <Card key={opp.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(opp.team.category)}>
                              {opp.team.name}
                            </Badge>
                            {opp.service_date && (
                              <span className="text-sm text-gray-500">
                                {new Date(opp.service_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-navy mb-1">{opp.title}</h3>
                          {opp.description && (
                            <p className="text-sm text-gray-600 mb-3">{opp.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {opp.start_time && opp.end_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {opp.start_time} - {opp.end_time}
                              </span>
                            )}
                            {opp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {opp.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-2">
                            {opp.spots_available - opp.spots_filled} spots left
                          </p>
                          <Button
                            onClick={() => signUpForOpportunity(opp.id)}
                            className="bg-gold hover:bg-gold/90 text-navy"
                            disabled={opp.spots_filled >= opp.spots_available}
                          >
                            Sign Up
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Service */}
          <TabsContent value="my-service">
            <div className="grid gap-6 md:grid-cols-2">
              {/* My Teams */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-navy" />
                    My Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myTeams.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      You haven't joined any teams yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {myTeams.map((mt) => {
                        const Icon = getCategoryIcon(mt.team.category)
                        return (
                          <div
                            key={mt.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(mt.team.category)}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-navy">{mt.team.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{mt.role}</p>
                            </div>
                            {mt.status === 'active' && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Service Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-gold" />
                    Your Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Goal: 10 hours</span>
                        <span>{stats.monthlyHours}/10</span>
                      </div>
                      <Progress value={(stats.monthlyHours / 10) * 100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <Star className="h-8 w-8 text-gold mx-auto mb-1" />
                        <p className="text-2xl font-bold text-navy">{stats.totalHours}</p>
                        <p className="text-xs text-gray-500">Lifetime Hours</p>
                      </div>
                      <div className="text-center">
                        <Heart className="h-8 w-8 text-red-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-navy">{stats.teamsJoined}</p>
                        <p className="text-xs text-gray-500">Teams Serving</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
