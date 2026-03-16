'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Crown, Heart, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react'

export default function PartnerPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const tiers = [
    {
      id: 'free',
      name: 'Free Member',
      price: { monthly: 0, annual: 0 },
      description: 'Start Your Journey',
      icon: Heart,
      buttonText: 'Get Started Free',
      buttonVariant: 'outline' as const,
      benefits: [
        'Access all teachings & content library',
        'Submit prayer requests',
        'Public prophetic word library',
        'Join 8am daily prayer call',
        'Community participation',
        'Season journey system',
      ],
    },
    {
      id: 'partner',
      name: 'Partner',
      price: { monthly: 50, annual: 500 },
      description: 'Support the Mission',
      badge: 'Most Popular',
      icon: Sparkles,
      buttonText: 'Become a Partner',
      buttonVariant: 'glow' as const,
      benefits: [
        'All Free Member benefits',
        'Monthly partner-only teaching/Q&A',
        'Partner-exclusive prophetic words',
        'Priority prayer requests',
        'Monthly personal email update',
        'Early access to new content',
        'Partner community network',
      ],
    },
    {
      id: 'covenant',
      name: 'Covenant Partner',
      price: { monthly: 150, annual: 1500 },
      description: 'Deep Partnership',
      badge: 'Premium',
      icon: Crown,
      buttonText: 'Join Covenant',
      buttonVariant: 'default' as const,
      benefits: [
        'All Partner benefits',
        'Quarterly 1-on-1 check-in (30 min)',
        'Personal prophetic word annually',
        'Direct message access',
        'Exclusive event invitations',
        'Input on ministry direction',
        'Priority coaching booking',
      ],
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      tier: 'Partner',
      text: "Partnering with TPC has transformed my spiritual journey. The monthly teachings have given me clarity and direction I've never had before.",
    },
    {
      name: 'Michael Chen',
      tier: 'Covenant Partner',
      text: 'The quarterly check-ins and personal prophetic word have been life-changing. This partnership is an investment in my destiny.',
    },
    {
      name: 'David Williams',
      tier: 'Partner',
      text: "Being part of the partner community has connected me with like-minded believers who are serious about kingdom impact.",
    },
  ]

  const faqs = [
    {
      question: 'What does my partnership support?',
      answer: 'Your partnership directly supports our global missions work, ministry initiatives, technological innovation for kingdom impact, and the creation of transformative content that reaches thousands.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your partnership at any time through your account settings. There are no long-term commitments, though we believe the greatest impact comes through sustained partnership.',
    },
    {
      question: 'What is the difference between Partner and Covenant Partner?',
      answer: 'Covenant Partners receive deeper one-on-one engagement including quarterly check-ins, an annual personal prophetic word, and direct access for questions and guidance. It\'s designed for those seeking a more personal ministry relationship.',
    },
    {
      question: 'How does annual billing work?',
      answer: 'Annual billing saves you the equivalent of 2 months. For Partner tier, you pay $500/year instead of $600. For Covenant Partner, you pay $1,500/year instead of $1,800.',
    },
    {
      question: 'Is my contribution tax-deductible?',
      answer: 'Yes, TPC Ministries is a registered 501(c)(3) organization. You will receive tax receipts for all contributions, which you can access in your account dashboard.',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[50vh] md:min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,184,131,0.06),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-32 text-center">
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Join Us
          </p>
          <h1 className="mb-6 font-display text-display-md sm:text-display-lg md:text-display-xl lg:text-display-2xl text-white">
            Partner With TPC Ministries
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Join us in transforming lives across the globe through ministry, missions, and kingdom innovation
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Billing Toggle + Tiers */}
      <section className="px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 md:mb-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-6 py-2 font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-navy text-white dark:bg-gold dark:text-navy-950'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`relative rounded-full px-6 py-2 font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-navy text-white dark:bg-gold dark:text-navy-950'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              Annual
              <span className="absolute -right-2 -top-2 rounded-full bg-gold px-2 py-0.5 text-xs text-navy-950">
                Save 2 months
              </span>
            </button>
          </div>

          {/* Tier Cards */}
          <div className="mb-10 md:mb-16 grid gap-6 md:gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 ${
                  tier.badge === 'Most Popular'
                    ? 'border-gold/50 bg-card shadow-2xl md:scale-105'
                    : 'border-border bg-card hover:border-gold/30 hover:shadow-xl'
                }`}
              >
                {tier.badge && (
                  <div className="absolute right-0 top-0 rounded-bl-2xl bg-gold px-4 py-1 text-body-sm font-medium text-navy-950">
                    {tier.badge}
                  </div>
                )}

                <div className="pb-8 pt-4 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/10 dark:bg-white/5">
                    <tier.icon className="h-8 w-8 text-navy dark:text-gold" />
                  </div>
                  <h3 className="mb-2 font-display text-display-xs text-navy dark:text-white">{tier.name}</h3>
                  <p className="text-body-md text-muted-foreground">{tier.description}</p>
                  <div className="mt-4">
                    <div className="font-display text-display-md text-navy dark:text-white">
                      ${tier.price[billingCycle]}
                      {tier.id !== 'free' && (
                        <span className="text-body-lg font-normal text-muted-foreground">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {tier.id !== 'free' && billingCycle === 'annual' && (
                      <p className="mt-1 text-body-sm text-muted-foreground">
                        ${(tier.price.annual / 12).toFixed(0)}/month
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span className="text-body-md text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={tier.id === 'free' ? '/auth/signup' : `/partner/upgrade?tier=${tier.id}`}>
                    <Button
                      variant={tier.buttonVariant}
                      className="w-full"
                      size="lg"
                    >
                      {tier.buttonText}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-navy dark:bg-navy-950 px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 md:mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Testimonials
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-white">
              What Our Partners Say
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-gold/30 hover:bg-white/10"
              >
                <div className="mb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <span className="font-display text-display-xs text-gold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <p className="mb-4 text-body-md italic text-white/70">&ldquo;{testimonial.text}&rdquo;</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-body-lg font-semibold text-white">{testimonial.name}</p>
                  <p className="text-body-sm text-gold">{testimonial.tier}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-10 md:mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Common Questions
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-navy dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`cursor-pointer rounded-3xl border bg-card p-6 transition-all duration-300 ${
                  expandedFaq === index ? 'border-gold/30 shadow-lg' : 'border-border hover:border-gold/20'
                }`}
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-body-lg font-semibold text-navy dark:text-white">{faq.question}</h3>
                  <ChevronDown className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${
                    expandedFaq === index ? 'rotate-180 text-gold' : ''
                  }`} />
                </div>
                {expandedFaq === index && (
                  <p className="mt-4 border-t border-border pt-4 text-body-md text-muted-foreground">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-16 md:py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Ready?
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Ready to Partner With Us?
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            Join a community of believers committed to kingdom impact and global transformation
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/partner/upgrade?tier=partner">
              <Button variant="glow" size="xl">
                Become a Partner
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-gold/30 text-white hover:bg-gold/10"
              >
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
