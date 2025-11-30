'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle,
  XCircle,
  Star,
  Eye,
  Trash2,
  Clock,
  Sparkles,
  Filter
} from 'lucide-react'

interface Testimony {
  id: string
  title: string
  content: string
  category: string
  is_anonymous: boolean
  is_approved: boolean
  is_featured: boolean
  likes_count: number
  comments_count: number
  created_at: string
  member?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function AdminTestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [selectedTestimony, setSelectedTestimony] = useState<Testimony | null>(null)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    featured: 0,
    total: 0
  })

  useEffect(() => {
    fetchTestimonies()
    fetchStats()
  }, [filter])

  const fetchStats = async () => {
    const supabase = createClient()

    const [pending, approved, featured, total] = await Promise.all([
      supabase.from('testimonies').select('*', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('testimonies').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('testimonies').select('*', { count: 'exact', head: true }).eq('is_featured', true),
      supabase.from('testimonies').select('*', { count: 'exact', head: true })
    ])

    setStats({
      pending: pending.count || 0,
      approved: approved.count || 0,
      featured: featured.count || 0,
      total: total.count || 0
    })
  }

  const fetchTestimonies = async () => {
    const supabase = createClient()
    setLoading(true)

    let query = supabase
      .from('testimonies')
      .select(`
        *,
        member:members(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })

    if (filter === 'pending') {
      query = query.eq('is_approved', false)
    } else if (filter === 'approved') {
      query = query.eq('is_approved', true)
    }

    const { data, error } = await query

    if (!error && data) {
      setTestimonies(data)
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      await supabase
        .from('testimonies')
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: member?.id
        })
        .eq('id', id)

      fetchTestimonies()
      fetchStats()
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimony?')) return

    const supabase = createClient()
    await supabase.from('testimonies').delete().eq('id', id)

    fetchTestimonies()
    fetchStats()
    setSelectedTestimony(null)
  }

  const handleFeature = async (id: string, featured: boolean) => {
    const supabase = createClient()
    await supabase.from('testimonies').update({ is_featured: featured }).eq('id', id)

    fetchTestimonies()
    fetchStats()
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      healing: 'Healing',
      provision: 'Provision',
      breakthrough: 'Breakthrough',
      salvation: 'Salvation',
      deliverance: 'Deliverance',
      answered_prayer: 'Answered Prayer',
      other: 'Other'
    }
    return labels[category] || category
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-gold" />
            Testimonies Management
          </h1>
          <p className="text-gray-500">Review and manage member testimonies</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('pending')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('approved')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Featured</p>
                <p className="text-2xl font-bold text-gold">{stats.featured}</p>
              </div>
              <Star className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-navy">{stats.total}</p>
              </div>
              <Sparkles className="h-8 w-8 text-navy" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          className={filter === 'pending' ? 'bg-navy' : ''}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending ({stats.pending})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
          className={filter === 'approved' ? 'bg-navy' : ''}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approved ({stats.approved})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-navy' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          All ({stats.total})
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Testimonies List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {filter === 'pending' ? 'Pending Review' : filter === 'approved' ? 'Approved Testimonies' : 'All Testimonies'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
              </div>
            ) : testimonies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No testimonies found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Testimony</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonies.map(testimony => (
                    <TableRow
                      key={testimony.id}
                      className={`cursor-pointer ${selectedTestimony?.id === testimony.id ? 'bg-navy/5' : ''}`}
                      onClick={() => setSelectedTestimony(testimony)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-navy">{testimony.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {testimony.content.substring(0, 60)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {testimony.is_anonymous ? (
                          <span className="text-gray-500 italic">Anonymous</span>
                        ) : (
                          <div>
                            <p className="text-sm">{testimony.member?.first_name} {testimony.member?.last_name}</p>
                            <p className="text-xs text-gray-500">{testimony.member?.email}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(testimony.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {testimony.is_approved ? (
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                          )}
                          {testimony.is_featured && (
                            <Star className="h-4 w-4 text-gold fill-gold" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTestimony(testimony)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!testimony.is_approved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(testimony.id)
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(testimony.id)
                            }}
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

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTestimony ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-semibold text-navy">{selectedTestimony.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <Badge variant="outline">{getCategoryLabel(selectedTestimony.category)}</Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Member</p>
                  <p>
                    {selectedTestimony.is_anonymous
                      ? 'Anonymous'
                      : `${selectedTestimony.member?.first_name} ${selectedTestimony.member?.last_name}`
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p>{new Date(selectedTestimony.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Content</p>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedTestimony.content}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{selectedTestimony.likes_count} likes</span>
                  <span>•</span>
                  <span>{selectedTestimony.comments_count} comments</span>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t">
                  {!selectedTestimony.is_approved && (
                    <Button
                      onClick={() => handleApprove(selectedTestimony.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Testimony
                    </Button>
                  )}

                  {selectedTestimony.is_approved && (
                    <Button
                      variant={selectedTestimony.is_featured ? 'outline' : 'default'}
                      onClick={() => handleFeature(selectedTestimony.id, !selectedTestimony.is_featured)}
                      className={!selectedTestimony.is_featured ? 'bg-gold hover:bg-gold/90 text-navy' : ''}
                    >
                      <Star className={`h-4 w-4 mr-2 ${selectedTestimony.is_featured ? 'fill-gold text-gold' : ''}`} />
                      {selectedTestimony.is_featured ? 'Remove from Featured' : 'Feature Testimony'}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleReject(selectedTestimony.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Testimony
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a testimony to preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
