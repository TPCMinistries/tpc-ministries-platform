'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  Send,
  ArrowLeft,
  BookOpen,
  Plus,
  Users,
  Filter
} from 'lucide-react'
import VerseCard from '@/components/VerseCard'
import { getVerseByCategory, formatVerseText } from '@/lib/bible-api'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface PrayerRequest {
  id: string
  member_id: string
  request_text: string
  category: string
  is_anonymous: boolean
  prayer_count: number
  created_at: string
  member?: {
    first_name: string
    last_name: string
  }
}

interface CategoryVerse {
  category: string
  reference: string
  text: string
}

const PRAYER_CATEGORIES = [
  { value: 'health', label: 'Health & Healing', icon: '🏥' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'financial', label: 'Financial', icon: '💰' },
  { value: 'spiritual', label: 'Spiritual Growth', icon: '✨' },
  { value: 'guidance', label: 'Guidance', icon: '🧭' },
  { value: 'comfort', label: 'Comfort', icon: '💕' },
  { value: 'thanksgiving', label: 'Thanksgiving', icon: '🙏' },
  { value: 'other', label: 'Other', icon: '📝' }
]

export default function PrayerWallPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryVerses, setCategoryVerses] = useState<Record<string, CategoryVerse>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [newPrayer, setNewPrayer] = useState('')
  const [newCategory, setNewCategory] = useState('spiritual')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPrayers()
    fetchCategoryVerses()
  }, [])

  const fetchPrayers = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('prayer_requests')
        .select(`
          *,
          member:members(first_name, last_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)

      setPrayers(data || [])
    } catch (error) {
      console.error('Failed to fetch prayers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryVerses = async () => {
    // Fetch verses for common categories
    const categories = ['health', 'family', 'financial', 'spiritual', 'comfort', 'guidance']
    const verses: Record<string, CategoryVerse> = {}

    await Promise.all(
      categories.map(async (category) => {
        try {
          const verse = await getVerseByCategory(category)
          if (verse) {
            verses[category] = {
              category,
              reference: verse.reference,
              text: formatVerseText(verse.text)
            }
          }
        } catch (e) {
          console.error(`Failed to fetch verse for ${category}:`, e)
        }
      })
    )

    setCategoryVerses(verses)
  }

  const handleSubmitPrayer = async () => {
    if (!newPrayer.trim()) return

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      await supabase
        .from('prayer_requests')
        .insert({
          member_id: member.id,
          request_text: newPrayer,
          category: newCategory,
          is_anonymous: isAnonymous,
          status: 'active',
          prayer_count: 0
        })

      setNewPrayer('')
      setDialogOpen(false)
      fetchPrayers()
    } catch (error) {
      console.error('Failed to submit prayer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrayFor = async (prayerId: string) => {
    if (prayedFor.has(prayerId)) return

    try {
      const supabase = createClient()

      // Increment prayer count
      const prayer = prayers.find(p => p.id === prayerId)
      if (prayer) {
        await supabase
          .from('prayer_requests')
          .update({ prayer_count: prayer.prayer_count + 1 })
          .eq('id', prayerId)

        setPrayedFor(prev => new Set(prev).add(prayerId))
        setPrayers(prev => prev.map(p =>
          p.id === prayerId ? { ...p, prayer_count: p.prayer_count + 1 } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update prayer count:', error)
    }
  }

  const filteredPrayers = selectedCategory === 'all'
    ? prayers
    : prayers.filter(p => p.category === selectedCategory)

  const getCategoryLabel = (value: string) => {
    return PRAYER_CATEGORIES.find(c => c.value === value)?.label || value
  }

  const getCategoryIcon = (value: string) => {
    return PRAYER_CATEGORIES.find(c => c.value === value)?.icon || '📝'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-tpc-gold hover:bg-tpc-gold/90 text-white gap-2">
                <Plus className="h-4 w-4" />
                Submit Prayer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit a Prayer Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRAYER_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Prayer Request</label>
                  <Textarea
                    value={newPrayer}
                    onChange={(e) => setNewPrayer(e.target.value)}
                    placeholder="Share your prayer request with the community..."
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Post anonymously</span>
                </label>

                <Button
                  onClick={handleSubmitPrayer}
                  disabled={submitting || !newPrayer.trim()}
                  className="w-full bg-tpc-navy hover:bg-tpc-navy/90"
                >
                  {submitting ? 'Submitting...' : 'Submit Prayer Request'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-tpc-navy dark:text-white mb-2">
            Prayer Wall
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join together in prayer with our community
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-tpc-navy' : ''}
          >
            All
          </Button>
          {PRAYER_CATEGORIES.slice(0, 5).map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={selectedCategory === cat.value ? 'bg-tpc-navy' : ''}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        {/* Prayer List */}
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredPrayers.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No prayer requests in this category yet.</p>
              <Button
                onClick={() => setDialogOpen(true)}
                variant="outline"
                className="mt-4"
              >
                Be the first to submit a prayer
              </Button>
            </div>
          ) : (
            filteredPrayers.map(prayer => (
              <Card key={prayer.id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryIcon(prayer.category)} {getCategoryLabel(prayer.category)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {prayer.request_text}
                  </p>

                  {/* Scripture suggestion for this category */}
                  {categoryVerses[prayer.category] && (
                    <VerseCard
                      reference={categoryVerses[prayer.category].reference}
                      text={categoryVerses[prayer.category].text}
                      variant="prayer"
                      className="mb-4"
                    />
                  )}

                  <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                    <span className="text-sm text-gray-500">
                      {prayer.is_anonymous ? 'Anonymous' : `${prayer.member?.first_name || 'Member'}`}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePrayFor(prayer.id)}
                      disabled={prayedFor.has(prayer.id)}
                      className={prayedFor.has(prayer.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${prayedFor.has(prayer.id) ? 'fill-current' : ''}`} />
                      {prayer.prayer_count} prayed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Link href="/devotional">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Daily Devotional
            </Button>
          </Link>
          <Link href="/community">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Community
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
