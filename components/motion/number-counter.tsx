"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useReducedMotion, useSpring, useTransform } from "framer-motion"

interface NumberCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  decimals?: number
}

export function NumberCounter({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className,
  decimals = 0,
}: NumberCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const shouldReduceMotion = useReducedMotion()

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: shouldReduceMotion ? 0 : duration,
  })

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${suffix}`
  })

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, value, spring])

  if (shouldReduceMotion) {
    return (
      <span ref={ref} className={className}>
        {prefix}{value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}
      </span>
    )
  }

  return <motion.span ref={ref} className={className}>{display}</motion.span>
}
