'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, Plane, BellRing, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

const CARDS = [
  {
    icon: BarChart3,
    title: 'See the impact',
    blurb: 'By the numbers — what 14 days on the ground actually delivered.',
    cta: 'Read the report',
    href: '/kenya-2026/impact',
  },
  {
    icon: Heart,
    title: 'Support the next mission',
    blurb: 'Kingdom Impact Trips are a rhythm now. Seed the next one.',
    cta: 'Give now',
    href: '/giving',
  },
  {
    icon: Plane,
    title: 'Get on the list to go',
    blurb: 'Tell us your heart is stirring for the next trip. We pick from those who say yes early.',
    cta: 'Add my name',
    href: '/connect',
  },
  {
    icon: BellRing,
    title: 'Get the next dispatch',
    blurb: 'Photos, stories, and what God is doing — straight to your inbox.',
    cta: 'Subscribe',
    href: '/connect',
  },
]

export function KenyaWhatsNext() {
  return (
    <Section size="lg" className="relative overflow-hidden bg-black">
      {/* Subtle background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(212,184,131,0.4) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
            What's next
          </div>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            The story doesn't end here.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Kenya was a chapter. We're already writing the next one. Walk it with us.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.07]"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30 transition group-hover:bg-gold/25">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-2xl font-bold leading-tight text-white">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">
                  {card.blurb}
                </p>
                <Link href={card.href} className="mt-6">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-sm font-bold uppercase tracking-[0.15em] text-gold hover:bg-transparent hover:text-gold-300"
                  >
                    {card.cta}
                    <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Closing line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <p className="font-serif text-2xl italic text-white/60 sm:text-3xl">
            "Go therefore and make disciples of all nations."
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold/70">
            Matthew 28:19
          </p>
        </motion.div>
      </div>
    </Section>
  )
}
