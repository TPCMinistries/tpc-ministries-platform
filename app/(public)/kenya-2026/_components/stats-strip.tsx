'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const STATS = [
  { value: '14', label: 'Days on the ground' },
  { value: '2026', label: 'The year God moved' },
  { value: 'Kenya', label: 'The nation' },
]

export function KenyaStatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <section className="relative border-y border-white/10 bg-navy-950 py-12 sm:py-16">
      <div ref={ref} className="mx-auto grid max-w-5xl grid-cols-1 gap-y-10 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="text-center"
          >
            <div className="font-serif text-5xl font-bold text-gold sm:text-6xl">
              {s.value}
            </div>
            <div className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/60 sm:text-sm">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
