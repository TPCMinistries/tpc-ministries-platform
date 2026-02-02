'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Heart, Share2, Copy, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatVerseText } from '@/lib/bible-api'

interface VerseCardProps {
  reference: string
  text: string
  translation?: string
  variant?: 'default' | 'compact' | 'featured' | 'prayer'
  onSave?: () => void
  onShare?: () => void
  onRefresh?: () => void
  loading?: boolean
  saved?: boolean
  className?: string
}

export default function VerseCard({
  reference,
  text,
  translation = 'WEB',
  variant = 'default',
  onSave,
  onShare,
  onRefresh,
  loading = false,
  saved = false,
  className = ''
}: VerseCardProps) {
  const [copied, setCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(saved)

  const formattedText = formatVerseText(text)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`"${formattedText}" - ${reference}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setIsSaved(true)
    onSave?.()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reference,
        text: `"${formattedText}" - ${reference}`,
      }).catch(() => {})
    } else {
      handleCopy()
    }
    onShare?.()
  }

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="w-32 h-5 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="w-full h-4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="w-3/4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Compact variant for prayer wall
  if (variant === 'compact') {
    return (
      <div className={cn(
        'bg-tpc-navy/5 dark:bg-tpc-navy/20 rounded-lg p-3 border-l-4 border-l-tpc-gold',
        className
      )}>
        <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
          "{formattedText}"
        </p>
        <p className="text-xs text-tpc-gold font-semibold mt-2">— {reference}</p>
      </div>
    )
  }

  // Prayer variant - subtle, scripture suggestion
  if (variant === 'prayer') {
    return (
      <div className={cn(
        'bg-gradient-to-r from-tpc-gold/10 to-transparent rounded-lg p-4',
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-tpc-gold/20 flex-shrink-0">
            <BookOpen className="h-4 w-4 text-tpc-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-tpc-gold font-medium mb-1">Scripture for this prayer</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "{formattedText}"
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">— {reference}</p>
          </div>
        </div>
      </div>
    )
  }

  // Featured variant - Verse of the Day
  if (variant === 'featured') {
    return (
      <Card className={cn(
        'bg-gradient-to-br from-tpc-navy to-tpc-navy/95 text-white overflow-hidden relative',
        className
      )}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-tpc-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-tpc-gold/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-tpc-gold/20">
                <BookOpen className="h-5 w-5 text-tpc-gold" />
              </div>
              <span className="text-sm font-medium text-tpc-gold">Verse of the Day</span>
            </div>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>

          <blockquote className="text-lg font-serif leading-relaxed mb-4">
            "{formattedText}"
          </blockquote>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-tpc-gold font-semibold">{reference}</p>
              <p className="text-xs text-white/50">{translation}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {onSave && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className={cn(
                    'hover:bg-white/10',
                    isSaved ? 'text-red-400' : 'text-white/70 hover:text-white'
                  )}
                >
                  <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn('bg-white dark:bg-gray-800', className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-tpc-navy/10 dark:bg-tpc-navy/30">
            <BookOpen className="h-5 w-5 text-tpc-navy dark:text-tpc-gold" />
          </div>
          <span className="text-sm font-medium text-tpc-navy dark:text-white">{reference}</span>
        </div>

        <blockquote className="text-gray-700 dark:text-gray-300 font-serif text-lg leading-relaxed mb-4 italic">
          "{formattedText}"
        </blockquote>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">{translation}</span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-gray-500 hover:text-tpc-navy dark:hover:text-tpc-gold"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={cn(
                  isSaved ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                )}
              >
                <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-tpc-navy dark:hover:text-tpc-gold"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
