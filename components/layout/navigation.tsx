'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown } from 'lucide-react'
import InstallButton from '@/components/pwa/install-button'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMissionsOpen, setIsMissionsOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleMissions = () => setIsMissionsOpen(!isMissionsOpen)
  const toggleResources = () => setIsResourcesOpen(!isResourcesOpen)

  // Close all dropdowns on Escape key
  const closeAllDropdowns = useCallback(() => {
    setIsMissionsOpen(false)
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

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    // { href: '/teachings', label: 'Teachings' }, // Hidden until content is ready
    { href: '/blog', label: 'Blog' },
    { href: '/giving', label: 'Give' },
    { href: '/connect', label: 'Connect' },
  ]

  const missionsLinks = [
    { href: '/missions', label: 'Missions Hub' },
    { href: '/missions/kenya', label: 'Kenya' },
    { href: '/missions/south-africa', label: 'South Africa' },
    { href: '/missions/grenada', label: 'Grenada' },
    { href: '/missions/support', label: 'Support' },
  ]

  const resourcesLinks = [
    { href: '/devotional', label: 'Daily Devotional' },
    { href: '/beliefs', label: 'Statement of Faith' },
    { href: '/assessments/seasonal', label: 'Seasonal Assessment', divider: true },
    { href: '/assessments', label: 'All Assessments' },
    { href: '/assessments/spiritual-gifts', label: 'Spiritual Gifts' },
    { href: '/assessments/prophetic-expression', label: 'Prophetic Expression' },
    { href: '/assessments/ministry-calling', label: 'Ministry Calling' },
    { href: '/assessments/redemptive-gifts', label: 'Redemptive Gifts' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-tpc-gold/30 bg-tpc-gold backdrop-blur" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tpc-navy">
              <span className="text-2xl font-bold text-tpc-gold">✝</span>
            </div>
            <span className="font-serif text-2xl font-bold text-tpc-navy">TPC Ministries</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-tpc-navy transition-colors hover:text-tpc-navy/70"
              >
                {link.label}
              </Link>
            ))}

            {/* Missions Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsMissionsOpen(true)}
              onMouseLeave={() => setIsMissionsOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-tpc-navy transition-colors hover:text-tpc-navy/70"
                aria-expanded={isMissionsOpen}
                aria-haspopup="true"
                onKeyDown={(e) => handleDropdownKeyDown(e, isMissionsOpen, setIsMissionsOpen)}
              >
                Missions
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>

              {isMissionsOpen && (
                <div
                  className="absolute top-full left-0 mt-0 w-48 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200"
                  role="menu"
                  aria-label="Missions submenu"
                >
                  {missionsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-navy hover:bg-gold/10 transition-colors"
                      role="menuitem"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-tpc-navy transition-colors hover:text-tpc-navy/70"
                aria-expanded={isResourcesOpen}
                aria-haspopup="true"
                onKeyDown={(e) => handleDropdownKeyDown(e, isResourcesOpen, setIsResourcesOpen)}
              >
                Tools & Resources
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>

              {isResourcesOpen && (
                <div
                  className="absolute top-full left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200"
                  role="menu"
                  aria-label="Tools and Resources submenu"
                >
                  {resourcesLinks.map((link) => (
                    <div key={link.href}>
                      {link.divider && <div className="my-1 border-t border-gray-200" role="separator" />}
                      <Link
                        href={link.href}
                        className="block px-4 py-2 text-sm text-navy hover:bg-gold/10 transition-colors"
                        role="menuitem"
                      >
                        {link.label}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden items-center space-x-4 md:flex">
            <InstallButton variant="compact" />
            <Link href="/auth/login">
              <Button variant="ghost" className="text-tpc-navy hover:bg-tpc-navy/10">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-tpc-gold-accent text-white hover:bg-tpc-gold-accent/90">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-tpc-navy" />
            ) : (
              <Menu className="h-6 w-6 text-tpc-navy" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="border-t border-tpc-navy/20 py-4 md:hidden" role="menu">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-tpc-navy transition-colors hover:text-tpc-navy/70"
                  onClick={toggleMenu}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Missions Dropdown */}
              <div>
                <button
                  onClick={toggleMissions}
                  className="flex w-full items-center justify-between text-sm font-medium text-tpc-navy"
                  aria-expanded={isMissionsOpen}
                  aria-haspopup="true"
                >
                  Missions
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMissionsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {isMissionsOpen && (
                  <div className="mt-2 ml-4 flex flex-col space-y-2">
                    {missionsLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm text-tpc-navy/80 hover:text-tpc-navy"
                        onClick={toggleMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Resources Dropdown */}
              <div>
                <button
                  onClick={toggleResources}
                  className="flex w-full items-center justify-between text-sm font-medium text-tpc-navy"
                  aria-expanded={isResourcesOpen}
                  aria-haspopup="true"
                >
                  Tools & Resources
                  <ChevronDown className={`h-4 w-4 transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {isResourcesOpen && (
                  <div className="mt-2 ml-4 flex flex-col space-y-2">
                    {resourcesLinks.map((link) => (
                      <div key={link.href}>
                        {link.divider && <div className="my-2 border-t border-tpc-navy/20" />}
                        <Link
                          href={link.href}
                          className="text-sm text-tpc-navy/80 hover:text-tpc-navy block"
                          onClick={toggleMenu}
                        >
                          {link.label}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 pt-4">
                <InstallButton variant="default" className="w-full" />
                <Link href="/auth/login" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full text-tpc-navy">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={toggleMenu}>
                  <Button className="w-full bg-tpc-gold-accent text-white hover:bg-tpc-gold-accent/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
