'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  MessageSquare
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FAQPageSchema } from '@/components/seo/json-ld'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const categoryLabels: Record<string, string> = {
  general: 'General',
  visiting: 'Visiting',
  giving: 'Giving',
  membership: 'Membership',
  beliefs: 'Beliefs & Doctrine'
}

const categoryIcons: Record<string, string> = {
  general: '💡',
  visiting: '🏠',
  giving: '💝',
  membership: '👥',
  beliefs: '📖'
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [grouped, setGrouped] = useState<Record<string, FAQ[]>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/public/faqs')
      const data = await res.json()
      setFaqs(data.faqs || [])
      setGrouped(data.grouped || {})
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const displayGrouped = selectedCategory === 'all' && !searchQuery
    ? grouped
    : { [selectedCategory === 'all' ? 'Results' : selectedCategory]: filteredFaqs }

  return (
    <div className="flex min-h-screen flex-col">
      {/* JSON-LD Schema for FAQ */}
      {faqs.length > 0 && (
        <FAQPageSchema faqs={faqs.map(faq => ({ question: faq.question, answer: faq.answer }))} />
      )}

      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">We&apos;re Here to Help</p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Find answers to common questions about our ministry, beliefs, and how to get involved.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Search and Filter */}
      <section className="border-b border-border bg-secondary px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Topics
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {categoryIcons[cat]} {categoryLabels[cat] || cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-4xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-navy"></div>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <Card className="rounded-2xl py-16 text-center">
              <CardContent>
                <HelpCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 font-display text-display-xs text-foreground">
                  No Questions Found
                </h3>
                <p className="mb-6 text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Check back soon for more FAQs'}
                </p>
                <Link href="/contact">
                  <Button>
                    Ask Us a Question
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(displayGrouped).map(([category, categoryFaqs]) => (
                <div key={category}>
                  {selectedCategory === 'all' && !searchQuery && (
                    <h2 className="mb-4 flex items-center gap-2 font-display text-display-xs text-foreground">
                      <span>{categoryIcons[category]}</span>
                      {categoryLabels[category] || category}
                    </h2>
                  )}

                  <div className="space-y-3">
                    {categoryFaqs.map((faq: FAQ) => (
                      <Card
                        key={faq.id}
                        className={`cursor-pointer rounded-2xl transition-all ${
                          expandedFaq === faq.id ? 'border-gold/30 shadow-md' : 'border-border hover:border-gold/20 hover:shadow-md'
                        }`}
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <HelpCircle className={`h-5 w-5 ${expandedFaq === faq.id ? 'text-gold' : 'text-muted-foreground'}`} />
                              </div>
                              <h3 className="font-semibold text-foreground">{faq.question}</h3>
                            </div>
                            {expandedFaq === faq.id ? (
                              <ChevronUp className="h-5 w-5 flex-shrink-0 text-gold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                            )}
                          </div>
                          {expandedFaq === faq.id && (
                            <div className="mt-4 pl-8 leading-relaxed text-muted-foreground">
                              {faq.answer}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <MessageSquare className="mx-auto mb-6 h-12 w-12 text-gold" />
          <h2 className="mb-4 font-display text-display-md text-white">
            Still Have Questions?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-body-xl text-white/50">
            We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/contact">
              <Button variant="glow" size="lg">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/visit">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Plan Your Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
