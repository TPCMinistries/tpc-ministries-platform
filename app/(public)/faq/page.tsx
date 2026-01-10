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
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about our ministry, beliefs, and how to get involved.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="px-4 py-8 bg-gray-50 border-b">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                className={selectedCategory === 'all' ? 'bg-navy' : ''}
              >
                All Topics
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'bg-navy' : ''}
                >
                  {categoryIcons[cat]} {categoryLabels[cat] || cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-4xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Questions Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Check back soon for more FAQs'}
                </p>
                <Link href="/contact">
                  <Button className="bg-navy hover:bg-navy/90">
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
                    <h2 className="text-2xl font-bold text-navy mb-4 flex items-center gap-2">
                      <span>{categoryIcons[category]}</span>
                      {categoryLabels[category] || category}
                    </h2>
                  )}

                  <div className="space-y-3">
                    {categoryFaqs.map((faq: FAQ) => (
                      <Card
                        key={faq.id}
                        className={`cursor-pointer transition-all ${
                          expandedFaq === faq.id ? 'shadow-md ring-2 ring-gold/20' : 'hover:shadow-md'
                        }`}
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <HelpCircle className={`h-5 w-5 ${expandedFaq === faq.id ? 'text-gold' : 'text-navy/50'}`} />
                              </div>
                              <h3 className="font-semibold text-navy">{faq.question}</h3>
                            </div>
                            {expandedFaq === faq.id ? (
                              <ChevronUp className="h-5 w-5 text-gold flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          {expandedFaq === faq.id && (
                            <div className="mt-4 pl-8 text-gray-600 leading-relaxed">
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
      <section className="px-4 py-16 bg-gradient-to-br from-gold/10 to-amber-50">
        <div className="container mx-auto max-w-4xl text-center">
          <MessageSquare className="h-12 w-12 text-gold mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-navy mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We'd love to hear from you. Reach out and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-navy hover:bg-navy/90">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/visit">
              <Button size="lg" variant="outline">
                Plan Your Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
