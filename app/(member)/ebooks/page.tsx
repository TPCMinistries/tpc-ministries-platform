'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  FileText,
  File,
  Search,
  Download,
  Lock,
  ExternalLink,
  Loader2,
  Crown,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Resource {
  id: string
  title: string
  description?: string
  type: 'ebook' | 'guide' | 'worksheet' | 'document' | 'other'
  file_url: string | null
  thumbnail_url?: string
  category?: string
  tier_required: 'free' | 'partner' | 'covenant'
  download_count: number
  author?: string
  has_access: boolean
  created_at: string
}

export default function EbooksPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [memberTier, setMemberTier] = useState('free')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchResources()
  }, [typeFilter])

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/resources?${params}`)
      const result = await response.json()

      if (response.ok) {
        setResources(result.data || [])
        setMemberTier(result.member_tier || 'free')
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchResources()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <BookOpen className="h-5 w-5" />
      case 'guide':
      case 'worksheet':
        return <FileText className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ebook':
        return 'bg-purple-100 text-purple-700'
      case 'guide':
        return 'bg-blue-100 text-blue-700'
      case 'worksheet':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'Free'
      case 'partner':
        return 'Partner'
      case 'covenant':
        return 'Covenant'
      default:
        return tier
    }
  }

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.author?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy">Ebooks & Resources</h1>
        <p className="text-gray-600 mt-1">Download guides, ebooks, and resources to grow your faith</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ebook">Ebooks</SelectItem>
            <SelectItem value="guide">Guides</SelectItem>
            <SelectItem value="worksheet">Worksheets</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-600">No resources found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card
              key={resource.id}
              className={`overflow-hidden transition-shadow hover:shadow-lg ${
                !resource.has_access ? 'opacity-90' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[3/2] bg-gradient-to-br from-navy/10 to-gold/10">
                {resource.thumbnail_url ? (
                  <Image
                    src={resource.thumbnail_url}
                    alt={resource.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-white/80 p-6">
                      {getTypeIcon(resource.type)}
                    </div>
                  </div>
                )}
                {!resource.has_access && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-navy" />
                      <span className="text-sm font-medium">
                        {getTierLabel(resource.tier_required)} Only
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className={getTypeColor(resource.type)}>
                    {resource.type}
                  </Badge>
                </div>
                {resource.tier_required !== 'free' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gold text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      {getTierLabel(resource.tier_required)}
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                {resource.author && (
                  <CardDescription>{resource.author}</CardDescription>
                )}
              </CardHeader>

              <CardContent>
                {resource.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Download className="h-4 w-4" />
                    <span>{resource.download_count} downloads</span>
                  </div>

                  {resource.has_access ? (
                    <Link href={`/ebooks/${resource.id}`}>
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/partner">
                      <Button size="sm" variant="outline">
                        <Lock className="h-4 w-4 mr-2" />
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade Banner for Free Users */}
      {memberTier === 'free' && (
        <Card className="bg-gradient-to-r from-navy to-navy-800 text-white">
          <CardContent className="flex flex-col md:flex-row items-center justify-between py-6 gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Unlock All Resources</h3>
              <p className="text-blue-100">
                Become a Partner to access exclusive ebooks, guides, and teaching materials.
              </p>
            </div>
            <Link href="/partner">
              <Button className="bg-gold hover:bg-gold-dark text-white">
                <Crown className="h-4 w-4 mr-2" />
                Become a Partner
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
