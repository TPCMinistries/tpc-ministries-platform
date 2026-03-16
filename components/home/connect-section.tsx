'use client'

import Link from 'next/link'
import { Send, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

export function ConnectSection() {
  return (
    <Section className="bg-background">
      <div className="mx-auto max-w-2xl text-center">
        <ScrollReveal>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-navy dark:text-white">
            Let&apos;s Stay Connected
          </h2>
          <p className="mb-8 text-body-lg text-muted-foreground">
            We&apos;d love to hear from you. Share your prayer requests, testimonies, or questions with us.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/contact">
              <Button variant="default" size="lg" className="w-full sm:w-auto">
                Contact Us
                <Send className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-navy text-navy hover:bg-navy/10 dark:border-navy-300 dark:text-navy-300 sm:w-auto"
              >
                Join Our Community
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </Section>
  )
}
