'use client'

import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { StaggerChildren, StaggerItem } from '@/components/motion/stagger-children'

interface EbookData {
  id: string
  title: string
  thumbnail_url?: string | null
  author?: string | null
}

interface EbooksSectionProps {
  ebooks: EbookData[]
}

// Generate a unique gradient based on title hash for visual variety
const coverStyles = [
  {
    bg: 'from-navy-950 via-navy-800 to-navy-700',
    accent: 'border-gold/40',
    line: 'bg-gold/60',
    dot: 'bg-gold/30',
  },
  {
    bg: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    accent: 'border-amber-400/40',
    line: 'bg-amber-400/60',
    dot: 'bg-amber-400/30',
  },
  {
    bg: 'from-[#2d1b4e] via-[#1a1040] to-[#0d0a1e]',
    accent: 'border-purple-300/40',
    line: 'bg-purple-300/60',
    dot: 'bg-purple-300/30',
  },
  {
    bg: 'from-[#1b2a1b] via-[#0f1f15] to-[#0a1510]',
    accent: 'border-emerald-300/40',
    line: 'bg-emerald-300/60',
    dot: 'bg-emerald-300/30',
  },
]

function DynamicBookCover({ title, author, index }: { title: string; author?: string | null; index: number }) {
  const style = coverStyles[index % coverStyles.length]

  return (
    <div className={`relative aspect-[3/4] overflow-hidden bg-gradient-to-br ${style.bg} p-6 flex flex-col justify-between`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/[0.03] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/[0.03] translate-y-1/2 -translate-x-1/2" />

      {/* Top accent line */}
      <div>
        <div className={`h-0.5 w-12 ${style.line} mb-6`} />
        {/* Decorative dots */}
        <div className="flex gap-1.5 mb-4">
          <div className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <div className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <div className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        </div>
      </div>

      {/* Title */}
      <div className="flex-1 flex items-center">
        <h3 className="font-display text-xl leading-tight text-white/90 line-clamp-4">
          {title}
        </h3>
      </div>

      {/* Bottom: author + accent */}
      <div>
        <div className={`h-px w-full ${style.line} opacity-30 mb-3`} />
        {author && (
          <p className="text-xs text-white/40 font-medium tracking-wide uppercase">
            {author}
          </p>
        )}
      </div>

      {/* Corner accent */}
      <div className={`absolute top-0 left-0 w-1 h-full ${style.line} opacity-20`} />
    </div>
  )
}

export function EbooksSection({ ebooks }: EbooksSectionProps) {
  return (
    <Section className="bg-gradient-to-br from-navy-950 to-navy-800">
      <ScrollReveal className="mb-12 text-center">
        <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
          Library
        </p>
        <h2 className="mb-4 font-display text-display-md md:text-display-lg text-white">
          Written Works
        </h2>
        <p className="text-body-lg text-white/50">
          Ebooks and resources for your spiritual growth
        </p>
      </ScrollReveal>

      <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ebooks.length > 0 ? (
          ebooks.map((ebook, index) => (
            <StaggerItem key={ebook.id}>
              <Link href={`/ebooks/${ebook.id}`}>
                <Card
                  variant="glass"
                  className="group cursor-pointer overflow-hidden border-white/10 bg-white/5 backdrop-blur transition-all duration-300 hover:border-gold/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-gold/5"
                >
                  {/* Book cover with 3D tilt */}
                  <div className="transition-transform duration-500 [perspective:600px] group-hover:[transform:rotateY(-4deg)_rotateX(1deg)]">
                    {ebook.thumbnail_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ebook.thumbnail_url}
                        alt={ebook.title}
                        className="aspect-[3/4] h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <DynamicBookCover
                        title={ebook.title}
                        author={ebook.author}
                        index={index}
                      />
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 font-display text-body-md text-white">
                      {ebook.title}
                    </CardTitle>
                    {ebook.author && (
                      <CardDescription className="text-white/40">
                        {ebook.author}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gold/30 text-gold hover:bg-gold hover:text-navy"
                    >
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))
        ) : (
          <div className="col-span-4 py-12 text-center text-white/40">
            <BookOpen className="mx-auto mb-4 h-16 w-16 opacity-50" />
            <p>Ebooks coming soon! Check back for new resources.</p>
          </div>
        )}
      </StaggerChildren>

      {ebooks.length > 0 && (
        <div className="mt-12 text-center">
          <Link href="/ebooks">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gold/30 text-gold hover:bg-gold hover:text-navy"
            >
              View All Ebooks
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      )}
    </Section>
  )
}
