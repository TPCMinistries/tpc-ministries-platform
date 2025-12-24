'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  Heart,
  Calendar,
  Play,
  Headphones,
  Loader2,
  Star,
  Search,
  ChevronLeft,
  Quote,
  Eye,
  Clock,
  User,
  Globe,
  Bookmark,
  Volume2,
  Video,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Prophecy {
  id: string
  title: string
  content: string
  prophecy_type: 'public' | 'personal'
  prophecy_date: string
  themes?: string
  audio_url?: string
  video_url?: string
  is_featured: boolean
  created_at: string
}

interface ProphecyRead {
  prophecy_id: string
  read_at: string
  is_favorite: boolean
}

export default function MyPropheciesPage() {
  const [personalProphecies, setPersonalProphecies] = useState<Prophecy[]>([])
  const [publicProphecies, setPublicProphecies] = useState<Prophecy[]>([])
  const [prophecyReads, setProphecyReads] = useState<ProphecyRead[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')
  const [selectedProphecy, setSelectedProphecy] = useState<Prophecy | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [memberName, setMemberName] = useState('')

  useEffect(() => {
    fetchProphecies()
  }, [])

  const fetchProphecies = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      // Get member name
      const { data: member } = await supabase
        .from('members')
        .select('first_name')
        .eq('user_id', user.id)
        .single()

      if (member) setMemberName(member.first_name)

      // Fetch personal prophecies (assigned to this user)
      const { data: personalData, error: personalError } = await supabase
        .from('prophecies')
        .select('*')
        .eq('prophecy_type', 'personal')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('prophecy_date', { ascending: false })

      if (personalError) {
        console.error('Error fetching personal prophecies:', personalError)
      } else {
        setPersonalProphecies(personalData || [])
      }

      // Fetch public prophecies (featured ones)
      const { data: publicData, error: publicError } = await supabase
        .from('prophecies')
        .select('*')
        .eq('prophecy_type', 'public')
        .eq('status', 'active')
        .order('prophecy_date', { ascending: false })

      if (publicError) {
        console.error('Error fetching public prophecies:', publicError)
      } else {
        setPublicProphecies(publicData || [])
      }

      // Fetch read status and favorites
      const { data: readsData } = await supabase
        .from('prophecy_reads')
        .select('*')
        .eq('user_id', user.id)

      if (readsData) {
        setProphecyReads(readsData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (prophecyId: string) => {
    if (!userId) return
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prophecy_reads')
        .upsert({
          user_id: userId,
          prophecy_id: prophecyId,
          read_at: new Date().toISOString(),
          is_favorite: prophecyReads.find(r => r.prophecy_id === prophecyId)?.is_favorite || false,
        })

      if (!error) {
        fetchProphecies()
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const toggleFavorite = async (prophecyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!userId) return
    const supabase = createClient()

    const currentRead = prophecyReads.find(r => r.prophecy_id === prophecyId)
    const isFav = currentRead?.is_favorite || false

    try {
      const { error } = await supabase
        .from('prophecy_reads')
        .upsert({
          user_id: userId,
          prophecy_id: prophecyId,
          read_at: currentRead?.read_at || new Date().toISOString(),
          is_favorite: !isFav,
        })

      if (!error) {
        fetchProphecies()
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const isRead = (prophecyId: string) => {
    return prophecyReads.some(r => r.prophecy_id === prophecyId)
  }

  const isFavorite = (prophecyId: string) => {
    return prophecyReads.find(r => r.prophecy_id === prophecyId)?.is_favorite || false
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const filterProphecies = (prophecies: Prophecy[]) => {
    if (!searchQuery) return prophecies
    const query = searchQuery.toLowerCase()
    return prophecies.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.themes?.toLowerCase().includes(query)
    )
  }

  const unreadCount = personalProphecies.filter(p => !isRead(p.id)).length
  const favoriteCount = prophecyReads.filter(r => r.is_favorite).length

  // Full-screen prophecy reading view
  if (selectedProphecy) {
    const isPersonal = selectedProphecy.prophecy_type === 'personal'

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900">
        {/* Header */}
        <div className={`bg-gradient-to-r ${isPersonal ? 'from-purple-600 via-indigo-600 to-violet-600' : 'from-blue-600 via-indigo-600 to-purple-600'} text-white`}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedProphecy(null)}
                className="text-white hover:bg-white/20 gap-2"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite(selectedProphecy.id)}
                className="text-white hover:bg-white/20"
              >
                <Star className={`h-5 w-5 ${isFavorite(selectedProphecy.id) ? 'fill-yellow-300 text-yellow-300' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Prophecy Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${isPersonal ? 'from-purple-500 to-indigo-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-xl mb-6`}>
              <Sparkles className="h-10 w-10 text-white" />
            </div>

            {isPersonal && (
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 mb-4">
                Personal Word for You
              </Badge>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedProphecy.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(selectedProphecy.prophecy_date)}
              </div>
              {selectedProphecy.themes && (
                <div className="flex gap-2">
                  {selectedProphecy.themes.split(',').slice(0, 3).map((theme, i) => (
                    <Badge key={i} variant="outline" className="bg-white/50 dark:bg-slate-800/50">
                      {theme.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Media */}
          {selectedProphecy.video_url && (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border-0 shadow-xl mb-8 overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={selectedProphecy.video_url}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </Card>
          )}

          {selectedProphecy.audio_url && !selectedProphecy.video_url && (
            <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-950/50 dark:to-indigo-950/50 border-0 shadow-xl mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Volume2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Audio Recording</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Listen to this prophetic word</p>
                  </div>
                </div>
                <audio controls className="w-full">
                  <source src={selectedProphecy.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          )}

          {/* Prophecy Content */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border-0 shadow-xl mb-8">
            <CardContent className="p-8 md:p-12">
              <Quote className="h-12 w-12 text-purple-300 dark:text-purple-700 mb-6" />
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                  {selectedProphecy.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Word Notice */}
          {isPersonal && (
            <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-950/50 dark:to-indigo-950/50 border-purple-200 dark:border-purple-800 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      {memberName ? `${memberName}, this` : 'This'} word is for you
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      This prophetic word has been specifically spoken over your life. Take time to pray over it,
                      meditate on the scriptures connected to it, and ask the Holy Spirit to reveal His plans for you through this word.
                      Write down what God speaks to your heart in your journal.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                      onClick={() => window.location.href = '/journal'}
                    >
                      <Bookmark className="h-4 w-4" />
                      Journal About This Word
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your prophetic words...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-purple-200">Your Prophetic Words</p>
                    <h1 className="text-3xl font-bold">My Prophecies</h1>
                  </div>
                </div>
                <p className="text-purple-200 mt-2 max-w-md">
                  Personal words spoken over your life and prophetic teachings for the body of Christ.
                </p>
              </div>

              {unreadCount > 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-purple-900" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-200">New Words</p>
                    <p className="text-2xl font-bold">{unreadCount}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Personal</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{personalProphecies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Public</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{publicProphecies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{favoriteCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search prophecies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-slate-800/80 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="personal" className="rounded-lg gap-2">
              <User className="h-4 w-4" />
              Personal ({personalProphecies.length})
            </TabsTrigger>
            <TabsTrigger value="public" className="rounded-lg gap-2">
              <Globe className="h-4 w-4" />
              Public ({publicProphecies.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-lg gap-2">
              <Star className="h-4 w-4" />
              Favorites ({favoriteCount})
            </TabsTrigger>
          </TabsList>

          {/* Personal Words Tab */}
          <TabsContent value="personal" className="mt-6">
            {filterProphecies(personalProphecies).length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 mx-auto mb-6 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {searchQuery ? 'No Results Found' : 'No Personal Words Yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {searchQuery
                      ? 'Try adjusting your search terms.'
                      : 'When you receive a personal prophetic word, it will appear here for you to revisit and meditate on.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterProphecies(personalProphecies).map((prophecy) => {
                  const read = isRead(prophecy.id)
                  const favorite = isFavorite(prophecy.id)

                  return (
                    <Card
                      key={prophecy.id}
                      onClick={() => {
                        setSelectedProphecy(prophecy)
                        if (!read) markAsRead(prophecy.id)
                      }}
                      className={`bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group ${
                        !read ? 'ring-2 ring-purple-400 ring-offset-2' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 ${
                            !read ? 'animate-pulse' : ''
                          }`}>
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {prophecy.title}
                                  </h3>
                                  {!read && (
                                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatShortDate(prophecy.prophecy_date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {getTimeAgo(prophecy.prophecy_date)}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={(e) => toggleFavorite(prophecy.id, e)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                              >
                                <Star className={`h-5 w-5 ${favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                              </button>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                              {prophecy.content}
                            </p>

                            <div className="flex items-center gap-2">
                              {prophecy.themes && prophecy.themes.split(',').slice(0, 2).map((theme, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                                  {theme.trim()}
                                </Badge>
                              ))}
                              {prophecy.audio_url && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Headphones className="h-3 w-3" />
                                  Audio
                                </Badge>
                              )}
                              {prophecy.video_url && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Video className="h-3 w-3" />
                                  Video
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Public Words Tab */}
          <TabsContent value="public" className="mt-6">
            {filterProphecies(publicProphecies).length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mb-6 flex items-center justify-center">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {searchQuery ? 'No Results Found' : 'No Public Words Yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {searchQuery
                      ? 'Try adjusting your search terms.'
                      : 'Public prophetic words for the body of Christ will appear here.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filterProphecies(publicProphecies).map((prophecy) => {
                  const favorite = isFavorite(prophecy.id)

                  return (
                    <Card
                      key={prophecy.id}
                      onClick={() => setSelectedProphecy(prophecy)}
                      className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {prophecy.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatShortDate(prophecy.prophecy_date)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => toggleFavorite(prophecy.id, e)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                          >
                            <Star className={`h-5 w-5 ${favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
                          {prophecy.content}
                        </p>

                        <div className="flex items-center gap-2">
                          {prophecy.is_featured && (
                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs">
                              Featured
                            </Badge>
                          )}
                          {prophecy.themes && prophecy.themes.split(',').slice(0, 1).map((theme, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {theme.trim()}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-6">
            {(() => {
              const allProphecies = [...personalProphecies, ...publicProphecies]
              const favorites = allProphecies.filter(p => isFavorite(p.id))
              const filteredFavorites = filterProphecies(favorites)

              if (filteredFavorites.length === 0) {
                return (
                  <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto mb-6 flex items-center justify-center">
                        <Star className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                        {searchQuery ? 'No Results Found' : 'No Favorites Yet'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        {searchQuery
                          ? 'Try adjusting your search terms.'
                          : 'Click the star icon on any prophecy to save it to your favorites for quick access.'}
                      </p>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <div className="space-y-4">
                  {filteredFavorites.map((prophecy) => {
                    const isPersonal = prophecy.prophecy_type === 'personal'

                    return (
                      <Card
                        key={prophecy.id}
                        onClick={() => setSelectedProphecy(prophecy)}
                        className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${isPersonal ? 'from-purple-500 to-indigo-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center flex-shrink-0`}>
                              <Sparkles className="h-6 w-6 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                      {prophecy.title}
                                    </h3>
                                    <Badge variant="outline" className={`text-xs ${isPersonal ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' : ''}`}>
                                      {isPersonal ? 'Personal' : 'Public'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {formatDate(prophecy.prophecy_date)}
                                  </p>
                                </div>

                                <button
                                  onClick={(e) => toggleFavorite(prophecy.id, e)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                </button>
                              </div>

                              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                                {prophecy.content}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )
            })()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
