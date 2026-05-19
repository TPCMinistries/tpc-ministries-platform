'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Play, Headphones, Calendar, Tag, Search, Heart, Download, Share2 } from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <ScrollReveal>
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Hear the Word of the Lord</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
              Prophecy Hub.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mx-auto max-w-2xl text-body-xl text-white/70">
              What God is saying for this season — released, archived, and walked out.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </ScrollReveal>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Current Word */}
      <section className="relative z-10 -mt-16 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <Card className="overflow-hidden rounded-3xl border-white/10 bg-card shadow-2xl">
            <div className="grid gap-0 md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-video bg-gradient-to-br from-gold/30 to-navy/30 md:aspect-auto">
                <ImagePlaceholder aspectRatio="16/9" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/90 p-6 backdrop-blur-sm">
                    <Play className="h-12 w-12 text-navy" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-8 md:p-12">
                <div className="mb-4">
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-body-sm font-medium text-gold">
                    Featured Word
                  </span>
                </div>
                <h2 className="mb-4 font-display text-display-sm text-foreground">
                  {featuredWord.title}
                </h2>
                <p className="mb-6 text-body-lg leading-relaxed text-muted-foreground">
                  {featuredWord.excerpt}
                </p>
                <div className="mb-6 flex items-center gap-6 text-body-sm text-muted-foreground">
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
                    <Button variant="glow" className="w-full">
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
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Browse Collection</p>
            <h2 className="font-display text-display-md text-foreground">Prophetic Word Library</h2>
            <p className="mt-2 text-body-lg text-muted-foreground">Browse all published prophetic words</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
                className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
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
            <Card className="rounded-2xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-body-lg text-foreground">No prophetic words found</p>
                <p className="text-body-sm text-muted-foreground">Try adjusting your search or filter</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProphecies.map((prophecy) => (
                <Link key={prophecy.id} href={`/prophecy/${prophecy.id}`}>
                  <Card className="group h-full cursor-pointer overflow-hidden rounded-2xl border-border transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-navy/20 to-gold/20">
                      <ImagePlaceholder aspectRatio="16/9" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded-full bg-white/90 p-4 backdrop-blur-sm">
                          <Play className="h-8 w-8 text-navy" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-gold px-3 py-1 text-body-xs font-medium text-white">
                          {prophecy.theme}
                        </span>
                      </div>
                      <div className="absolute right-3 top-3">
                        <div className="flex items-center gap-1 rounded-md bg-navy/80 px-2 py-1 text-body-xs text-white backdrop-blur-sm">
                          <Headphones className="h-3 w-3" />
                          {prophecy.duration}
                        </div>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-body-lg font-semibold text-foreground transition-colors group-hover:text-gold">
                        {prophecy.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-body-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(prophecy.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <audio controls className="h-10 w-full">
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
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <Heart className="mx-auto mb-6 h-12 w-12 text-gold" />
          <h2 className="mb-4 font-display text-display-md text-white">Need Prayer?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-body-lg text-white/50">
            Request prayer for specific areas of your life. Our prayer team is here to stand with you in faith.
          </p>
          <Link href="/prayer">
            <Button variant="glow" size="lg">
              <Heart className="mr-2 h-5 w-5" />
              Submit Prayer Request
            </Button>
          </Link>
          <p className="mt-4 text-body-sm text-white/30">Members only</p>
        </div>
      </section>
    </div>
  )
}
