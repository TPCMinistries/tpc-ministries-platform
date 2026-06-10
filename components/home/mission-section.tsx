'use client'

import Image from 'next/image'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { NumberCounter } from '@/components/motion/number-counter'

const stats = [
  { value: 3, suffix: '', label: 'Countries' },
  { value: 1000, suffix: '+', label: 'Lives Impacted' },
  { value: 14, suffix: '-Day', label: 'Mission Trips' },
  { value: 6, suffix: '', label: 'Service Tracks' },
]

export function MissionSection() {
  return (
    <Section size="lg" className="bg-background">
      {/* Full-width editorial layout */}
      <div className="mx-auto max-w-6xl">
        {/* Big quote / mission statement */}
        <ScrollReveal className="mb-10 md:mb-16 text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
            Our Mission
          </p>
          <h2 className="mx-auto max-w-4xl font-display text-display-md md:text-display-lg lg:text-display-xl text-navy dark:text-white">
            To awaken purpose and ignite vision in every believer
          </h2>
        </ScrollReveal>

        {/* Two-column: Image + Text */}
        <div className="grid items-center gap-8 lg:gap-16 lg:grid-cols-2">
          {/* Left — Image with overlay badge */}
          <ScrollReveal variant="fade-left">
            <div className="relative">
              <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-navy/5 to-gold/5">
                <Image
                  src="/images/logos/tpc-logo.png"
                  alt="TPC Ministries"
                  width={400}
                  height={400}
                  className="h-full w-full object-contain p-8"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 rounded-2xl border border-gold/20 bg-card px-5 py-3 shadow-xl md:-bottom-6 md:-right-8">
                <p className="font-display text-display-xs text-gold-600">2016</p>
                <p className="text-body-xs text-muted-foreground">Founded</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Right — Description */}
          <ScrollReveal variant="fade-right">
            <p className="mb-8 text-body-xl leading-relaxed text-muted-foreground">
              Through transformative discipleship, biblical teaching, and global ministry,
              we empower individuals to discover their divine calling and walk in the fullness
              of God&apos;s plan for their lives.
            </p>
            <p className="text-body-lg leading-relaxed text-muted-foreground/80">
              From the streets of Nairobi to communities in South Africa and Grenada,
              TPC Ministries brings the gospel, practical support, and prophetic vision
              to those who need it most.
            </p>
          </ScrollReveal>
        </div>

        {/* Stats bar — full width */}
        <ScrollReveal delay={0.2} className="mt-12 md:mt-20">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 py-4 text-center md:py-6">
                <div className="font-display text-display-sm md:text-display-md text-navy dark:text-white">
                  <NumberCounter value={stat.value} suffix={stat.suffix} duration={1.5} />
                </div>
                <div className="mt-1 text-body-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </Section>
  )
}
