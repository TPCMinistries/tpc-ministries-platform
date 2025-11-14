'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Heart, Calendar, Play, Headphones, Loader2, Star } from 'lucide-react'
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

  const toggleFavorite = async (prophecyId: string) => {
    if (!userId) return
    const supabase = createClient()

    const currentRead = prophecyReads.find(r => r.prophecy_id === prophecyId)
    const isFavorite = currentRead?.is_favorite || false

    try {
      const { error } = await supabase
        .from('prophecy_reads')
        .upsert({
          user_id: userId,
          prophecy_id: prophecyId,
          read_at: currentRead?.read_at || new Date().toISOString(),
          is_favorite: !isFavorite,
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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const ProphecyCard = ({ prophecy, isPersonal }: { prophecy: Prophecy; isPersonal: boolean }) => {
    const read = isRead(prophecy.id)
    const favorite = isFavorite(prophecy.id)

    return (
      <Card
        className={`hover:shadow-lg transition-shadow cursor-pointer ${
          !read && isPersonal ? 'border-l-4 border-l-gold' : ''
        }`}
        onClick={() => {
          setSelectedProphecy(prophecy)
          if (!read && isPersonal) {
            markAsRead(prophecy.id)
          }
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={`h-5 w-5 ${isPersonal ? 'text-gold' : 'text-navy'}`} />
                <CardTitle className="text-xl">{prophecy.title}</CardTitle>
                {!read && isPersonal && (
                  <Badge variant="outline" className="bg-gold/20 text-gold border-gold">
                    New
                  </Badge>
                )}
                {prophecy.is_featured && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(prophecy.prophecy_date)}
                </div>
                {prophecy.themes && (
                  <Badge variant="outline" className="text-xs">
                    {prophecy.themes.split(',')[0]}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(prophecy.id)
              }}
            >
              <Star
                className={`h-5 w-5 ${favorite ? 'fill-gold text-gold' : 'text-gray-400'}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 line-clamp-3 mb-4">{prophecy.content}</p>
          <div className="flex items-center gap-2">
            {prophecy.audio_url && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Headphones className="h-3 w-3" />
                Audio
              </Badge>
            )}
            {prophecy.video_url && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Play className="h-3 w-3" />
                Video
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  // Full prophecy view modal
  if (selectedProphecy) {
    return (
      <div className="p-4 lg:p-8">
        <Button
          variant="outline"
          onClick={() => setSelectedProphecy(null)}
          className="mb-4"
        >
          ← Back to All Prophecies
        </Button>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className={`h-6 w-6 ${selectedProphecy.prophecy_type === 'personal' ? 'text-gold' : 'text-navy'}`} />
                  <CardTitle className="text-3xl">{selectedProphecy.title}</CardTitle>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedProphecy.prophecy_date)}
                  </div>
                  {selectedProphecy.themes && (
                    <div className="flex gap-2">
                      {selectedProphecy.themes.split(',').map((theme, i) => (
                        <Badge key={i} variant="outline">
                          {theme.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(selectedProphecy.id)}
              >
                <Star
                  className={`h-6 w-6 ${isFavorite(selectedProphecy.id) ? 'fill-gold text-gold' : 'text-gray-400'}`}
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Media */}
            {selectedProphecy.video_url && (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={selectedProphecy.video_url}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
            {selectedProphecy.audio_url && !selectedProphecy.video_url && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <audio controls className="w-full">
                  <source src={selectedProphecy.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {selectedProphecy.content}
              </div>
            </div>

            {selectedProphecy.prophecy_type === 'personal' && (
              <div className="bg-gold/10 border border-gold/20 rounded-lg p-6 mt-6">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-navy mb-2">Personal Word for You</h4>
                    <p className="text-sm text-gray-700">
                      This prophetic word has been specifically given for you. Take time to pray over it,
                      meditate on it, and ask God to reveal His plans for your life through this word.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-gold" />
          <h1 className="text-3xl font-bold text-navy">My Prophecies</h1>
        </div>
        <p className="text-gray-600 mt-1">
          Your personal prophetic words and public teachings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Personal Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">{personalProphecies.length}</div>
            <p className="text-xs text-gray-600 mt-1">For you specifically</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">
              {personalProphecies.filter(p => !isRead(p.id)).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">New prophecies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {prophecyReads.filter(r => r.is_favorite).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Saved words</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="personal">
            Personal Words ({personalProphecies.length})
          </TabsTrigger>
          <TabsTrigger value="public">
            Public Words ({publicProphecies.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({prophecyReads.filter(r => r.is_favorite).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6 space-y-4">
          {personalProphecies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  No personal prophecies yet. When you receive a personal word, it will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {personalProphecies.map((prophecy) => (
                <ProphecyCard key={prophecy.id} prophecy={prophecy} isPersonal={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="mt-6 space-y-4">
          {publicProphecies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  No public prophecies available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {publicProphecies.map((prophecy) => (
                <ProphecyCard key={prophecy.id} prophecy={prophecy} isPersonal={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6 space-y-4">
          {prophecyReads.filter(r => r.is_favorite).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  No favorite prophecies yet. Click the star icon to mark prophecies as favorites.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {[...personalProphecies, ...publicProphecies]
                .filter(p => isFavorite(p.id))
                .map((prophecy) => (
                  <ProphecyCard
                    key={prophecy.id}
                    prophecy={prophecy}
                    isPersonal={prophecy.prophecy_type === 'personal'}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
