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
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/ebooks"
            className="inline-flex items-center gap-2 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Ebooks
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Book Cover */}
            <div>
              <div className="sticky top-8">
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-navy-800 shadow-2xl">
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
                        <BookOpen className="mx-auto mb-6 h-24 w-24 text-gold/50" />
                        <p className="font-display text-display-xs text-white">{ebook.title}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Stats */}
                <div className="mt-6 text-center text-body-sm text-muted-foreground">
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

              <h1 className="mb-4 font-display text-display-md text-foreground">
                {ebook.title}
              </h1>

              {/* Author */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy">
                  <User className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{ebook.author || 'TPC Ministries'}</p>
                  <p className="text-body-sm text-muted-foreground">Author</p>
                </div>
              </div>

              {/* Price Section */}
              <Card className="mb-8 rounded-2xl border-2 border-gold/30">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-body-sm text-muted-foreground">Price</p>
                      <p className="font-display text-display-sm text-foreground">$9.99</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-gold">
                        <Crown className="h-4 w-4" />
                        <span className="text-body-sm font-medium">Included with Partnership</span>
                      </div>
                    </div>
                  </div>

                  {isPartner ? (
                    // Partner - Free Download
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Included with your Partnership</span>
                      </div>
                      <p className="mb-4 text-body-sm text-muted-foreground">
                        This title is available in your member dashboard library.
                      </p>
                      {ebook.file_url ? (
                        <a href={ebook.file_url} download>
                          <Button variant="glow" className="h-14 w-full text-body-lg">
                            <Download className="mr-2 h-5 w-5" />
                            Download Now
                          </Button>
                        </a>
                      ) : (
                        <Button disabled className="h-14 w-full text-body-lg">
                          Download Coming Soon
                        </Button>
                      )}
                    </div>
                  ) : isLoggedIn ? (
                    // Logged in but not partner
                    <div className="space-y-4">
                      <Link href={`/api/stripe/create-checkout-session?type=ebook&id=${ebook.id}`}>
                        <Button variant="glow" className="h-14 w-full text-body-lg font-bold">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Purchase for $9.99
                        </Button>
                      </Link>
                      <div className="rounded-2xl bg-secondary p-4 text-center">
                        <p className="mb-2 text-body-sm text-muted-foreground">
                          Ministry Partners enjoy complimentary access to all written works
                          through their member dashboard.
                        </p>
                        <Link href="/partners" className="text-body-sm font-medium text-gold hover:underline">
                          Explore Partnership Benefits
                        </Link>
                      </div>
                    </div>
                  ) : (
                    // Not logged in
                    <div className="space-y-4">
                      <Link href={`/api/stripe/create-checkout-session?type=ebook&id=${ebook.id}`}>
                        <Button variant="glow" className="h-14 w-full text-body-lg font-bold">
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Purchase for $9.99
                        </Button>
                      </Link>
                      <div className="rounded-2xl bg-secondary p-4 text-center">
                        <p className="mb-3 text-body-sm text-muted-foreground">
                          Ministry Partners enjoy complimentary access to all written works
                          through their member dashboard.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <Link href="/auth/login">
                            <Button variant="outline" className="w-full text-body-sm">
                              Sign In
                            </Button>
                          </Link>
                          <Link href="/partners">
                            <Button variant="outline" className="w-full border-gold text-body-sm text-gold hover:bg-gold/10">
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
                <h2 className="mb-4 font-display text-display-xs text-foreground">About This Book</h2>
                {ebook.description ? (
                  <div className="prose prose-lg max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {ebook.description}
                    </p>
                  </div>
                ) : (
                  <p className="italic text-muted-foreground">
                    Discover transformative insights and practical wisdom for your spiritual journey.
                    This ebook provides biblical teachings and guidance to help you grow in faith and purpose.
                  </p>
                )}
              </div>

              {/* What You'll Get */}
              <div className="mb-8">
                <h2 className="mb-4 font-display text-display-xs text-foreground">What You&apos;ll Get</h2>
                <ul className="space-y-3">
                  {[
                    'Instant digital download (PDF format)',
                    'Read on any device - phone, tablet, or computer',
                    'Lifetime access to the content',
                    'Biblical insights and practical application',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              {ebook.tags && ebook.tags.length > 0 && (
                <div>
                  <h3 className="mb-2 text-body-sm font-medium text-muted-foreground">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {ebook.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
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
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-6xl text-center">
          <h2 className="mb-4 font-display text-display-sm text-white">Explore More Written Works</h2>
          <p className="text-body-lg text-white/50">
            Discover more transformative teachings and resources.
          </p>
          <p className="mb-8 mt-2 text-body-sm text-white/30">
            Ministry Partners receive complimentary access to the entire library through their member dashboard.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/ebooks">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View All Ebooks
              </Button>
            </Link>
            <Link href="/partners">
              <Button variant="glow">
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
