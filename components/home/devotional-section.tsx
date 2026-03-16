'use client'

import { ArrowRight, BookOpen, Heart, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

const features = [
  { icon: BookOpen, text: 'Fresh daily devotionals & prophetic words' },
  { icon: Heart, text: 'Scripture-based encouragement for your journey' },
  { icon: Users, text: 'Join a growing community of believers' },
]

export function DevotionalSection() {
  return (
    <Section className="bg-gradient-to-br from-gold-50 to-gold-100/50">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Content */}
          <ScrollReveal variant="fade-left" className="text-center md:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-2">
              <Sparkles className="h-4 w-4 text-gold-600" />
              <span className="text-body-sm font-medium text-gold-600">Daily Devotional</span>
            </div>
            <h2 className="mb-4 font-display text-display-md md:text-display-lg text-navy">
              Start Your Day With A Word In Season
            </h2>
            <p className="mb-6 text-body-lg text-muted-foreground">
              Begin each morning with fresh biblical insights, prophetic encouragement,
              and practical wisdom through our daily devotional platform.
            </p>
            <div className="mb-8 space-y-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.text} className="flex items-center gap-3 text-foreground">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gold/20">
                      <Icon className="h-3 w-3 text-gold-600" />
                    </div>
                    <span className="text-body-md">{feature.text}</span>
                  </div>
                )
              })}
            </div>
            <a href="https://www.streamsofgrace.app" target="_blank" rel="noopener noreferrer">
              <Button variant="gold" size="lg" className="font-bold">
                Visit Streams of Grace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </ScrollReveal>

          {/* Visual card */}
          <ScrollReveal variant="fade-right">
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-800 p-8 shadow-2xl">
                <div className="text-center">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gold/20">
                    <BookOpen className="h-10 w-10 text-gold" />
                  </div>
                  <h3 className="mb-2 font-display text-display-xs text-white">
                    Streams of Grace
                  </h3>
                  <p className="mb-6 text-gold">Daily Devotional App</p>
                  <div className="rounded-xl bg-white/10 p-4 text-left">
                    <p className="mb-2 text-body-xs uppercase tracking-wider text-white/60">
                      Today&apos;s Word
                    </p>
                    <p className="font-serif italic text-white">
                      &ldquo;For I know the plans I have for you, declares the Lord,
                      plans to prosper you and not to harm you, plans to give you
                      hope and a future.&rdquo;
                    </p>
                    <p className="mt-2 text-body-sm text-gold">-- Jeremiah 29:11</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gold/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gold-200/50 blur-2xl" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Section>
  )
}
