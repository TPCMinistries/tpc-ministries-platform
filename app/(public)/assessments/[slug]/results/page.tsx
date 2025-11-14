'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Download,
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

interface GiftResult {
  name: string
  score: number
  percentage: number
  description: string
  biblicalFoundation: string
  practicalApplications: string[]
  ministryOpportunities: string[]
  growthTips: string[]
}

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
            .from('assessment_results')
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

  // Old mock data removed - now using real results from database
  const oldMockData: GiftResult[] = [
    {
      name: 'Teaching',
      score: 24,
      percentage: 96,
      description: 'You have a strong ability to understand and explain Scripture in ways that help others grow spiritually. You love studying God\'s Word and making complex biblical truths accessible.',
      biblicalFoundation: 'Romans 12:7 - "If it is teaching, let him teach." This gift enables you to communicate biblical truth with clarity and authority, helping believers mature in their faith.',
      practicalApplications: [
        'Lead a small group Bible study focused on deeper theological topics',
        'Develop teaching materials or study guides for your church',
        'Mentor newer believers in understanding Scripture',
        'Create content that breaks down biblical concepts for different audiences'
      ],
      ministryOpportunities: [
        'Adult Sunday School teacher',
        'Small group leader or facilitator',
        'Youth ministry Bible teacher',
        'Online content creator (blog, podcast, video teaching)',
        'Discipleship mentor'
      ],
      growthTips: [
        'Continue regular personal Bible study and theological reading',
        'Practice teaching in smaller settings before larger audiences',
        'Learn different teaching methods to reach various learning styles',
        'Stay humble and teachable - the best teachers are always learning',
        'Balance teaching content with practical application'
      ]
    },
    {
      name: 'Exhortation',
      score: 22,
      percentage: 88,
      description: 'You naturally encourage and motivate others toward spiritual growth. You can see potential in people and inspire them to take their next steps of faith.',
      biblicalFoundation: 'Romans 12:8 - "If it is encouraging, let him encourage." Also called the gift of encouragement, this gift strengthens and builds up the body of Christ.',
      practicalApplications: [
        'Come alongside struggling believers with timely encouragement',
        'Challenge others to step into their calling and purpose',
        'Speak life and hope into difficult situations',
        'Help people see God\'s perspective in their circumstances'
      ],
      ministryOpportunities: [
        'Life coach or spiritual mentor',
        'Recovery ministry leader',
        'Pastoral care team member',
        'Prayer ministry',
        'Encouragement ministry coordinator'
      ],
      growthTips: [
        'Develop your listening skills to understand what people truly need',
        'Learn when to encourage vs when to challenge',
        'Study how Jesus encouraged different people in the Gospels',
        'Be sensitive to timing - the right word at the right time is powerful',
        'Balance encouragement with truth-telling'
      ]
    },
    {
      name: 'Discernment',
      score: 19,
      percentage: 76,
      description: 'You have a God-given ability to distinguish between spiritual truth and error. You can sense when something is "off" spiritually and help protect others from deception.',
      biblicalFoundation: '1 Corinthians 12:10 - "Distinguishing between spirits." This gift helps the church stay aligned with God\'s truth and protected from spiritual deception.',
      practicalApplications: [
        'Pray for wisdom in evaluating teachings and spiritual experiences',
        'Speak up (graciously) when you sense spiritual error',
        'Help leaders make decisions by providing spiritual insight',
        'Protect vulnerable believers from false teaching'
      ],
      ministryOpportunities: [
        'Church leadership or elder board',
        'Prayer team leader',
        'Counseling ministry',
        'New member integration team',
        'Teaching team (to ensure doctrinal accuracy)'
      ],
      growthTips: [
        'Study Scripture deeply to develop a biblical filter',
        'Learn to communicate discernment with grace and humility',
        'Test your discernment with trusted spiritual leaders',
        'Don\'t become critical or judgmental - stay humble',
        'Pair discernment with love and restoration, not just correction'
      ]
    }
  ]

  const seasonalResults = {
    primarySeason: 'Growth Season',
    description: 'You are in a season of spiritual expansion and learning. God is actively teaching you new things and stretching your faith.',
    characteristics: [
      'Increased hunger for God\'s Word and deeper understanding',
      'New opportunities and open doors appearing',
      'Feeling stretched beyond your current capacity',
      'Learning through both successes and failures',
      'Sensing God preparing you for something bigger'
    ],
    focusAreas: [
      'Invest heavily in learning and spiritual development',
      'Say yes to new opportunities that align with your calling',
      'Find mentors who have been where you\'re going',
      'Document what you\'re learning for future reference',
      'Build spiritual disciplines that will sustain future fruit'
    ],
    scripture: 'Isaiah 54:2-3 - "Enlarge the place of your tent, stretch your tent curtains wide, do not hold back; lengthen your cords, strengthen your stakes. For you will spread out to the right and to the left."',
    duration: 'Growth seasons typically last 6-18 months. Embrace the stretching - it\'s preparing you for greater fruitfulness.',
    nextSeason: 'After this growth season, you\'ll likely enter a Harvest Season where you\'ll see fruit from what you\'re learning now.'
  }

  const renderSpiritualGiftsResults = () => (
    <div className="space-y-8">
      {/* Top 3 Gifts Overview */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border-2 border-gold rounded-full">
          <Crown className="h-5 w-5 text-gold" />
          <span className="font-semibold text-navy">Your Top 3 Spiritual Gifts</span>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Based on your responses, these are the primary ways God has equipped you to serve His kingdom.
        </p>
      </div>

      {/* Gift Cards */}
      {spiritualGiftsResults.map((gift, index) => (
        <Card key={gift.name} className="border-2 border-navy/20">
          <CardHeader className="bg-gradient-to-r from-navy/5 to-gold/5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-navy text-white">#{index + 1}</Badge>
                  <CardTitle className="text-2xl text-navy">{gift.name}</CardTitle>
                </div>
                <CardDescription className="text-base">{gift.percentage}% match</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-navy">{gift.score}</div>
                <div className="text-sm text-gray-600">out of 25</div>
              </div>
            </div>
            <Progress value={gift.percentage} className="h-3 mt-4" />
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-gold" />
                What This Means
              </h4>
              <p className="text-gray-700">{gift.description}</p>
            </div>

            {isLoggedIn ? (
              <>
                {/* Biblical Foundation - Members Only */}
                <div>
                  <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gold" />
                    Biblical Foundation
                  </h4>
                  <p className="text-gray-700">{gift.biblicalFoundation}</p>
                </div>

                {/* Practical Applications - Members Only */}
                <div>
                  <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-gold" />
                    How to Use This Gift Today
                  </h4>
                  <ul className="space-y-2">
                    {gift.practicalApplications.map((app, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ministry Opportunities - Members Only */}
                <div>
                  <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-gold" />
                    Ministry Opportunities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gift.ministryOpportunities.map((opp, i) => (
                      <Badge key={i} variant="outline" className="border-navy/20">
                        {opp}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Growth Tips - Members Only */}
                <div>
                  <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gold" />
                    How to Develop This Gift
                  </h4>
                  <ul className="space-y-2">
                    {gift.growthTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              /* Locked Content for Non-Members */
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-navy mb-2">Unlock Your Full Results</h4>
                <p className="text-gray-600 mb-4">
                  Create a free account to access biblical foundations, practical applications, ministry opportunities, and personalized growth tips for each gift.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/auth/signup">
                    <Button className="bg-gold hover:bg-gold-dark">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderSeasonalResults = () => (
    <div className="space-y-8">
      {/* Primary Season */}
      <Card className="border-2 border-navy">
        <CardHeader className="bg-gradient-to-r from-navy to-navy-800 text-white">
          <CardTitle className="text-3xl text-center">{seasonalResults.primarySeason}</CardTitle>
          <CardDescription className="text-gray-200 text-center text-lg">
            Your Current Spiritual Season
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <p className="text-lg text-gray-700">{seasonalResults.description}</p>

          {/* Characteristics */}
          <div>
            <h4 className="font-semibold text-navy mb-3">What This Season Looks Like:</h4>
            <ul className="space-y-2">
              {seasonalResults.characteristics.map((char, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{char}</span>
                </li>
              ))}
            </ul>
          </div>

          {isLoggedIn ? (
            <>
              {/* Focus Areas - Members Only */}
              <div>
                <h4 className="font-semibold text-navy mb-3">Your Focus Areas:</h4>
                <ul className="space-y-2">
                  {seasonalResults.focusAreas.map((focus, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scripture - Members Only */}
              <div className="bg-gold/10 border-l-4 border-gold p-4 rounded">
                <h4 className="font-semibold text-navy mb-2">Your Season Scripture:</h4>
                <p className="text-gray-700 italic">{seasonalResults.scripture}</p>
              </div>

              {/* Timeline - Members Only */}
              <div>
                <h4 className="font-semibold text-navy mb-2">Expected Duration:</h4>
                <p className="text-gray-700">{seasonalResults.duration}</p>
              </div>

              {/* Next Season - Members Only */}
              <div className="bg-navy/5 p-4 rounded-lg">
                <h4 className="font-semibold text-navy mb-2">What's Next:</h4>
                <p className="text-gray-700">{seasonalResults.nextSeason}</p>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-navy mb-2">Unlock Your Full Season Guide</h4>
              <p className="text-gray-600 mb-4">
                Create a free account to access your personalized focus areas, scripture, timeline expectations, and curated resources for this season.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/auth/signup">
                  <Button className="bg-gold hover:bg-gold-dark">Create Free Account</Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

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
            {isLoggedIn && (
              <>
                <Button size="lg" className="bg-navy hover:bg-navy/90">
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF Results
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share Results
                </Button>
              </>
            )}
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
                  <Link href="/partner" className="block">
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-gold">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-navy mb-2">Become a Partner</h4>
                        <p className="text-sm text-gray-600">
                          Get exclusive teachings and prophetic words for your gifting
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
