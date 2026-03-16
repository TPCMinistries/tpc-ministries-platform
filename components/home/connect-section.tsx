'use client'

import Link from 'next/link'
import { Send, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

export function ConnectSection() {
  return (
    <Section size="lg" className="relative overflow-hidden bg-gradient-to-br from-tpc-beige via-gold-50 to-background">
      {/* Decorative element */}
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl">
        <div className="grid items-center gap-8 md:gap-12 md:grid-cols-2">
          {/* Left — content */}
          <ScrollReveal variant="fade-left">
            <p className="mb-3 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Get in Touch
            </p>
            <h2 className="mb-4 font-display text-display-md md:text-display-lg text-navy dark:text-white">
              Let&apos;s Stay Connected
            </h2>
            <p className="text-body-lg text-muted-foreground">
              Share your prayer requests, testimonies, or questions.
              We&apos;re here for you on every step of the journey.
            </p>
          </ScrollReveal>

          {/* Right — buttons stacked */}
          <ScrollReveal variant="fade-right">
            <div className="flex flex-col gap-4">
              <Link href="/contact">
                <Button variant="default" size="xl" className="w-full justify-between">
                  Contact Us
                  <Send className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="warm" size="xl" className="w-full justify-between">
                  Join Our Community
                  <Users className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/prayer">
                <Button variant="outline" size="xl" className="w-full justify-between">
                  Submit a Prayer Request
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Section>
  )
}
