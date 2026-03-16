'use client'

import Link from 'next/link'
import { BookOpen, Video, Laptop, ArrowRight } from 'lucide-react'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { StaggerChildren, StaggerItem } from '@/components/motion/stagger-children'

const ministryCards = [
  {
    href: '/teachings',
    icon: BookOpen,
    title: 'Virtual Discipleship',
    description:
      'Access comprehensive biblical teachings, interactive courses, and mentorship programs designed to deepen your faith journey from anywhere in the world.',
    cta: 'Explore Teachings',
  },
  {
    href: '/auth/signup',
    icon: Video,
    title: 'Online Engagement',
    description:
      'Join live worship services, prayer meetings, and community gatherings. Connect with believers globally and build meaningful relationships.',
    cta: 'Join Community',
  },
  {
    href: '/auth/signup',
    icon: Laptop,
    title: 'Digital Empowerment',
    description:
      'Access tools, resources, and training to grow spiritually, develop leadership skills, and fulfill your divine calling in the digital age.',
    cta: 'Get Empowered',
  },
]

export function MinistryCardsSection() {
  return (
    <Section className="bg-navy dark:bg-navy-950">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-10 md:mb-16 text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Digital Ministry
          </p>
          <h2 className="font-display text-display-md md:text-display-lg text-white">
            Reaching the World for Christ
          </h2>
        </ScrollReveal>

        {/* Bento grid: 1 large left + 2 stacked right */}
        <StaggerChildren className="grid gap-6 lg:grid-cols-5">
          {/* Large card — spans 3 cols */}
          <StaggerItem className="lg:col-span-3 lg:row-span-2">
            <Link href={ministryCards[0].href} className="group block h-full">
              <div className="relative h-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 sm:p-8 md:p-12">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/20">
                  <BookOpen className="h-8 w-8 text-gold" />
                </div>
                <h3 className="mb-4 font-display text-display-sm md:text-display-md text-white">
                  {ministryCards[0].title}
                </h3>
                <p className="mb-8 max-w-md text-body-lg leading-relaxed text-white/60">
                  {ministryCards[0].description}
                </p>
                <div className="flex items-center gap-2 text-gold transition-transform duration-300 group-hover:translate-x-2">
                  <span className="text-body-md font-semibold">{ministryCards[0].cta}</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
                {/* Decorative gradient */}
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
              </div>
            </Link>
          </StaggerItem>

          {/* Two stacked cards — each 2 cols */}
          {ministryCards.slice(1).map((card) => {
            const Icon = card.icon
            return (
              <StaggerItem key={card.title} className="lg:col-span-2">
                <Link href={card.href} className="group block h-full">
                  <div className="h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-white/10">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="mb-3 font-display text-display-xs text-white">
                      {card.title}
                    </h3>
                    <p className="mb-5 text-body-md leading-relaxed text-white/50">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-2 text-gold transition-transform duration-300 group-hover:translate-x-2">
                      <span className="text-body-sm font-semibold">{card.cta}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerChildren>
      </div>
    </Section>
  )
}
