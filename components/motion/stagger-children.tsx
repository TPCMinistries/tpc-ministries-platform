"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import { fadeInUp } from "./variants"

interface StaggerChildrenProps {
  children: React.ReactNode
  className?: string
  containerVariants?: Variants
  staggerDelay?: number
  once?: boolean
  amount?: number
  as?: "div" | "ul" | "ol" | "section"
}

export function StaggerChildren({
  children,
  className,
  containerVariants,
  staggerDelay = 0.06,
  once = true,
  amount = 0.15,
  as = "div",
}: StaggerChildrenProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    const Comp = as
    return <Comp className={className}>{children}</Comp>
  }

  const container: Variants = containerVariants ?? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  const MotionComp = motion[as]

  return (
    <MotionComp
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={container}
      className={className}
    >
      {children}
    </MotionComp>
  )
}

export function StaggerItem({
  children,
  className,
  variants = fadeInUp,
  as = "div",
}: {
  children: React.ReactNode
  className?: string
  variants?: Variants
  as?: "div" | "li" | "article" | "span"
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    const Comp = as
    return <Comp className={className}>{children}</Comp>
  }

  const MotionComp = motion[as]

  return (
    <MotionComp variants={variants} className={className}>
      {children}
    </MotionComp>
  )
}
