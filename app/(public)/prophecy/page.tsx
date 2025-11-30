'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Play, Headphones, Calendar, Tag, Search, Heart, Download, Share2 } from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

export default function ProphecyHubPage() {
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - will be replaced with API calls
  const featuredWord = {
    id: '1',
    title: 'A Season of Divine Acceleration',
    theme: 'Breakthrough',
    date: '2024-01-15',
    duration: '18 min',
    audioUrl: '/audio/prophecy-1.mp3',
    excerpt: 'The Lord says, "I am accelerating the plans I have for you. What you thought would take years will happen in months. Trust the process and stay aligned with My word."',
    thumbnail: '/prophecy-featured.jpg',
  }

  const prophecies = [
    {
      id: '2',
      title: 'Walking in Your Kingdom Assignment',
      theme: 'Purpose',
      date: '2024-01-08',
      duration: '22 min',
      audioUrl: '/audio/prophecy-2.mp3',
      thumbnail: '/prophecy-2.jpg',
    },
    {
      id: '3',
      title: 'Breaking Generational Barriers',
      theme: 'Deliverance',
      date: '2024-01-01',
      duration: '15 min',
      audioUrl: '/audio/prophecy-3.mp3',
      thumbnail: '/prophecy-3.jpg',
    },
    {
      id: '4',
      title: 'The Spirit of Excellence',
      theme: 'Excellence',
      date: '2023-12-25',
      duration: '20 min',
      audioUrl: '/audio/prophecy-4.mp3',
      thumbnail: '/prophecy-4.jpg',
    },
    {
      id: '5',
      title: 'Financial Overflow and Stewardship',
      theme: 'Prosperity',
      date: '2023-12-18',
      duration: '25 min',
      audioUrl: '/audio/prophecy-5.mp3',
      thumbnail: '/prophecy-5.jpg',
    },
    {
      id: '6',
      title: 'Healing Waters are Flowing',
      theme: 'Healing',
      date: '2023-12-11',
      duration: '17 min',
      audioUrl: '/audio/prophecy-6.mp3',
      thumbnail: '/prophecy-6.jpg',
    },
  ]

  const themes = [
    { value: 'all', label: 'All Themes' },
    { value: 'breakthrough', label: 'Breakthrough' },
    { value: 'purpose', label: 'Purpose' },
    { value: 'healing', label: 'Healing' },
    { value: 'deliverance', label: 'Deliverance' },
    { value: 'prosperity', label: 'Prosperity' },
    { value: 'excellence', label: 'Excellence' },
  ]

  const filteredProphecies = prophecies.filter((prophecy) => {
    const matchesTheme = selectedTheme === 'all' || prophecy.theme.toLowerCase() === selectedTheme
    const matchesSearch = prophecy.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTheme && matchesSearch
  })

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-4 font-serif text-5xl font-bold text-white md:text-6xl">
            Prophetic Ministry
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Hear what God is saying for this season
          </p>
        </div>
      </section>

      {/* Featured Current Word */}
      <section className="px-4 py-12 -mt-16 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <Card className="overflow-hidden shadow-2xl border-2 border-gold/20">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="aspect-video md:aspect-auto bg-gradient-to-br from-gold/30 to-navy/30 relative">
                <ImagePlaceholder aspectRatio="16/9" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-full">
                    <Play className="h-12 w-12 text-navy" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
                    Featured Word
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-navy mb-4">
                  {featuredWord.title}
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {featuredWord.excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(featuredWord.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4" />
                    {featuredWord.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {featuredWord.theme}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href={`/prophecy/${featuredWord.id}`} className="flex-1">
                    <Button className="w-full bg-navy hover:bg-navy/90">
                      <Play className="mr-2 h-4 w-4" />
                      Listen Now
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Prophetic Word Library */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-navy mb-2">Prophetic Word Library</h2>
            <p className="text-gray-600">Browse all published prophetic words</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search prophetic words..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
              >
                {themes.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prophecy Grid */}
          {filteredProphecies.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-2">No prophetic words found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProphecies.map((prophecy) => (
                <Link key={prophecy.id} href={`/prophecy/${prophecy.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full cursor-pointer">
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-navy/20 to-gold/20">
                      <ImagePlaceholder aspectRatio="16/9" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full">
                          <Play className="h-8 w-8 text-navy" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-gold text-white rounded-full text-xs font-medium">
                          {prophecy.theme}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-navy/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-white text-xs">
                          <Headphones className="h-3 w-3" />
                          {prophecy.duration}
                        </div>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-lg text-navy group-hover:text-gold transition-colors line-clamp-2">
                        {prophecy.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(prophecy.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <audio controls className="w-full h-10">
                        <source src={prophecy.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Prayer Request Section */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <Heart className="h-12 w-12 text-gold mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-navy mb-4">Need Prayer?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Request prayer for specific areas of your life. Our prayer team is here to stand with you in faith.
            </p>
          </div>
          <Link href="/prayer">
            <Button size="lg" className="bg-gold hover:bg-gold-dark text-white">
              <Heart className="mr-2 h-5 w-5" />
              Submit Prayer Request
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">Members only</p>
        </div>
      </section>
    </div>
  )
}
