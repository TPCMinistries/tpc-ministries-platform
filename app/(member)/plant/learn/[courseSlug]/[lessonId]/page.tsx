'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen,
  Clock,
  CheckCircle,
  PlayCircle,
  FileText,
  Volume2,
  FileIcon,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  BookMarked,
  List
} from 'lucide-react'
import Link from 'next/link'

interface Lesson {
  id: string
  slug: string
  name: string
  description: string
  sequence_order: number
  content_type: 'video' | 'text' | 'audio' | 'pdf' | 'interactive'
  video_url?: string
  video_duration?: number
  audio_url?: string
  audio_duration?: number
  content_html?: string
  pdf_url?: string
  resources?: Array<{ name: string; url: string; type: string }>
  estimated_minutes: number
  scripture_references?: string[]
  is_preview: boolean
}

interface Module {
  id: string
  slug: string
  name: string
  description: string
  sequence_order: number
  lessons: Lesson[]
}

interface Course {
  id: string
  slug: string
  name: string
  modules: Module[]
  is_enrolled: boolean
  lesson_progress: Record<string, {
    status: string
    progress_percent: number
    video_position?: number
    personal_notes?: string
  }>
}

interface LessonProgress {
  status: string
  progress_percent: number
  video_position?: number
  personal_notes?: string
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params.courseSlug as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  useEffect(() => {
    if (courseSlug && lessonId) {
      fetchCourseAndLesson()
    }
  }, [courseSlug, lessonId])

