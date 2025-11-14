'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Sparkles, Crown, Heart, ChevronRight } from 'lucide-react'

export default function PartnerPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const tiers = [
    {
      id: 'free',
      name: 'Free Member',
      price: { monthly: 0, annual: 0 },
      description: 'Start Your Journey',
      icon: Heart,
      iconColor: 'text-navy',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
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
      iconColor: 'text-gold',
      bgColor: 'bg-gold/5',
      borderColor: 'border-gold',
      buttonText: 'Become a Partner',
      buttonVariant: 'default' as const,
      buttonClass: 'bg-gold hover:bg-gold-dark',
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
      iconColor: 'text-navy',
      bgColor: 'bg-navy/5',
      borderColor: 'border-navy',
      buttonText: 'Join Covenant',
      buttonVariant: 'default' as const,
      buttonClass: 'bg-navy hover:bg-navy/90',
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
      image: '/testimonial-1.jpg',
    },
    {
      name: 'Michael Chen',
      tier: 'Covenant Partner',
      text: 'The quarterly check-ins and personal prophetic word have been life-changing. This partnership is an investment in my destiny.',
      image: '/testimonial-2.jpg',
    },
    {
      name: 'David Williams',
      tier: 'Partner',
      text: "Being part of the partner community has connected me with like-minded believers who are serious about kingdom impact.",
      image: '/testimonial-3.jpg',
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-4 font-serif text-5xl font-bold text-white md:text-6xl">
            Partner With TPC Ministries
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join us in transforming lives across the globe through ministry, missions, and kingdom innovation
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-navy text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full font-medium transition-colors relative ${
                billingCycle === 'annual'
                  ? 'bg-navy text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-gold text-white text-xs px-2 py-0.5 rounded-full">
                Save 2 months
              </span>
            </button>
          </div>

          {/* Tier Cards */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative overflow-hidden ${tier.bgColor} border-2 ${tier.borderColor} ${
                  tier.badge ? 'scale-105 shadow-2xl' : ''
                }`}
              >
                {tier.badge && (
                  <div className="absolute top-0 right-0 bg-gold text-white px-4 py-1 text-sm font-medium">
                    {tier.badge}
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-12">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${tier.bgColor}`}>
                    <tier.icon className={`h-8 w-8 ${tier.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl text-navy mb-2">{tier.name}</CardTitle>
                  <CardDescription className="text-gray-600">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-navy">
                      ${tier.price[billingCycle]}
                      {tier.id !== 'free' && (
                        <span className="text-lg font-normal text-gray-600">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {tier.id !== 'free' && billingCycle === 'annual' && (
                      <p className="text-sm text-gray-600 mt-1">
                        ${(tier.price.annual / 12).toFixed(0)}/month
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={tier.id === 'free' ? '/auth/signup' : `/partner/upgrade?tier=${tier.id}`}>
                    <Button
                      variant={tier.buttonVariant}
                      className={`w-full ${tier.buttonClass || ''}`}
                      size="lg"
                    >
                      {tier.buttonText}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">
            What Our Partners Say
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="h-16 w-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-navy">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-gray-700 italic mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-navy">{testimonial.name}</p>
                    <p className="text-sm text-gold">{testimonial.tier}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg text-navy">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Partner With Us?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join a community of believers committed to kingdom impact and global transformation
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/partner/upgrade?tier=partner">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-white">
                Become a Partner
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="bg-white text-navy hover:bg-gray-100">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
