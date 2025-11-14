'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Heart, Plus, Check, Clock, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface PrayerRequest {
  id: string
  title: string
  description: string
  status: 'active' | 'answered' | 'archived'
  created_at: string
  answered_at?: string
}

export default function MyPrayersPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPrayerTitle, setNewPrayerTitle] = useState('')
  const [newPrayerDescription, setNewPrayerDescription] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'answered'>('all')

  useEffect(() => {
    fetchPrayers()
  }, [])

  const fetchPrayers = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching prayers:', error)
      } else {
        setPrayers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPrayer = async () => {
    if (!newPrayerTitle.trim()) return

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id: user.id,
          title: newPrayerTitle,
          description: newPrayerDescription,
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating prayer:', error)
      } else if (data) {
        setPrayers([data, ...prayers])
        setNewPrayerTitle('')
        setNewPrayerDescription('')
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Error:', error)
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
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating prayer:', error)
      } else {
        setPrayers(
          prayers.map((p) =>
            p.id === id ? { ...p, status: 'answered' as const, answered_at: new Date().toISOString() } : p
          )
        )
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deletePrayer = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting prayer:', error)
      } else {
        setPrayers(prayers.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredPrayers = prayers.filter((p) => {
    if (filter === 'all') return true
    return p.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">My Prayer Requests</h1>
          <p className="text-gray-600 mt-1">Submit prayer requests and track answered prayers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy hover:bg-navy/90">
              <Plus className="h-4 w-4 mr-2" />
              New Prayer Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Prayer Request</DialogTitle>
              <DialogDescription>
                Share your prayer request with our community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Prayer Title *</Label>
                <Input
                  id="title"
                  value={newPrayerTitle}
                  onChange={(e) => setNewPrayerTitle(e.target.value)}
                  placeholder="e.g., Wisdom in Career Decision"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Details (Optional)</Label>
                <Textarea
                  id="description"
                  value={newPrayerDescription}
                  onChange={(e) => setNewPrayerDescription(e.target.value)}
                  placeholder="Share more details about your prayer request..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitPrayer} className="bg-navy hover:bg-navy/90">
                Submit Prayer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-navy' : ''}
        >
          All Prayers ({prayers.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'bg-navy' : ''}
        >
          Active ({prayers.filter((p) => p.status === 'active').length})
        </Button>
        <Button
          variant={filter === 'answered' ? 'default' : 'outline'}
          onClick={() => setFilter('answered')}
          className={filter === 'answered' ? 'bg-navy' : ''}
        >
          Answered ({prayers.filter((p) => p.status === 'answered').length})
        </Button>
      </div>

      {/* Prayer List */}
      <div className="space-y-4">
        {filteredPrayers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">
                {filter === 'all'
                  ? 'No prayer requests yet. Submit your first prayer request above.'
                  : `No ${filter} prayer requests.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPrayers.map((prayer) => (
            <Card key={prayer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{prayer.title}</CardTitle>
                      <Badge variant="outline" className={getStatusColor(prayer.status)}>
                        {prayer.status === 'answered' ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Answered
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Active
                          </>
                        )}
                      </Badge>
                    </div>
                    {prayer.description && (
                      <CardDescription className="text-base">{prayer.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Submitted {formatDate(prayer.created_at)}</span>
                    {prayer.answered_at && (
                      <span className="text-green-700">
                        • Answered {formatDate(prayer.answered_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {prayer.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsAnswered(prayer.id)}
                        className="text-green-700 border-green-300 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark as Answered
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePrayer(prayer.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-br from-navy/5 to-gold/5">
        <CardHeader>
          <CardTitle className="text-lg">Prayer Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-navy">{prayers.length}</div>
              <div className="text-sm text-gray-600">Total Prayers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {prayers.filter((p) => p.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {prayers.filter((p) => p.status === 'answered').length}
              </div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
