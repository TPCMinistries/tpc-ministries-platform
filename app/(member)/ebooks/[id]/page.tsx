'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  FileText,
  File,
  Download,
  Lock,
  ArrowLeft,
  Loader2,
  Crown,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import Link from 'next/link'

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

export default function EbookViewPage() {
  const params = useParams()
  const router = useRouter()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [requiredTier, setRequiredTier] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    fetchResource()
  }, [params.id])

  const fetchResource = async () => {
    try {
      const response = await fetch(`/api/resources/${params.id}`)
      const result = await response.json()

      if (response.ok) {
        setResource(result.data)
        setRequiredTier(result.required_tier || null)
      } else if (response.status === 404) {
        router.push('/ebooks')
      }
    } catch (error) {
      console.error('Error fetching resource:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <BookOpen className="h-6 w-6" />
      case 'guide':
      case 'worksheet':
        return <FileText className="h-6 w-6" />
      default:
        return <File className="h-6 w-6" />
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

  const isPDF = (url: string) => {
    return url.toLowerCase().endsWith('.pdf')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Resource not found</p>
        <Link href="/ebooks">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ebooks
          </Button>
        </Link>
      </div>
    )
  }

  // No access - show upgrade prompt
  if (!resource.has_access) {
    return (
      <div className="p-4 lg:p-8">
        <Link href="/ebooks" className="inline-flex items-center text-sm text-gray-600 hover:text-navy mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ebooks
        </Link>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gold/20 flex items-center justify-center">
              <Lock className="h-8 w-8 text-gold" />
            </div>
            <CardTitle className="text-2xl">{resource.title}</CardTitle>
            {resource.author && (
              <CardDescription className="text-base">{resource.author}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {resource.description && (
              <p className="text-gray-600">{resource.description}</p>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <Crown className="h-8 w-8 text-gold mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">
                {getTierLabel(requiredTier || resource.tier_required)} Content
              </h3>
              <p className="text-gray-600 mb-4">
                This resource is available exclusively for {getTierLabel(requiredTier || resource.tier_required)} members.
                Upgrade your membership to access this and other exclusive content.
              </p>
              <Link href="/partner">
                <Button className="bg-gold hover:bg-gold-dark text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to {getTierLabel(requiredTier || resource.tier_required)}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Has access - show content
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'p-4 lg:p-8'}`}>
      {!isFullscreen && (
        <>
          <Link href="/ebooks" className="inline-flex items-center text-sm text-gray-600 hover:text-navy mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ebooks
          </Link>

          {/* Resource Info */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(resource.type)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-navy">{resource.title}</h1>
                  {resource.author && (
                    <p className="text-gray-600 mt-1">{resource.author}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{resource.type}</Badge>
                    {resource.category && (
                      <Badge variant="outline">{resource.category}</Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {resource.download_count} downloads
                    </span>
                  </div>
                </div>
              </div>
              {resource.description && (
                <p className="text-gray-600 mt-4">{resource.description}</p>
              )}
            </div>

            <div className="flex gap-2 lg:flex-col">
              {resource.file_url && (
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer" download>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              )}
              {resource.file_url && (
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </a>
              )}
            </div>
          </div>
        </>
      )}

      {/* PDF Viewer */}
      {resource.file_url && isPDF(resource.file_url) && (
        <Card className={isFullscreen ? 'h-full rounded-none border-0' : ''}>
          <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
            <CardTitle className="text-lg">Document Viewer</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className={`p-0 ${isFullscreen ? 'h-[calc(100%-60px)]' : ''}`}>
            <iframe
              src={`${resource.file_url}#toolbar=1&navpanes=1`}
              className={`w-full ${isFullscreen ? 'h-full' : 'h-[70vh]'}`}
              title={resource.title}
            />
          </CardContent>
        </Card>
      )}

      {/* Non-PDF files - just show download */}
      {resource.file_url && !isPDF(resource.file_url) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {getTypeIcon(resource.type)}
            <p className="text-gray-600 mt-4 mb-4">
              This file type cannot be previewed in the browser.
            </p>
            <a href={resource.file_url} target="_blank" rel="noopener noreferrer" download>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
