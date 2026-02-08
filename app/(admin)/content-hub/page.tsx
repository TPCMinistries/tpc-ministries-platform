'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus, Search, Loader2, PenSquare, Edit2, Trash2,
  MoreVertical, Video, BookOpen, Sparkles, FileDown, Calendar,
  Eye, EyeOff, ChevronDown,
} from 'lucide-react'
import { CONTENT_TYPES } from '@/lib/content/content-types'
import { useToast } from '@/hooks/use-toast'

const iconMap: Record<string, any> = {
  Video, BookOpen, Sparkles, FileDown, Calendar,
}

interface ContentItem {
  id: string
  _type: string
  _title?: string
  created_at: string
  updated_at?: string
  [key: string]: any
}

export default function ContentHubPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchContent()
  }, [activeType, page])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeType !== 'all') params.set('type', activeType)
      if (search) params.set('search', search)
      params.set('page', page.toString())

      const res = await fetch(`/api/admin/content-hub?${params}`)
      const json = await res.json()

      setContent(json.data || [])
      setTotalPages(json.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchContent()
  }

  const handleDelete = async (item: ContentItem) => {
    const type = item._type
    const config = CONTENT_TYPES.find(t => t.id === type)
    const title = item._title || item[config?.titleField || 'title'] || 'this item'
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/content-hub/${item.id}?type=${type}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Deleted', description: `${config?.label || 'Content'} deleted` })
        fetchContent()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const getTitle = (item: ContentItem) => {
    if (item._title) return item._title
    const config = CONTENT_TYPES.find(t => t.id === item._type)
    return item[config?.titleField || 'title'] || 'Untitled'
  }

  const getTypeConfig = (typeId: string) => CONTENT_TYPES.find(t => t.id === typeId)

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName]
    return Icon ? <Icon className="h-4 w-4" /> : <PenSquare className="h-4 w-4" />
  }

  const getStatus = (item: ContentItem) => {
    const config = getTypeConfig(item._type)
    if (!config?.statusField) return null
    const val = item[config.statusField]
    if (typeof val === 'boolean') return val ? 'Published' : 'Draft'
    return val || null
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <PenSquare className="h-8 w-8 text-navy" />
              <h1 className="text-4xl font-bold text-navy">Content Hub</h1>
            </div>
            <p className="text-gray-600">Create and manage all content from one place</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-navy hover:bg-navy/90">
                <Plus className="mr-2 h-4 w-4" />
                Create New
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {CONTENT_TYPES.map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => router.push(`/content-hub/create?type=${type.id}`)}
                  className="gap-2"
                >
                  {getIcon(type.icon)}
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          {CONTENT_TYPES.map((type) => {
            const count = activeType === 'all'
              ? content.filter(c => c._type === type.id).length
              : activeType === type.id ? content.length : 0
            return (
              <Card key={type.id} className="cursor-pointer hover:border-navy/50 transition-colors"
                onClick={() => setActiveType(type.id)}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    {getIcon(type.icon)}
                    <span className="text-sm font-medium text-gray-600">{type.pluralLabel}</span>
                  </div>
                  <p className="text-2xl font-bold text-navy">{count}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Type Tabs */}
        <Tabs value={activeType} onValueChange={(v) => { setActiveType(v); setPage(1) }} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            {CONTENT_TYPES.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="gap-1.5">
                {getIcon(type.icon)}
                {type.pluralLabel}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navy">
              {activeType === 'all' ? 'Recent Content' : getTypeConfig(activeType)?.pluralLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : content.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <PenSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No content found</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push('/content-hub/create')}
                >
                  Create your first piece
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {content.map((item) => {
                  const config = getTypeConfig(item._type)
                  const status = getStatus(item)

                  return (
                    <div
                      key={`${item._type}-${item.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:border-navy/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0">
                        {config ? getIcon(config.icon) : <PenSquare className="h-4 w-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-navy truncate">{getTitle(item)}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>{config?.label}</span>
                          <span>&middot;</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {status && (
                        <Badge
                          variant="outline"
                          className={
                            status === 'Published' || status === 'published'
                              ? 'text-green-600 border-green-200 bg-green-50'
                              : 'text-gray-600 border-gray-200 bg-gray-50'
                          }
                        >
                          {status === 'Published' || status === 'published' ? (
                            <Eye className="h-3 w-3 mr-1" />
                          ) : (
                            <EyeOff className="h-3 w-3 mr-1" />
                          )}
                          {status}
                        </Badge>
                      )}

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/content-hub/edit/${item.id}?type=${item._type}`)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/content-hub/edit/${item.id}?type=${item._type}`)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
