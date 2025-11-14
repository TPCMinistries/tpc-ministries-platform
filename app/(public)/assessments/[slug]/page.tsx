'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Check, ChevronLeft, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function AssessmentLandingPage({ params }: { params: { slug: string } }) {
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Mock data - will be replaced with API call
  const assessmentData: Record<string, any> = {
    'spiritual-gifts': {
      title: 'Spiritual Gifts Assessment',
      subtitle: 'Discover the unique abilities God has given you to serve His kingdom',
      benefits: [
        'Identify your top 3 spiritual gifts from 12 biblical categories',
        'Understand how each gift operates in your life',
        'Get personalized ministry recommendations',
        'Discover practical ways to use your gifts today',
      ],
      questionCount: 20,
      estimatedTime: '15 minutes',
      learnings: [
        'Your top spiritual gifts ranked by strength',
        'Biblical foundation for each gift',
        'How your gifts show up in daily life',
        'Ministry opportunities that match your design',
      ],
    },
    'seasonal': {
      title: 'Seasonal Assessment',
      subtitle: 'Discover where you are in your spiritual journey',
      benefits: [
        'Identify your current spiritual season',
        'Get personalized content for where you are',
        'Understand what this season is teaching you',
        'Receive guidance for your next steps',
      ],
      questionCount: 15,
      estimatedTime: '10 minutes',
      learnings: [
        'Your current spiritual season',
        'Focus areas for this season',
        'Curated teachings and resources',
        'Timeline expectations and milestones',
      ],
    },
    'prophetic-expression': {
      title: 'Prophetic Expression Assessment',
      subtitle: 'Understand how the prophetic flows through you',
      benefits: [
        'Discover your primary prophetic expression',
        'Learn how God uniquely speaks through you',
        'Get training for your specific expression',
        'Avoid common pitfalls and mature in the gift',
      ],
      questionCount: 16,
      estimatedTime: '12 minutes',
      learnings: [
        'Your primary prophetic expression type',
        'How God speaks to you personally',
        'Development path and training resources',
        'Community of others with your expression',
      ],
    },
    'ministry-calling': {
      title: 'Ministry Calling Assessment',
      subtitle: 'Identify where you\'re called to serve in God\'s kingdom',
      benefits: [
        'Match your design to ministry opportunities',
        'Discover your top 3 calling areas',
        'Get connected with serving opportunities',
        'Find your fit in the body of Christ',
      ],
      questionCount: 18,
      estimatedTime: '15 minutes',
      learnings: [
        'Your top ministry calling areas',
        'How your gifts align with your calling',
        'Current serving opportunities',
        'Training and equipping resources',
      ],
    },
    'redemptive-gifts': {
      title: 'Redemptive Gifts Assessment',
      subtitle: 'Understand your unique God-given perspective and design',
      benefits: [
        'Discover your primary redemptive gift (Romans 12)',
        'Understand how you see and process the world',
        'Learn your communication and relationship style',
        'Find where you thrive in ministry and life',
      ],
      questionCount: 25,
      estimatedTime: '18 minutes',
      learnings: [
        'Your primary and secondary redemptive gifts',
        'Core motivations and values',
        'Strengths and potential blind spots',
        'How to work with other gift types',
      ],
    },
    'spiritual-maturity': {
      title: 'Spiritual Maturity Assessment',
      subtitle: 'Assess where you are in your spiritual development',
      benefits: [
        'Celebrate areas where you\'re thriving',
        'Identify your next growth steps',
        'Get personalized spiritual development plan',
        'Track your progress over time',
      ],
      questionCount: 15,
      estimatedTime: '12 minutes',
      learnings: [
        'Areas of spiritual strength',
        'Growth opportunities',
        'Personalized development plan',
        'Recommended habits and resources',
      ],
    },
  }

  const assessment = assessmentData[params.slug] || assessmentData['spiritual-gifts']

  const handleStartAssessment = () => {
    setShowEmailCapture(true)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const supabase = createClient()

    try {
      // Save to leads table
      const { error } = await supabase
        .from('leads')
        .insert({
          email: email,
          name: '', // Can add name field later if needed
          source: `assessment: ${params.slug}`,
          status: 'new',
          notes: `Started ${assessment.title}`,
        })

      if (error) {
        // If duplicate email, that's okay - still let them proceed
        if (!error.message?.includes('duplicate')) {
          throw error
        }
      }

      toast({
        title: 'Welcome!',
        description: "Let's discover what God has placed in you!",
      })

      // Redirect to quiz
      window.location.href = `/assessments/${params.slug}/quiz`
    } catch (error: any) {
      console.error('Error saving lead:', error)
      toast({
        title: 'Note',
        description: 'Continuing to assessment...',
      })
      // Still redirect even if save fails
      window.location.href = `/assessments/${params.slug}/quiz`
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/assessments"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to All Assessments
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white md:text-5xl">
            {assessment.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            {assessment.subtitle}
          </p>
          <Button
            size="lg"
            onClick={handleStartAssessment}
            className="bg-gold hover:bg-gold-dark text-white text-lg px-8 py-6"
          >
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">
            What You'll Discover
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {assessment.benefits.map((benefit: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Email Capture Section */}
      {showEmailCapture && (
        <section className="px-4 py-16 bg-gradient-to-br from-gold/10 to-navy/10">
          <div className="container mx-auto max-w-2xl">
            <Card className="border-2 border-gold">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-navy">Get Your Personalized Results</CardTitle>
                <CardDescription className="text-base">
                  Enter your email to receive your complete assessment results and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p>We respect your privacy. Unsubscribe anytime.</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-navy hover:bg-navy/90"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Start Assessment'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => window.location.href = `/assessments/${params.slug}/quiz`}
                    className="text-sm text-gray-600 hover:text-navy underline"
                  >
                    Continue without email (won't save progress)
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* What to Expect */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">
            What to Expect
          </h2>

          <div className="grid gap-8 md:grid-cols-3 mb-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/10">
                <span className="text-2xl font-bold text-navy">{assessment.questionCount}</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Questions</h3>
              <p className="text-sm text-gray-600">Thoughtfully designed to reveal insights</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/10">
                <span className="text-2xl font-bold text-navy">{assessment.estimatedTime}</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Time Required</h3>
              <p className="text-sm text-gray-600">Take your time - no rush</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                <Check className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Personalized Results</h3>
              <p className="text-sm text-gray-600">Tailored to your unique responses</p>
            </div>
          </div>

          <Card className="bg-gold/5 border-gold/20">
            <CardHeader>
              <CardTitle className="text-navy">You'll Learn:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {assessment.learnings.map((learning: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{learning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Discover Your Design?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Take the first step in understanding how God uniquely created you
          </p>
          <Button
            size="lg"
            onClick={handleStartAssessment}
            className="bg-gold hover:bg-gold-dark text-white text-lg px-8 py-6"
          >
            Start Assessment Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}
