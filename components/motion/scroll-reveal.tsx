"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import { fadeInUp, fadeInScale, fadeInLeft, fadeInRight, fadeIn } from "./variants"

const presets: Record<string, Variants> = {
  "fade-up": fadeInUp,
  "fade-in": fadeIn,
  "fade-scale": fadeInScale,
  "fade-left": fadeInLeft,
  "fade-right": fadeInRight,
}

interface ScrollRevealProps {
  children: React.ReactNode
  variant?: keyof typeof presets | Variants
  className?: string
  delay?: number
  once?: boolean
  amount?: number
  as?: "div" | "section" | "article" | "li" | "span"
}

export function ScrollReveal({
  children,
  variant = "fade-up",
  className,
  delay = 0,
  once = true,
  amount = 0.2,
  as = "div",
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion()

  const variants = typeof variant === "string" ? presets[variant] : variant

  if (shouldReduceMotion) {
    const Comp = as
    return <Comp className={className}>{children}</Comp>
  }

  const MotionComp = motion[as]

  return (
    <MotionComp
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      className={className}
      transition={{ delay }}
    >
      {children}
    </MotionComp>
  )
}
