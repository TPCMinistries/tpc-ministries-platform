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
  Download,
  Share2,
  ChevronLeft,
  BookOpen,
} from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

interface PropheticWord {
  id: string
  title: string
  theme: string
  date: string
  duration: string
  audioUrl?: string
  videoUrl?: string
  transcript: string
  scriptures: string[]
  thumbnail?: string
}

export default function PropheticWordPage({ params }: { params: { id: string } }) {
  const [prophecy, setProphecy] = useState<PropheticWord | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data - will be replaced with API call
  useEffect(() => {
    const mockProphecy: PropheticWord = {
      id: params.id,
      title: 'A Season of Divine Acceleration',
      theme: 'Breakthrough',
      date: '2024-01-15',
      duration: '18 min',
      audioUrl: '/audio/prophecy-1.mp3',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      transcript: `
        <p>The Lord says, "This is your season of divine acceleration. I am speeding up the timeline of My promises in your life. What you thought would take years will happen in months. What you thought would take months will happen in weeks."</p>

        <p>"I am removing the obstacles that have been in your way. Every hindrance, every delay, every setback - I am turning it around for your good. The enemy meant it for harm, but I am using it to catapult you into your destiny."</p>

        <p>"Do not be discouraged by what you see in the natural. I am working behind the scenes, arranging divine connections, opening supernatural doors, and aligning circumstances for your breakthrough. Trust the process and stay aligned with My word."</p>

        <p>"This acceleration requires preparation. Get ready! Prepare your heart, renew your mind, and position yourself for what I am about to do. Those who have been faithful in the small things will be entrusted with much."</p>

        <p>"I am raising up a generation that walks in excellence, integrity, and power. You are part of this chosen generation. Embrace your calling and step into your kingdom assignment with boldness and confidence."</p>
      `,
      scriptures: [
        'Isaiah 60:22 - "The least of you will become a thousand, the smallest a mighty nation. I am the Lord; in its time I will do this swiftly."',
        'Habakkuk 2:3 - "For the revelation awaits an appointed time; it speaks of the end and will not prove false. Though it linger, wait for it; it will certainly come and will not delay."',
        'Romans 8:28 - "And we know that in all things God works for the good of those who love him, who have been called according to his purpose."',
      ],
      thumbnail: '/prophecy-featured.jpg',
    }

    setTimeout(() => {
      setProphecy(mockProphecy)
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleDownload = () => {
    // TODO: Implement download functionality
    alert('Download functionality coming soon')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: prophecy?.title,
        text: 'Listen to this prophetic word',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy border-t-transparent"></div>
      </div>
    )
  }

  if (!prophecy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Prophetic word not found</h1>
          <Link href="/prophecy">
            <Button>Back to Prophetic Hub</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <Link
            href="/prophecy"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Prophetic Hub
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Audio Player */}
            {prophecy.videoUrl ? (
              <Card className="overflow-hidden">
                <div className="aspect-video bg-black">
                  <iframe
                    src={prophecy.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-navy to-gold flex items-center justify-center">
                  <Headphones className="h-24 w-24 text-white" />
                </div>
                <CardContent className="p-4">
                  <audio controls className="w-full">
                    <source src={prophecy.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </CardContent>
              </Card>
            )}

            {/* Prophecy Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
                        {prophecy.theme}
                      </span>
                    </div>
                    <CardTitle className="text-3xl text-navy mb-3">
                      {prophecy.title}
                    </CardTitle>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(prophecy.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Headphones className="h-4 w-4" />
                        {prophecy.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleDownload}>
                      <Download className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Full Transcript */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-navy" />
                  <CardTitle className="text-xl text-navy">Full Transcript</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                <div
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: prophecy.transcript }}
                />
              </CardContent>
            </Card>

            {/* Related Scriptures */}
            {prophecy.scriptures && prophecy.scriptures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Related Scriptures</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {prophecy.scriptures.map((scripture, index) => (
                    <div key={index} className="p-4 bg-gold/10 rounded-lg border-l-4 border-gold">
                      <p className="text-gray-700 italic">{scripture}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-navy">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-navy hover:bg-navy/90" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Audio
                </Button>
                <Button className="w-full" variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share This Word
                </Button>
              </CardContent>
            </Card>

            {/* More Prophetic Words */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-navy">More Prophetic Words</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: '2',
                    title: 'Walking in Your Kingdom Assignment',
                    date: '2024-01-08',
                    theme: 'Purpose',
                  },
                  {
                    id: '3',
                    title: 'Breaking Generational Barriers',
                    date: '2024-01-01',
                    theme: 'Deliverance',
                  },
                  {
                    id: '4',
                    title: 'The Spirit of Excellence',
                    date: '2023-12-25',
                    theme: 'Excellence',
                  },
                ].map((word) => (
                  <Link
                    key={word.id}
                    href={`/prophecy/${word.id}`}
                    className="block group"
                  >
                    <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium text-sm text-navy group-hover:text-gold transition-colors line-clamp-2 mb-2">
                        {word.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="px-2 py-1 bg-gold/20 text-gold rounded">
                          {word.theme}
                        </span>
                        <span>
                          {new Date(word.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-navy to-navy-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Join Our Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">
                  Become a member to receive personal prophetic words and access your prophecy vault.
                </p>
                <Link href="/auth/signup">
                  <Button className="w-full bg-gold hover:bg-gold-dark text-white">
                    Become a Member
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
