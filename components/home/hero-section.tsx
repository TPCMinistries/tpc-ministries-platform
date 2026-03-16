'use client'

import { useReducedMotion, motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { staggerContainer, fadeInUp } from '@/components/motion/variants'

const words = ['Awakening', 'Purpose.', 'Igniting', 'Vision.']

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-gold/20"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  const particles = [
    { delay: 0, x: '10%', y: '20%', size: 6 },
    { delay: 1.2, x: '80%', y: '30%', size: 8 },
    { delay: 0.6, x: '25%', y: '70%', size: 5 },
    { delay: 1.8, x: '65%', y: '15%', size: 7 },
    { delay: 0.3, x: '90%', y: '60%', size: 4 },
    { delay: 2.1, x: '45%', y: '80%', size: 6 },
    { delay: 1.5, x: '15%', y: '50%', size: 5 },
    { delay: 0.9, x: '70%', y: '75%', size: 8 },
  ]

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-br from-navy-950 via-navy to-navy-800">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      {/* Gradient orbs */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />

      {/* Floating particles */}
      {!shouldReduceMotion &&
        particles.map((p, i) => <FloatingParticle key={i} {...p} />)}

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Title with staggered word reveal */}
          <motion.h1
            className="mb-4 font-display text-display-xl md:text-display-2xl text-white"
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : 'visible'}
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-gold-300 via-gold to-gold-500 bg-clip-text text-transparent">
              TPC Ministries
            </span>
          </motion.h1>

          {/* Subtitle with staggered words */}
          <motion.p
            className="mb-8 font-display text-display-sm md:text-display-md text-gold-300"
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : 'visible'}
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                className="mr-2 inline-block"
                variants={shouldReduceMotion ? undefined : wordVariant}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            variants={shouldReduceMotion ? undefined : fadeInUp}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : 'visible'}
          >
            <Link href="/giving">
              <Button
                variant="glow"
                size="xl"
                className="w-full animate-glow-pulse sm:w-auto"
              >
                Give Now
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                variant="outline"
                size="xl"
                className="w-full border-2 border-gold/50 bg-transparent text-white hover:bg-gold/10 sm:w-auto"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
