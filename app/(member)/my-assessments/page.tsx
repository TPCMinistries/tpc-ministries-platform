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
  Loader2,
  Sparkles,
  Target,
  BookOpen,
  Star,
  Award,
  Clock,
  CheckCircle,
  ArrowRight
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
    resultId?: string
  }[]
}

const ASSESSMENT_CONFIG: { [key: string]: { icon: any, gradient: string, description: string } } = {
  'spiritual-gifts': {
    icon: Gift,
    gradient: 'from-purple-400 to-violet-500',
    description: 'Discover your God-given spiritual gifts'
  },
  'seasonal': {
    icon: Compass,
    gradient: 'from-amber-400 to-orange-500',
    description: 'Identify your current spiritual season'
  },
  'prophetic-expression': {
    icon: Eye,
    gradient: 'from-indigo-400 to-purple-500',
    description: 'Understand your prophetic expression style'
  },
  'ministry-calling': {
    icon: Heart,
    gradient: 'from-rose-400 to-pink-500',
    description: 'Discover where you\'re called to serve'
  },
  'redemptive-gifts': {
    icon: Crown,
    gradient: 'from-amber-400 to-yellow-500',
    description: 'Understand your unique redemptive design'
  },
  'spiritual-maturity': {
    icon: TreePine,
    gradient: 'from-emerald-400 to-green-500',
    description: 'Assess your spiritual development journey'
  }
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
        .from('member_assessment_results')
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
        const config = ASSESSMENT_CONFIG[type] || { icon: Gift, gradient: 'from-gray-400 to-slate-500', description: '' }

        const getTitle = (type: string) => {
          return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }

        return {
          id: typeResults[0].id,
          slug: type,
          title: getTitle(type),
          icon: config.icon,
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

  const availableAssessments = Object.entries(ASSESSMENT_CONFIG)
    .filter(([slug]) => !assessmentHistory.find(h => h.slug === slug))
    .map(([slug, config]) => ({
      slug,
      title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      icon: config.icon,
      description: config.description,
      gradient: config.gradient
    }))

  const getChangeIcon = (change?: string) => {
    if (!change) return null
    if (change.toLowerCase().includes('increase')) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change.toLowerCase().includes('decrease')) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-teal-950/30 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-teal-950/30 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-teal-200">Know Yourself</p>
                    <h1 className="text-3xl font-bold">My Assessments</h1>
                  </div>
                </div>
                <p className="text-teal-100 mt-2 max-w-md">
                  Discover your spiritual gifts, calling, and season through our prophetic assessments.
                </p>
              </div>

              <Link href="/assessments">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 shadow-lg gap-2">
                  <Sparkles className="h-5 w-5" />
                  Browse All Assessments
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Taken</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTaken}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableAssessments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Insights</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTaken * 3}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Assessments */}
        {assessmentHistory.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-teal-500" />
              Your Assessment History
            </h2>
            <div className="space-y-4">
              {assessmentHistory.map((assessment) => {
                const config = ASSESSMENT_CONFIG[assessment.slug] || { gradient: 'from-gray-400 to-slate-500' }
                const Icon = assessment.icon
                const isExpanded = selectedAssessment === assessment.id
                const latestResult = assessment.results[0]

                return (
                  <Card key={assessment.id} className="overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all">
                    {/* Colored top bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-lg`}>
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-900 dark:text-white">{assessment.title}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Last taken: {formatDate(assessment.lastTaken)}
                              </span>
                              <Badge variant="outline" className="border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
                                Completed {assessment.timesCompleted}x
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/assessments/${assessment.slug}/results?id=${latestResult.resultId}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <BookOpen className="h-4 w-4" />
                              View Results
                            </Button>
                          </Link>
                          <Link href={`/assessments/${assessment.slug}/quiz`}>
                            <Button size="sm" className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white border-0 gap-1`}>
                              <RefreshCw className="h-4 w-4" />
                              Retake
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Latest Results Summary */}
                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-teal-100 dark:border-teal-900">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-teal-500" />
                            Latest Results
                          </h4>
                          <Badge className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0">Current</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {latestResult.topResults.map((result, i) => (
                            <Badge
                              key={i}
                              className={`${i === 0 ? `bg-gradient-to-r ${config.gradient} text-white border-0` : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}
                            >
                              {i === 0 && <Star className="h-3 w-3 mr-1" />}
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
                            className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium"
                          >
                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            View History ({assessment.results.length - 1} previous {assessment.results.length - 1 === 1 ? 'result' : 'results'})
                          </button>

                          {/* History Details */}
                          {isExpanded && (
                            <div className="space-y-3 pl-6 border-l-2 border-teal-200 dark:border-teal-800 ml-2">
                              {assessment.results.slice(1).map((result, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="h-4 w-4" />
                                    {formatDate(result.date)}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {result.topResults.map((res, i) => (
                                      <Badge key={i} variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                                        {res}
                                      </Badge>
                                    ))}
                                  </div>
                                  {result.changes && (
                                    <div className="flex items-start gap-2 text-sm">
                                      {getChangeIcon(result.changes)}
                                      <span className="text-gray-700 dark:text-gray-300">{result.changes}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Download Option */}
                      <div className="pt-2 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">
                          <Download className="mr-2 h-4 w-4" />
                          Download Results (PDF)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Assessments */}
        {availableAssessments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Available Assessments
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableAssessments.map((assessment) => {
                const Icon = assessment.icon
                return (
                  <Card key={assessment.slug} className="overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl transition-all group">
                    <CardHeader className="pb-3">
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-r ${assessment.gradient} flex items-center justify-center shadow-lg mb-4 transform group-hover:scale-105 transition-transform`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{assessment.title}</CardTitle>
                      <CardDescription>{assessment.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/assessments/${assessment.slug}`}>
                        <Button className={`w-full bg-gradient-to-r ${assessment.gradient} hover:opacity-90 text-white border-0 gap-2`}>
                          Take Assessment
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {assessmentHistory.length === 0 && availableAssessments.length === 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Assessments Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Take your first assessment to discover your spiritual gifts, calling, and current season.
              </p>
              <Link href="/assessments">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:opacity-90 text-white gap-2">
                  <Sparkles className="h-4 w-4" />
                  Browse Assessments
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Growth Journey Card */}
        <Card className="bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-white border-0 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Track Your Growth</h3>
                <p className="text-teal-100 text-sm">
                  Retaking assessments every 6-12 months helps you see how God is developing your gifts and calling over time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
