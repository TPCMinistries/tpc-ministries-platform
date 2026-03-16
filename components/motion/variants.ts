import type { Variants, Transition } from "framer-motion"

// === Spring Configs ===
export const springBounce: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
}

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
}

// === Easing ===
export const revealEase = [0.25, 0.46, 0.45, 0.94] as const

// === Fade Variants ===
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: revealEase as unknown as number[] },
  },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: revealEase as unknown as number[] },
  },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: revealEase as unknown as number[] },
  },
}

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: revealEase as unknown as number[] },
  },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: revealEase as unknown as number[] },
  },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: revealEase as unknown as number[] },
  },
}

// === Stagger Container ===
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

// === Interaction Variants ===
export const tapScale = { scale: 0.97 }

export const hoverLift = {
  y: -4,
  shadow: "0 8px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.05)",
  transition: { duration: 0.2 },
}

export const shakeError: Variants = {
  shake: {
    x: [0, -8, 8, -4, 4, 0],
    transition: { duration: 0.4 },
  },
}

export const checkmarkSpring: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: springBounce,
  },
}

// === Page Transition ===
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: revealEase as unknown as number[] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25 },
  },
}

// === Slide Indicator (for layoutId nav) ===
export const slideIndicator = {
  layoutId: "activeIndicator",
  transition: springSmooth,
}
