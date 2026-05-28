'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown, BookOpen, Sparkles, ClipboardList, FileText, Heart, ScrollText } from 'lucide-react'
import { StaggerChildren, StaggerItem } from '@/components/motion/stagger-children'
import InstallButton from '@/components/pwa/install-button'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/kenya-2026', label: 'Kenya 2026' },
  { href: '/partners', label: 'Partners' },
  { href: '/giving', label: 'Give' },
  { href: '/blog', label: 'Blog' },
  { href: '/connect', label: 'Connect' },
]

const contentResources = [
  { href: 'https://www.streamsofgrace.app', label: 'Daily Devotional', external: true, icon: BookOpen, description: 'Fresh biblical insights each morning' },
  { href: '/ebooks', label: 'Written Works', external: false, icon: FileText, description: 'Ebooks for spiritual growth' },
  { href: '/beliefs', label: 'Statement of Faith', external: false, icon: ScrollText, description: 'What we believe' },
]

const assessmentResources = [
  { href: '/assessments', label: 'All Assessments', icon: ClipboardList, description: 'Browse all 6 assessments' },
  { href: '/assessments/spiritual-gifts', label: 'Spiritual Gifts', icon: Sparkles, description: 'Discover your unique gifts' },
  { href: '/assessments/prophetic-expression', label: 'Prophetic Expression', icon: Heart, description: 'Understand your prophetic voice' },
  { href: '/assessments/ministry-calling', label: 'Ministry Calling', icon: Heart, description: 'Find your specific calling' },
  { href: '/assessments/redemptive-gifts', label: 'Redemptive Gifts', icon: Sparkles, description: 'Uncover your redemptive purpose' },
  { href: '/assessments/seasonal', label: 'Seasonal Assessment', icon: ClipboardList, description: 'Know your current season' },
]

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  // Scroll listener: transparent -> frosted glass, hide on down / show on up
  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY

      // Frosted glass threshold
      setIsScrolled(currentY > 20)

      // Hide/show on scroll direction (only after 100px)
      if (currentY > 100) {
        if (currentY > lastScrollY.current + 5) {
          setIsVisible(false)
        } else if (currentY < lastScrollY.current - 5) {
          setIsVisible(true)
        }
      } else {
        setIsVisible(true)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close all dropdowns on Escape key
  const closeAllDropdowns = useCallback(() => {
    setIsResourcesOpen(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllDropdowns()
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeAllDropdowns])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Handle keyboard navigation for dropdown buttons
  const handleDropdownKeyDown = (
    e: React.KeyboardEvent,
    isOpen: boolean,
    setOpen: (open: boolean) => void
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(!isOpen)
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault()
      setOpen(true)
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault()
      setOpen(false)
    }
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleResources = () => setIsResourcesOpen(!isResourcesOpen)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Public pages have dark hero sections — nav text should be white when not scrolled
  const isPublicPage = !pathname.startsWith('/dashboard') && !pathname.startsWith('/admin') && !pathname.startsWith('/account') && !pathname.startsWith('/auth')
  const isOverDarkBg = isPublicPage && !isScrolled

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled
            ? 'border-b border-gold/20 bg-white/80 shadow-sm backdrop-blur-md dark:bg-navy-950/80'
            : 'bg-transparent'
        }`}
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center space-x-3">
              <Image
                src="/images/logos/tpc-logo.png"
                alt="TPC Ministries"
                width={160}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-body-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 ${
                    isOverDarkBg
                      ? 'text-white/90 hover:text-white'
                      : 'text-navy hover:text-navy/70 dark:text-navy-200 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                  {/* Gold underline indicator with layoutId */}
                  {isActive(link.href) && (
                    <motion.div
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gold"
                      layoutId={shouldReduceMotion ? undefined : 'nav-indicator'}
                      transition={shouldReduceMotion ? undefined : { type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}

              {/* Resources Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setIsResourcesOpen(true)}
                onMouseLeave={() => setIsResourcesOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-body-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 ${
                    isOverDarkBg
                      ? 'text-white/90 hover:text-white'
                      : 'text-navy hover:text-navy/70 dark:text-navy-200 dark:hover:text-white'
                  }`}
                  aria-expanded={isResourcesOpen}
                  aria-haspopup="true"
                  onKeyDown={(e) =>
                    handleDropdownKeyDown(e, isResourcesOpen, setIsResourcesOpen)
                  }
                >
                  Tools &amp; Resources
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isResourcesOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {isResourcesOpen && (
                    <motion.div
                      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-1 w-[560px] overflow-hidden rounded-xl border border-border bg-card/95 shadow-xl backdrop-blur-md"
                      role="menu"
                      aria-label="Tools and Resources submenu"
                    >
                      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                        {/* Left column: Content Resources */}
                        <div className="p-4">
                          <p className="mb-3 text-body-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Content
                          </p>
                          {contentResources.map((link) => {
                            const Icon = link.icon
                            return link.external ? (
                              <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-gold/10"
                                role="menuitem"
                              >
                                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-navy/10">
                                  <Icon className="h-4 w-4 text-navy" />
                                </div>
                                <div>
                                  <span className="text-body-sm font-medium text-navy dark:text-navy-100">
                                    {link.label} ↗
                                  </span>
                                  <p className="text-body-xs text-muted-foreground">
                                    {link.description}
                                  </p>
                                </div>
                              </a>
                            ) : (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-gold/10"
                                role="menuitem"
                              >
                                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-navy/10">
                                  <Icon className="h-4 w-4 text-navy" />
                                </div>
                                <div>
                                  <span className="text-body-sm font-medium text-navy dark:text-navy-100">
                                    {link.label}
                                  </span>
                                  <p className="text-body-xs text-muted-foreground">
                                    {link.description}
                                  </p>
                                </div>
                              </Link>
                            )
                          })}
                        </div>

                        {/* Right column: Assessments */}
                        <div className="p-4">
                          <p className="mb-3 text-body-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Assessments
                          </p>
                          {assessmentResources.map((link) => {
                            const Icon = link.icon
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-gold/10"
                                role="menuitem"
                              >
                                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                                  <Icon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                                </div>
                                <div>
                                  <span className="text-body-sm font-medium text-navy dark:text-navy-100">
                                    {link.label}
                                  </span>
                                  <p className="text-body-xs text-muted-foreground">
                                    {link.description}
                                  </p>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden items-center space-x-3 md:flex">
              <InstallButton variant="compact" />
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className={isOverDarkBg
                    ? 'text-white/90 hover:bg-white/10 hover:text-white'
                    : 'text-navy hover:bg-navy/10 dark:text-navy-200'
                  }
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="gold">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="relative z-10 md:hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu
                  className={`h-6 w-6 ${
                    isOverDarkBg ? 'text-white' : 'text-navy dark:text-white'
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col bg-navy dark:bg-navy-950 md:hidden"
            role="menu"
          >
            {/* Spacer for nav bar */}
            <div className="h-20" />

            <div className="flex-1 overflow-y-auto px-6 py-8">
              <StaggerChildren className="flex flex-col space-y-2" staggerDelay={0.06}>
                {navLinks.map((link) => (
                  <StaggerItem key={link.href}>
                    <Link
                      href={link.href}
                      className={`block font-display text-display-sm text-white/90 transition-colors hover:text-gold ${
                        isActive(link.href) ? 'text-gold' : ''
                      }`}
                      onClick={toggleMenu}
                    >
                      {link.label}
                    </Link>
                  </StaggerItem>
                ))}

                {/* Mobile Resources Dropdown */}
                <StaggerItem>
                  <button
                    onClick={toggleResources}
                    className="flex w-full items-center justify-between font-display text-display-sm text-white/90"
                    aria-expanded={isResourcesOpen}
                    aria-haspopup="true"
                  >
                    Tools &amp; Resources
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        isResourcesOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence>
                    {isResourcesOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                        animate={shouldReduceMotion ? undefined : { height: 'auto', opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 ml-4 space-y-3 overflow-hidden border-l-2 border-gold/30 pl-4"
                      >
                        <p className="text-body-xs font-semibold uppercase tracking-wider text-gold/60">
                          Content
                        </p>
                        {contentResources.map((link) =>
                          link.external ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-body-lg text-white/70 hover:text-gold"
                              onClick={toggleMenu}
                            >
                              {link.label} ↗
                            </a>
                          ) : (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="block text-body-lg text-white/70 hover:text-gold"
                              onClick={toggleMenu}
                            >
                              {link.label}
                            </Link>
                          )
                        )}

                        <p className="mt-4 text-body-xs font-semibold uppercase tracking-wider text-gold/60">
                          Assessments
                        </p>
                        {assessmentResources.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block text-body-lg text-white/70 hover:text-gold"
                            onClick={toggleMenu}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StaggerItem>
              </StaggerChildren>

              {/* Mobile auth buttons */}
              <div className="mt-10 flex flex-col space-y-3">
                <InstallButton variant="default" className="w-full" />
                <Link href="/auth/login" onClick={toggleMenu}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={toggleMenu}>
                  <Button variant="gold" size="lg" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
