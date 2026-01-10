'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  Award,
  TrendingUp,
  Download,
  Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VolunteerHour {
  id: string
  member_id: string
  opportunity_id: string | null
  event_id: string | null
  date: string
  hours_worked: number
  description: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  approved_at: string | null
  created_at: string
  member: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url: string | null
  }
  opportunity?: {
    id: string
    title: string
  } | null
  event?: {
    id: string
    title: string
  } | null
  approved_by_member?: {
    first_name: string
    last_name: string
  } | null
}

interface Stats {
  totalHours: number
  approvedHours: number
  pendingHours: number
  totalEntries: number
}

interface LeaderboardEntry {
  id: string
  name: string
  hours: number
}

interface Member {
  id: string
  first_name: string
  last_name: string
}

export default function VolunteerHoursPage() {
  const [hours, setHours] = useState<VolunteerHour[]>([])
  const [stats, setStats] = useState<Stats>({ totalHours: 0, approvedHours: 0, pendingHours: 0, totalEntries: 0 })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    member_id: '',
    date: new Date().toISOString().split('T')[0],
    hours_worked: '',
    description: '',
    auto_approve: false,
  })

  useEffect(() => {
    fetchHours()
    fetchMembers()
  }, [statusFilter])

  const fetchHours = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/volunteer-hours?${params}`)
      const data = await res.json()

      setHours(data.hours || [])
      setStats(data.stats || { totalHours: 0, approvedHours: 0, pendingHours: 0, totalEntries: 0 })
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching hours:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .order('first_name')

    setMembers(data || [])
  }

  const handleSubmit = async () => {
    if (!formData.member_id || !formData.hours_worked) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/volunteer-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours_worked: parseFloat(formData.hours_worked),
        }),
      })

      if (res.ok) {
        setShowAddDialog(false)
        setFormData({
          member_id: '',
          date: new Date().toISOString().split('T')[0],
          hours_worked: '',
          description: '',
          auto_approve: false,
        })
        fetchHours()
      }
    } catch (error) {
      console.error('Error saving hours:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await fetch('/api/admin/volunteer-hours', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      fetchHours()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const filteredHours = searchQuery
    ? hours.filter(h =>
        `${h.member.first_name} ${h.member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : hours

  const pendingCount = hours.filter(h => h.status === 'pending').length

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
              <Clock className="h-8 w-8" />
              Volunteer Hours
            </h1>
            <p className="text-gray-600 mt-1">Track and approve volunteer service hours</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchHours} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-navy hover:bg-navy/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Hours
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Volunteer Hours</DialogTitle>
                  <DialogDescription>
                    Record volunteer service hours for a member.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Member *</label>
                    <Select
                      value={formData.member_id}
                      onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.first_name} {m.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date *</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Hours *</label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={formData.hours_worked}
                        onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                        placeholder="e.g., 2.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What did they help with?"
                      rows={2}
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.auto_approve}
                      onChange={(e) => setFormData({ ...formData, auto_approve: e.target.checked })}
                    />
                    <span className="text-sm">Auto-approve these hours</span>
                  </label>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving || !formData.member_id || !formData.hours_worked}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Log Hours
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-navy" />
                <div>
                  <div className="text-2xl font-bold text-navy">{stats.totalHours.toFixed(1)}</div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.approvedHours.toFixed(1)}</div>
                  <p className="text-sm text-gray-600">Approved Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${pendingCount > 0 ? 'ring-2 ring-orange-300' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingHours.toFixed(1)}</div>
                  <p className="text-sm text-gray-600">Pending Approval ({pendingCount})</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalEntries}</div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Hours List */}
          <div className="col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Hour Entries</CardTitle>
                    <CardDescription>Review and approve volunteer hours</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-navy" />
                  </div>
                ) : filteredHours.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No volunteer hours recorded</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Volunteer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHours.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={entry.member.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {entry.member.first_name[0]}
                                  {entry.member.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">
                                  {entry.member.first_name} {entry.member.last_name}
                                </div>
                                <div className="text-xs text-gray-500">{entry.member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(entry.date)}</TableCell>
                          <TableCell>
                            <span className="font-medium">{entry.hours_worked}h</span>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                            {entry.description || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                entry.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : entry.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-orange-100 text-orange-700'
                              }
                            >
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.status === 'pending' && (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleStatusChange(entry.id, 'approved')}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleStatusChange(entry.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-gold" />
                  Top Volunteers
                </CardTitle>
                <CardDescription>Most approved hours</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No data yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          index === 0
                            ? 'bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20'
                            : index === 1
                            ? 'bg-gray-100'
                            : index === 2
                            ? 'bg-orange-50'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? 'bg-gold text-navy'
                              : index === 1
                              ? 'bg-gray-300 text-gray-700'
                              : index === 2
                              ? 'bg-orange-300 text-orange-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{entry.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-navy">{entry.hours}h</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
