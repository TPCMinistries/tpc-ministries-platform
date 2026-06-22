'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/missions', label: 'Our Missions' },
  { href: '/partners', label: 'Covenant Partners' },
  { href: '/teachings', label: 'Teachings' },
  { href: '/giving', label: 'Give' },
  { href: '/assessments', label: 'Assessments' },
  { href: '/blog', label: 'Blog' },
  { href: '/connect', label: 'Connect' },
]

const socialLinks = [
  { href: 'https://facebook.com/tpcmin', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com/tpcmin', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com/tpcmin', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/@tpcmin', icon: Youtube, label: 'YouTube' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterStatus === 'submitting') return
    setNewsletterStatus('submitting')
    try {
      const res = await fetch('/api/public/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })
      if (!res.ok) throw new Error('subscribe failed')
      setNewsletterStatus('success')
      setEmail('')
    } catch {
      setNewsletterStatus('error')
    }
  }

  return (
    <footer className="bg-navy dark:bg-navy-950">
      {/* Newsletter Bar */}
      <div className="border-b border-gold/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <h3 className="font-display text-display-xs text-white">
                Stay in the Loop
              </h3>
              <p className="mt-1 text-body-sm text-navy-200">
                Get weekly devotionals, ministry updates, and event announcements.
              </p>
            </div>
            <div className="w-full max-w-md">
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-3"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address for newsletter"
                  className="border-navy-600 bg-navy-800 text-white placeholder:text-navy-400 focus-visible:border-gold-400"
                />
                <Button type="submit" variant="gold" className="flex-shrink-0" disabled={newsletterStatus === 'submitting'}>
                  {newsletterStatus === 'submitting' ? 'Subscribing…' : 'Subscribe'}
                </Button>
              </form>
              {newsletterStatus === 'success' && (
                <p className="mt-2 text-body-sm text-gold-300" role="status">
                  You&apos;re in! Watch your inbox for the next update.
                </p>
              )}
              {newsletterStatus === 'error' && (
                <p className="mt-2 text-body-sm text-red-300" role="status">
                  Something went wrong — please try again.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <div className="mb-4 flex items-center space-x-3">
              {/* Inline mark — the PNG logo has an opaque white background, so it can't sit on navy */}
              <svg
                viewBox="0 0 100 100"
                aria-hidden="true"
                className="h-10 w-10 flex-shrink-0 text-white"
              >
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="7" />
                <rect x="46" y="14" width="8" height="64" fill="currentColor" />
                <rect x="22" y="32" width="56" height="8" fill="currentColor" />
              </svg>
              <span className="font-display text-body-lg font-semibold tracking-wide text-white">
                TPC Ministries
              </span>
            </div>
            <p className="text-body-sm text-navy-200">
              A prophetic ministry for the digital age — based in the US, with active mission work in Kenya, South Africa, Grenada, and a growing global online community. Awakening purpose. Igniting vision.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-display text-body-sm font-semibold text-gold">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-navy-200 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 font-display text-body-sm font-semibold text-gold">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-body-sm text-navy-200">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold/60" />
                <a
                  href="mailto:info@tpcmin.org"
                  className="transition-colors hover:text-gold"
                >
                  info@tpcmin.org
                </a>
              </li>
              <li className="flex items-start space-x-2 text-body-sm text-navy-200">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold/60" />
                <span>Kenya &bull; South Africa &bull; Grenada</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-4 font-display text-body-sm font-semibold text-gold">
              Follow @tpcmin
            </h3>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-navy-300 transition-all hover:bg-gold/20 hover:text-gold hover:shadow-[0_0_12px_rgba(212,184,131,0.3)]"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Gold separator */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <p className="text-body-sm text-navy-300">
            &copy; {currentYear} TPC Ministries. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link
              href="/privacy"
              className="text-body-sm text-navy-300 transition-colors hover:text-gold"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-body-sm text-navy-300 transition-colors hover:text-gold"
            >
              Terms of Service
            </Link>
            <button
              onClick={handleScrollToTop}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-navy-300 transition-all hover:bg-gold/20 hover:text-gold"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
