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

export function EbooksSection({ ebooks }: EbooksSectionProps) {
  return (
    <Section className="bg-gradient-to-br from-navy-950 to-navy-800">
      <ScrollReveal className="mb-12 text-center">
        <h2 className="mb-4 font-display text-display-md md:text-display-lg text-white">
          Written Works
        </h2>
        <p className="text-body-lg text-gold">
          Ebooks and resources for your spiritual growth
        </p>
      </ScrollReveal>

      <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ebooks.length > 0 ? (
          ebooks.map((ebook) => (
            <StaggerItem key={ebook.id}>
              <Link href={`/ebooks/${ebook.id}`}>
                <Card
                  variant="glass"
                  className="group cursor-pointer overflow-hidden border-gold/30 bg-white/10 backdrop-blur transition-all hover:border-gold"
                >
                  {/* 3D book tilt on hover */}
                  <div
                    className="relative aspect-[3/4] bg-gradient-to-br from-gold to-gold-500 transition-transform duration-500 [perspective:600px] group-hover:[transform:rotateY(-6deg)_rotateX(2deg)]"
                  >
                    {ebook.thumbnail_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ebook.thumbnail_url}
                        alt={ebook.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-20 w-20 text-white/50" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 font-display text-white">
                      {ebook.title}
                    </CardTitle>
                    {ebook.author && (
                      <CardDescription className="text-gold/80">
                        {ebook.author}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full border-gold text-gold hover:bg-gold hover:text-navy"
                    >
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))
        ) : (
          <div className="col-span-4 py-12 text-center text-gold/60">
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
              className="border-2 border-gold text-gold hover:bg-gold hover:text-navy"
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
