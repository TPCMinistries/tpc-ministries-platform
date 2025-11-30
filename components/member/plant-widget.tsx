'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  Leaf,
  TrendingUp,
  Trophy,
  PlayCircle
} from 'lucide-react'
import Link from 'next/link'

interface CourseEnrollment {
  id: string
  status: string
  progress_percent: number
  course: {
    id: string
    slug: string
    name: string
    thumbnail_url?: string
    total_lessons: number
    estimated_hours: number
  }
}

interface Stats {
  enrolled_courses: number
  completed_courses: number
  completed_lessons: number
  total_time_spent: number
  certificates_earned: number
}

export default function PlantWidget() {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [enrollRes, progressRes] = await Promise.all([
        fetch('/api/plant/enroll'),
        fetch('/api/plant/progress')
      ])

      if (enrollRes.ok) {
        const data = await enrollRes.json()
        setEnrollments(data.course_enrollments || [])
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Get courses in progress
  const inProgress = enrollments.filter(e => e.status === 'active' && e.progress_percent > 0)

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-green-200 rounded w-1/2"></div>
            <div className="h-16 bg-green-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No enrollments yet - show intro card
  if (enrollments.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-full">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-900">PLANT Learning</CardTitle>
              <CardDescription className="text-green-700">
                Purpose. Learn. Activate. Nurture. Thrive.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-green-800">
            Grow in your faith through structured courses and learning paths designed to equip you for kingdom impact.
          </p>
          <Link href="/plant">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Leaf className="h-4 w-4 mr-2" />
              Explore Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-full">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-900">Your Learning</CardTitle>
              <CardDescription className="text-green-700">PLANT Progress</CardDescription>
            </div>
          </div>
          <Link href="/plant/my-learning">
            <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900 hover:bg-green-100">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BookOpen className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold text-green-700">{stats.enrolled_courses}</span>
              </div>
              <p className="text-xs text-green-600">Enrolled</p>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold text-green-700">{stats.completed_lessons}</span>
              </div>
              <p className="text-xs text-green-600">Lessons Done</p>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-lg font-bold text-green-700">{stats.certificates_earned}</span>
              </div>
              <p className="text-xs text-green-600">Certificates</p>
            </div>
          </div>
        )}

        {/* Continue Learning */}
        {inProgress.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-800 flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Continue Learning
            </h4>
            {inProgress.slice(0, 2).map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/plant/course/${enrollment.course.slug}`}
                className="block"
              >
                <div className="p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm text-green-900 line-clamp-1">
                      {enrollment.course.name}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      {Math.round(enrollment.progress_percent)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-green-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${enrollment.progress_percent}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Explore More */}
        <Link href="/plant">
          <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-100">
            <Leaf className="h-4 w-4 mr-2" />
            Browse More Courses
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
