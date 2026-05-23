'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface LazyMountProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  minHeight?: string
}

export function LazyMount({
  children,
  fallback = null,
  rootMargin = '300px',
  minHeight = '400px',
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { rootMargin },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : fallback}
    </div>
  )
}
