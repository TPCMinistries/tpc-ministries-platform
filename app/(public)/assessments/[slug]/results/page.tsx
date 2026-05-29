'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Share2,
  Lock,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Users,
  Crown,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AssessmentResult {
  id: string
  assessment_type: string
  primary_result: string
  secondary_result: string
  tertiary_result: string
  scores: { [key: string]: number }
  title: string
  description: string
  strengths: string[]
  growth_areas: string[]
  ministry_recommendations: string[]
  scripture_references: string[]
  next_steps: string[]
}

export default function AssessmentResultsPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [memberTier, setMemberTier] = useState<'free' | 'partner' | 'covenant'>('free')
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in and fetch results
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const resultId = searchParams.get('id')

      try {
        // Check auth status
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setIsLoggedIn(true)

          // Get member tier
          const { data: member } = await supabase
            .from('members')
            .select('tier')
            .eq('user_id', user.id)
            .single()

          if (member) {
            setMemberTier(member.tier || 'free')
          }
        }

        // Fetch assessment results
        if (resultId) {
          const { data: resultData, error } = await supabase
            .from('member_assessment_results')
            .select('*')
            .eq('id', resultId)
            .single()

          if (error) throw error
          setResult(resultData)
        } else {
          toast({
            title: 'No results found',
            description: 'Please complete an assessment first.',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load results. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams, toast])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-navy mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-navy">No Results Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We couldn't find your assessment results. Please complete an assessment first.
            </p>
            <Link href="/assessments">
              <Button className="w-full bg-navy hover:bg-navy/90">
                Browse Assessments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-gold mx-auto" />
          </div>
          <h1 className="mb-4 font-serif text-4xl font-bold text-white md:text-5xl">
            {result.title}
          </h1>
          <p className="text-xl text-gray-300">
            {result.description}
          </p>
        </div>
      </section>

      {/* Results Content */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          {/* Top Results */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border-2 border-gold rounded-full mb-4">
              <Crown className="h-5 w-5 text-gold" />
              <span className="font-semibold text-navy">Your Top Results</span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-bold text-navy">1. {result.primary_result}</p>
              <p className="text-xl text-gray-700">2. {result.secondary_result}</p>
              {result.tertiary_result && (
                <p className="text-lg text-gray-600">3. {result.tertiary_result}</p>
              )}
            </div>
          </div>

          {/* Scores */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-navy">Your Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(result.scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-navy capitalize">{key.replace(/[-_]/g, ' ')}</span>
                      <span className="text-gray-600">{value}%</span>
                    </div>
                    <Progress value={value as number} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {isLoggedIn ? (
            <>
              {/* Growth Areas - Members Only */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-navy flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-gold" />
                    Growth Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.growth_areas.map((area, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Ministry Recommendations - Members Only */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-navy flex items-center gap-2">
                    <Users className="h-6 w-6 text-gold" />
                    Ministry Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.ministry_recommendations.map((rec, i) => (
                      <Badge key={i} variant="outline" className="border-navy/20 text-base py-1 px-3">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scripture References - Members Only */}
              <Card className="mb-8 bg-gold/5">
                <CardHeader>
                  <CardTitle className="text-navy flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-gold" />
                    Biblical Foundation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.scripture_references.map((ref, i) => (
                      <li key={i} className="text-gray-700 italic border-l-4 border-gold pl-4 py-2">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Next Steps - Members Only */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-navy flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-gold" />
                    Your Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.next_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-sm font-semibold flex-shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Locked Content for Non-Members */
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-navy mb-2 text-xl">Unlock Your Complete Results</h4>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Create a free account to access growth areas, ministry recommendations, biblical foundations, and personalized next steps.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gold hover:bg-gold-dark">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">Sign In</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={async () => {
                const url = typeof window !== 'undefined' ? window.location.href : ''
                const title = result?.title ? `${result.title} — TPC Assessment` : 'My TPC Assessment Results'
                const text = result?.description || 'I just took the TPC assessment.'
                if (typeof navigator !== 'undefined' && (navigator as any).share) {
                  try {
                    await (navigator as any).share({ title, text, url })
                    return
                  } catch {
                    // user dismissed — fall through to clipboard
                  }
                }
                try {
                  await navigator.clipboard.writeText(url)
                  toast({
                    title: 'Link copied',
                    description: 'Paste it anywhere to share your results.',
                  })
                } catch {
                  toast({
                    title: 'Copy failed',
                    description: 'Manually copy the URL from your browser.',
                    variant: 'destructive',
                  })
                }
              }}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share Results
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="mt-12 border-2 border-gold/20 bg-gold/5">
            <CardHeader>
              <CardTitle className="text-navy">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/assessments" className="block">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-navy/20">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold text-navy mb-2">Take Another Assessment</h4>
                      <p className="text-sm text-gray-600">
                        Continue discovering your design with our other assessments
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/teachings" className="block">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-navy/20">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold text-navy mb-2">Explore Teachings</h4>
                      <p className="text-sm text-gray-600">
                        Find teachings aligned with your gifts and calling
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                {!isLoggedIn && (
                  <Link href="/partners" className="block">
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-gold">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-navy mb-2">Become a Partner</h4>
                        <p className="text-sm text-gray-600">
                          Help sustain teachings, discipleship, and practical equipping
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
