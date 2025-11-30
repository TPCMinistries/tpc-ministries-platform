'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Cake,
  Heart,
  Gift,
  Calendar,
  Users,
  Mail,
  MessageSquare,
  Send,
  Star,
  PartyPopper,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

interface MemberCelebration {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  wedding_anniversary: string | null
  membership_date: string | null
  photo_url: string | null
}

interface Milestone {
  id: string
  member_id: string
  member_name?: string
  milestone_type: string
  milestone_date: string
  years: number | null
  message_sent: boolean
  created_at: string
}

export default function AdminCelebrationsPage() {
  const [members, setMembers] = useState<MemberCelebration[]>([])
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<MemberCelebration[]>([])
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState<MemberCelebration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'birthdays' | 'anniversaries' | 'milestones'>('upcoming')
  const [selectedMember, setSelectedMember] = useState<MemberCelebration | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [stats, setStats] = useState({
    birthdaysThisWeek: 0,
    birthdaysThisMonth: 0,
    anniversariesThisMonth: 0,
    membershipMilestones: 0,
  })

  useEffect(() => {
    fetchData()
  }, [currentMonth])

  const fetchData = async () => {
    await Promise.all([
      fetchMembers(),
      fetchStats(),
    ])
    setLoading(false)
  }

  const fetchMembers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, date_of_birth, wedding_anniversary, membership_date, photo_url')
      .order('first_name')

    if (!error && data) {
      setMembers(data)
      calculateUpcoming(data)
    }
  }

  const calculateUpcoming = (memberData: MemberCelebration[]) => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const thisMonth = today.getMonth()
    const thisYear = today.getFullYear()

    // Filter birthdays in the next 30 days
    const birthdays = memberData
      .filter(m => m.date_of_birth)
      .map(m => {
        const bday = new Date(m.date_of_birth!)
        const nextBirthday = new Date(thisYear, bday.getMonth(), bday.getDate())
        if (nextBirthday < today) {
          nextBirthday.setFullYear(thisYear + 1)
        }
        return { ...m, nextDate: nextBirthday }
      })
      .filter(m => {
        const daysUntil = Math.ceil((m.nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntil >= 0 && daysUntil <= 30
      })
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())

    setUpcomingBirthdays(birthdays)

    // Filter anniversaries in the next 30 days
    const anniversaries = memberData
      .filter(m => m.wedding_anniversary)
      .map(m => {
        const anniv = new Date(m.wedding_anniversary!)
        const nextAnniv = new Date(thisYear, anniv.getMonth(), anniv.getDate())
        if (nextAnniv < today) {
          nextAnniv.setFullYear(thisYear + 1)
        }
        return { ...m, nextDate: nextAnniv }
      })
      .filter(m => {
        const daysUntil = Math.ceil((m.nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntil >= 0 && daysUntil <= 30
      })
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())

    setUpcomingAnniversaries(anniversaries)
  }

  const fetchStats = async () => {
    const today = new Date()
    const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const thisMonth = today.getMonth() + 1
    const thisDay = today.getDate()

    const supabase = createClient()

    // Get all members with birthdays
    const { data: birthdayData } = await supabase
      .from('members')
      .select('date_of_birth')
      .not('date_of_birth', 'is', null)

    let birthdaysThisWeek = 0
    let birthdaysThisMonth = 0

    birthdayData?.forEach(m => {
      if (m.date_of_birth) {
        const bday = new Date(m.date_of_birth)
        if (bday.getMonth() + 1 === thisMonth) {
          birthdaysThisMonth++
          if (bday.getDate() >= thisDay && bday.getDate() <= thisDay + 7) {
            birthdaysThisWeek++
          }
        }
      }
    })

    // Get anniversaries this month
    const { data: anniversaryData } = await supabase
      .from('members')
      .select('wedding_anniversary')
      .not('wedding_anniversary', 'is', null)

    let anniversariesThisMonth = 0
    anniversaryData?.forEach(m => {
      if (m.wedding_anniversary) {
        const anniv = new Date(m.wedding_anniversary)
        if (anniv.getMonth() + 1 === thisMonth) {
          anniversariesThisMonth++
        }
      }
    })

    setStats({
      birthdaysThisWeek,
      birthdaysThisMonth,
      anniversariesThisMonth,
      membershipMilestones: 0,
    })
  }

  const getDaysUntil = (dateStr: string, type: 'birthday' | 'anniversary') => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateStr)
    const thisYear = today.getFullYear()

    const nextOccurrence = new Date(thisYear, date.getMonth(), date.getDate())
    if (nextOccurrence < today) {
      nextOccurrence.setFullYear(thisYear + 1)
    }

    const diffTime = nextOccurrence.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getAge = (dateStr: string) => {
    const today = new Date()
    const birth = new Date(dateStr)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age + 1 // Next birthday age
  }

  const getYearsTogether = (dateStr: string) => {
    const today = new Date()
    const wedding = new Date(dateStr)
    let years = today.getFullYear() - wedding.getFullYear()
    const m = today.getMonth() - wedding.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < wedding.getDate())) {
      years--
    }
    return years + 1 // Next anniversary years
  }

  const openMessageModal = (member: MemberCelebration, type: string) => {
    setSelectedMember(member)
    if (type === 'birthday') {
      setMessageContent(`Happy Birthday, ${member.first_name}! Wishing you a blessed year ahead filled with God's grace and favor.`)
    } else if (type === 'anniversary') {
      setMessageContent(`Happy Anniversary, ${member.first_name}! Celebrating the beautiful journey of love and commitment. May God continue to bless your union.`)
    }
    setShowMessageModal(true)
  }

  const sendMessage = async () => {
    // In a real implementation, this would send an email or SMS
    console.log('Sending message to:', selectedMember?.email, messageContent)
    alert('Message sent successfully!')
    setShowMessageModal(false)
    setSelectedMember(null)
    setMessageContent('')
  }

  const filteredBirthdays = upcomingBirthdays.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAnniversaries = upcomingAnniversaries.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Celebrations</h1>
            <p className="text-gray-600">Track birthdays, anniversaries, and milestones</p>
          </div>
          <Button className="bg-navy hover:bg-navy/90">
            <Send className="mr-2 h-4 w-4" />
            Send Bulk Message
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Birthdays This Week</p>
                  <p className="text-3xl font-bold">{stats.birthdaysThisWeek}</p>
                </div>
                <Cake className="h-10 w-10 text-white/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Birthdays This Month</p>
                  <p className="text-3xl font-bold text-navy">{stats.birthdaysThisMonth}</p>
                </div>
                <Gift className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Anniversaries This Month</p>
                  <p className="text-3xl font-bold text-red-600">{stats.anniversariesThisMonth}</p>
                </div>
                <Heart className="h-10 w-10 text-red-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Membership Milestones</p>
                  <p className="text-3xl font-bold text-gold">{stats.membershipMilestones}</p>
                </div>
                <Star className="h-10 w-10 text-gold/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['upcoming', 'birthdays', 'anniversaries'] as const).map((tab) => (
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

        {/* Upcoming Tab */}
        {activeTab === 'upcoming' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming Birthdays */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Cake className="h-5 w-5 text-pink-500" />
                  <CardTitle>Upcoming Birthdays</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {filteredBirthdays.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No upcoming birthdays in the next 30 days</p>
                ) : (
                  <div className="space-y-3">
                    {filteredBirthdays.slice(0, 10).map((member) => {
                      const daysUntil = getDaysUntil(member.date_of_birth!, 'birthday')
                      const turningAge = getAge(member.date_of_birth!)
                      return (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-pink-600 font-medium">
                                {member.first_name[0]}{member.last_name[0]}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{member.first_name} {member.last_name}</p>
                            <p className="text-sm text-gray-500">
                              Turning {turningAge} • {new Date(member.date_of_birth!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${daysUntil === 0 ? 'text-pink-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openMessageModal(member, 'birthday')}
                              className="ml-2"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Anniversaries */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <CardTitle>Upcoming Anniversaries</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAnniversaries.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No upcoming anniversaries in the next 30 days</p>
                ) : (
                  <div className="space-y-3">
                    {filteredAnniversaries.slice(0, 10).map((member) => {
                      const daysUntil = getDaysUntil(member.wedding_anniversary!, 'anniversary')
                      const years = getYearsTogether(member.wedding_anniversary!)
                      return (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <Heart className="h-5 w-5 text-red-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{member.first_name} {member.last_name}</p>
                            <p className="text-sm text-gray-500">
                              {years} years • {new Date(member.wedding_anniversary!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${daysUntil === 0 ? 'text-red-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openMessageModal(member, 'anniversary')}
                              className="ml-2"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Birthdays Tab */}
        {activeTab === 'birthdays' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
            ) : filteredBirthdays.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-gray-500">
                  <Cake className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No birthdays found</p>
                </CardContent>
              </Card>
            ) : (
              filteredBirthdays.map((member) => {
                const daysUntil = getDaysUntil(member.date_of_birth!, 'birthday')
                const turningAge = getAge(member.date_of_birth!)
                return (
                  <Card key={member.id} className={daysUntil === 0 ? 'border-pink-500 border-2' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                          <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center">
                            <Cake className="h-7 w-7 text-pink-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{member.first_name} {member.last_name}</h3>
                          <p className="text-sm text-gray-600">Turning {turningAge}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(member.date_of_birth!).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-center">
                          {daysUntil === 0 ? (
                            <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Today!
                            </span>
                          ) : (
                            <span className="text-2xl font-bold text-gray-400">{daysUntil}d</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openMessageModal(member, 'birthday')}>
                          <Mail className="h-4 w-4 mr-1" />
                          Send Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* Anniversaries Tab */}
        {activeTab === 'anniversaries' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
            ) : filteredAnniversaries.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No anniversaries found</p>
                </CardContent>
              </Card>
            ) : (
              filteredAnniversaries.map((member) => {
                const daysUntil = getDaysUntil(member.wedding_anniversary!, 'anniversary')
                const years = getYearsTogether(member.wedding_anniversary!)
                return (
                  <Card key={member.id} className={daysUntil === 0 ? 'border-red-500 border-2' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                          <Heart className="h-7 w-7 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{member.first_name} {member.last_name}</h3>
                          <p className="text-sm text-gray-600">{years} years together</p>
                          <p className="text-sm text-gray-500">
                            {new Date(member.wedding_anniversary!).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-center">
                          {daysUntil === 0 ? (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Today!
                            </span>
                          ) : (
                            <span className="text-2xl font-bold text-gray-400">{daysUntil}d</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openMessageModal(member, 'anniversary')}>
                          <Mail className="h-4 w-4 mr-1" />
                          Send Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* Message Modal */}
        {showMessageModal && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">Send Message</h2>
                <button onClick={() => setShowMessageModal(false)}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>To</Label>
                  <p className="text-sm text-gray-600">{selectedMember.first_name} {selectedMember.last_name} ({selectedMember.email})</p>
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={sendMessage} className="flex-1 bg-navy hover:bg-navy/90">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
