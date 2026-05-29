import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ArrowRight, Crown, User } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

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
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,184,131,0.06),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <ScrollReveal>
            <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Written Works
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
              Words to walk with.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mx-auto max-w-2xl text-body-xl text-white/70">
              Ebooks from Prophet Lorenzo — purpose, prophecy, and Kingdom strategy in print.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-6 py-3">
                <Crown className="h-5 w-5 text-gold" />
                <span className="text-body-md font-medium text-white">Free with Partnership</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3">
                <span className="text-body-md text-white/80">$9.99 each</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Author Section */}
      <section className="border-y border-border bg-secondary/50 px-4 py-section-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 md:flex-row">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-navy">
              <User className="h-12 w-12 text-gold" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="mb-2 font-display text-display-xs text-navy dark:text-white">Lorenzo A. Daughtry-Chambers</h2>
              <p className="text-body-md text-muted-foreground">
                Author, teacher, and founder of TPC Ministries. These works represent years of
                biblical study, prophetic insight, and practical wisdom for Kingdom living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ebooks Grid */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Library
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-navy dark:text-white">
              Available Ebooks
            </h2>
            <p className="mt-2 text-body-md text-muted-foreground">{ebooks.length} titles available</p>
          </div>

          {ebooks.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card py-16 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-body-lg text-muted-foreground">No ebooks available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {ebooks.map((ebook) => (
                <Link href={`/ebooks/${ebook.id}`} key={ebook.id}>
                  <div className="group h-full cursor-pointer overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-xl">
                    {/* Cover Image */}
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-navy to-navy/80">
                      {ebook.thumbnail_url ? (
                        <Image
                          src={ebook.thumbnail_url}
                          alt={ebook.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-6 text-center">
                            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gold/50" />
                            <p className="font-display text-body-lg text-white/80">{ebook.title}</p>
                          </div>
                        </div>
                      )}
                      {/* Price Badge */}
                      <div className="absolute right-3 top-3">
                        <Badge className="bg-gold font-bold text-navy-950">
                          $9.99
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-1 font-display text-body-lg font-semibold text-navy transition-colors group-hover:text-gold dark:text-white dark:group-hover:text-gold">
                        {ebook.title}
                      </h3>
                      {ebook.author && (
                        <p className="mb-3 text-body-sm text-muted-foreground">{ebook.author}</p>
                      )}

                      {ebook.description && (
                        <p className="mb-4 line-clamp-2 text-body-sm text-muted-foreground">
                          {ebook.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-body-sm text-muted-foreground">
                          {ebook.download_count || 0} downloads
                        </span>
                        <span className="flex items-center gap-1 text-body-sm font-medium text-gold transition-all group-hover:gap-2">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Partner CTA */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <Crown className="mx-auto mb-6 h-12 w-12 text-gold" />
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Partnership
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Unlock the Full Library
          </h2>
          <p className="mb-4 text-body-xl text-white/50">
            Ministry Partners receive complimentary access to all written works,
            available anytime through their personal member dashboard.
          </p>
          <p className="mb-10 text-body-md text-white/30">
            Plus ongoing teaching, early event updates, and a community of purpose-driven believers.
          </p>
          <Link href="/partners">
            <Button variant="glow" size="xl">
              Explore Partnership
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
