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

type Assessment = {
  title: string
  subtitle: string
  benefits: string[]
  questionCount: number
  estimatedTime: string
  learnings: string[]
}

export default function AssessmentLandingPage({ params }: { params: { slug: string } }) {
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Mock data - will be replaced with API call
  const assessmentData: Record<string, Assessment> = {
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
    } catch (error) {
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/assessments"
            className="flex items-center gap-2 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to All Assessments
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-4xl px-4 py-32 text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Discover Your Design</p>
          <h1 className="mb-6 font-display text-display-lg md:text-display-xl text-white">
            {assessment.title}
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-body-xl text-white/50">
            {assessment.subtitle}
          </p>
          <Button
            variant="glow"
            size="xl"
            onClick={handleStartAssessment}
          >
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* What You'll Discover */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Benefits</p>
            <h2 className="font-display text-display-md text-foreground">
              What You&apos;ll Discover
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {assessment.benefits.map((benefit: string, index: number) => (
              <div key={index} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-gold/30 hover:shadow-lg">
                <div className="mt-1 flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Email Capture Section */}
      {showEmailCapture && (
        <section className="bg-navy px-4 py-section-sm dark:bg-navy-950">
          <div className="container mx-auto max-w-2xl">
            <Card className="rounded-3xl border-gold/30 bg-card">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-display-xs text-foreground">Get Your Personalized Results</CardTitle>
                <CardDescription className="text-body-md">
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

                  <div className="flex items-start gap-2 text-body-sm text-muted-foreground">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <p>We respect your privacy. Unsubscribe anytime.</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
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
                    className="text-body-sm text-muted-foreground underline hover:text-foreground"
                  >
                    Continue without email (won&apos;t save progress)
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* What to Expect */}
      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">The Process</p>
            <h2 className="font-display text-display-md text-foreground">
              What to Expect
            </h2>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/10">
                <span className="font-display text-display-xs text-navy">{assessment.questionCount}</span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Questions</h3>
              <p className="text-body-sm text-muted-foreground">Thoughtfully designed to reveal insights</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/10">
                <span className="font-display text-body-lg text-navy">{assessment.estimatedTime}</span>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Time Required</h3>
              <p className="text-body-sm text-muted-foreground">Take your time - no rush</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                <Check className="h-8 w-8 text-gold" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Personalized Results</h3>
              <p className="text-body-sm text-muted-foreground">Tailored to your unique responses</p>
            </div>
          </div>

          <Card className="rounded-2xl border-gold/20 bg-gold/5">
            <CardHeader>
              <CardTitle className="font-display text-display-xs text-foreground">You&apos;ll Learn:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {assessment.learnings.map((learning: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                    <span className="text-muted-foreground">{learning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-display text-display-md text-white">
            Ready to Discover Your Design?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-body-xl text-white/50">
            Take the first step in understanding how God uniquely created you
          </p>
          <Button
            variant="glow"
            size="xl"
            onClick={handleStartAssessment}
          >
            Start Assessment Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}
