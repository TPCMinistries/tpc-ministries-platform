'use client'

import { useReducedMotion, motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { Heart, ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { staggerContainer, fadeInUp } from '@/components/motion/variants'

const titleWords = ['Welcome', 'to', 'TPC', 'Ministries']

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-gold/30"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.15, 0.6, 0.15] }}
      transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  const particles = [
    { delay: 0, x: '8%', y: '25%', size: 4 },
    { delay: 1.2, x: '82%', y: '18%', size: 6 },
    { delay: 0.6, x: '20%', y: '72%', size: 3 },
    { delay: 1.8, x: '68%', y: '12%', size: 5 },
    { delay: 0.3, x: '92%', y: '55%', size: 3 },
    { delay: 2.1, x: '42%', y: '85%', size: 4 },
    { delay: 1.5, x: '12%', y: '48%', size: 3 },
    { delay: 0.9, x: '75%', y: '70%', size: 5 },
    { delay: 2.5, x: '55%', y: '30%', size: 4 },
    { delay: 1.0, x: '35%', y: '15%', size: 3 },
  ]

  return (
    <section className="relative flex min-h-[85vh] md:min-h-screen items-center justify-center overflow-hidden bg-navy-950">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,184,131,0.08),transparent_60%)]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

      {/* Floating particles */}
      {!shouldReduceMotion && particles.map((p, i) => <FloatingParticle key={i} {...p} />)}

      {/* Content */}
      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-5xl">
          {/* Eyebrow */}
          <motion.div
            className="mb-8 flex justify-center"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-5 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <span className="text-body-sm font-medium tracking-wide text-gold-300">
                Transforming Lives Across 3 Nations
              </span>
            </div>
          </motion.div>

          {/* Main title — staggered word reveal */}
          <motion.h1
            className="mb-6 text-center font-display text-[2.5rem] leading-[1.05] tracking-tight text-white sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem]"
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : 'visible'}
          >
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                className={`mr-[0.25em] inline-block ${
                  word === 'TPC' || word === 'Ministries'
                    ? 'bg-gradient-to-r from-gold-300 via-gold to-gold-500 bg-clip-text text-transparent'
                    : ''
                }`}
                variants={shouldReduceMotion ? undefined : wordVariant}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mb-4 max-w-2xl text-center font-serif text-xl italic text-gold-300/80 sm:text-2xl md:text-3xl"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Awakening Purpose. Igniting Vision.
          </motion.p>

          {/* Divider line */}
          <motion.div
            className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent"
            initial={shouldReduceMotion ? undefined : { scaleX: 0 }}
            animate={shouldReduceMotion ? undefined : { scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          />

          {/* Body text */}
          <motion.p
            className="mx-auto mb-8 md:mb-12 max-w-xl text-center text-body-md sm:text-body-lg text-navy-200/70"
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            Join a global community of believers in Kenya, South Africa, and Grenada
            walking in the fullness of God&apos;s purpose.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            variants={shouldReduceMotion ? undefined : fadeInUp}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : 'visible'}
            transition={{ delay: 1.3 }}
          >
            <Link href="/giving">
              <Button variant="glow" size="xl" className="w-full animate-glow-pulse sm:w-auto">
                Give Now
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                variant="outline"
                size="xl"
                className="w-full border-2 border-gold/30 bg-transparent text-white hover:bg-gold/10 sm:w-auto"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-6 w-6 text-gold/40" />
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
