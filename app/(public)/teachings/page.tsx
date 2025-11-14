'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Play, BookOpen, Headphones, FileText, Clock, Eye, Bookmark, Filter } from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

export default function TeachingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Mock data - will be replaced with API calls
  const teachings = [
    {
      id: '1',
      slug: 'the-power-of-purpose-driven-faith',
      title: 'The Power of Purpose-Driven Faith',
      type: 'video',
      author: 'Pastor Lorenzo',
      description: 'Discover how aligning your faith with your God-given purpose can transform every area of your life.',
      duration: '42 min',
      views: 1234,
      publishedAt: '2 days ago',
      topic: 'purpose',
      thumbnail: '/placeholder-video.jpg',
    },
    {
      id: '2',
      slug: 'leadership-principles-from-nehemiah',
      title: 'Leadership Principles from Nehemiah',
      type: 'article',
      author: 'Dr. Sarah Mitchell',
      description: 'Learn powerful leadership lessons from the biblical example of Nehemiah rebuilding the walls.',
      duration: '8 min read',
      views: 892,
      publishedAt: '1 week ago',
      topic: 'leadership',
      thumbnail: '/placeholder-article.jpg',
    },
    {
      id: '3',
      slug: 'faith-and-business-excellence',
      title: 'Faith and Business Excellence',
      type: 'book',
      author: 'Rev. John Chambers',
      description: 'A comprehensive guide to integrating biblical principles into modern business practices and entrepreneurship.',
      duration: '245 pages',
      views: 2341,
      publishedAt: '3 weeks ago',
      topic: 'business',
      thumbnail: '/placeholder-book.jpg',
    },
    {
      id: '4',
      slug: 'prayer-that-moves-mountains',
      title: 'Prayer That Moves Mountains',
      type: 'audio',
      author: 'Pastor Maria Lopez',
      description: 'An inspiring teaching on developing a powerful prayer life that sees breakthrough and transformation.',
      duration: '35 min',
      views: 567,
      publishedAt: '5 days ago',
      topic: 'prayer',
      thumbnail: '/placeholder-audio.jpg',
    },
  ]

  const contentTypes = [
    { value: 'all', label: 'All Content', icon: FileText },
    { value: 'video', label: 'Videos', icon: Play },
    { value: 'article', label: 'Articles', icon: FileText },
    { value: 'book', label: 'Books', icon: BookOpen },
    { value: 'audio', label: 'Audio', icon: Headphones },
  ]

  const topics = [
    { value: 'all', label: 'All Topics' },
    { value: 'faith', label: 'Faith' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'prayer', label: 'Prayer' },
    { value: 'purpose', label: 'Purpose' },
    { value: 'healing', label: 'Healing' },
    { value: 'business', label: 'Business/Ministry' },
    { value: 'technology', label: 'AI/Technology' },
  ]

  const getTypeIcon = (type: string) => {
    const icons = {
      video: Play,
      article: FileText,
      book: BookOpen,
      audio: Headphones,
    }
    const Icon = icons[type as keyof typeof icons] || FileText
    return <Icon className="h-4 w-4" />
  }

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      video: 'bg-red-100 text-red-700',
      article: 'bg-blue-100 text-blue-700',
      book: 'bg-purple-100 text-purple-700',
      audio: 'bg-green-100 text-green-700',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const filteredTeachings = teachings.filter((teaching) => {
    const matchesSearch = teaching.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teaching.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || teaching.type === selectedType
    const matchesTopic = selectedTopic === 'all' || teaching.topic === selectedTopic
    return matchesSearch && matchesType && matchesTopic
  })

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="mb-4 font-serif text-5xl font-bold text-white md:text-6xl">
              Teachings & Resources
            </h1>
            <p className="text-xl text-gray-300">
              Transformative content for your spiritual growth
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search teachings, topics, speakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                {/* Content Type Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-navy">Content Type</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contentTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedType === type.value
                            ? 'bg-navy text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Topics Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-navy">Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {topics.map((topic) => (
                      <button
                        key={topic.value}
                        onClick={() => setSelectedTopic(topic.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedTopic === topic.value
                            ? 'bg-gold text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-full h-14 w-14 bg-navy hover:bg-navy/90 shadow-lg"
              >
                <Filter className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-navy">
                  {filteredTeachings.length} {filteredTeachings.length === 1 ? 'Result' : 'Results'}
                </h2>
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="recommended">Recommended</option>
                </select>
              </div>

              {filteredTeachings.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No teachings found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your filters or search query</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredTeachings.map((teaching) => (
                    <Link key={teaching.id} href={`/teachings/${teaching.slug}`}>
                      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full cursor-pointer">
                        <div className="aspect-video relative overflow-hidden bg-gray-200">
                          <ImagePlaceholder aspectRatio="16/9" />
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                // Handle bookmark
                              }}
                              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                            >
                              <Bookmark className="h-4 w-4 text-navy" />
                            </button>
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeBadgeColor(teaching.type)}`}>
                              {getTypeIcon(teaching.type)}
                              {teaching.type.charAt(0).toUpperCase() + teaching.type.slice(1)}
                            </span>
                          </div>
                        </div>

                        <CardHeader>
                          <CardTitle className="text-lg text-navy group-hover:text-gold transition-colors line-clamp-2">
                            {teaching.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            By {teaching.author}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                            {teaching.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {teaching.duration}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {teaching.views}
                              </div>
                              <span>{teaching.publishedAt}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
