'use client'

import Link from 'next/link'
import { BookOpen, Video, Laptop, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
    gradient: 'from-navy via-navy-800 to-navy-700',
    large: true,
  },
  {
    href: '/auth/signup',
    icon: Video,
    title: 'Online Engagement',
    description:
      'Join live worship services, prayer meetings, and community gatherings. Connect with believers globally.',
    cta: 'Join Community',
    gradient: 'from-gold-600 via-gold-500 to-gold-400',
    large: false,
  },
  {
    href: '/auth/signup',
    icon: Laptop,
    title: 'Digital Empowerment',
    description:
      'Access tools, resources, and training to grow spiritually and develop leadership skills.',
    cta: 'Get Empowered',
    gradient: 'from-navy-800 via-navy-600 to-navy-500',
    large: false,
  },
]

export function MinistryCardsSection() {
  return (
    <Section className="bg-secondary">
      <ScrollReveal className="mb-12 text-center">
        <h2 className="mb-4 font-display text-display-md md:text-display-lg text-navy">
          Reaching the World for Christ
        </h2>
        <p className="text-body-xl text-muted-foreground">Through Digital Ministry</p>
      </ScrollReveal>

      <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ministryCards.map((card) => {
          const Icon = card.icon
          return (
            <StaggerItem
              key={card.title}
              className={card.large ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''}
            >
              <Link href={card.href} className="block h-full">
                <Card
                  variant="interactive"
                  className={`group h-full overflow-hidden backdrop-blur-sm ${
                    card.large ? 'min-h-[320px]' : ''
                  }`}
                >
                  <CardHeader className={card.large ? 'pb-8' : ''}>
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient}`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="font-display text-display-xs text-navy">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-body-md">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-gold-600 transition-transform group-hover:translate-x-2">
                      <span className="font-medium">{card.cta}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerChildren>
    </Section>
  )
}
