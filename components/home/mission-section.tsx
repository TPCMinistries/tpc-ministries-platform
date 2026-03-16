'use client'

import Image from 'next/image'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { NumberCounter } from '@/components/motion/number-counter'

const stats = [
  { value: 3, suffix: '', label: 'Countries Served', icon: '🌍' },
  { value: 1000, suffix: '+', label: 'Lives Impacted', icon: '🙏' },
  { value: 14, suffix: '', label: 'Day Mission Trips', icon: '✈️' },
  { value: 6, suffix: '', label: 'Service Tracks', icon: '🤝' },
]

export function MissionSection() {
  return (
    <Section className="bg-background">
      <div className="grid items-center gap-12 md:grid-cols-5 md:gap-16">
        {/* Image - 2 cols */}
        <ScrollReveal variant="fade-left" className="md:col-span-2 flex justify-center">
          <Image
            src="/images/logos/tpc-logo.png"
            alt="TPC Ministries"
            width={320}
            height={320}
            className="h-64 w-auto md:h-80"
          />
        </ScrollReveal>

        {/* Content - 3 cols */}
        <div className="md:col-span-3">
          <ScrollReveal variant="fade-right">
            <h2 className="mb-6 font-display text-display-md md:text-display-lg text-navy">
              Our Mission
            </h2>
            <p className="mb-8 text-body-lg leading-relaxed text-muted-foreground">
              To awaken purpose and ignite vision in every believer through transformative
              discipleship, biblical teaching, and global ministry. We are committed to
              empowering individuals to discover their divine calling and walk in the fullness
              of God&apos;s plan for their lives.
            </p>
          </ScrollReveal>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            {stats.map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 0.1}>
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="mb-1 text-2xl">{stat.icon}</div>
                  <div className="font-display text-display-xs text-navy">
                    <NumberCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      duration={1.5}
                    />
                  </div>
                  <div className="text-body-sm text-muted-foreground">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
