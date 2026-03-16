'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { NumberCounter } from '@/components/motion/number-counter'

const impactStats = [
  { amount: 50, description: 'provides meals for a family of 4 in Kenya' },
  { amount: 100, description: 'sponsors a child for a month of school' },
  { amount: 250, description: 'funds a community ministry event' },
]

export function GivingCtaSection() {
  return (
    <Section className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-300">
      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-navy-950">
            Be the Change -- Your Kindness Makes a Difference
          </h2>
          <p className="mb-10 text-body-xl text-navy-800/80 md:text-body-xl">
            Your generous support enables us to transform lives, spread the Gospel, and make an
            eternal impact across Kenya, South Africa, and Grenada.
          </p>
        </ScrollReveal>

        {/* Impact stats */}
        <ScrollReveal delay={0.15}>
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {impactStats.map((stat) => (
              <div
                key={stat.amount}
                className="rounded-xl bg-white/30 p-5 backdrop-blur-sm"
              >
                <div className="mb-2 font-display text-display-sm text-navy-950">
                  <NumberCounter
                    value={stat.amount}
                    prefix="$"
                    duration={1.2}
                  />
                </div>
                <p className="text-body-sm text-navy-800/80">{stat.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <Link href="/giving">
            <Button
              variant="default"
              size="xl"
              className="bg-navy text-lg text-white shadow-xl hover:bg-navy-800"
            >
              Donate Now
              <Heart className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </Section>
  )
}
