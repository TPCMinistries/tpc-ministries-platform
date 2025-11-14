'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Heart,
  Plus,
  Check,
  Clock,
  Users,
  Lock,
  Globe,
  MessageCircle,
  Trash2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PrayerRequest {
  id: string
  title: string
  description: string
  category: string
  privacy: 'private' | 'members' | 'public'
  is_answered: boolean
  answered_at?: string
  created_at: string
  prayer_count: number
}

export default function PrayerPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PrayerRequest[]>([])
  const [communityRequests, setCommunityRequests] = useState<PrayerRequest[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    privacy: 'private'
  })

  useEffect(() => {
    fetchPrayerRequests()
  }, [])

  const fetchPrayerRequests = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      // Fetch member's own prayer requests
      const { data: myRequests } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })

      // Fetch community prayer requests
      const { data: community } = await supabase
        .from('prayer_requests')
        .select('*')
        .neq('member_id', member.id)
        .in('privacy', ['members', 'public'])
        .order('created_at', { ascending: false })
        .limit(20)

      setRequests(myRequests || [])
      setCommunityRequests(community || [])
    } catch (error) {
      console.error('Error fetching prayer requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      await supabase.from('prayer_requests').insert({
        member_id: member.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        privacy: formData.privacy,
        is_answered: false
      })

      setFormData({
        title: '',
        description: '',
        category: 'general',
        privacy: 'private'
      })
      setIsDialogOpen(false)
      fetchPrayerRequests()
    } catch (error) {
      console.error('Error submitting prayer request:', error)
    }
  }

  const handlePray = async (requestId: string) => {
    // TODO: Track that user prayed for this request
    console.log('Prayed for request:', requestId)
  }

  const handleMarkAnswered = async (requestId: string) => {
    const supabase = createClient()

    try {
      await supabase
        .from('prayer_requests')
        .update({
          is_answered: true,
          answered_at: new Date().toISOString()
        })
        .eq('id', requestId)

      fetchPrayerRequests()
    } catch (error) {
      console.error('Error marking request as answered:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      healing: 'bg-red-100 text-red-700 border-red-200',
      guidance: 'bg-blue-100 text-blue-700 border-blue-200',
      provision: 'bg-green-100 text-green-700 border-green-200',
      relationship: 'bg-pink-100 text-pink-700 border-pink-200',
      salvation: 'bg-purple-100 text-purple-700 border-purple-200',
      thanksgiving: 'bg-amber-100 text-amber-700 border-amber-200',
      general: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[category] || colors.general
  }

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Globe className="h-3 w-3" />
      case 'members':
        return <Users className="h-3 w-3" />
      default:
        return <Lock className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Prayer</h1>
          <p className="text-gray-600">Share your prayer requests and pray for others</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Prayer Request</DialogTitle>
              <DialogDescription>
                Share your prayer need with the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Prayer Request Title</Label>
                <Input
                  id="title"
                  placeholder="Brief title for your prayer request"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Share details about your prayer request..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="healing">Healing</SelectItem>
                    <SelectItem value="guidance">Guidance</SelectItem>
                    <SelectItem value="provision">Provision</SelectItem>
                    <SelectItem value="relationship">Relationships</SelectItem>
                    <SelectItem value="salvation">Salvation</SelectItem>
                    <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="privacy">Privacy</Label>
                <Select
                  value={formData.privacy}
                  onValueChange={(value) => setFormData({ ...formData, privacy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only Me)</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.title || !formData.description}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-requests">My Requests ({requests.length})</TabsTrigger>
          <TabsTrigger value="community">Community ({communityRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="space-y-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">You haven't submitted any prayer requests yet</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Your First Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {requests.map((request) => (
                <Card key={request.id} className={request.is_answered ? 'border-green-200 bg-green-50/30' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(request.category)} variant="outline">
                            {request.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getPrivacyIcon(request.privacy)}
                            <span className="ml-1">{request.privacy}</span>
                          </Badge>
                          {request.is_answered && (
                            <Badge className="bg-green-600 text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Answered
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{request.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Heart className="h-4 w-4" />
                        <span>{request.prayer_count || 0} prayers</span>
                      </div>
                      <div className="flex gap-2">
                        {!request.is_answered && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAnswered(request.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Mark Answered
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          {communityRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600">No community prayer requests available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {communityRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(request.category)} variant="outline">
                        {request.category}
                      </Badge>
                      {request.is_answered && (
                        <Badge className="bg-green-600 text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Answered
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription>
                      {new Date(request.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{request.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Heart className="h-4 w-4" />
                        <span>{request.prayer_count || 0} prayers</span>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePray(request.id)}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        I Prayed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Prayer Stats */}
      <Card className="bg-gradient-to-br from-navy to-blue-900 text-white">
        <CardHeader>
          <CardTitle>Your Prayer Impact</CardTitle>
          <CardDescription className="text-blue-100">
            See how you're supporting the community through prayer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">{requests.filter(r => r.is_answered).length}</div>
              <div className="text-sm text-blue-100">Answered Prayers</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">
                {requests.reduce((sum, r) => sum + (r.prayer_count || 0), 0)}
              </div>
              <div className="text-sm text-blue-100">Prayers Received</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">0</div>
              <div className="text-sm text-blue-100">Prayers Given</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
