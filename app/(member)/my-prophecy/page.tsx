'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar,
  Tag,
  Headphones,
  Edit3,
  CheckCircle,
  Clock,
  Search,
  Filter,
  BookOpen,
  Sparkles,
} from 'lucide-react'

export default function ProphecyVaultPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProphecy, setSelectedProphecy] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Mock data - will be replaced with API calls
  const personalProphecies = [
    {
      id: '1',
      date: '2024-01-20',
      deliveryMethod: 'In-Person',
      title: 'Your Business Will Flourish',
      themes: ['Business', 'Prosperity', 'Vision'],
      transcript: `
        The Lord says, "I have given you a spirit of entrepreneurship and innovation. The business ideas I have placed in your heart are not just for profit, but for kingdom impact. I will open doors no man can shut. Your business will be a testimony of My faithfulness and a source of blessing to many."
      `,
      audioUrl: '/audio/personal-prophecy-1.mp3',
      duration: '12 min',
      journal: 'I felt this word deeply. Started working on the business plan immediately. Trusting God for the resources and connections.',
      fulfillmentStatus: 'unfolding',
      memberTags: ['business', 'entrepreneurship', 'provision'],
    },
    {
      id: '2',
      date: '2023-11-15',
      deliveryMethod: 'Phone Call',
      title: 'Healing in Your Family Line',
      themes: ['Healing', 'Family', 'Deliverance'],
      transcript: `
        "I am breaking generational curses in your family line. What affected your grandparents and parents will not affect you or your children. I am releasing healing - physical, emotional, and spiritual. Your family will be a testimony of My restorative power."
      `,
      duration: '8 min',
      journal: 'This brought such peace. I have seen breakthroughs already. My relationship with my mother has improved significantly.',
      fulfillmentStatus: 'manifested',
      manifestedDate: '2024-01-05',
      manifestedTestimony: 'Complete restoration in family relationships. My mother gave her life to Christ!',
      memberTags: ['healing', 'family restoration', 'deliverance'],
    },
    {
      id: '3',
      date: '2023-09-10',
      deliveryMethod: 'Email',
      title: 'Ministry Assignment Activation',
      themes: ['Ministry', 'Purpose', 'Calling'],
      transcript: `
        "I am activating a new dimension of your ministry calling. You will minister to leaders and influencers. I am giving you a prophetic voice to speak into marketplaces, boardrooms, and places of influence. Do not despise small beginnings - I am preparing you for greater impact."
      `,
      duration: '15 min',
      journal: 'Still processing this. Praying for clarity on next steps. Had a dream about speaking at a conference.',
      fulfillmentStatus: 'unfolding',
      memberTags: ['ministry', 'leadership', 'prophetic'],
    },
  ]

  const [editFormData, setEditFormData] = useState({
    journal: '',
    fulfillmentStatus: 'unfolding',
    manifestedDate: '',
    manifestedTestimony: '',
    memberTags: '',
  })

  const themes = ['all', 'Business', 'Healing', 'Ministry', 'Prosperity', 'Family', 'Purpose']
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'unfolding', label: 'Unfolding' },
    { value: 'manifested', label: 'Manifested' },
  ]

  const handleEdit = (prophecy: any) => {
    setSelectedProphecy(prophecy)
    setEditFormData({
      journal: prophecy.journal || '',
      fulfillmentStatus: prophecy.fulfillmentStatus || 'unfolding',
      manifestedDate: prophecy.manifestedDate || '',
      manifestedTestimony: prophecy.manifestedTestimony || '',
      memberTags: prophecy.memberTags?.join(', ') || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    // TODO: API call to update prophecy tracking
    console.log('Saving edits:', editFormData)
    setIsEditDialogOpen(false)
  }

  const filteredProphecies = personalProphecies.filter((prophecy) => {
    const matchesSearch =
      prophecy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prophecy.transcript.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTheme =
      selectedTheme === 'all' ||
      prophecy.themes.some((theme) => theme.toLowerCase() === selectedTheme.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || prophecy.fulfillmentStatus === selectedStatus
    return matchesSearch && matchesTheme && matchesStatus
  })

  const allMemberTags = Array.from(
    new Set(personalProphecies.flatMap((p) => p.memberTags || []))
  )

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-gold" />
            <h1 className="text-4xl font-bold text-navy">My Prophecy Vault</h1>
          </div>
          <p className="text-gray-600">
            Your personal collection of prophetic words and their fulfillment
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Prophecies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{personalProphecies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Unfolding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {personalProphecies.filter((p) => p.fulfillmentStatus === 'unfolding').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Manifested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {personalProphecies.filter((p) => p.fulfillmentStatus === 'manifested').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search prophecies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                >
                  <option value="all">All Themes</option>
                  {themes.slice(1).map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:w-48">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tag Cloud */}
            {allMemberTags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Your Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {allMemberTags.map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 bg-gold/20 text-gold rounded-full text-xs font-medium hover:bg-gold/30 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prophecies Timeline */}
        <div className="space-y-6">
          {filteredProphecies.map((prophecy) => (
            <Card key={prophecy.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-navy/5 to-gold/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          prophecy.fulfillmentStatus === 'manifested'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gold/20 text-gold'
                        }`}
                      >
                        {prophecy.fulfillmentStatus === 'manifested' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Manifested
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Unfolding
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(prophecy.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <span className="text-sm text-gray-500">via {prophecy.deliveryMethod}</span>
                    </div>
                    <CardTitle className="text-xl text-navy">{prophecy.title}</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(prophecy)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {/* Audio Player */}
                {prophecy.audioUrl && (
                  <div>
                    <audio controls className="w-full">
                      <source src={prophecy.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {/* Transcript */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-navy" />
                    <h4 className="font-semibold text-navy">Transcript</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">{prophecy.transcript}</p>
                </div>

                {/* Themes */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {prophecy.themes.map((theme) => (
                      <span
                        key={theme}
                        className="px-2 py-1 bg-navy/10 text-navy rounded text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Member Tags */}
                {prophecy.memberTags && prophecy.memberTags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">My Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {prophecy.memberTags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gold/20 text-gold rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Journal */}
                {prophecy.journal && (
                  <div className="bg-gold/5 p-4 rounded-lg border-l-4 border-gold">
                    <h4 className="text-sm font-semibold text-navy mb-2">My Journal</h4>
                    <p className="text-gray-700">{prophecy.journal}</p>
                  </div>
                )}

                {/* Manifestation Testimony */}
                {prophecy.fulfillmentStatus === 'manifested' && prophecy.manifestedTestimony && (
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Manifestation Testimony
                    </h4>
                    <p className="text-gray-700 mb-2">{prophecy.manifestedTestimony}</p>
                    {prophecy.manifestedDate && (
                      <p className="text-sm text-gray-600">
                        Manifested on{' '}
                        {new Date(prophecy.manifestedDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProphecies.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-2">No prophecies found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-navy">Edit Prophecy Tracking</DialogTitle>
            <DialogDescription>
              Update your journal, fulfillment status, and personal tags
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Journal */}
            <div className="space-y-2">
              <Label htmlFor="journal">My Journal</Label>
              <textarea
                id="journal"
                className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                placeholder="Record your thoughts, prayers, and observations about this prophecy..."
                value={editFormData.journal}
                onChange={(e) => setEditFormData({ ...editFormData, journal: e.target.value })}
              />
            </div>

            {/* Fulfillment Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Fulfillment Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                value={editFormData.fulfillmentStatus}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fulfillmentStatus: e.target.value })
                }
              >
                <option value="unfolding">Unfolding</option>
                <option value="manifested">Manifested</option>
              </select>
            </div>

            {/* Manifested Fields */}
            {editFormData.fulfillmentStatus === 'manifested' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="manifestedDate">Manifestation Date</Label>
                  <Input
                    id="manifestedDate"
                    type="date"
                    value={editFormData.manifestedDate}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, manifestedDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testimony">Manifestation Testimony</Label>
                  <textarea
                    id="testimony"
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                    placeholder="Share how this prophecy was fulfilled..."
                    value={editFormData.manifestedTestimony}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, manifestedTestimony: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {/* Member Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">My Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="business, breakthrough, healing"
                value={editFormData.memberTags}
                onChange={(e) => setEditFormData({ ...editFormData, memberTags: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Add personal tags to help you find and organize your prophecies
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-navy hover:bg-navy/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
