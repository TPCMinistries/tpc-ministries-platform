'use client'

import { useReducedMotion, motion, type Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { staggerContainer, fadeInUp } from '@/components/motion/variants'

const headlineWords = ['Hear', 'from', 'God.']
const subWords = ['Walk', 'in', 'your', 'assignment.']

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function FloatingParticle({
  delay,
  x,
  y,
  size,
}: {
  delay: number
  x: string
  y: string
  size: number
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-gold/30"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.15, 0.6, 0.15] }}
      transition={{
        duration: 5 + Math.random() * 3,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

export function ProphetHeroSection() {
  const shouldReduceMotion = useReducedMotion()

  const particles = [
    { delay: 0, x: '8%', y: '25%', size: 4 },
    { delay: 1.2, x: '82%', y: '18%', size: 6 },
    { delay: 0.6, x: '20%', y: '72%', size: 3 },
    { delay: 1.8, x: '68%', y: '12%', size: 5 },
    { delay: 0.3, x: '92%', y: '55%', size: 3 },
    { delay: 2.1, x: '42%', y: '85%', size: 4 },
  ]

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy-950">
      {/* Background photo */}
      <Image
        src="/images/hero/lorenzo-speaking.png"
        alt="Prophet Lorenzo speaking"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%] opacity-50"
      />

      {/* Gradient washes */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.18),transparent_60%)]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />

      {/* Floating particles */}
      {!shouldReduceMotion &&
        particles.map((p, i) => <FloatingParticle key={i} {...p} />)}

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: headline + ctas */}
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.div
              className="mb-6 flex justify-start"
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-4 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                </span>
                <span className="text-body-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
                  Prophet Lorenzo · TPC Ministries
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="mb-3 font-display text-[2.75rem] leading-[0.95] tracking-tight text-white sm:text-[3.75rem] md:text-[5.25rem] lg:text-[6rem]"
              variants={shouldReduceMotion ? undefined : staggerContainer}
              initial={shouldReduceMotion ? undefined : 'hidden'}
              animate={shouldReduceMotion ? undefined : 'visible'}
            >
              {headlineWords.map((word, i) => (
                <motion.span
                  key={`h-${i}`}
                  className="mr-[0.18em] inline-block"
                  variants={shouldReduceMotion ? undefined : wordVariant}
                >
                  {word}
                </motion.span>
              ))}
              <br />
              {subWords.map((word, i) => (
                <motion.span
                  key={`s-${i}`}
                  className={`mr-[0.18em] inline-block ${
                    word === 'assignment.'
                      ? 'bg-gradient-to-r from-gold-200 via-gold to-gold-500 bg-clip-text text-transparent'
                      : 'text-white/70'
                  }`}
                  variants={shouldReduceMotion ? undefined : wordVariant}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Sub — LCP element; plain <p> so text paints immediately. Prior
                framer-motion fade-in with 1s delay blocked LCP for ~1.6s. */}
            <p className="mb-8 max-w-xl text-body-lg text-white/65 sm:text-body-xl">
              A prophetic ministry for the <strong className="font-semibold text-white/85">digital age</strong> — meeting people where they are, across the US and around the world. Wherever you scroll, the Word can find you.
            </p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              variants={shouldReduceMotion ? undefined : fadeInUp}
              initial={shouldReduceMotion ? undefined : 'hidden'}
              animate={shouldReduceMotion ? undefined : 'visible'}
              transition={{ delay: 1.2 }}
            >
              <a href="#ask-prophet">
                <Button
                  size="xl"
                  className="group h-14 w-full bg-gold px-7 text-body-md font-bold text-navy-950 shadow-lg shadow-gold/20 hover:bg-gold-300 sm:w-auto"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Ask Prophet Lorenzo
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </a>
              <Link href="/kenya-2026">
                <Button
                  size="xl"
                  variant="outline"
                  className="h-14 w-full border-2 border-white/25 bg-white/[0.04] px-7 text-body-md font-semibold text-white backdrop-blur-sm hover:border-gold/60 hover:bg-gold/10 hover:text-white sm:w-auto"
                >
                  Kenya 2026
                </Button>
              </Link>
              <Link
                href="/giving"
                className="group inline-flex items-center gap-2 px-2 text-body-sm font-medium text-white/60 transition-colors hover:text-gold"
              >
                <Heart className="h-4 w-4" />
                <span>Give</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-body-xs text-white/45"
              initial={shouldReduceMotion ? undefined : { opacity: 0 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <span className="flex items-center gap-2">
                <span className="inline-block h-1 w-1 rounded-full bg-gold/60" />
                US + global
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1 w-1 rounded-full bg-gold/60" />
                Streams of Grace devotional
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1 w-1 rounded-full bg-gold/60" />
                4 books published
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1 w-1 rounded-full bg-gold/60" />
                AI-powered prophetic guidance
              </span>
            </motion.div>
          </div>

          {/* Right: AI card teaser (desktop only) */}
          <motion.div
            className="hidden lg:block"
            initial={shouldReduceMotion ? undefined : { opacity: 0, x: 30 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-gold/20 via-gold/5 to-transparent blur-3xl" />
              <div className="relative rounded-2xl border border-gold/25 bg-navy-950/70 p-6 backdrop-blur-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gold/40 bg-gold/10">
                    <Image
                      src="/images/team/lorenzo-about.png"
                      alt="Prophet Lorenzo"
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-body-sm font-bold text-white">Prophet Lorenzo</p>
                      <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                        AI
                      </span>
                    </div>
                    <p className="flex items-center gap-1.5 text-[11px] text-white/55">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Online · trained on his teachings
                    </p>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-body-sm leading-relaxed text-white/85">
                    Beloved, what&apos;s on your heart today? I&apos;m here to encourage you, share a
                    Scripture, or pray with you.
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-gold/90 px-4 py-2 text-body-sm text-navy-950">
                      What is God saying to me in this season?
                    </div>
                  </div>
                </div>

                <a href="#ask-prophet">
                  <Button className="h-11 w-full bg-gold text-navy-950 hover:bg-gold-300">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start the conversation
                  </Button>
                </a>
                <p className="mt-2 text-center text-[10px] text-white/35">
                  Free. No signup required to try.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-6 w-6 text-gold/40" />
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Anchor target for chat trigger */}
      <span id="ask-prophet" className="absolute bottom-0" aria-hidden="true" />
    </section>
  )
}
