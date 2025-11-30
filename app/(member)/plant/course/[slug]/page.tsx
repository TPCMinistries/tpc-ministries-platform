'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Lock,
  CheckCircle,
  PlayCircle,
  FileText,
  Volume2,
  FileIcon,
  ArrowLeft,
  Trophy,
  Leaf,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface Lesson {
  id: string
  slug: string
  name: string
  description: string
  sequence_order: number
  content_type: 'video' | 'text' | 'audio' | 'pdf'
  estimated_minutes: number
  is_preview: boolean
}

interface Module {
  id: string
  slug: string
  name: string
  description: string
  sequence_order: number
  has_quiz: boolean
  lessons: Lesson[]
}

interface Course {
  id: string
  slug: string
  name: string
  description: string
  long_description?: string
  thumbnail_url?: string
  promo_video_url?: string
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
  prerequisites: string[]
  has_access: boolean
  is_enrolled: boolean
  enrollment?: {
    id: string
    status: string
    progress_percent: number
    last_lesson_id?: string
  }
  lesson_progress: Record<string, {
    status: string
    progress_percent: number
    completed_at?: string
  }>
  modules: Module[]
  instructor?: {
    id: string
    external_name?: string
    title?: string
    specialty?: string
    credentials?: string
    member?: {
      first_name: string
      last_name: string
    }
  }
}

const contentTypeIcons = {
  video: PlayCircle,
  text: FileText,
  audio: Volume2,
  pdf: FileIcon
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchCourse()
    }
  }, [slug])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/plant/courses?slug=${slug}`)
      if (res.ok) {
        const data = await res.json()
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!course) return
    setEnrolling(true)

    try {
      const res = await fetch('/api/plant/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: course.id })
      })

      if (res.ok) {
        fetchCourse()
      } else {
        const error = await res.json()
        console.error('Enrollment error:', error)
      }
    } catch (error) {
      console.error('Error enrolling:', error)
    } finally {
      setEnrolling(false)
    }
  }

  const getInstructorName = () => {
    if (!course?.instructor) return 'TPC Faculty'
    if (course.instructor.member) {
      return `${course.instructor.title || ''} ${course.instructor.member.first_name} ${course.instructor.member.last_name}`.trim()
    }
    return course.instructor.external_name || 'TPC Faculty'
  }

  const getLessonStatus = (lessonId: string) => {
    if (!course?.lesson_progress) return 'not_started'
    return course.lesson_progress[lessonId]?.status || 'not_started'
  }

  const getFirstIncompleteLesson = (): { moduleIndex: number; lessonId: string } | null => {
    if (!course?.modules) return null

    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i]
      for (const lesson of module.lessons) {
        if (getLessonStatus(lesson.id) !== 'completed') {
          return { moduleIndex: i, lessonId: lesson.id }
        }
      }
    }
    return null
  }

  const getCompletedLessonsInModule = (module: Module) => {
    return module.lessons.filter(l => getLessonStatus(l.id) === 'completed').length
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-48 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Course not found</p>
            <Link href="/plant">
              <Button variant="link" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to PLANT
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextLesson = getFirstIncompleteLesson()

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link href="/plant">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to PLANT
        </Button>
      </Link>

      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className={difficultyColors[course.difficulty_level as keyof typeof difficultyColors]}>
                {course.difficulty_level}
              </Badge>
              <Badge variant="outline">{course.category}</Badge>
              {course.ministry_id === 'tpc' && (
                <Badge className="bg-navy text-white">TPC Exclusive</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
            <p className="text-lg text-gray-600">{course.description}</p>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium">{getInstructorName()}</p>
              {course.instructor?.specialty && (
                <p className="text-sm text-gray-500">{course.instructor.specialty}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>{course.total_lessons} lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{course.estimated_hours} hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{course.enrollment_count} enrolled</span>
            </div>
            {course.average_rating > 0 && (
              <div className="flex items-center gap-2 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span>{course.average_rating.toFixed(1)}</span>
              </div>
            )}
            {course.has_certificate && (
              <div className="flex items-center gap-2 text-green-600">
                <Trophy className="h-5 w-5" />
                <span>Certificate</span>
              </div>
            )}
          </div>

          {/* Long Description */}
          {course.long_description && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold">About This Course</h3>
              <div dangerouslySetInnerHTML={{ __html: course.long_description }} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {course.is_enrolled && course.enrollment ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Progress</span>
                      <span className="font-medium">{Math.round(course.enrollment.progress_percent)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${course.enrollment.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  {course.enrollment.status === 'completed' ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Course Completed!</span>
                      </div>
                      {course.has_certificate && (
                        <Link href="/plant/my-learning?tab=certificates">
                          <Button variant="link" className="p-0 h-auto text-green-600">
                            View Certificate
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={nextLesson ? `/plant/learn/${course.slug}/${nextLesson.lessonId}` : '#'}
                      className="block"
                    >
                      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                        <PlayCircle className="h-4 w-4" />
                        Continue Learning
                      </Button>
                    </Link>
                  )}
                </>
              ) : course.has_access ? (
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Lock className="h-5 w-5" />
                      <span className="font-medium">Requires {course.required_tier} membership</span>
                    </div>
                  </div>
                  <Link href="/upgrade">
                    <Button className="w-full">Upgrade to Access</Button>
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Modules</span>
                  <span className="font-medium">{course.total_modules}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Lessons</span>
                  <span className="font-medium">{course.total_lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{course.estimated_hours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Level</span>
                  <span className="font-medium capitalize">{course.difficulty_level}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            {course.total_modules} modules • {course.total_lessons} lessons • {course.estimated_hours} hours total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full" defaultValue={['module-0']}>
            {course.modules.map((module, index) => {
              const completedCount = getCompletedLessonsInModule(module)
              const totalCount = module.lessons.length

              return (
                <AccordionItem key={module.id} value={`module-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{module.name}</h4>
                        <p className="text-sm text-gray-500">
                          {module.lessons.length} lessons
                          {module.has_quiz && ' • Quiz'}
                          {course.is_enrolled && ` • ${completedCount}/${totalCount} completed`}
                        </p>
                      </div>
                      {course.is_enrolled && completedCount === totalCount && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-12">
                      {module.lessons.map((lesson) => {
                        const status = getLessonStatus(lesson.id)
                        const Icon = contentTypeIcons[lesson.content_type] || FileText
                        const canAccess = course.is_enrolled || lesson.is_preview

                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              canAccess ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60'
                            }`}
                            onClick={() => {
                              if (canAccess) {
                                router.push(`/plant/learn/${course.slug}/${lesson.id}`)
                              }
                            }}
                          >
                            <div className={`p-2 rounded-lg ${
                              status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Icon className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{lesson.name}</p>
                              <p className="text-xs text-gray-500">
                                {lesson.content_type} • {lesson.estimated_minutes} min
                                {lesson.is_preview && !course.is_enrolled && (
                                  <span className="text-green-600 ml-2">Preview</span>
                                )}
                              </p>
                            </div>
                            {canAccess ? (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        )
                      })}
                      {module.has_quiz && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-amber-50 border-amber-200">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Star className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Module Quiz</p>
                            <p className="text-xs text-gray-500">Test your knowledge</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
