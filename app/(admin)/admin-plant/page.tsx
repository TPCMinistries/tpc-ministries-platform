'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Leaf,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  BookOpen,
  Users,
  GraduationCap,
  Layers,
  Video,
  FileText,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  HelpCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Course {
  id: string
  slug: string
  name: string
  description: string
  category: string
  difficulty_level: string
  ministry_id: string
  required_tier: string
  status: string
  estimated_hours: number
  total_modules: number
  total_lessons: number
  enrollment_count: number
  has_certificate: boolean
  created_at: string
}

interface Module {
  id: string
  course_id: string
  slug: string
  name: string
  description: string
  sequence_order: number
  has_quiz: boolean
}

interface Lesson {
  id: string
  module_id: string
  slug: string
  name: string
  description: string
  sequence_order: number
  content_type: string
  estimated_minutes: number
  content_html: string
  video_url: string
  is_preview: boolean
}

interface LearningPath {
  id: string
  slug: string
  name: string
  description: string
  category: string
  difficulty_level: string
  required_tier: string
  status: string
  estimated_hours: number
  total_courses: number
  enrollment_count: number
}

export default function AdminPlantPage() {
  const [activeTab, setActiveTab] = useState('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [populating, setPopulating] = useState(false)
  const [creatingQuizzes, setCreatingQuizzes] = useState(false)

  // Dialog states
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [isPathDialogOpen, setIsPathDialogOpen] = useState(false)

  // Editing states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null)

  // Selected course/module for drilling down
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)

  // Form data
  const [courseForm, setCourseForm] = useState({
    slug: '',
    name: '',
    description: '',
    category: 'discipleship',
    difficulty_level: 'beginner',
    ministry_id: 'tpc',
    required_tier: 'free',
    status: 'draft',
    estimated_hours: 0,
    has_certificate: true
  })

  const [moduleForm, setModuleForm] = useState({
    slug: '',
    name: '',
    description: '',
    sequence_order: 1,
    has_quiz: false
  })

  const [lessonForm, setLessonForm] = useState({
    slug: '',
    name: '',
    description: '',
    sequence_order: 1,
    content_type: 'video',
    estimated_minutes: 10,
    content_html: '',
    video_url: '',
    is_preview: false
  })

  const [pathForm, setPathForm] = useState({
    slug: '',
    name: '',
    description: '',
    category: 'discipleship',
    difficulty_level: 'beginner',
    required_tier: 'free',
    status: 'draft',
    estimated_hours: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchModules(selectedCourse.id)
    }
  }, [selectedCourse])

  useEffect(() => {
    if (selectedModule) {
      fetchLessons(selectedModule.id)
    }
  }, [selectedModule])

  const fetchData = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const [coursesRes, pathsRes] = await Promise.all([
        supabase.from('plant_courses').select('*').order('created_at', { ascending: false }),
        supabase.from('plant_learning_paths').select('*').order('created_at', { ascending: false })
      ])

      if (coursesRes.data) setCourses(coursesRes.data)
      if (pathsRes.data) setLearningPaths(pathsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchModules = async (courseId: string) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('plant_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('sequence_order')

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const fetchLessons = async (moduleId: string) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('plant_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('sequence_order')

      if (error) throw error
      setLessons(data || [])
    } catch (error) {
      console.error('Error fetching lessons:', error)
    }
  }

  // Course handlers
  const handleCreateCourse = () => {
    setEditingCourse(null)
    setCourseForm({
      slug: '',
      name: '',
      description: '',
      category: 'discipleship',
      difficulty_level: 'beginner',
      ministry_id: 'tpc',
      required_tier: 'free',
      status: 'draft',
      estimated_hours: 0,
      has_certificate: true
    })
    setIsCourseDialogOpen(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseForm({
      slug: course.slug,
      name: course.name,
      description: course.description || '',
      category: course.category || 'discipleship',
      difficulty_level: course.difficulty_level || 'beginner',
      ministry_id: course.ministry_id || 'tpc',
      required_tier: course.required_tier || 'free',
      status: course.status || 'draft',
      estimated_hours: course.estimated_hours || 0,
      has_certificate: course.has_certificate
    })
    setIsCourseDialogOpen(true)
  }

  const handleSaveCourse = async () => {
    const supabase = createClient()
    setSaving(true)

    try {
      const courseData = {
        slug: courseForm.slug || courseForm.name.toLowerCase().replace(/\s+/g, '-'),
        name: courseForm.name,
        description: courseForm.description,
        category: courseForm.category,
        difficulty_level: courseForm.difficulty_level,
        ministry_id: courseForm.ministry_id,
        required_tier: courseForm.required_tier,
        status: courseForm.status,
        estimated_hours: courseForm.estimated_hours,
        has_certificate: courseForm.has_certificate,
        published_at: courseForm.status === 'published' ? new Date().toISOString() : null
      }

      if (editingCourse) {
        const { error } = await supabase
          .from('plant_courses')
          .update(courseData)
          .eq('id', editingCourse.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('plant_courses')
          .insert(courseData)
        if (error) throw error
      }

      setIsCourseDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure? This will delete all modules and lessons within this course.')) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from('plant_courses').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  // Module handlers
  const handleCreateModule = () => {
    setEditingModule(null)
    setModuleForm({
      slug: '',
      name: '',
      description: '',
      sequence_order: modules.length + 1,
      has_quiz: false
    })
    setIsModuleDialogOpen(true)
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleForm({
      slug: module.slug,
      name: module.name,
      description: module.description || '',
      sequence_order: module.sequence_order,
      has_quiz: module.has_quiz
    })
    setIsModuleDialogOpen(true)
  }

  const handleSaveModule = async () => {
    if (!selectedCourse) return
    const supabase = createClient()
    setSaving(true)

    try {
      const moduleData = {
        course_id: selectedCourse.id,
        slug: moduleForm.slug || moduleForm.name.toLowerCase().replace(/\s+/g, '-'),
        name: moduleForm.name,
        description: moduleForm.description,
        sequence_order: moduleForm.sequence_order,
        has_quiz: moduleForm.has_quiz
      }

      if (editingModule) {
        const { error } = await supabase
          .from('plant_modules')
          .update(moduleData)
          .eq('id', editingModule.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('plant_modules')
          .insert(moduleData)
        if (error) throw error
      }

      setIsModuleDialogOpen(false)
      fetchModules(selectedCourse.id)
    } catch (error) {
      console.error('Error saving module:', error)
      alert('Failed to save module')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Are you sure? This will delete all lessons within this module.')) return
    if (!selectedCourse) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from('plant_modules').delete().eq('id', id)
      if (error) throw error
      fetchModules(selectedCourse.id)
    } catch (error) {
      console.error('Error deleting module:', error)
    }
  }

  // Lesson handlers
  const handleCreateLesson = () => {
    setEditingLesson(null)
    setLessonForm({
      slug: '',
      name: '',
      description: '',
      sequence_order: lessons.length + 1,
      content_type: 'video',
      estimated_minutes: 10,
      content_html: '',
      video_url: '',
      is_preview: false
    })
    setIsLessonDialogOpen(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setLessonForm({
      slug: lesson.slug,
      name: lesson.name,
      description: lesson.description || '',
      sequence_order: lesson.sequence_order,
      content_type: lesson.content_type || 'video',
      estimated_minutes: lesson.estimated_minutes || 10,
      content_html: lesson.content_html || '',
      video_url: lesson.video_url || '',
      is_preview: lesson.is_preview
    })
    setIsLessonDialogOpen(true)
  }

  const handleSaveLesson = async () => {
    if (!selectedModule) return
    const supabase = createClient()
    setSaving(true)

    try {
      const lessonData = {
        module_id: selectedModule.id,
        slug: lessonForm.slug || lessonForm.name.toLowerCase().replace(/\s+/g, '-'),
        name: lessonForm.name,
        description: lessonForm.description,
        sequence_order: lessonForm.sequence_order,
        content_type: lessonForm.content_type,
        estimated_minutes: lessonForm.estimated_minutes,
        content_html: lessonForm.content_html,
        video_url: lessonForm.video_url,
        is_preview: lessonForm.is_preview
      }

      if (editingLesson) {
        const { error } = await supabase
          .from('plant_lessons')
          .update(lessonData)
          .eq('id', editingLesson.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('plant_lessons')
          .insert(lessonData)
        if (error) throw error
      }

      setIsLessonDialogOpen(false)
      fetchLessons(selectedModule.id)
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('Failed to save lesson')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    if (!selectedModule) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from('plant_lessons').delete().eq('id', id)
      if (error) throw error
      fetchLessons(selectedModule.id)
    } catch (error) {
      console.error('Error deleting lesson:', error)
    }
  }

  // Learning Path handlers
  const handleCreatePath = () => {
    setEditingPath(null)
    setPathForm({
      slug: '',
      name: '',
      description: '',
      category: 'discipleship',
      difficulty_level: 'beginner',
      required_tier: 'free',
      status: 'draft',
      estimated_hours: 0
    })
    setIsPathDialogOpen(true)
  }

  const handleEditPath = (path: LearningPath) => {
    setEditingPath(path)
    setPathForm({
      slug: path.slug,
      name: path.name,
      description: path.description || '',
      category: path.category || 'discipleship',
      difficulty_level: path.difficulty_level || 'beginner',
      required_tier: path.required_tier || 'free',
      status: path.status || 'draft',
      estimated_hours: path.estimated_hours || 0
    })
    setIsPathDialogOpen(true)
  }

  const handleSavePath = async () => {
    const supabase = createClient()
    setSaving(true)

    try {
      const pathData = {
        slug: pathForm.slug || pathForm.name.toLowerCase().replace(/\s+/g, '-'),
        name: pathForm.name,
        description: pathForm.description,
        category: pathForm.category,
        difficulty_level: pathForm.difficulty_level,
        required_tier: pathForm.required_tier,
        status: pathForm.status,
        estimated_hours: pathForm.estimated_hours,
        published_at: pathForm.status === 'published' ? new Date().toISOString() : null
      }

      if (editingPath) {
        const { error } = await supabase
          .from('plant_learning_paths')
          .update(pathData)
          .eq('id', editingPath.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('plant_learning_paths')
          .insert(pathData)
        if (error) throw error
      }

      setIsPathDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error saving learning path:', error)
      alert('Failed to save learning path')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePath = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning path?')) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from('plant_learning_paths').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting learning path:', error)
    }
  }

  const handleSeedCourses = async () => {
    if (!confirm('This will add 12 starter courses (3 fully built FREE courses + 9 placeholder courses). Continue?')) return

    setSeeding(true)
    try {
      const res = await fetch('/api/admin/seed-courses', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to seed courses')
      }

      alert(`Successfully created ${data.courses?.length || 0} courses!`)
      fetchData()
    } catch (error) {
      console.error('Error seeding courses:', error)
      alert('Failed to seed courses: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSeeding(false)
    }
  }

  const handlePopulateCourses = async () => {
    if (!confirm('This will add full lesson content to "Introduction to the Bible" and "Prayer Foundations" courses. Any existing modules/lessons in these courses will be replaced. Continue?')) return

    setPopulating(true)
    try {
      const res = await fetch('/api/admin/populate-courses', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to populate courses')
      }

      alert('Successfully added lesson content to courses!')
      fetchData()
    } catch (error) {
      console.error('Error populating courses:', error)
      alert('Failed to populate courses: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setPopulating(false)
    }
  }

  const handleCreateQuizzes = async () => {
    if (!confirm('This will create quizzes for the Bible and Prayer courses. Any existing quizzes for these modules will be replaced. Continue?')) return

    setCreatingQuizzes(true)
    try {
      const res = await fetch('/api/admin/populate-quizzes', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create quizzes')
      }

      alert('Successfully created quizzes for courses!')
      fetchData()
    } catch (error) {
      console.error('Error creating quizzes:', error)
      alert('Failed to create quizzes: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setCreatingQuizzes(false)
    }
  }

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPaths = learningPaths.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-600">Published</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'archived':
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'covenant':
        return <Badge className="bg-purple-600">Covenant</Badge>
      case 'partner':
        return <Badge className="bg-gold text-white">Partner</Badge>
      default:
        return <Badge variant="outline">Free</Badge>
    }
  }

  // Render lesson view
  if (selectedModule) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedModule(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modules
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              {selectedModule.name} - Lessons
            </h1>
            <p className="text-muted-foreground">Manage lessons for this module</p>
          </div>
          <Button onClick={handleCreateLesson} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lesson
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Lesson Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{lesson.sequence_order}</TableCell>
                    <TableCell className="font-medium">{lesson.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {lesson.content_type === 'video' && <Video className="h-3 w-3 mr-1" />}
                        {lesson.content_type === 'text' && <FileText className="h-3 w-3 mr-1" />}
                        {lesson.content_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{lesson.estimated_minutes} min</TableCell>
                    <TableCell>
                      {lesson.is_preview ? (
                        <Badge className="bg-blue-600">Preview</Badge>
                      ) : (
                        <Badge variant="secondary">Enrolled Only</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lesson Dialog */}
        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
              <DialogDescription>Configure the lesson details and content</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Lesson Name</Label>
                  <Input
                    value={lessonForm.name}
                    onChange={(e) => setLessonForm({ ...lessonForm, name: e.target.value })}
                    placeholder="Introduction to Prayer"
                  />
                </div>
                <div>
                  <Label>URL Slug</Label>
                  <Input
                    value={lessonForm.slug}
                    onChange={(e) => setLessonForm({ ...lessonForm, slug: e.target.value })}
                    placeholder="intro-to-prayer"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="Brief description of this lesson"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Content Type</Label>
                  <Select value={lessonForm.content_type} onValueChange={(v) => setLessonForm({ ...lessonForm, content_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Text/Article</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={lessonForm.sequence_order}
                    onChange={(e) => setLessonForm({ ...lessonForm, sequence_order: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={lessonForm.estimated_minutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, estimated_minutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {lessonForm.content_type === 'video' && (
                <div>
                  <Label>Video URL</Label>
                  <Input
                    value={lessonForm.video_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div>
                <Label>Content (HTML)</Label>
                <Textarea
                  value={lessonForm.content_html}
                  onChange={(e) => setLessonForm({ ...lessonForm, content_html: e.target.value })}
                  placeholder="<p>Lesson content here...</p>"
                  rows={6}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_preview"
                  checked={lessonForm.is_preview}
                  onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_preview">Allow preview (visible without enrollment)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveLesson} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Lesson'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Render module view
  if (selectedCourse) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <Layers className="h-6 w-6 text-purple-600" />
              {selectedCourse.name} - Modules
            </h1>
            <p className="text-muted-foreground">Manage modules and lessons for this course</p>
          </div>
          <Button onClick={handleCreateModule} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Module
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Module Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell>{module.sequence_order}</TableCell>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => setSelectedModule(module)}
                        className="text-left hover:text-navy hover:underline flex items-center gap-1"
                      >
                        {module.name}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{module.description}</TableCell>
                    <TableCell>
                      {module.has_quiz ? (
                        <Badge className="bg-green-600">Has Quiz</Badge>
                      ) : (
                        <Badge variant="secondary">No Quiz</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedModule(module)}>
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditModule(module)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteModule(module.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Module Dialog */}
        <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Edit Module' : 'Create Module'}</DialogTitle>
              <DialogDescription>Configure the module details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Module Name</Label>
                <Input
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                  placeholder="Getting Started"
                />
              </div>

              <div>
                <Label>URL Slug</Label>
                <Input
                  value={moduleForm.slug}
                  onChange={(e) => setModuleForm({ ...moduleForm, slug: e.target.value })}
                  placeholder="getting-started"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Brief description of this module"
                  rows={3}
                />
              </div>

              <div>
                <Label>Sequence Order</Label>
                <Input
                  type="number"
                  value={moduleForm.sequence_order}
                  onChange={(e) => setModuleForm({ ...moduleForm, sequence_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="has_quiz"
                  checked={moduleForm.has_quiz}
                  onChange={(e) => setModuleForm({ ...moduleForm, has_quiz: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="has_quiz">This module has a quiz</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveModule} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Module'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Main view
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            PLANT Learning Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage courses, modules, lessons, and learning paths</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handlePopulateCourses} disabled={populating} variant="outline" className="gap-2">
            {populating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Adding Content...</>
            ) : (
              <><BookOpen className="h-4 w-4" />Populate Lessons</>
            )}
          </Button>
          <Button onClick={handleCreateQuizzes} disabled={creatingQuizzes} variant="outline" className="gap-2">
            {creatingQuizzes ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Creating Quizzes...</>
            ) : (
              <><HelpCircle className="h-4 w-4" />Add Quizzes</>
            )}
          </Button>
          <Button onClick={handleSeedCourses} disabled={seeding} variant={courses.length === 0 ? "default" : "outline"} className="gap-2">
            {seeding ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Adding Courses...</>
            ) : (
              <><Sparkles className="h-4 w-4" />{courses.length === 0 ? 'Seed Starter Courses' : 'Add Sample Courses'}</>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-navy">{courses.length}</div>
            <p className="text-sm text-muted-foreground">Total Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">
              {courses.filter(c => c.status === 'published').length}
            </div>
            <p className="text-sm text-muted-foreground">Published Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600">{learningPaths.length}</div>
            <p className="text-sm text-muted-foreground">Learning Paths</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">
              {courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Enrollments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="paths" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Learning Paths
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreateCourse} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Modules</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <button
                            onClick={() => setSelectedCourse(course)}
                            className="text-left hover:text-navy hover:underline"
                          >
                            <div className="font-medium">{course.name}</div>
                            <div className="text-xs text-muted-foreground">{course.estimated_hours}h</div>
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.category}</Badge>
                        </TableCell>
                        <TableCell>{getTierBadge(course.required_tier)}</TableCell>
                        <TableCell>{getStatusBadge(course.status)}</TableCell>
                        <TableCell>{course.total_modules}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {course.enrollment_count || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(course)}>
                              <Layers className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditCourse(course)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreatePath} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Learning Path
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Learning Path</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPaths.map((path) => (
                      <TableRow key={path.id}>
                        <TableCell>
                          <div className="font-medium">{path.name}</div>
                          <div className="text-xs text-muted-foreground">{path.estimated_hours}h</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{path.category}</Badge>
                        </TableCell>
                        <TableCell>{getTierBadge(path.required_tier)}</TableCell>
                        <TableCell>{getStatusBadge(path.status)}</TableCell>
                        <TableCell>{path.total_courses || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {path.enrollment_count || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditPath(path)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeletePath(path.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
            <DialogDescription>Configure the course details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Course Name</Label>
                <Input
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder="Introduction to Prayer"
                />
              </div>
              <div>
                <Label>URL Slug</Label>
                <Input
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                  placeholder="intro-to-prayer"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Course description..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Category</Label>
                <Select value={courseForm.category} onValueChange={(v) => setCourseForm({ ...courseForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discipleship">Discipleship</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="prophetic">Prophetic</SelectItem>
                    <SelectItem value="ministry">Ministry</SelectItem>
                    <SelectItem value="bible-study">Bible Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={courseForm.difficulty_level} onValueChange={(v) => setCourseForm({ ...courseForm, difficulty_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Est. Hours</Label>
                <Input
                  type="number"
                  value={courseForm.estimated_hours}
                  onChange={(e) => setCourseForm({ ...courseForm, estimated_hours: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Ministry</Label>
                <Select value={courseForm.ministry_id} onValueChange={(v) => setCourseForm({ ...courseForm, ministry_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tpc">TPC Ministries</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Required Tier</Label>
                <Select value={courseForm.required_tier} onValueChange={(v) => setCourseForm({ ...courseForm, required_tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="covenant">Covenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={courseForm.status} onValueChange={(v) => setCourseForm({ ...courseForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="has_certificate"
                checked={courseForm.has_certificate}
                onChange={(e) => setCourseForm({ ...courseForm, has_certificate: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="has_certificate">Issue certificate upon completion</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCourseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCourse} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Learning Path Dialog */}
      <Dialog open={isPathDialogOpen} onOpenChange={setIsPathDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPath ? 'Edit Learning Path' : 'Create Learning Path'}</DialogTitle>
            <DialogDescription>Configure the learning path details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Path Name</Label>
                <Input
                  value={pathForm.name}
                  onChange={(e) => setPathForm({ ...pathForm, name: e.target.value })}
                  placeholder="Foundations of Faith"
                />
              </div>
              <div>
                <Label>URL Slug</Label>
                <Input
                  value={pathForm.slug}
                  onChange={(e) => setPathForm({ ...pathForm, slug: e.target.value })}
                  placeholder="foundations-of-faith"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={pathForm.description}
                onChange={(e) => setPathForm({ ...pathForm, description: e.target.value })}
                placeholder="Learning path description..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Category</Label>
                <Select value={pathForm.category} onValueChange={(v) => setPathForm({ ...pathForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discipleship">Discipleship</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="prophetic">Prophetic</SelectItem>
                    <SelectItem value="ministry">Ministry</SelectItem>
                    <SelectItem value="bible-study">Bible Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={pathForm.difficulty_level} onValueChange={(v) => setPathForm({ ...pathForm, difficulty_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Est. Hours</Label>
                <Input
                  type="number"
                  value={pathForm.estimated_hours}
                  onChange={(e) => setPathForm({ ...pathForm, estimated_hours: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Required Tier</Label>
                <Select value={pathForm.required_tier} onValueChange={(v) => setPathForm({ ...pathForm, required_tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="covenant">Covenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={pathForm.status} onValueChange={(v) => setPathForm({ ...pathForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPathDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePath} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Learning Path'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
