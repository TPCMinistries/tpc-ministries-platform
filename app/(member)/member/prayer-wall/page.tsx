'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart,
  Loader2,
  Plus,
  Users,
  CheckCircle,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface PrayerRequest {
  id: string
  member_id: string
  request: string
  is_public: boolean
  prayer_count: number
  is_answered: boolean
  answered_at?: string
  testimony?: string
  created_at: string
  member?: {
    first_name: string
    last_name: string
  }
  user_has_prayed?: boolean
}

export default function PrayerWallPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('public')
  const { toast } = useToast()

  const [newPrayer, setNewPrayer] = useState({
    request: '',
    is_public: true,
  })

  useEffect(() => {
    fetchPrayers()
  }, [activeTab])

  const fetchPrayers = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!member) return

      let query = supabase
        .from('prayer_requests')
        .select(`
          *,
          member:members(first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (activeTab === 'public') {
        query = query.eq('is_public', true)
      } else if (activeTab === 'my-prayers') {
        query = query.eq('member_id', member.id)
      } else if (activeTab === 'answered') {
        query = query.eq('is_answered', true).eq('is_public', true)
      }

      const { data, error } = await query

      if (error) throw error

      // Check which prayers the user has prayed for
      const { data: interactions } = await supabase
        .from('prayer_interactions')
        .select('prayer_request_id')
        .eq('member_id', member.id)

      const prayedIds = new Set(interactions?.map(i => i.prayer_request_id) || [])

      const prayersWithStatus = (data || []).map(p => ({
        ...p,
        user_has_prayed: prayedIds.has(p.id),
      }))

      setPrayers(prayersWithStatus)
    } catch (error) {
      console.error('Error fetching prayers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load prayer requests',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!member) throw new Error('Member not found')

      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          member_id: member.id,
          request: newPrayer.request,
          is_public: newPrayer.is_public,
          status: 'pending',
        })

      if (error) throw error

      toast({
        title: 'Prayer Request Submitted!',
        description: newPrayer.is_public
          ? 'Your prayer request has been shared with the community.'
          : 'Your prayer request has been submitted privately.',
      })

      setDialogOpen(false)
      setNewPrayer({ request: '', is_public: true })
      fetchPrayers()
    } catch (error: any) {
      console.error('Error submitting prayer:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit prayer request',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePray = async (prayerId: string) => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!member) throw new Error('Member not found')

      const { error } = await supabase
        .from('prayer_interactions')
        .insert({
          prayer_request_id: prayerId,
          member_id: member.id,
        })

      if (error) throw error

      toast({
        title: 'Prayer Recorded',
        description: 'Thank you for praying! 🙏',
      })

      fetchPrayers()
    } catch (error: any) {
      // Ignore duplicate key errors (already prayed)
      if (!error.message?.includes('duplicate')) {
        console.error('Error recording prayer:', error)
      }
    }
  }

  const handleMarkAnswered = async (prayerId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({
          is_answered: true,
          answered_at: new Date().toISOString(),
        })
        .eq('id', prayerId)

      if (error) throw error

      toast({
        title: 'Praise Report!',
        description: 'Prayer marked as answered. Glory to God! 🙌',
      })

      fetchPrayers()
    } catch (error: any) {
      console.error('Error marking prayer answered:', error)
      toast({
        title: 'Error',
        description: 'Failed to update prayer',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Prayer Wall</h1>
            <p className="text-gray-600">Pray for one another and share answered prayers</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gold hover:bg-gold/90 text-navy"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Prayers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">
                {prayers.reduce((sum, p) => sum + p.prayer_count, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {prayers.filter(p => !p.is_answered).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Answered Prayers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {prayers.filter(p => p.is_answered).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="public">
              <Users className="mr-2 h-4 w-4" />
              Public Wall
            </TabsTrigger>
            <TabsTrigger value="my-prayers">
              <Heart className="mr-2 h-4 w-4" />
              My Prayers
            </TabsTrigger>
            <TabsTrigger value="answered">
              <CheckCircle className="mr-2 h-4 w-4" />
              Answered
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {prayers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">
                      {activeTab === 'my-prayers'
                        ? "You haven't submitted any prayer requests yet"
                        : 'No prayer requests found'}
                    </p>
                    <Button
                      onClick={() => setDialogOpen(true)}
                      variant="outline"
                    >
                      Submit a Prayer Request
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                prayers.map((prayer) => (
                  <Card
                    key={prayer.id}
                    className={`hover:shadow-lg transition-shadow ${
                      prayer.is_answered ? 'border-green-200 bg-green-50/50' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {prayer.member && (
                              <span className="font-semibold text-navy">
                                {prayer.member.first_name} {prayer.member.last_name.charAt(0)}.
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDate(prayer.created_at)}
                            </span>
                            {prayer.is_answered && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Answered
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{prayer.request}</p>

                          {prayer.is_answered && prayer.testimony && (
                            <div className="mt-4 p-4 bg-white border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-gold" />
                                <span className="font-semibold text-green-700">Testimony</span>
                              </div>
                              <p className="text-gray-700 text-sm">{prayer.testimony}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Heart className="h-4 w-4" />
                            <span>{prayer.prayer_count} prayers</span>
                          </div>
                          {prayer.user_has_prayed && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              You prayed
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {!prayer.user_has_prayed && !prayer.is_answered && (
                            <Button
                              onClick={() => handlePray(prayer.id)}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Heart className="mr-2 h-4 w-4" />
                              I Prayed
                            </Button>
                          )}
                          {activeTab === 'my-prayers' && !prayer.is_answered && (
                            <Button
                              onClick={() => handleMarkAnswered(prayer.id)}
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Answered
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* New Prayer Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">Submit Prayer Request</DialogTitle>
              <DialogDescription>
                Share your prayer request with the community
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Prayer Request */}
              <div className="space-y-2">
                <Label htmlFor="request">Prayer Request *</Label>
                <Textarea
                  id="request"
                  value={newPrayer.request}
                  onChange={(e) => setNewPrayer({ ...newPrayer, request: e.target.value })}
                  placeholder="Share what you would like prayer for..."
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500">
                  Be specific but mindful of privacy when sharing publicly
                </p>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium text-navy">Share on Public Prayer Wall</div>
                  <div className="text-sm text-gray-600">
                    Allow other members to see and pray for this request
                  </div>
                </div>
                <Switch
                  checked={newPrayer.is_public}
                  onCheckedChange={(checked) => setNewPrayer({ ...newPrayer, is_public: checked })}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-navy hover:bg-navy/90"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
