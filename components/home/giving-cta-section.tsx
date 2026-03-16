'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { NumberCounter } from '@/components/motion/number-counter'

const impactStats = [
  { amount: 50, description: 'Provides meals for a family of 4' },
  { amount: 100, description: 'Sponsors a child for a month' },
  { amount: 250, description: 'Funds a community outreach' },
]

export function GivingCtaSection() {
  return (
    <Section size="lg" className="relative overflow-hidden bg-navy-950" container={false}>
      {/* Radial gold glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.12),transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Make an Impact
          </p>
          <h2 className="mx-auto mb-6 max-w-3xl font-display text-display-md md:text-display-lg lg:text-display-xl text-white">
            Your Generosity Changes Lives
          </h2>
          <p className="mx-auto mb-8 md:mb-12 max-w-2xl text-body-lg text-white/50">
            Every gift transforms lives across Kenya, South Africa, and Grenada —
            spreading the Gospel and building lasting impact.
          </p>
        </ScrollReveal>

        {/* Impact tiers */}
        <ScrollReveal delay={0.15}>
          <div className="mb-10 md:mb-14 grid gap-4 sm:grid-cols-3">
            {impactStats.map((stat) => (
              <div
                key={stat.amount}
                className="group rounded-2xl border border-gold/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-white/10"
              >
                <div className="mb-2 font-display text-display-md text-gold">
                  <NumberCounter value={stat.amount} prefix="$" duration={1.2} />
                </div>
                <p className="text-body-sm text-white/50">{stat.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="text-center">
          <Link href="/giving">
            <Button variant="glow" size="xl" className="text-lg animate-glow-pulse">
              Donate Now
              <Heart className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </Section>
  )
}
