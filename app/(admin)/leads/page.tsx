'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  UserPlus,
  Search,
  Loader2,
  TrendingUp,
  Users,
  Flame,
  Target,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Tag,
  User,
  MessageSquare,
  Trash2,
  UserCheck,
  AlertCircle,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  getLeads,
  getLeadStats,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToMember,
  type Lead,
  type LeadActivity,
  type LeadFilters,
  type LeadStats,
} from '@/lib/db/lead-queries'

const interestLabels: Record<string, string> = {
  teachings: 'Teachings & Sermons',
  prayer: 'Prayer Support',
  giving: 'Giving & Supporting Missions',
  events: 'Live Events & Gatherings',
  prophecy: 'Personal Prophecy',
  missions: 'Mission Work',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    status: 'all',
    interestLevel: 'all',
    source: 'all',
    dateRange: 'all',
  })
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [leadsData, statsData] = await Promise.all([
        getLeads(filters),
        getLeadStats(),
      ])
      setLeads(leadsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const openLeadDetails = async (lead: Lead) => {
    setSelectedLead(lead)
    setNotes(lead.notes || '')
    setDetailsOpen(true)

    try {
      const { activities } = await getLeadById(lead.id)
      setLeadActivities(activities)
    } catch (error) {
      console.error('Error fetching lead activities:', error)
    }
  }

  const handleUpdateStatus = async (status: Lead['status']) => {
    if (!selectedLead) return

    setProcessing(true)
    try {
      await updateLead(selectedLead.id, { status })
      toast({
        title: 'Success',
        description: 'Lead status updated',
      })
      fetchData()
      const updated = await getLeadById(selectedLead.id)
      setSelectedLead(updated.lead)
      setLeadActivities(updated.activities)
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateInterestLevel = async (interestLevel: Lead['interest_level']) => {
    if (!selectedLead) return

    setProcessing(true)
    try {
      await updateLead(selectedLead.id, { interest_level: interestLevel })
      toast({
        title: 'Success',
        description: 'Interest level updated',
      })
      fetchData()
      const updated = await getLeadById(selectedLead.id)
      setSelectedLead(updated.lead)
      setLeadActivities(updated.activities)
    } catch (error) {
      console.error('Error updating interest level:', error)
      toast({
        title: 'Error',
        description: 'Failed to update interest level',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedLead) return

    setProcessing(true)
    try {
      await updateLead(selectedLead.id, { notes })
      toast({
        title: 'Success',
        description: 'Notes saved',
      })
      setEditingNotes(false)
      fetchData()
      const updated = await getLeadById(selectedLead.id)
      setSelectedLead(updated.lead)
    } catch (error) {
      console.error('Error saving notes:', error)
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkContacted = async () => {
    if (!selectedLead) return

    setProcessing(true)
    try {
      await updateLead(selectedLead.id, {
        last_contacted_at: new Date().toISOString(),
        status: selectedLead.status === 'new' ? 'contacted' : selectedLead.status,
      })
      toast({
        title: 'Success',
        description: 'Lead marked as contacted',
      })
      fetchData()
      const updated = await getLeadById(selectedLead.id)
      setSelectedLead(updated.lead)
      setLeadActivities(updated.activities)
    } catch (error) {
      console.error('Error marking as contacted:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark as contacted',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleConvertToMember = async () => {
    if (!selectedLead) return

    setProcessing(true)
    try {
      await convertLeadToMember(selectedLead.id)
      toast({
        title: 'Success',
        description: `${selectedLead.name} has been converted to a member`,
      })
      setConvertDialogOpen(false)
      setDetailsOpen(false)
      fetchData()
    } catch (error: any) {
      console.error('Error converting to member:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert to member',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!selectedLead) return

    setProcessing(true)
    try {
      await deleteLead(selectedLead.id)
      toast({
        title: 'Success',
        description: 'Lead deleted',
      })
      setDeleteDialogOpen(false)
      setDetailsOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      interestLevel: 'all',
      source: 'all',
      dateRange: 'all',
    })
  }

  const getStatusBadge = (status: Lead['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      contacted: 'bg-purple-100 text-purple-700 border-purple-200',
      nurturing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      converted: 'bg-green-100 text-green-700 border-green-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getInterestLevelBadge = (level: Lead['interest_level']) => {
    const colors = {
      cold: 'bg-blue-100 text-blue-700',
      warm: 'bg-yellow-100 text-yellow-700',
      hot: 'bg-red-100 text-red-700',
    }
    const icons = {
      cold: null,
      warm: null,
      hot: <Flame className="h-3 w-3 mr-1" />,
    }
    return (
      <Badge className={colors[level]}>
        {icons[level]}
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return formatDate(dateString)
  }

  if (loading && !stats) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="h-8 w-8 text-gold" />
            <h1 className="text-4xl font-bold text-navy">Lead Management</h1>
          </div>
          <p className="text-gray-600">Track and nurture potential members</p>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  New This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-navy">{stats.newThisWeek}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  New This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-navy">{stats.newThisMonth}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-600" />
                  Hot Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-navy">{stats.hotLeads}</p>
                <p className="text-xs text-gray-500 mt-1">Need follow-up</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Target className="h-4 w-4 text-gold" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-navy">{stats.conversionRate}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="nurturing">Nurturing</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.interestLevel}
                onValueChange={(value) => setFilters({ ...filters, interestLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Interest Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.source}
                onValueChange={(value) => setFilters({ ...filters, source: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-navy">
              {leads.length} Lead{leads.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No leads found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Interest</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Interests</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => openLeadDetails(lead)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-navy" />
                            </div>
                            <span className="font-medium text-navy">{lead.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-700">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-gray-500 mt-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(lead.status)}</td>
                        <td className="py-3 px-4">{getInterestLevelBadge(lead.interest_level)}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {lead.interests?.slice(0, 2).map((interest) => (
                              <Badge key={interest} variant="outline" className="text-xs">
                                {interestLabels[interest] || interest}
                              </Badge>
                            ))}
                            {lead.interests && lead.interests.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{lead.interests.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {lead.source}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(lead.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                openLeadDetails(lead)
                              }}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                window.location.href = `mailto:${lead.email}`
                              }}>
                                Send Email
                              </DropdownMenuItem>
                              {lead.status !== 'converted' && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLead(lead)
                                  setConvertDialogOpen(true)
                                }}>
                                  Convert to Member
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLead(lead)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-red-600"
                              >
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedLead && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl text-navy flex items-center gap-2">
                    <User className="h-6 w-6 text-gold" />
                    {selectedLead.name}
                  </DialogTitle>
                  <DialogDescription>
                    Lead created {formatRelativeDate(selectedLead.created_at)}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Contact Info */}
                    <div>
                      <h3 className="font-semibold text-navy mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <a href={`mailto:${selectedLead.email}`} className="text-blue-600 hover:underline">
                            {selectedLead.email}
                          </a>
                        </div>
                        {selectedLead.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <a href={`tel:${selectedLead.phone}`} className="text-blue-600 hover:underline">
                              {selectedLead.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Interest Level */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="mb-2 block">Status</Label>
                        <Select
                          value={selectedLead.status}
                          onValueChange={(value) => handleUpdateStatus(value as Lead['status'])}
                          disabled={processing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="nurturing">Nurturing</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-2 block">Interest Level</Label>
                        <Select
                          value={selectedLead.interest_level}
                          onValueChange={(value) => handleUpdateInterestLevel(value as Lead['interest_level'])}
                          disabled={processing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cold">Cold</SelectItem>
                            <SelectItem value="warm">Warm</SelectItem>
                            <SelectItem value="hot">Hot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Interests */}
                    {selectedLead.interests && selectedLead.interests.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedLead.interests.map((interest) => (
                            <Badge key={interest} variant="outline">
                              {interestLabels[interest] || interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Source & Last Contacted */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-gray-600">Source</Label>
                        <p className="text-navy font-medium mt-1">
                          {selectedLead.source.charAt(0).toUpperCase() + selectedLead.source.slice(1)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Last Contacted</Label>
                        <p className="text-navy font-medium mt-1">
                          {selectedLead.last_contacted_at
                            ? formatRelativeDate(selectedLead.last_contacted_at)
                            : 'Never'}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-navy flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Notes
                        </h3>
                        {!editingNotes && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingNotes(true)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      {editingNotes ? (
                        <div className="space-y-2">
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this lead..."
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveNotes}
                              disabled={processing}
                              className="bg-gold hover:bg-gold/90 text-navy"
                            >
                              {processing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingNotes(false)
                                setNotes(selectedLead.notes || '')
                              }}
                              disabled={processing}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedLead.notes || 'No notes added yet'}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Button
                        onClick={handleMarkContacted}
                        disabled={processing}
                        className="bg-gold hover:bg-gold/90 text-navy"
                      >
                        Mark as Contacted
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = `mailto:${selectedLead.email}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      {selectedLead.status !== 'converted' && (
                        <Button
                          variant="outline"
                          onClick={() => setConvertDialogOpen(true)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Convert to Member
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Lead
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-6">
                    {leadActivities.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No activity recorded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {leadActivities.map((activity) => (
                          <div key={activity.id} className="flex gap-4 border-l-2 border-gray-200 pl-4 pb-4">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-gold" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-navy">{activity.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeDate(activity.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Delete Lead?
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedLead?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteLead}
                disabled={processing}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Lead
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Convert to Member Dialog */}
        <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-green-600" />
                Convert to Member?
              </DialogTitle>
              <DialogDescription>
                This will create a member account for {selectedLead?.name} and send them a welcome email with login instructions.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConvertDialogOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConvertToMember}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Convert to Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
