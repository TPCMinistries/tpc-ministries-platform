'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Heart,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react'

interface VolunteerShift {
  id: string
  title?: string
  shift_date: string
  start_time: string
  end_time: string
  slots_available: number
  slots_filled: number
  notes?: string
  signups?: { id: string; member_id: string; status: string }[]
}

interface VolunteerOpportunity {
  id: string
  title: string
  description?: string
  ministry_area: string
  requirements?: string
  commitment_level?: string
  training_required: boolean
  upcoming_shifts?: VolunteerShift[]
}

interface VolunteerSignup {
  id: string
  status: string
  signed_up_at: string
  shift: {
    id: string
    shift_date: string
    start_time: string
    end_time: string
    opportunity: {
      id: string
      title: string
      ministry_area: string
    }
  }
}

export function VolunteerOpportunities() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [mySignups, setMySignups] = useState<VolunteerSignup[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [ministryAreas, setMinistryAreas] = useState<string[]>([])
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [signingUp, setSigningUp] = useState<string | null>(null)

  const fetchOpportunities = useCallback(async () => {
    try {
      const params = new URLSearchParams({ include_shifts: 'true' })
      if (selectedArea !== 'all') {
        params.append('ministry_area', selectedArea)
      }
      const res = await fetch(`/api/volunteer/opportunities?${params}`)
      const data = await res.json()
      setOpportunities(data.opportunities || [])
      setMinistryAreas(data.ministryAreas || [])
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    }
  }, [selectedArea])

  const fetchMySignups = useCallback(async () => {
    try {
      const res = await fetch('/api/volunteer/signup?upcoming=true')
      const data = await res.json()
      setMySignups(data.signups || [])
      setTotalHours(data.totalHours || 0)
    } catch (error) {
      console.error('Error fetching signups:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOpportunities()
    fetchMySignups()
  }, [fetchOpportunities, fetchMySignups])

  const handleSignup = async (shiftId: string) => {
    setSigningUp(shiftId)
    try {
      const res = await fetch('/api/volunteer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift_id: shiftId })
      })

      if (res.ok) {
        fetchOpportunities()
        fetchMySignups()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to sign up')
      }
    } catch (error) {
      console.error('Error signing up:', error)
    } finally {
      setSigningUp(null)
    }
  }

  const handleCancelSignup = async (signupId: string) => {
    try {
      const res = await fetch(`/api/volunteer/signup?id=${signupId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchMySignups()
        fetchOpportunities()
      }
    } catch (error) {
      console.error('Error cancelling signup:', error)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const isSignedUp = (shift: VolunteerShift) => {
    return mySignups.some(s => s.shift?.id === shift.id && s.status === 'confirmed')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mySignups.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHours}</p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Heart className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{opportunities.length}</p>
                <p className="text-sm text-muted-foreground">Opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Find Opportunities</TabsTrigger>
          <TabsTrigger value="my-shifts">My Shifts</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {/* Ministry Area Filter */}
          {ministryAreas.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedArea === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedArea('all')}
              >
                All Areas
              </Button>
              {ministryAreas.map((area) => (
                <Button
                  key={area}
                  variant={selectedArea === area ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedArea(area)}
                >
                  {area}
                </Button>
              ))}
            </div>
          )}

          {/* Opportunities List */}
          {opportunities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Opportunities</h3>
                <p className="text-muted-foreground text-center">
                  Check back later for volunteer opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <Card key={opp.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{opp.ministry_area}</Badge>
                          {opp.training_required && (
                            <Badge variant="outline">Training Required</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{opp.title}</CardTitle>
                        {opp.description && (
                          <CardDescription className="mt-1">
                            {opp.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {opp.upcoming_shifts && opp.upcoming_shifts.length > 0 && (
                    <CardContent>
                      <h4 className="text-sm font-medium mb-3">Upcoming Shifts</h4>
                      <div className="space-y-2">
                        {opp.upcoming_shifts.map((shift) => {
                          const slotsLeft = shift.slots_available - shift.slots_filled
                          const alreadySignedUp = isSignedUp(shift)

                          return (
                            <div
                              key={shift.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="font-medium">
                                    {formatDate(shift.shift_date)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  {slotsLeft} spot{slotsLeft !== 1 ? 's' : ''} left
                                </div>
                              </div>

                              {alreadySignedUp ? (
                                <Badge variant="secondary" className="gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Signed Up
                                </Badge>
                              ) : slotsLeft > 0 ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleSignup(shift.id)}
                                  disabled={signingUp === shift.id}
                                >
                                  {signingUp === shift.id ? 'Signing up...' : 'Sign Up'}
                                </Button>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Full
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-shifts" className="space-y-4">
          {mySignups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Shifts</h3>
                <p className="text-muted-foreground text-center">
                  Sign up for volunteer opportunities to see them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {mySignups.map((signup) => (
                <Card key={signup.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {signup.shift?.opportunity?.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(signup.shift?.shift_date)} &bull;{' '}
                            {formatTime(signup.shift?.start_time)} - {formatTime(signup.shift?.end_time)}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {signup.shift?.opportunity?.ministry_area}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelSignup(signup.id)}
                        >
                          Cancel
                        </Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
