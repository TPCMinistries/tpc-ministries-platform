import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  ArrowLeft,
  Download,
  Crown,
  ShoppingCart,
  User,
  CheckCircle,
  Lock,
} from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

async function getEbook(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .eq('type', 'ebook')
    .single()

  if (error) {
    return null
  }
  return data
}

async function getUserAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { isLoggedIn: false, isPartner: false, tier: null }
  }

  const { data: member } = await supabase
    .from('members')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  const tier = member?.tier || 'free'
  const isPartner = ['partner', 'covenant'].includes(tier)

  return { isLoggedIn: true, isPartner, tier }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const ebook = await getEbook(id)

  if (!ebook) {
    return { title: 'Ebook Not Found | TPC Ministries' }
  }

  return {
    title: `${ebook.title} | TPC Ministries`,
    description: ebook.description || `Read "${ebook.title}" by ${ebook.author || 'TPC Ministries'}`,
    openGraph: {
      title: ebook.title,
      description: ebook.description || `Ebook by ${ebook.author}`,
      images: ebook.thumbnail_url ? [ebook.thumbnail_url] : [],
    },
  }
}

export default async function EbookDetailPage({ params }: Props) {
  const { id } = await params
  const ebook = await getEbook(id)

  if (!ebook) {
    notFound()
  }

  const { isLoggedIn, isPartner } = await getUserAccess()

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-4">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/ebooks"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-tpc-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Ebooks
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Book Cover */}
            <div>
              <div className="sticky top-8">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-tpc-navy to-tpc-navy/80 rounded-2xl overflow-hidden shadow-2xl">
                  {ebook.thumbnail_url ? (
                    <Image
                      src={ebook.thumbnail_url}
                      alt={ebook.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="text-center">
                        <BookOpen className="h-24 w-24 text-tpc-gold/50 mx-auto mb-6" />
                        <p className="text-white font-serif text-2xl">{ebook.title}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Stats */}
                <div className="mt-6 text-center text-stone-500 text-sm">
                  {ebook.download_count || 0} downloads
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div>
              {/* Category Badge */}
              {ebook.category && (
                <Badge variant="outline" className="mb-4">
                  {ebook.category}
                </Badge>
              )}

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
                {ebook.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-tpc-navy rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-tpc-gold" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">{ebook.author || 'TPC Ministries'}</p>
                  <p className="text-sm text-stone-500">Author</p>
                </div>
              </div>

              {/* Price Section */}
              <Card className="mb-8 border-2 border-tpc-gold/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-stone-500 mb-1">Price</p>
                      <p className="text-3xl font-bold text-stone-900">$9.99</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 bg-tpc-gold/10 text-tpc-gold px-4 py-2 rounded-full">
                        <Crown className="h-4 w-4" />
                        <span className="font-medium text-sm">Included with Partnership</span>
                      </div>
                    </div>
                  </div>

                  {isPartner ? (
                    // Partner - Free Download
                    <div>
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Included with your Partnership</span>
                      </div>
                      <p className="text-sm text-stone-500 mb-4">
                        This title is available in your member dashboard library.
                      </p>
                      {ebook.file_url ? (
                        <a href={ebook.file_url} download>
                          <Button className="w-full bg-tpc-navy hover:bg-tpc-navy/90 text-white h-14 text-lg">
                            <Download className="mr-2 h-5 w-5" />
                            Download Now
                          </Button>
                        </a>
                      ) : (
                        <Button disabled className="w-full h-14 text-lg">
                          Download Coming Soon
                        </Button>
                      )}
                    </div>
                  ) : isLoggedIn ? (
                    // Logged in but not partner
                    <div className="space-y-4">
                      <Link href={`/api/stripe/create-checkout-session?type=ebook&id=${ebook.id}`}>
                        <Button className="w-full bg-tpc-gold hover:bg-tpc-gold-accent text-tpc-navy h-14 text-lg font-bold">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Purchase for $9.99
                        </Button>
                      </Link>
                      <div className="bg-stone-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-stone-600 mb-2">
                          Ministry Partners enjoy complimentary access to all written works
                          through their member dashboard.
                        </p>
                        <Link href="/partner" className="text-tpc-gold hover:underline text-sm font-medium">
                          Explore Partnership Benefits
                        </Link>
                      </div>
                    </div>
                  ) : (
                    // Not logged in
                    <div className="space-y-4">
                      <Link href={`/api/stripe/create-checkout-session?type=ebook&id=${ebook.id}`}>
                        <Button className="w-full bg-tpc-gold hover:bg-tpc-gold-accent text-tpc-navy h-14 text-lg font-bold">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Purchase for $9.99
                        </Button>
                      </Link>
                      <div className="bg-stone-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-stone-600 mb-3">
                          Ministry Partners enjoy complimentary access to all written works
                          through their member dashboard.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <Link href="/auth/login">
                            <Button variant="outline" className="w-full text-sm">
                              Sign In
                            </Button>
                          </Link>
                          <Link href="/partner">
                            <Button variant="outline" className="w-full border-tpc-gold text-tpc-gold hover:bg-tpc-gold/10 text-sm">
                              <Crown className="mr-2 h-4 w-4" />
                              Become a Partner
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-stone-900 mb-4">About This Book</h2>
                {ebook.description ? (
                  <div className="prose prose-stone max-w-none">
                    <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {ebook.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-stone-500 italic">
                    Discover transformative insights and practical wisdom for your spiritual journey.
                    This ebook provides biblical teachings and guidance to help you grow in faith and purpose.
                  </p>
                )}
              </div>

              {/* What You'll Get */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-stone-900 mb-4">What You'll Get</h2>
                <ul className="space-y-3">
                  {[
                    'Instant digital download (PDF format)',
                    'Read on any device - phone, tablet, or computer',
                    'Lifetime access to the content',
                    'Biblical insights and practical application',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              {ebook.tags && ebook.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-stone-500 mb-2">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {ebook.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-stone-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* More Ebooks */}
      <section className="px-4 py-16 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Explore More Written Works</h2>
          <p className="text-stone-600 mb-4">
            Discover more transformative teachings and resources.
          </p>
          <p className="text-stone-500 text-sm mb-8">
            Ministry Partners receive complimentary access to the entire library through their member dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ebooks">
              <Button variant="outline" className="border-tpc-navy text-tpc-navy hover:bg-tpc-navy hover:text-white">
                View All Ebooks
              </Button>
            </Link>
            <Link href="/partner">
              <Button variant="outline" className="border-tpc-gold text-tpc-gold hover:bg-tpc-gold hover:text-tpc-navy">
                <Crown className="mr-2 h-4 w-4" />
                Explore Partnership
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
