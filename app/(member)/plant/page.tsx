'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  GraduationCap,
  Clock,
  Users,
  Star,
  Lock,
  CheckCircle,
  Search,
  Leaf,
  ArrowRight,
  Trophy,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface LearningPath {
  id: string
  slug: string
  name: string
  description: string
  thumbnail_url?: string
  category: string
  difficulty_level: string
  ministry_id: string
  required_tier: string
  estimated_hours: number
  total_courses: number
  enrollment_count: number
  has_access: boolean
  is_enrolled: boolean
  enrollment?: {
    progress_percent: number
    status: string
  }
  courses?: Array<{
    sequence_order: number
    course: {
      id: string
      slug: string
      name: string
      thumbnail_url?: string
      estimated_hours: number
    }
  }>
}

interface Course {
  id: string
  slug: string
  name: string
  description: string
  thumbnail_url?: string
  category: string
  difficulty_level: string
  ministry_id: string
  required_tier: string
  estimated_hours: number
  total_modules: number
  total_lessons: number
  enrollment_count: number
  average_rating: number
  has_certificate: boolean
  has_access: boolean
  is_enrolled: boolean
  enrollment?: {
    progress_percent: number
    status: string
  }
  instructor?: {
    id: string
    external_name?: string
    title?: string
    member?: {
      first_name: string
      last_name: string
    }
  }
}

interface Stats {
  enrolled_courses: number
  completed_courses: number
  completed_lessons: number
  total_time_spent: number
  certificates_earned: number
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'discipleship', label: 'Discipleship' },
  { value: 'prophetic', label: 'Prophetic' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'bible-study', label: 'Bible Study' },
  { value: 'ministry', label: 'Ministry' }
]

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
}

export default function PlantPage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userTier, setUserTier] = useState('free')

  useEffect(() => {
    fetchData()
  }, [selectedCategory])

  const fetchData = async () => {
    try {
      const categoryParam = selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''

      const [pathsRes, coursesRes, progressRes] = await Promise.all([
        fetch(`/api/plant/paths${categoryParam}`),
        fetch(`/api/plant/courses${categoryParam}`),
        fetch('/api/plant/progress')
      ])

      if (pathsRes.ok) {
        const data = await pathsRes.json()
        setPaths(data.paths || [])
        setUserTier(data.user_tier)
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json()
        setCourses(data.courses || [])
      }

      if (progressRes.ok) {
        const data = await progressRes.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching PLANT data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course =>
    !searchQuery ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInstructorName = (instructor?: Course['instructor']) => {
    if (!instructor) return 'TPC Faculty'
    if (instructor.member) {
      return `${instructor.title || ''} ${instructor.member.first_name} ${instructor.member.last_name}`.trim()
    }
    return instructor.external_name || 'TPC Faculty'
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
        <div className="absolute inset-0 bg-[url('/plant-pattern.svg')] opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur">
              <Leaf className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">PLANT</h1>
              <p className="text-white/80 text-sm">Purpose. Learn. Activate. Nurture. Thrive.</p>
            </div>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Grow in your faith through structured learning paths designed to equip you for kingdom impact.
          </p>
          {stats && (
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.enrolled_courses}</div>
                <div className="text-sm text-white/70">Courses Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.completed_lessons}</div>
                <div className="text-sm text-white/70">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(stats.total_time_spent)}</div>
                <div className="text-sm text-white/70">Time Learning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.certificates_earned}</div>
                <div className="text-sm text-white/70">Certificates</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/plant/my-learning">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            My Learning
          </Button>
        </Link>
        {stats && stats.certificates_earned > 0 && (
          <Link href="/plant/my-learning?tab=certificates">
            <Button variant="outline" className="gap-2">
              <Trophy className="h-4 w-4" />
              View Certificates
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs for Paths and Courses */}
      <Tabs defaultValue="paths" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="courses">All Courses</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-6">
          {paths.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No learning paths available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paths.map((path) => (
                <Card key={path.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-3 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{path.name}</CardTitle>
                        <CardDescription>{path.description}</CardDescription>
                      </div>
                      {!path.has_access && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Lock className="h-3 w-3 mr-1" />
                          {path.required_tier}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className={difficultyColors[path.difficulty_level as keyof typeof difficultyColors]}>
                        {path.difficulty_level}
                      </Badge>
                      <Badge variant="outline">{path.category}</Badge>
                      {path.ministry_id === 'tpc' && (
                        <Badge className="bg-navy text-white">TPC Exclusive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {path.total_courses} Courses
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {path.estimated_hours}h
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {path.enrollment_count} enrolled
                      </div>
                    </div>

                    {path.is_enrolled && path.enrollment && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Your Progress</span>
                          <span className="font-medium">{Math.round(path.enrollment.progress_percent)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${path.enrollment.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {path.courses && path.courses.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Courses in this path:</p>
                        <div className="flex flex-wrap gap-1">
                          {path.courses.slice(0, 4).map((pc) => (
                            <Badge key={pc.course.id} variant="outline" className="text-xs">
                              {pc.course.name}
                            </Badge>
                          ))}
                          {path.courses.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{path.courses.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <Link href={`/plant/course/${path.courses?.[0]?.course.slug || '#'}`} className="w-full">
                      <Button className="w-full gap-2" disabled={!path.has_access}>
                        {path.is_enrolled ? (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            Continue Learning
                          </>
                        ) : path.has_access ? (
                          <>
                            Start Path
                            <ArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Upgrade to Access
                          </>
                        )}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No courses found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 relative">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="h-16 w-16 text-green-300" />
                      </div>
                    )}
                    {!course.has_access && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-500 text-white">
                          <Lock className="h-3 w-3 mr-1" />
                          {course.required_tier}
                        </Badge>
                      </div>
                    )}
                    {course.is_enrolled && course.enrollment?.status === 'completed' && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-2">{course.name}</CardTitle>
                      {course.average_rating > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{getInstructorName(course.instructor)}</p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.total_lessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.estimated_hours}h
                      </span>
                      {course.has_certificate && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Trophy className="h-3 w-3" />
                          Certificate
                        </span>
                      )}
                    </div>
                    {course.is_enrolled && course.enrollment && course.enrollment.progress_percent > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{Math.round(course.enrollment.progress_percent)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${course.enrollment.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Link href={`/plant/course/${course.slug}`} className="w-full">
                      <Button
                        className="w-full"
                        variant={course.is_enrolled ? "outline" : "default"}
                        disabled={!course.has_access}
                      >
                        {course.is_enrolled ? 'Continue' : course.has_access ? 'View Course' : 'Upgrade to Access'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
