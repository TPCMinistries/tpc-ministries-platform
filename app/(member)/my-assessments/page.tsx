'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Gift,
  Compass,
  Eye,
  Heart,
  Crown,
  TreePine,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCw,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AssessmentHistory {
  id: string
  slug: string
  title: string
  icon: any
  lastTaken: string
  timesCompleted: number
  results: {
    date: string
    topResults: string[]
    changes?: string
  }[]
}

export default function MemberAssessmentsPage() {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ completed: 0, totalTaken: 0 })

  useEffect(() => {
    fetchAssessmentHistory()
  }, [])

  const fetchAssessmentHistory = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      // Fetch all assessment results for this member
      const { data: results, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group results by assessment type
      const groupedResults: { [key: string]: any[] } = {}
      results?.forEach((result) => {
        if (!groupedResults[result.assessment_type]) {
          groupedResults[result.assessment_type] = []
        }
        groupedResults[result.assessment_type].push(result)
      })

      // Convert to AssessmentHistory format
      const history: AssessmentHistory[] = Object.entries(groupedResults).map(([type, typeResults]) => {
        const getIcon = (type: string) => {
          switch (type) {
            case 'spiritual-gifts': return Gift
            case 'seasonal': return Compass
            case 'prophetic-expression': return Eye
            case 'ministry-calling': return Heart
            case 'redemptive-gifts': return Crown
            case 'spiritual-maturity': return TreePine
            default: return Gift
          }
        }

        const getTitle = (type: string) => {
          return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }

        return {
          id: typeResults[0].id,
          slug: type,
          title: getTitle(type),
          icon: getIcon(type),
          lastTaken: new Date(typeResults[0].created_at).toISOString().split('T')[0],
          timesCompleted: typeResults.length,
          results: typeResults.map((r) => ({
            date: new Date(r.created_at).toISOString().split('T')[0],
            topResults: [
              r.primary_result,
              r.secondary_result,
              r.tertiary_result
            ].filter(Boolean),
            resultId: r.id
          }))
        }
      })

      setAssessmentHistory(history)
      setStats({
        completed: history.length,
        totalTaken: results?.length || 0
      })
    } catch (error) {
      console.error('Error fetching assessment history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-navy mx-auto mb-4" />
          <p className="text-gray-600">Loading your assessments...</p>
        </div>
      </div>
    )
  }

  // Mock data for reference (keep commented)
  const oldMockData: AssessmentHistory[] = [
    {
      id: '1',
      slug: 'spiritual-gifts',
      title: 'Spiritual Gifts',
      icon: Gift,
      lastTaken: '2024-01-15',
      timesCompleted: 2,
      results: [
        {
          date: '2024-01-15',
          topResults: ['Teaching (96%)', 'Exhortation (88%)', 'Discernment (76%)'],
        },
        {
          date: '2023-06-20',
          topResults: ['Teaching (92%)', 'Discernment (82%)', 'Exhortation (78%)'],
          changes: 'Exhortation increased 10%, now #2 gift',
        },
      ],
    },
    {
      id: '2',
      slug: 'seasonal',
      title: 'Seasonal',
      icon: Compass,
      lastTaken: '2024-01-10',
      timesCompleted: 3,
      results: [
        {
          date: '2024-01-10',
          topResults: ['Growth Season'],
        },
        {
          date: '2023-09-15',
          topResults: ['Harvest Season'],
          changes: 'Transitioned from Harvest to Growth',
        },
        {
          date: '2023-03-01',
          topResults: ['Planting Season'],
          changes: 'Moved from Planting to Harvest',
        },
      ],
    },
    {
      id: '3',
      slug: 'prophetic-expression',
      title: 'Prophetic Expression',
      icon: Eye,
      lastTaken: '2023-11-05',
      timesCompleted: 1,
      results: [
        {
          date: '2023-11-05',
          topResults: ['Seer (94%)', 'Prophet (76%)', 'Intercessor (68%)'],
        },
      ],
    },
  ]

  const availableAssessments = [
    {
      slug: 'ministry-calling',
      title: 'Ministry Calling',
      icon: Heart,
      description: 'Identify where you\'re called to serve',
      status: 'not-started',
    },
    {
      slug: 'redemptive-gifts',
      title: 'Redemptive Gifts',
      icon: Crown,
      description: 'Understand your unique design',
      status: 'not-started',
    },
    {
      slug: 'spiritual-maturity',
      title: 'Spiritual Maturity',
      icon: TreePine,
      description: 'Assess your spiritual development',
      status: 'not-started',
    },
  ]

  const getChangeIcon = (change: string) => {
    if (change.toLowerCase().includes('increase')) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change.toLowerCase().includes('decrease')) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white md:text-5xl">
            My Assessments
          </h1>
          <p className="text-xl text-gray-300">
            Track your spiritual growth journey over time
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-6xl space-y-12">
          {/* Completed Assessments */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-6">Your Assessment History</h2>
            <div className="grid gap-6">
              {assessmentHistory.map((assessment) => {
                const Icon = assessment.icon
                const isExpanded = selectedAssessment === assessment.id
                const latestResult = assessment.results[0]

                return (
                  <Card key={assessment.id} className="border-2 border-navy/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10">
                            <Icon className="h-6 w-6 text-navy" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-navy">{assessment.title} Assessment</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Last taken: {new Date(assessment.lastTaken).toLocaleDateString()}
                              </span>
                              <span>Completed {assessment.timesCompleted}x</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/assessments/${assessment.slug}/results?id=${latestResult.resultId || assessment.results[0].resultId}`}>
                            <Button variant="outline" size="sm">
                              View Results
                            </Button>
                          </Link>
                          <Link href={`/assessments/${assessment.slug}/quiz`}>
                            <Button size="sm" className="bg-navy hover:bg-navy/90">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retake
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Latest Results Summary */}
                      <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-navy">Latest Results</h4>
                          <Badge className="bg-gold text-white">Current</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {latestResult.topResults.map((result, i) => (
                            <Badge key={i} variant="outline" className="border-navy/30">
                              {result}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* History Toggle */}
                      {assessment.results.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedAssessment(isExpanded ? null : assessment.id)}
                            className="flex items-center gap-2 text-sm text-navy hover:text-navy/80 transition-colors"
                          >
                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            View History ({assessment.results.length - 1} previous {assessment.results.length - 1 === 1 ? 'result' : 'results'})
                          </button>

                          {/* History Details */}
                          {isExpanded && (
                            <div className="space-y-3 pl-6 border-l-2 border-navy/20">
                              {assessment.results.slice(1).map((result, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(result.date).toLocaleDateString()}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {result.topResults.map((res, i) => (
                                      <Badge key={i} variant="outline" className="border-gray-300 text-gray-600">
                                        {res}
                                      </Badge>
                                    ))}
                                  </div>
                                  {result.changes && (
                                    <div className="flex items-start gap-2 text-sm">
                                      {getChangeIcon(result.changes)}
                                      <span className="text-gray-700">{result.changes}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Download Option */}
                      <div className="pt-2">
                        <Button variant="ghost" size="sm" className="text-navy">
                          <Download className="mr-2 h-4 w-4" />
                          Download Assessment History (PDF)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Available Assessments */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-6">Available Assessments</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableAssessments.map((assessment) => {
                const Icon = assessment.icon
                return (
                  <Card key={assessment.slug} className="border-2 border-navy/10 hover:border-navy/30 transition-all">
                    <CardHeader>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 mb-4">
                        <Icon className="h-6 w-6 text-navy" />
                      </div>
                      <CardTitle className="text-lg text-navy">{assessment.title}</CardTitle>
                      <CardDescription>{assessment.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/assessments/${assessment.slug}`}>
                        <Button className="w-full bg-navy hover:bg-navy/90">
                          Take Assessment
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Growth Insights */}
          <Card className="border-2 border-gold/20 bg-gold/5">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                Your Growth Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white p-4 rounded-lg border border-gold/20">
                  <div className="text-2xl font-bold text-navy mb-1">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Assessments Completed</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gold/20">
                  <div className="text-2xl font-bold text-navy mb-1">{stats.totalTaken}</div>
                  <div className="text-sm text-gray-600">Total Times Taken</div>
                </div>
              </div>
              <p className="text-gray-700">
                Retaking assessments 6-12 months apart helps you track spiritual growth and see how God is developing your gifts over time.
              </p>
              <Link href="/assessments">
                <Button variant="outline" className="w-full border-gold text-navy hover:bg-gold/10">
                  Explore All Assessments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
