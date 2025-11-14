'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart, Search, Loader2, CheckCircle, Archive, Trash2, Calendar, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface PrayerRequest {
  id: string
  user_id?: string
  title: string
  description?: string
  category?: string
  status: 'active' | 'answered' | 'archived'
  is_answered: boolean
  is_public: boolean
  answered_at?: string
  created_at: string
  updated_at: string
  member?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function PrayerRequestsManagementPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'answered' | 'archived'>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchPrayers()
  }, [])

  const fetchPrayers = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select(`
          *,
          member:members(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching prayer requests:', error)
        toast({
          title: 'Error',
          description: 'Failed to load prayer requests',
          variant: 'destructive',
        })
      } else {
        setPrayers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsAnswered = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({
          status: 'answered',
          is_answered: true,
          answered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error('Error marking as answered:', error)
        toast({
          title: 'Error',
          description: 'Failed to update prayer request',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Prayer request marked as answered',
        })
        fetchPrayers()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const archivePrayer = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error('Error archiving prayer:', error)
        toast({
          title: 'Error',
          description: 'Failed to archive prayer request',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Prayer request archived',
        })
        fetchPrayers()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deletePrayer = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting prayer:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete prayer request',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Prayer request deleted',
        })
        fetchPrayers()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const filteredPrayers = prayers.filter((prayer) => {
    const matchesSearch =
      prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.member?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.member?.last_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || prayer.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: prayers.length,
    active: prayers.filter(p => p.status === 'active').length,
    answered: prayers.filter(p => p.status === 'answered').length,
    archived: prayers.filter(p => p.status === 'archived').length,
  }

  if (loading) {
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
            <Heart className="h-8 w-8 text-red-600" />
            <h1 className="text-4xl font-bold text-navy">Prayer Requests</h1>
          </div>
          <p className="text-gray-600">Manage and respond to member prayer requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.answered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Archived</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats.archived}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search prayer requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="answered">Answered</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Requests List */}
        <div className="space-y-4">
          {filteredPrayers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">No prayer requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPrayers.map((prayer) => (
              <Card
                key={prayer.id}
                className={`${
                  prayer.status === 'active'
                    ? 'border-l-4 border-l-red-600'
                    : prayer.status === 'answered'
                    ? 'border-l-4 border-l-green-600'
                    : 'opacity-75'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{prayer.title}</CardTitle>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            prayer.status === 'active'
                              ? 'bg-red-100 text-red-700'
                              : prayer.status === 'answered'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {prayer.status.charAt(0).toUpperCase() + prayer.status.slice(1)}
                        </span>
                        {prayer.category && (
                          <span className="px-2 py-1 bg-navy/10 text-navy rounded text-xs">
                            {prayer.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {prayer.member && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {prayer.member.first_name} {prayer.member.last_name}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(prayer.created_at)}
                        </div>
                        {prayer.answered_at && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Answered {formatDate(prayer.answered_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {prayer.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Request</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{prayer.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {prayer.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => markAsAnswered(prayer.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Answered
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => archivePrayer(prayer.id)}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </Button>
                      </>
                    )}
                    {prayer.status === 'answered' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => archivePrayer(prayer.id)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePrayer(prayer.id, prayer.title)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
