'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Brain,
  Sparkles,
  BookOpen,
  MessageSquare,
  Settings,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ScrollText,
  Heart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AIConfig {
  id: string
  config_key: string
  config_value: string
  config_type: string
  description: string
}

interface KnowledgeItem {
  id: string
  category: string
  title: string
  content: string
  scripture_references: string[]
  tags: string[]
  priority: number
  is_active: boolean
}

interface ResponseFeedback {
  id: string
  rating: number
  feedback_type: string
  feedback_text: string
  admin_reviewed: boolean
  created_at: string
  member_name?: string
  message_preview?: string
}

export default function AdminAITrainingPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [feedback, setFeedback] = useState<ResponseFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [isKnowledgeDialogOpen, setIsKnowledgeDialogOpen] = useState(false)
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeItem | null>(null)

  // Form states
  const [knowledgeForm, setKnowledgeForm] = useState({
    category: 'teaching',
    title: '',
    content: '',
    scripture_references: '',
    tags: '',
    priority: 5,
    is_active: true
  })

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchData = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const [configRes, knowledgeRes, feedbackRes] = await Promise.all([
        supabase.from('ai_config').select('*').order('config_key'),
        supabase.from('ai_knowledge_base').select('*').order('priority', { ascending: false }),
        supabase.from('ai_response_feedback').select('*').order('created_at', { ascending: false }).limit(50)
      ])

      if (configRes.data) setConfigs(configRes.data)
      if (knowledgeRes.data) setKnowledge(knowledgeRes.data)
      if (feedbackRes.data) setFeedback(feedbackRes.data)
    } catch (error) {
      console.error('Error fetching AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async (key: string, value: string) => {
    const supabase = createClient()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('ai_config')
        .update({ config_value: value, updated_at: new Date().toISOString() })
        .eq('config_key', key)

      if (error) throw error
      setNotification({ type: 'success', message: 'Configuration saved!' })
      fetchData()
    } catch (error) {
      console.error('Error saving config:', error)
      setNotification({ type: 'error', message: 'Failed to save configuration' })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateKnowledge = () => {
    setEditingKnowledge(null)
    setKnowledgeForm({
      category: 'teaching',
      title: '',
      content: '',
      scripture_references: '',
      tags: '',
      priority: 5,
      is_active: true
    })
    setIsKnowledgeDialogOpen(true)
  }

  const handleEditKnowledge = (item: KnowledgeItem) => {
    setEditingKnowledge(item)
    setKnowledgeForm({
      category: item.category,
      title: item.title,
      content: item.content,
      scripture_references: item.scripture_references?.join(', ') || '',
      tags: item.tags?.join(', ') || '',
      priority: item.priority,
      is_active: item.is_active
    })
    setIsKnowledgeDialogOpen(true)
  }

  const handleSaveKnowledge = async () => {
    const supabase = createClient()
    setSaving(true)

    try {
      const data = {
        category: knowledgeForm.category,
        title: knowledgeForm.title,
        content: knowledgeForm.content,
        scripture_references: knowledgeForm.scripture_references
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
        tags: knowledgeForm.tags
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(t => t),
        priority: knowledgeForm.priority,
        is_active: knowledgeForm.is_active
      }

      if (editingKnowledge) {
        const { error } = await supabase
          .from('ai_knowledge_base')
          .update(data)
          .eq('id', editingKnowledge.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ai_knowledge_base')
          .insert(data)
        if (error) throw error
      }

      setIsKnowledgeDialogOpen(false)
      setNotification({ type: 'success', message: 'Knowledge saved!' })
      fetchData()
    } catch (error) {
      console.error('Error saving knowledge:', error)
      setNotification({ type: 'error', message: 'Failed to save knowledge' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge item?')) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from('ai_knowledge_base').delete().eq('id', id)
      if (error) throw error
      setNotification({ type: 'success', message: 'Knowledge deleted!' })
      fetchData()
    } catch (error) {
      console.error('Error deleting knowledge:', error)
    }
  }

  const filteredKnowledge = knowledge.filter(k =>
    k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.tags?.some(t => t.includes(searchQuery.toLowerCase()))
  )

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'teaching': return <BookOpen className="h-4 w-4" />
      case 'scripture': return <ScrollText className="h-4 w-4" />
      case 'prayer_guide': return <Heart className="h-4 w-4" />
      case 'faq': return <MessageSquare className="h-4 w-4" />
      case 'prophecy_principle': return <Sparkles className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'teaching': return 'Teaching'
      case 'scripture': return 'Scripture'
      case 'prayer_guide': return 'Prayer Guide'
      case 'faq': return 'FAQ'
      case 'prophecy_principle': return 'Prophetic Principle'
      case 'ministry_info': return 'Ministry Info'
      case 'sermon': return 'Sermon'
      default: return category
    }
  }

  const getConfigLabel = (key: string) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="p-8 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          AI Training Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure Prophet Lorenzo AI's personality, knowledge base, and responses
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-navy" />
              <span className="text-sm text-muted-foreground">Configurations</span>
            </div>
            <div className="text-3xl font-bold mt-2">{configs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Knowledge Items</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mt-2">{knowledge.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Feedback Items</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{feedback.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <span className="text-sm text-muted-foreground">Active Knowledge</span>
            </div>
            <div className="text-3xl font-bold text-gold mt-2">
              {knowledge.filter(k => k.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personality">
        <TabsList>
          <TabsTrigger value="personality" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Personality
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Personality & Settings</CardTitle>
              <CardDescription>
                Configure how Prophet Lorenzo AI thinks, speaks, and interacts with members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                configs.map((config) => (
                  <div key={config.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">{getConfigLabel(config.config_key)}</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveConfig(config.config_key, config.config_value)}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                    {config.description && (
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    )}
                    <Textarea
                      value={config.config_value}
                      onChange={(e) => {
                        setConfigs(prev =>
                          prev.map(c =>
                            c.id === config.id ? { ...c, config_value: e.target.value } : c
                          )
                        )
                      }}
                      rows={config.config_value.length > 100 ? 4 : 2}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreateKnowledge} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Knowledge
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Teachings, FAQs, and information the AI uses to answer questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKnowledge.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            {getCategoryLabel(item.category)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.content.substring(0, 80)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap max-w-[150px]">
                            {item.tags?.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.priority >= 8 ? 'default' : 'secondary'}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.is_active ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditKnowledge(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteKnowledge(item.id)}
                            >
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

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Feedback</CardTitle>
              <CardDescription>
                Review member feedback on AI responses to improve quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No feedback received yet. Members can rate AI responses to help improve quality.
                </p>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.rating >= 4 ? 'default' : item.rating >= 3 ? 'secondary' : 'destructive'}>
                              {item.rating}/5 Stars
                            </Badge>
                            <Badge variant="outline">{item.feedback_type}</Badge>
                          </div>
                          {item.feedback_text && (
                            <p className="mt-2 text-sm">{item.feedback_text}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Knowledge Dialog */}
      <Dialog open={isKnowledgeDialogOpen} onOpenChange={setIsKnowledgeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingKnowledge ? 'Edit Knowledge' : 'Add Knowledge'}</DialogTitle>
            <DialogDescription>
              Add information the AI will use when answering member questions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select
                  value={knowledgeForm.category}
                  onValueChange={(v) => setKnowledgeForm({ ...knowledgeForm, category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="scripture">Scripture Reference</SelectItem>
                    <SelectItem value="prayer_guide">Prayer Guide</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="prophecy_principle">Prophetic Principle</SelectItem>
                    <SelectItem value="ministry_info">Ministry Info</SelectItem>
                    <SelectItem value="sermon">Sermon/Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={knowledgeForm.priority}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, priority: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={knowledgeForm.title}
                onChange={(e) => setKnowledgeForm({ ...knowledgeForm, title: e.target.value })}
                placeholder="How to Hear God's Voice"
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={knowledgeForm.content}
                onChange={(e) => setKnowledgeForm({ ...knowledgeForm, content: e.target.value })}
                placeholder="The full teaching or information the AI should know..."
                rows={8}
              />
            </div>

            <div>
              <Label>Scripture References (comma-separated)</Label>
              <Input
                value={knowledgeForm.scripture_references}
                onChange={(e) => setKnowledgeForm({ ...knowledgeForm, scripture_references: e.target.value })}
                placeholder="John 10:27, 1 Kings 19:12, Acts 2:17"
              />
            </div>

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={knowledgeForm.tags}
                onChange={(e) => setKnowledgeForm({ ...knowledgeForm, tags: e.target.value })}
                placeholder="hearing god, prophetic, spiritual growth"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={knowledgeForm.is_active}
                onChange={(e) => setKnowledgeForm({ ...knowledgeForm, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Active (AI will use this knowledge)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKnowledgeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveKnowledge} disabled={saving}>
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                'Save Knowledge'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
