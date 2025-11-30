'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Clock,
  CheckCircle,
  PlayCircle,
  Trophy,
  ArrowRight,
  Award,
  Calendar,
  TrendingUp,
  Leaf
} from 'lucide-react'
import Link from 'next/link'

interface CourseEnrollment {
  id: string
  status: string
  progress_percent: number
  enrolled_at: string
  started_at?: string
  completed_at?: string
  last_accessed_at?: string
  total_time_spent: number
  course: {
    id: string
    slug: string
    name: string
    thumbnail_url?: string
    total_lessons: number
    estimated_hours: number
  }
}

interface PathEnrollment {
  id: string
  status: string
  progress_percent: number
  enrolled_at: string
  completed_at?: string
  learning_path: {
    id: string
    slug: string
    name: string
    thumbnail_url?: string
    total_courses: number
  }
}

interface Certificate {
  id: string
  certificate_number: string
  recipient_name: string
  course_name: string
  issued_at: string
  verification_url: string
  course?: { name: string; slug: string }
  learning_path?: { name: string; slug: string }
}

interface Stats {
  enrolled_courses: number
  completed_courses: number
  completed_lessons: number
  total_time_spent: number
  certificates_earned: number
}

export default function MyLearningPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'courses'

  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([])
  const [pathEnrollments, setPathEnrollments] = useState<PathEnrollment[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [enrollRes, certsRes, progressRes] = await Promise.all([
        fetch('/api/plant/enroll'),
        fetch('/api/plant/certificates'),
        fetch('/api/plant/progress')
      ])

      if (enrollRes.ok) {
        const data = await enrollRes.json()
        setCourseEnrollments(data.course_enrollments || [])
        setPathEnrollments(data.path_enrollments || [])
      }

      if (certsRes.ok) {
        const data = await certsRes.json()
        setCertificates(data.certificates || [])
      }

      if (progressRes.ok) {
        const data = await progressRes.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching learning data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const inProgressCourses = courseEnrollments.filter(e => e.status === 'active' && e.progress_percent > 0)
  const notStartedCourses = courseEnrollments.filter(e => e.status === 'active' && e.progress_percent === 0)
  const completedCourses = courseEnrollments.filter(e => e.status === 'completed')

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Learning</h1>
          <p className="text-gray-500">Track your progress and continue learning</p>
        </div>
        <Link href="/plant">
          <Button variant="outline" className="gap-2">
            <Leaf className="h-4 w-4" />
            Browse Courses
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold">{stats.enrolled_courses}</div>
              <div className="text-sm text-gray-500">Enrolled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold">{stats.completed_courses}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{stats.completed_lessons}</div>
              <div className="text-sm text-gray-500">Lessons Done</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <div className="text-2xl font-bold">{formatTime(stats.total_time_spent)}</div>
              <div className="text-sm text-gray-500">Time Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <div className="text-2xl font-bold">{stats.certificates_earned}</div>
              <div className="text-sm text-gray-500">Certificates</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">
            Courses ({courseEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="paths">
            Learning Paths ({pathEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="certificates">
            Certificates ({certificates.length})
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {/* In Progress */}
          {inProgressCourses.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-green-500" />
                Continue Learning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressCourses.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-1/3 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        {enrollment.course.thumbnail_url ? (
                          <img
                            src={enrollment.course.thumbnail_url}
                            alt={enrollment.course.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-10 w-10 text-green-300" />
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <h4 className="font-medium line-clamp-1">{enrollment.course.name}</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">{Math.round(enrollment.progress_percent)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${enrollment.progress_percent}%` }}
                            />
                          </div>
                          <Link href={`/plant/course/${enrollment.course.slug}`}>
                            <Button size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700">
                              Continue
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Not Started */}
          {notStartedCourses.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Not Started</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notStartedCourses.map((enrollment) => (
                  <Card key={enrollment.id}>
                    <CardContent className="pt-6">
                      <h4 className="font-medium mb-2">{enrollment.course.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {enrollment.course.total_lessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {enrollment.course.estimated_hours}h
                        </span>
                      </div>
                      <Link href={`/plant/course/${enrollment.course.slug}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Start Course
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedCourses.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Completed
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedCourses.map((enrollment) => (
                  <Card key={enrollment.id} className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{enrollment.course.name}</h4>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Completed {enrollment.completed_at ? formatDate(enrollment.completed_at) : ''}
                      </p>
                      <Link href={`/plant/course/${enrollment.course.slug}`}>
                        <Button variant="outline" size="sm" className="w-full border-green-300 text-green-700">
                          Review Course
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {courseEnrollments.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-500 mb-4">Start your learning journey today!</p>
                <Link href="/plant">
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-4">
          {pathEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pathEnrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{enrollment.learning_path.name}</h4>
                        <p className="text-sm text-gray-500">
                          {enrollment.learning_path.total_courses} courses
                        </p>
                      </div>
                      {enrollment.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{Math.round(enrollment.progress_percent)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${enrollment.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Leaf className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No learning paths enrolled</h3>
                <p className="text-gray-500 mb-4">Explore structured learning paths to grow your skills.</p>
                <Link href="/plant">
                  <Button>Browse Learning Paths</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-100 rounded-full">
                        <Award className="h-8 w-8 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{cert.course_name}</h4>
                        <p className="text-sm text-gray-500">
                          Certificate #{cert.certificate_number}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          Issued {formatDate(cert.issued_at)}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            View Certificate
                          </Button>
                          <Button variant="ghost" size="sm">
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No certificates yet</h3>
                <p className="text-gray-500 mb-4">Complete courses to earn certificates!</p>
                <Link href="/plant">
                  <Button>Start Learning</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
