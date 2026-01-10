'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Play,
  Headphones,
  Calendar,
  Tag,
  Share2,
  ChevronLeft,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PropheticWord {
  id: string
  title: string
  theme: string
  date: string
  duration: string
  audio_url?: string
  video_url?: string
  transcript?: string
  scriptures?: string[]
  thumbnail?: string
  excerpt?: string
}

export default function PropheticWordPage({ params }: { params: { id: string } }) {
  const [prophecy, setProphecy] = useState<PropheticWord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProphecy = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('public_prophecies')
        .select('*')
        .eq('id', params.id)
        .eq('status', 'published')
        .single()

      if (error) {
        console.error('Error fetching prophecy:', error)
        setError('This prophetic word could not be found.')
      } else {
        setProphecy(data)
      }
      setLoading(false)
    }

    fetchProphecy()
  }, [params.id])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: prophecy?.title,
        text: 'Listen to this prophetic word from TPC Ministries',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (error || !prophecy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-navy mb-4">Prophetic Word Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'This prophetic word may have been removed or is not yet available.'}</p>
        <Link href="/prophecy">
          <Button className="bg-navy hover:bg-navy/90">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Prophecies
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy to-navy-800 px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-4xl">
          <Link href="/prophecy" className="inline-flex items-center text-gold hover:text-gold-light mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Prophecies
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {prophecy.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(prophecy.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            {prophecy.theme && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{prophecy.theme}</span>
              </div>
            )}
            {prophecy.duration && (
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                <span>{prophecy.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Audio Player */}
            {prophecy.video_url && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                    <iframe
                      src={prophecy.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {prophecy.audio_url && !prophecy.video_url && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-navy/10 rounded-full flex items-center justify-center">
                      <Headphones className="h-8 w-8 text-navy" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-navy mb-2">Listen to this prophetic word</p>
                      <audio controls className="w-full">
                        <source src={prophecy.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transcript */}
            {prophecy.transcript && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Full Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-navy max-w-none"
                    dangerouslySetInnerHTML={{ __html: prophecy.transcript }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Excerpt if no transcript */}
            {!prophecy.transcript && prophecy.excerpt && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{prophecy.excerpt}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share */}
            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleShare} variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share This Word
                </Button>
              </CardContent>
            </Card>

            {/* Scriptures */}
            {prophecy.scriptures && prophecy.scriptures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Scriptures</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prophecy.scriptures.map((scripture, index) => (
                    <p key={index} className="text-sm text-gray-700 border-l-2 border-gold pl-3">
                      {scripture}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-navy text-white">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Receive Personal Prophecy</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Become a partner to receive personal prophetic words and deeper spiritual guidance.
                </p>
                <Link href="/partner">
                  <Button className="w-full bg-gold hover:bg-gold-dark text-navy">
                    Become a Partner
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
