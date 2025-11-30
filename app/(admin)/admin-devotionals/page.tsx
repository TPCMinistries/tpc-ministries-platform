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
  Sun,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  BookOpen,
  Search,
  Eye,
  EyeOff
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Devotional {
  id: string
  date: string
  title: string
  scripture_reference: string
  scripture_text: string
  content: string
  prayer: string
  reflection_questions: string[]
  author: string
  series: string
  is_published: boolean
  created_at: string
}

export default function AdminDevotionalsPage() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDevotional, setEditingDevotional] = useState<Devotional | null>(null)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    scripture_reference: '',
    scripture_text: '',
    content: '',
    prayer: '',
    reflection_questions: '',
    author: 'TPC Ministries',
    series: 'Streams of Grace',
    is_published: true
  })

  useEffect(() => {
    fetchDevotionals()
  }, [])

  const fetchDevotionals = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error
      setDevotionals(data || [])
    } catch (error) {
      console.error('Error fetching devotionals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingDevotional(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      scripture_reference: '',
      scripture_text: '',
      content: '',
      prayer: '',
      reflection_questions: '',
      author: 'TPC Ministries',
      series: 'Streams of Grace',
      is_published: true
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (devotional: Devotional) => {
    setEditingDevotional(devotional)
    setFormData({
      date: devotional.date,
      title: devotional.title,
      scripture_reference: devotional.scripture_reference,
      scripture_text: devotional.scripture_text,
      content: devotional.content,
      prayer: devotional.prayer || '',
      reflection_questions: devotional.reflection_questions?.join('\n') || '',
      author: devotional.author,
      series: devotional.series,
      is_published: devotional.is_published
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    const supabase = createClient()
    setSaving(true)

    try {
      const devotionalData = {
        date: formData.date,
        title: formData.title,
        scripture_reference: formData.scripture_reference,
        scripture_text: formData.scripture_text,
        content: formData.content,
        prayer: formData.prayer,
        reflection_questions: formData.reflection_questions
          .split('\n')
          .map(q => q.trim())
          .filter(q => q),
        author: formData.author,
        series: formData.series,
        is_published: formData.is_published
      }

      if (editingDevotional) {
        const { error } = await supabase
          .from('devotionals')
          .update(devotionalData)
          .eq('id', editingDevotional.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('devotionals')
          .insert(devotionalData)

        if (error) throw error
      }

      setIsDialogOpen(false)
      fetchDevotionals()
    } catch (error) {
      console.error('Error saving devotional:', error)
      alert('Failed to save devotional')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this devotional?')) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('devotionals')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchDevotionals()
    } catch (error) {
      console.error('Error deleting devotional:', error)
    }
  }

  const togglePublished = async (devotional: Devotional) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('devotionals')
        .update({ is_published: !devotional.is_published })
        .eq('id', devotional.id)

      if (error) throw error
      fetchDevotionals()
    } catch (error) {
      console.error('Error toggling published:', error)
    }
  }

  const filteredDevotionals = devotionals.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.scripture_reference.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
            <Sun className="h-8 w-8 text-amber-500" />
            Devotionals Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage daily devotionals</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Devotional
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-navy">{devotionals.length}</div>
            <p className="text-sm text-muted-foreground">Total Devotionals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">
              {devotionals.filter(d => d.is_published).length}
            </div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">
              {devotionals.filter(d => new Date(d.date) >= new Date()).length}
            </div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devotionals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Scripture</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevotionals.map((devotional) => (
                  <TableRow key={devotional.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(devotional.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{devotional.title}</TableCell>
                    <TableCell>{devotional.scripture_reference}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{devotional.series}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={devotional.is_published ? 'default' : 'secondary'}>
                        {devotional.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublished(devotional)}
                        >
                          {devotional.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(devotional)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(devotional.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDevotional ? 'Edit Devotional' : 'Create Devotional'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for this devotional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Series</Label>
                <Input
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  placeholder="Streams of Grace"
                />
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Walking in Divine Purpose"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Scripture Reference</Label>
                <Input
                  value={formData.scripture_reference}
                  onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
                  placeholder="Jeremiah 29:11"
                />
              </div>
              <div>
                <Label>Author</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="TPC Ministries"
                />
              </div>
            </div>

            <div>
              <Label>Scripture Text</Label>
              <Textarea
                value={formData.scripture_text}
                onChange={(e) => setFormData({ ...formData, scripture_text: e.target.value })}
                placeholder="For I know the plans I have for you..."
                rows={3}
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Main devotional content..."
                rows={8}
              />
            </div>

            <div>
              <Label>Prayer</Label>
              <Textarea
                value={formData.prayer}
                onChange={(e) => setFormData({ ...formData, prayer: e.target.value })}
                placeholder="Closing prayer..."
                rows={4}
              />
            </div>

            <div>
              <Label>Reflection Questions (one per line)</Label>
              <Textarea
                value={formData.reflection_questions}
                onChange={(e) => setFormData({ ...formData, reflection_questions: e.target.value })}
                placeholder="What is God teaching you today?&#10;How can you apply this to your life?"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_published">Publish immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Devotional'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
