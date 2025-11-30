'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Award,
  ChevronDown,
  Save,
  X,
  UserPlus,
  Building,
} from 'lucide-react'

interface MinistryTeam {
  id: string
  name: string
  description: string
  leader_id: string | null
  leader_name?: string
  meeting_schedule: string | null
  max_members: number | null
  is_active: boolean
  member_count?: number
  created_at: string
}

interface VolunteerOpportunity {
  id: string
  team_id: string
  team_name?: string
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  spots_available: number
  spots_filled: number
  location: string
  created_at: string
}

interface TeamMember {
  id: string
  team_id: string
  member_id: string
  role: string
  joined_at: string
  member?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function AdminVolunteerPage() {
  const [teams, setTeams] = useState<MinistryTeam[]>([])
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'teams' | 'opportunities' | 'signups'>('teams')
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showOpportunityModal, setShowOpportunityModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<MinistryTeam | null>(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalVolunteers: 0,
    upcomingOpportunities: 0,
    hoursThisMonth: 0,
  })

  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    meeting_schedule: '',
    max_members: '',
    is_active: true,
  })

  const [opportunityFormData, setOpportunityFormData] = useState({
    team_id: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '12:00',
    spots_available: 10,
    location: '',
  })

  useEffect(() => {
    fetchTeams()
    fetchOpportunities()
    fetchStats()
  }, [])

  const fetchTeams = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ministry_teams')
      .select('*')
      .order('name')

    if (!error && data) {
      setTeams(data)
    }
    setLoading(false)
  }

  const fetchOpportunities = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        ministry_teams(name)
      `)
      .order('date', { ascending: true })

    if (!error && data) {
      setOpportunities(data.map(o => ({
        ...o,
        team_name: o.ministry_teams?.name
      })))
    }
  }

  const fetchStats = async () => {
    const supabase = createClient()

    const { count: totalTeams } = await supabase
      .from('ministry_teams')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: totalVolunteers } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })

    const { count: upcomingOpportunities } = await supabase
      .from('volunteer_opportunities')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString().split('T')[0])

    const { data: hoursData } = await supabase
      .from('volunteer_hours')
      .select('hours')
      .gte('service_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const hoursThisMonth = hoursData?.reduce((sum, h) => sum + (h.hours || 0), 0) || 0

    setStats({
      totalTeams: totalTeams || 0,
      totalVolunteers: totalVolunteers || 0,
      upcomingOpportunities: upcomingOpportunities || 0,
      hoursThisMonth,
    })
  }

  const fetchTeamMembers = async (teamId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('team_members')
      .select(`
        *,
        members(first_name, last_name, email)
      `)
      .eq('team_id', teamId)

    if (data) {
      setTeamMembers(data.map(tm => ({
        ...tm,
        member: tm.members
      })))
    }
  }

  const handleCreateTeam = async () => {
    const supabase = createClient()
    const payload = {
      ...teamFormData,
      max_members: teamFormData.max_members ? parseInt(teamFormData.max_members) : null,
    }

    if (selectedTeam) {
      await supabase.from('ministry_teams').update(payload).eq('id', selectedTeam.id)
    } else {
      await supabase.from('ministry_teams').insert([payload])
    }

    fetchTeams()
    fetchStats()
    closeTeamModal()
  }

  const handleCreateOpportunity = async () => {
    const supabase = createClient()

    if (selectedOpportunity) {
      await supabase.from('volunteer_opportunities').update(opportunityFormData).eq('id', selectedOpportunity.id)
    } else {
      await supabase.from('volunteer_opportunities').insert([{ ...opportunityFormData, spots_filled: 0 }])
    }

    fetchOpportunities()
    fetchStats()
    closeOpportunityModal()
  }

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Delete this ministry team?')) return
    const supabase = createClient()
    await supabase.from('ministry_teams').delete().eq('id', id)
    fetchTeams()
    fetchStats()
  }

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm('Delete this volunteer opportunity?')) return
    const supabase = createClient()
    await supabase.from('volunteer_opportunities').delete().eq('id', id)
    fetchOpportunities()
    fetchStats()
  }

  const handleRemoveMember = async (memberId: string, teamId: string) => {
    if (!confirm('Remove this member from the team?')) return
    const supabase = createClient()
    await supabase.from('team_members').delete().eq('id', memberId)
    fetchTeamMembers(teamId)
    fetchStats()
  }

  const openTeamEditModal = (team: MinistryTeam) => {
    setSelectedTeam(team)
    setTeamFormData({
      name: team.name,
      description: team.description,
      meeting_schedule: team.meeting_schedule || '',
      max_members: team.max_members?.toString() || '',
      is_active: team.is_active,
    })
    setShowTeamModal(true)
  }

  const openOpportunityEditModal = (opp: VolunteerOpportunity) => {
    setSelectedOpportunity(opp)
    setOpportunityFormData({
      team_id: opp.team_id,
      title: opp.title,
      description: opp.description,
      date: opp.date,
      start_time: opp.start_time,
      end_time: opp.end_time,
      spots_available: opp.spots_available,
      location: opp.location,
    })
    setShowOpportunityModal(true)
  }

  const openMembersModal = (team: MinistryTeam) => {
    setSelectedTeam(team)
    fetchTeamMembers(team.id)
    setShowMembersModal(true)
  }

  const closeTeamModal = () => {
    setShowTeamModal(false)
    setSelectedTeam(null)
    setTeamFormData({
      name: '',
      description: '',
      meeting_schedule: '',
      max_members: '',
      is_active: true,
    })
  }

  const closeOpportunityModal = () => {
    setShowOpportunityModal(false)
    setSelectedOpportunity(null)
    setOpportunityFormData({
      team_id: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '12:00',
      spots_available: 10,
      location: '',
    })
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Volunteer & Teams</h1>
            <p className="text-gray-600">Manage ministry teams and volunteer opportunities</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowTeamModal(true)} variant="outline">
              <Building className="mr-2 h-4 w-4" />
              Add Team
            </Button>
            <Button onClick={() => setShowOpportunityModal(true)} className="bg-navy hover:bg-navy/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Teams</p>
                  <p className="text-3xl font-bold text-navy">{stats.totalTeams}</p>
                </div>
                <Building className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Volunteers</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalVolunteers}</p>
                </div>
                <Users className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Events</p>
                  <p className="text-3xl font-bold text-gold">{stats.upcomingOpportunities}</p>
                </div>
                <Calendar className="h-10 w-10 text-gold/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hours This Month</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.hoursThisMonth}</p>
                </div>
                <Clock className="h-10 w-10 text-purple-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['teams', 'opportunities'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : teams.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No ministry teams yet</p>
                </CardContent>
              </Card>
            ) : (
              teams.map((team) => (
                <Card key={team.id} className={!team.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="h-6 w-6 text-navy" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-navy">{team.name}</h3>
                          {!team.is_active && (
                            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">Inactive</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{team.description}</p>
                        {team.meeting_schedule && (
                          <p className="text-sm text-gray-500">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {team.meeting_schedule}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openMembersModal(team)}>
                          <Users className="h-4 w-4 mr-1" />
                          Members
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openTeamEditModal(team)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteTeam(team.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="grid gap-4">
            {opportunities.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No volunteer opportunities yet</p>
                </CardContent>
              </Card>
            ) : (
              opportunities.map((opp) => (
                <Card key={opp.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-navy">
                          {new Date(opp.date).getDate()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(opp.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-navy mb-1">{opp.title}</h3>
                        {opp.team_name && (
                          <span className="inline-block bg-navy/10 text-navy text-xs px-2 py-0.5 rounded mb-2">
                            {opp.team_name}
                          </span>
                        )}
                        <p className="text-gray-600 text-sm mb-2">{opp.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span><Clock className="h-3 w-3 inline mr-1" />{opp.start_time} - {opp.end_time}</span>
                          <span>{opp.location}</span>
                          <span className="text-green-600">
                            {opp.spots_filled}/{opp.spots_available} spots filled
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openOpportunityEditModal(opp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteOpportunity(opp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Team Modal */}
        {showTeamModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedTeam ? 'Edit Team' : 'Create Ministry Team'}
                </h2>
                <button onClick={closeTeamModal}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Team Name *</Label>
                  <Input
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                    placeholder="e.g., Worship Team"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={teamFormData.description}
                    onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meeting Schedule</Label>
                    <Input
                      value={teamFormData.meeting_schedule}
                      onChange={(e) => setTeamFormData({ ...teamFormData, meeting_schedule: e.target.value })}
                      placeholder="e.g., Sundays 8am"
                    />
                  </div>
                  <div>
                    <Label>Max Members</Label>
                    <Input
                      type="number"
                      value={teamFormData.max_members}
                      onChange={(e) => setTeamFormData({ ...teamFormData, max_members: e.target.value })}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={teamFormData.is_active}
                    onChange={(e) => setTeamFormData({ ...teamFormData, is_active: e.target.checked })}
                  />
                  <span className="text-sm">Active</span>
                </label>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateTeam} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedTeam ? 'Update' : 'Create'} Team
                  </Button>
                  <Button variant="outline" onClick={closeTeamModal}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opportunity Modal */}
        {showOpportunityModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedOpportunity ? 'Edit Opportunity' : 'Create Volunteer Opportunity'}
                </h2>
                <button onClick={closeOpportunityModal}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Ministry Team *</Label>
                  <select
                    value={opportunityFormData.team_id}
                    onChange={(e) => setOpportunityFormData({ ...opportunityFormData, team_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select a team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={opportunityFormData.title}
                    onChange={(e) => setOpportunityFormData({ ...opportunityFormData, title: e.target.value })}
                    placeholder="e.g., Sunday Service Setup"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={opportunityFormData.description}
                    onChange={(e) => setOpportunityFormData({ ...opportunityFormData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={opportunityFormData.date}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={opportunityFormData.start_time}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={opportunityFormData.end_time}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={opportunityFormData.location}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, location: e.target.value })}
                      placeholder="e.g., Main Sanctuary"
                    />
                  </div>
                  <div>
                    <Label>Spots Available</Label>
                    <Input
                      type="number"
                      value={opportunityFormData.spots_available}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, spots_available: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateOpportunity} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedOpportunity ? 'Update' : 'Create'} Opportunity
                  </Button>
                  <Button variant="outline" onClick={closeOpportunityModal}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Members Modal */}
        {showMembersModal && selectedTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-navy">{selectedTeam.name}</h2>
                  <p className="text-gray-600">Team Members</p>
                </div>
                <button onClick={() => setShowMembersModal(false)}><X className="h-5 w-5" /></button>
              </div>

              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No members in this team</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((tm) => (
                    <div key={tm.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
                        <span className="text-navy font-medium">
                          {tm.member?.first_name?.[0]}{tm.member?.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{tm.member?.first_name} {tm.member?.last_name}</p>
                        <p className="text-sm text-gray-500">{tm.role}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleRemoveMember(tm.id, selectedTeam.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