  const fetchCourseAndLesson = async () => {
    try {
      const res = await fetch(`/api/plant/courses?slug=${courseSlug}`)
      if (res.ok) {
        const data = await res.json()
        const courseData = data.course
        setCourse(courseData)

        // Find the lesson and module
        for (const module of courseData.modules) {
          const lesson = module.lessons.find((l: Lesson) => l.id === lessonId)
          if (lesson) {
            setCurrentLesson(lesson)
            setCurrentModule(module)
            break
          }
        }

        // Get progress for this lesson
        const lessonProgress = courseData.lesson_progress?.[lessonId]
        if (lessonProgress) {
          setProgress(lessonProgress)
          setNotes(lessonProgress.personal_notes || '')
        }

        // Mark as in progress if not already
        if (!lessonProgress || lessonProgress.status === 'not_started') {
          updateProgress({ status: 'in_progress', progress_percent: 0 })
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (updates: Partial<LessonProgress>) => {
    try {
      await fetch('/api/plant/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          ...updates
        })
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleCompleteLesson = async () => {
    setCompleting(true)
    try {
      await updateProgress({ status: 'completed', progress_percent: 100 })
      setProgress(prev => prev ? { ...prev, status: 'completed', progress_percent: 100 } : null)

      // Navigate to next lesson if available
      const nextLesson = getNextLesson()
      if (nextLesson) {
        router.push(`/plant/learn/${courseSlug}/${nextLesson.id}`)
      }
    } finally {
      setCompleting(false)
    }
  }

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      await updateProgress({ personal_notes: notes })
    } finally {
      setSaving(false)
    }
  }

  const getNextLesson = (): Lesson | null => {
    if (!course || !currentModule || !currentLesson) return null

    // Find next lesson in current module
    const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id)
    if (currentIndex < currentModule.lessons.length - 1) {
      return currentModule.lessons[currentIndex + 1]
    }

    // Find first lesson in next module
    const moduleIndex = course.modules.findIndex(m => m.id === currentModule.id)
    if (moduleIndex < course.modules.length - 1) {
      const nextModule = course.modules[moduleIndex + 1]
      return nextModule.lessons[0] || null
    }

    return null
  }

  const getPreviousLesson = (): Lesson | null => {
    if (!course || !currentModule || !currentLesson) return null

    // Find previous lesson in current module
    const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id)
    if (currentIndex > 0) {
      return currentModule.lessons[currentIndex - 1]
    }

    // Find last lesson in previous module
    const moduleIndex = course.modules.findIndex(m => m.id === currentModule.id)
    if (moduleIndex > 0) {
      const prevModule = course.modules[moduleIndex - 1]
      return prevModule.lessons[prevModule.lessons.length - 1] || null
    }

    return null
  }

  const getLessonStatus = (lid: string) => {
    return course?.lesson_progress?.[lid]?.status || 'not_started'
  }

  const isCompleted = progress?.status === 'completed'
  const nextLesson = getNextLesson()
  const prevLesson = getPreviousLesson()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-96 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!course || !currentLesson || !currentModule) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Lesson not found</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all bg-white border-r overflow-hidden`}>
        <div className="p-4 border-b">
          <Link href={`/plant/course/${courseSlug}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
          <h2 className="font-semibold mt-3 line-clamp-2">{course.name}</h2>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {course.modules.map((module, moduleIndex) => (
            <div key={module.id} className="border-b">
              <div className="p-3 bg-gray-50 font-medium text-sm flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs">
                  {moduleIndex + 1}
                </span>
                <span className="line-clamp-1">{module.name}</span>
              </div>
              <div className="py-1">
                {module.lessons.map((lesson) => {
                  const status = getLessonStatus(lesson.id)
                  const isCurrent = lesson.id === currentLesson.id

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => router.push(`/plant/learn/${courseSlug}/${lesson.id}`)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${
                        isCurrent ? 'bg-green-50 border-l-2 border-green-500' : ''
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : status === 'in_progress' ? (
                        <div className="h-4 w-4 border-2 border-green-500 rounded-full flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                      )}
                      <span className={`line-clamp-1 ${isCurrent ? 'font-medium' : ''}`}>
                        {lesson.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <List className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-xs text-gray-500">{currentModule.name}</p>
              <h1 className="font-semibold">{currentLesson.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {prevLesson && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/plant/learn/${courseSlug}/${prevLesson.id}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            {nextLesson && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/plant/learn/${courseSlug}/${nextLesson.id}`)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Content based on type */}
          {currentLesson.content_type === 'video' && currentLesson.video_url && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={currentLesson.video_url}
                controls
                className="w-full h-full"
                onEnded={() => {
                  if (!isCompleted) {
                    updateProgress({ progress_percent: 100 })
                  }
                }}
              />
            </div>
          )}

          {currentLesson.content_type === 'audio' && currentLesson.audio_url && (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Volume2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{currentLesson.name}</h3>
                    <p className="text-sm text-gray-500">{currentLesson.estimated_minutes} minutes</p>
                  </div>
                </div>
                <audio
                  src={currentLesson.audio_url}
                  controls
                  className="w-full mt-4"
                  onEnded={() => {
                    if (!isCompleted) {
                      updateProgress({ progress_percent: 100 })
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}

          {currentLesson.content_type === 'pdf' && currentLesson.pdf_url && (
            <Card>
              <CardContent className="py-6">
                <a
                  href={currentLesson.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <FileIcon className="h-10 w-10 text-red-500" />
                  <div>
                    <p className="font-medium">Download PDF</p>
                    <p className="text-sm text-gray-500">Click to open in new tab</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Text Content */}
          {currentLesson.content_html && (
            <Card>
              <CardContent className="py-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content_html }}
                />
              </CardContent>
            </Card>
          )}

          {/* Scripture References */}
          {currentLesson.scripture_references && currentLesson.scripture_references.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-amber-500" />
                  Scripture References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentLesson.scripture_references.map((ref, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {ref}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {currentLesson.resources && currentLesson.resources.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentLesson.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span>{resource.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your personal notes here..."
                rows={4}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </Button>
            </CardContent>
          </Card>

          {/* Complete Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {currentLesson.estimated_minutes} min
            </div>

            {isCompleted ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Completed</span>
                </div>
                {nextLesson && (
                  <Button
                    onClick={() => router.push(`/plant/learn/${courseSlug}/${nextLesson.id}`)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Next Lesson
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={handleCompleteLesson}
                disabled={completing}
                className="bg-green-600 hover:bg-green-700"
              >
                {completing ? 'Completing...' : 'Mark as Complete'}
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
