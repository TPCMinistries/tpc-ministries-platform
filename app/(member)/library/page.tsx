'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { BookOpen, Video, Headphones, FileText, Clock, Play, Search, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface LibraryItem {
  id: string
  title: string
  author: string
  type: 'video' | 'audio' | 'article' | 'document'
  thumbnail_url?: string
  duration_minutes?: number
  progress_percentage?: number
  completed: boolean
  saved_at: string
  category: string
}

export default function MyLibraryPage() {
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchLibrary()
  }, [])

  const fetchLibrary = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch teaching progress with teaching details
      const { data, error } = await supabase
        .from('teaching_progress')
        .select(`
          *,
          teaching:teachings(*)
        `)
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })

      if (error) {
        console.error('Error fetching library:', error)
      } else if (data) {
        setLibrary(
          data.map((item: any) => ({
            id: item.teaching.id,
            title: item.teaching.title,
            author: item.teaching.speaker,
            type: item.teaching.video_url ? 'video' : item.teaching.audio_url ? 'audio' : 'article',
            thumbnail_url: item.teaching.thumbnail_url,
            duration_minutes: item.teaching.duration_minutes,
            progress_percentage: item.teaching.duration_minutes
              ? Math.round((item.progress_seconds / (item.teaching.duration_minutes * 60)) * 100)
              : 0,
            completed: item.completed,
            saved_at: item.last_watched_at,
            category: item.teaching.category || 'Teachings',
          }))
        )
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video
      case 'audio':
        return Headphones
      case 'article':
        return FileText
      default:
        return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'audio':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'article':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredLibrary = library.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'in-progress') return matchesSearch && !item.completed && (item.progress_percentage || 0) > 0
    if (activeTab === 'completed') return matchesSearch && item.completed
    if (activeTab === 'not-started') return matchesSearch && (item.progress_percentage || 0) === 0
    return matchesSearch
  })

  const stats = {
    total: library.length,
    inProgress: library.filter((item) => !item.completed && (item.progress_percentage || 0) > 0).length,
    completed: library.filter((item) => item.completed).length,
    notStarted: library.filter((item) => (item.progress_percentage || 0) === 0).length,
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
      <div>
        <h1 className="text-3xl font-bold text-navy">My Library</h1>
        <p className="text-gray-600 mt-1">Your saved teachings, resources, and content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.notStarted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search your library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="not-started">Not Started ({stats.notStarted})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredLibrary.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  {searchQuery
                    ? 'No results found. Try a different search term.'
                    : 'Your library is empty. Start saving content from the teachings page!'}
                </p>
                {!searchQuery && (
                  <Link href="/teachings">
                    <Button className="mt-4 bg-navy hover:bg-navy/90">Browse Teachings</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLibrary.map((item) => {
                const Icon = getContentIcon(item.type)
                return (
                  <Link key={item.id} href={`/teachings/${item.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="relative">
                        {item.thumbnail_url && (
                          <div className="aspect-video bg-gray-200 rounded-t-lg relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-12 w-12 text-white opacity-80" />
                            </div>
                          </div>
                        )}
                        {item.progress_percentage !== undefined && item.progress_percentage > 0 && (
                          <div className="absolute bottom-0 left-0 right-0">
                            <Progress value={item.progress_percentage} className="h-1 rounded-none" />
                          </div>
                        )}
                        {item.completed && (
                          <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-2 mb-2">
                          <Icon className="h-4 w-4 text-navy flex-shrink-0 mt-0.5" />
                          <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                        </div>
                        <CardDescription className="flex items-center justify-between">
                          <span className="truncate">{item.author}</span>
                          {item.duration_minutes && (
                            <span className="flex items-center gap-1 text-xs flex-shrink-0 ml-2">
                              <Clock className="h-3 w-3" />
                              {item.duration_minutes}m
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getTypeColor(item.type)}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        {item.progress_percentage !== undefined && item.progress_percentage > 0 && !item.completed && (
                          <p className="text-xs text-gray-600">{item.progress_percentage}% complete</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
