'use client'

import { useRef } from 'react'
import { useReducedMotion, motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Globe, Heart, Users, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

export function KenyaSection() {
  const shouldReduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduceMotion ? '0%' : '15%'])

  return (
    <div ref={sectionRef}>
      <Section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900" container={false}>
        {/* Parallax background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-amber-800/80 to-stone-900/80"
          style={{ y: bgY }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:gap-12 md:grid-cols-2">
          {/* Content */}
          <div className="text-white">
            <ScrollReveal variant="fade-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Globe className="h-4 w-4 text-amber-300" />
                <span className="text-body-sm font-medium text-amber-200">Global Impact 2026</span>
              </div>

              <h2 className="mb-6 font-display text-display-md md:text-display-lg">
                What God Did in
                <span className="block text-amber-300">Kenya</span>
              </h2>

              <p className="mb-6 text-body-xl leading-relaxed text-amber-100/90">
                Fourteen days on the ground. The Kenya 2026 Global Impact Delegation
                served across ministry, education, healthcare, and business — and the
                footage tells the story.
              </p>
            </ScrollReveal>

            {/* Trip complete badge */}
            <ScrollReveal delay={0.2}>
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-body-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  Mission complete
                </span>
                <span className="text-body-sm font-medium text-amber-100/80">
                  April 23 – May 6, 2026
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="mb-8 space-y-3">
                <div className="flex items-center gap-3 text-amber-100">
                  <Heart className="h-5 w-5 text-amber-400" />
                  <span>6 Service Tracks to match your gifts</span>
                </div>
                <div className="flex items-center gap-3 text-amber-100">
                  <Users className="h-5 w-5 text-amber-400" />
                  <span>All-inclusive experience with safari</span>
                </div>
                <div className="flex items-center gap-3 text-amber-100">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <span>Scholarships available</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/kenya-2026">
                  <Button
                    size="lg"
                    className="w-full bg-amber-500 font-bold text-stone-900 hover:bg-amber-400 sm:w-auto"
                  >
                    See the recap
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/kenya/give">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Support the Mission
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Trip Flier */}
          <ScrollReveal variant="fade-right" className="hidden md:block">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500/20 to-transparent blur-2xl" />
              <Link href="/kenya" className="relative block">
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-colors hover:border-amber-400/50">
                  <Image
                    src="/images/kenya/kenya-flier.png"
                    alt="Kenya Kingdom Impact Trip 2026"
                    width={600}
                    height={800}
                    className="w-full rounded-xl shadow-2xl"
                  />
                </div>
              </Link>
            </div>
          </ScrollReveal>
          </div>
        </div>
      </Section>
    </div>
  )
}
