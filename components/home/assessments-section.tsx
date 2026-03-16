'use client'

import Link from 'next/link'
import { ClipboardList, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { StaggerChildren, StaggerItem } from '@/components/motion/stagger-children'

const assessments = [
  {
    icon: ClipboardList,
    title: 'Spiritual Gifts',
    description: 'Discover the unique abilities God has given you to serve His kingdom',
    href: '/assessments/spiritual-gifts',
    gradient: 'from-purple-500 to-purple-700',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-300',
    btnClass: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    icon: TrendingUp,
    title: 'Seasonal Assessment',
    description: 'Understand your current spiritual season and get tailored guidance',
    href: '/assessments/seasonal',
    gradient: 'from-blue-500 to-blue-700',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-300',
    btnClass: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    icon: Sparkles,
    title: 'Ministry Calling',
    description: 'Find your specific calling and get matched with ministry opportunities',
    href: '/assessments/ministry-calling',
    gradient: 'from-gold-500 to-gold-700',
    iconBg: 'bg-gold/20',
    iconColor: 'text-gold-600',
    btnClass: 'bg-gold-600 hover:bg-gold-700',
  },
]

export function AssessmentsSection() {
  return (
    <Section className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-navy-950 dark:to-navy-900">
      <ScrollReveal className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-300" />
        </div>
        <h2 className="mb-4 font-display text-display-md md:text-display-lg text-navy dark:text-white">
          Discover Your God-Given Design
        </h2>
        <p className="mx-auto max-w-3xl text-body-xl text-muted-foreground">
          Take our free assessments to uncover your spiritual gifts, calling, and purpose
        </p>
      </ScrollReveal>

      <StaggerChildren className="mb-8 grid gap-6 md:grid-cols-3">
        {assessments.map((assessment) => {
          const Icon = assessment.icon
          return (
            <StaggerItem key={assessment.title}>
              <Card variant="interactive" className="h-full border-2 border-transparent hover:border-gold/30">
                <CardHeader>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${assessment.iconBg}`}>
                    <Icon className={`h-6 w-6 ${assessment.iconColor}`} />
                  </div>
                  <CardTitle className="font-display text-navy dark:text-white">
                    {assessment.title}
                  </CardTitle>
                  <CardDescription className="text-body-md">
                    {assessment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={assessment.href}>
                    <Button className={`w-full text-white ${assessment.btnClass}`}>
                      Take Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
          )
        })}
      </StaggerChildren>

      <div className="text-center">
        <Link href="/assessments">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400"
          >
            View All 6 Assessments
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </Section>
  )
}
