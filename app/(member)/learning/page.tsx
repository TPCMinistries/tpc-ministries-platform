'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Leaf,
  CheckCircle,
  ArrowRight,
  Loader2,
  Sun,
  Snowflake,
  Flower2,
  TreeDeciduous,
  Target,
  BookOpen,
  GraduationCap,
  Award,
  Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Course {
  id: string
  title: string
  description: string
  level: string
  duration_weeks: number
  lessons_count: number
  is_enrolled?: boolean
  progress?: number
}

interface Season {
  id: string
  name: string
  description: string
  color: string
  icon_name: string
  is_member?: boolean
  progress_percentage?: number
  content_completed?: number
  content_total?: number
}

const SEASON_ICONS: { [key: string]: any } = {
  sun: Sun,
  leaf: Leaf,
  snowflake: Snowflake,
  flower: Flower2,
  tree: TreeDeciduous,
  sparkles: Sparkles,
  target: Target,
  default: Sparkles
}

export default function LearningPathsPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'courses' | 'seasons'>('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [enrolledCount, setEnrolledCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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

      // Fetch PLANT courses
      const { data: coursesData } = await supabase
        .from('plant_courses')
        .select('*')
        .eq('is_published', true)
        .order('display_order')

      // Fetch member's enrollments
      const { data: enrollments } = await supabase
        .from('plant_enrollments')
        .select('course_id, progress_percentage, completed_at')
        .eq('member_id', member.id)

      const enrollmentMap = new Map(enrollments?.map(e => [e.course_id, e]) || [])

      const processedCourses = coursesData?.map(course => ({
        ...course,
        is_enrolled: enrollmentMap.has(course.id),
        progress: enrollmentMap.get(course.id)?.progress_percentage || 0
      })) || []

      setCourses(processedCourses)
      setEnrolledCount(enrollments?.length || 0)
      setCompletedCount(enrollments?.filter(e => e.completed_at).length || 0)

      // Fetch Seasons
      const { data: seasonsData } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      const { data: memberSeasons } = await supabase
        .from('member_seasons')
        .select('season_id')
        .eq('member_id', member.id)

      const memberSeasonIds = new Set(memberSeasons?.map(ms => ms.season_id) || [])

      const processedSeasons = seasonsData?.map(season => ({
        ...season,
        is_member: memberSeasonIds.has(season.id),
        progress_percentage: 0,
        content_completed: 0,
        content_total: 0
      })) || []

      setSeasons(processedSeasons)
    } catch (error) {
      console.error('Error fetching learning data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeasonIcon = (iconName: string) => {
    return SEASON_ICONS[iconName] || SEASON_ICONS.default
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-green-950/30 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading learning paths...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-green-950/30 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-green-200">Grow in Faith & Knowledge</p>
                <h1 className="text-3xl font-bold">Learning Paths</h1>
              </div>
            </div>
            <p className="text-green-100 mt-2 max-w-md">
              Structured courses and spiritual seasons designed to help you grow deeper in your faith and calling.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Courses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{enrolledCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seasons</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{seasons.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'courses'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Leaf className="h-4 w-4" />
            PLANT Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('seasons')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'seasons'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Spiritual Seasons ({seasons.length})
          </button>
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3 bg-white/80 dark:bg-slate-800/80 border-0">
                <CardContent className="py-16 text-center">
                  <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>
                  <p className="text-gray-500">New courses are being prepared. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              courses.map((course) => (
                <Card key={course.id} className="overflow-hidden bg-white/80 dark:bg-slate-800/80 border-0 hover:shadow-xl transition-all group">
                  <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getLevelBadge(course.level)}>
                        {course.level}
                      </Badge>
                      {course.is_enrolled && (
                        <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration_weeks} weeks
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.lessons_count} lessons
                      </span>
                    </div>

                    {course.is_enrolled && course.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    <Link href={`/plant/${course.id}`}>
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2">
                        {course.is_enrolled ? 'Continue Learning' : 'View Course'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Seasons Tab */}
        {activeTab === 'seasons' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seasons.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3 bg-white/80 dark:bg-slate-800/80 border-0">
                <CardContent className="py-16 text-center">
                  <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Seasons Available</h3>
                  <p className="text-gray-500">New spiritual seasons are being prepared. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              seasons.map((season) => {
                const Icon = getSeasonIcon(season.icon_name)
                return (
                  <Card key={season.id} className="overflow-hidden bg-white/80 dark:bg-slate-800/80 border-0 hover:shadow-xl transition-all group">
                    <div className="h-2" style={{ background: `linear-gradient(to right, ${season.color}, ${season.color}dd)` }} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${season.color}, ${season.color}cc)` }}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {season.is_member && (
                          <Badge className="bg-green-100 text-green-800">Joined</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{season.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{season.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/seasons/${season.id}`}>
                        <Button
                          className="w-full gap-2 text-white"
                          style={{ background: `linear-gradient(135deg, ${season.color}, ${season.color}dd)` }}
                        >
                          {season.is_member ? 'Continue Journey' : 'Begin Season'}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* Encouragement Card */}
        <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Grow in Grace</h3>
                <p className="text-green-100 text-sm">
                  "But grow in the grace and knowledge of our Lord and Savior Jesus Christ." — 2 Peter 3:18
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
