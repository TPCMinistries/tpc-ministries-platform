import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ArrowRight, Crown, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ebooks & Written Works | TPC Ministries',
  description: 'Explore transformative ebooks and written works by Lorenzo A. Daughtry-Chambers. Biblical teachings, devotionals, and resources for spiritual growth.',
}

async function getPublicEbooks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('published', true)
    .eq('type', 'ebook')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ebooks:', error)
    return []
  }
  return data || []
}

export default async function PublicEbooksPage() {
  const ebooks = await getPublicEbooks()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-tpc-navy via-tpc-navy/95 to-tpc-navy/90 text-white px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <BookOpen className="h-4 w-4 text-tpc-gold" />
              <span className="text-tpc-gold text-sm font-medium">Written Works</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Transformative Teachings
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Explore ebooks and written works designed to awaken purpose, ignite vision,
              and deepen your spiritual journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="inline-flex items-center gap-2 bg-tpc-gold/20 rounded-full px-6 py-3">
                <Crown className="h-5 w-5 text-tpc-gold" />
                <span className="text-white font-medium">Included with Partnership</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-6 py-3">
                <span className="text-white/80">$9.99 each</span>
              </div>
            </div>
            <p className="text-white/60 text-sm mt-6 max-w-xl mx-auto">
              Ministry Partners enjoy complimentary access to our entire written works library
              through their member dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="bg-stone-50 px-4 py-12 border-b border-stone-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-tpc-navy rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-12 w-12 text-tpc-gold" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Lorenzo A. Daughtry-Chambers</h2>
              <p className="text-stone-600">
                Author, teacher, and founder of TPC Ministries. These works represent years of
                biblical study, prophetic insight, and practical wisdom for Kingdom living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ebooks Grid */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-2">Available Ebooks</h2>
            <p className="text-stone-600">{ebooks.length} titles available</p>
          </div>

          {ebooks.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <BookOpen className="h-16 w-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-600">No ebooks available yet. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {ebooks.map((ebook) => (
                <Link href={`/ebooks/${ebook.id}`} key={ebook.id}>
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    {/* Cover Image */}
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-tpc-navy to-tpc-navy/80">
                      {ebook.thumbnail_url ? (
                        <Image
                          src={ebook.thumbnail_url}
                          alt={ebook.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-6">
                            <BookOpen className="h-16 w-16 text-tpc-gold/50 mx-auto mb-4" />
                            <p className="text-white/80 font-serif text-lg line-clamp-3">{ebook.title}</p>
                          </div>
                        </div>
                      )}
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-tpc-gold text-tpc-navy font-bold">
                          $9.99
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-tpc-gold transition-colors">
                        {ebook.title}
                      </CardTitle>
                      {ebook.author && (
                        <p className="text-sm text-stone-500">{ebook.author}</p>
                      )}
                    </CardHeader>

                    <CardContent>
                      {ebook.description && (
                        <p className="text-sm text-stone-600 line-clamp-2 mb-4">
                          {ebook.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">
                          {ebook.download_count || 0} downloads
                        </span>
                        <span className="text-tpc-gold font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Partner CTA */}
      <section className="px-4 py-16 bg-gradient-to-r from-tpc-gold to-tpc-gold-accent">
        <div className="container mx-auto max-w-4xl text-center">
          <Crown className="h-12 w-12 text-tpc-navy mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-tpc-navy mb-4">
            Unlock the Full Library
          </h2>
          <p className="text-xl text-tpc-navy/80 mb-4 max-w-2xl mx-auto">
            Ministry Partners receive complimentary access to all written works,
            available anytime through their personal member dashboard.
          </p>
          <p className="text-tpc-navy/70 mb-8 max-w-xl mx-auto">
            Plus exclusive teachings, early event access, and a community of purpose-driven believers.
          </p>
          <Link href="/partner">
            <Button size="lg" className="bg-tpc-navy hover:bg-tpc-navy/90 text-white font-bold px-8 h-14">
              Explore Partnership
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
