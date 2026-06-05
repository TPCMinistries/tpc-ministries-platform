'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Sparkles, Heart, Send, ArrowLeft, RefreshCw } from 'lucide-react'
import VerseCard from '@/components/VerseCard'
import { getVerseOfTheDay, getRandomVerse, formatVerseText, type VerseOfTheDay } from '@/lib/bible-api'
import { createClient } from '@/lib/supabase/client'

interface DailyScripture {
  id: string
  scripture_date: string
  verse_reference: string
  verse_text: string
  reflection_prompt: string
  author_note?: string
}

export default function DevotionalPage() {
  const [verse, setVerse] = useState<VerseOfTheDay | null>(null)
  const [manualDevotional, setManualDevotional] = useState<DailyScripture | null>(null)
  const [loading, setLoading] = useState(true)
  const [reflection, setReflection] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchDevotional()
  }, [])

  const fetchDevotional = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      // Check for manual devotional entry first
      const { data: devotional } = await supabase
        .from('daily_scriptures')
        .select('*')
        .eq('scripture_date', today)
        .single()

      if (devotional) {
        setManualDevotional(devotional)
      } else {
        // Fall back to Bible API verse of the day
        const votd = await getVerseOfTheDay()
        setVerse(votd)
      }
    } catch {
      // If manual fetch fails, still try API
      try {
        const votd = await getVerseOfTheDay()
        setVerse(votd)
      } catch (e) {
        console.error('Failed to fetch devotional:', e)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchNewVerse = async () => {
    setLoading(true)
    try {
      const newVerse = await getRandomVerse()
      setVerse({
        reference: newVerse.reference,
        text: formatVerseText(newVerse.text),
        translation: newVerse.translation_name || 'World English Bible'
      })
      setManualDevotional(null)
    } catch (error) {
      console.error('Failed to fetch new verse:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVerse = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) return

    const ref = manualDevotional?.verse_reference || verse?.reference
    const text = manualDevotional?.verse_text || verse?.text

    if (!ref || !text) return

    const { error } = await supabase
      .from('scripture_interactions')
      .insert({
        member_id: member.id,
        verse_reference: ref,
        verse_text: text,
        interaction_type: 'saved',
        created_at: new Date().toISOString()
      })

    if (!error) {
      setSaved(true)
    }
  }

  const handleSubmitReflection = async () => {
    if (!reflection.trim()) return

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

      const ref = manualDevotional?.verse_reference || verse?.reference

      // Save reflection as a scripture interaction
      await supabase
        .from('scripture_interactions')
        .insert({
          member_id: member.id,
          verse_reference: ref || 'Daily Devotional',
          verse_text: manualDevotional?.verse_text || verse?.text || '',
          interaction_type: 'reflection',
          notes: reflection,
          created_at: new Date().toISOString()
        })

      setSubmitted(true)
      setReflection('')
    } catch (error) {
      console.error('Failed to submit reflection:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const currentRef = manualDevotional?.verse_reference || verse?.reference || ''
  const currentText = manualDevotional?.verse_text || verse?.text || ''
  const reflectionPrompt = manualDevotional?.reflection_prompt || 'How does this scripture speak to your life today? What is God revealing to you through this verse?'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-tpc-gold to-amber-500 rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-tpc-navy dark:text-white mb-2">
            Daily Devotional
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Verse Card */}
        {loading ? (
          <VerseCard
            reference=""
            text=""
            loading={true}
            variant="featured"
          />
        ) : (
          <div className="space-y-4">
            <VerseCard
              reference={currentRef}
              text={currentText}
              variant="featured"
              onSave={handleSaveVerse}
              onRefresh={fetchNewVerse}
              saved={saved}
            />

            {/* Author's Note (if manual devotional) */}
            {manualDevotional?.author_note && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-tpc-gold/20">
                      <Sparkles className="h-4 w-4 text-tpc-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-tpc-gold font-medium mb-1">Pastor&apos;s Note</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {manualDevotional.author_note}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Reflection Section */}
        {!loading && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-tpc-navy dark:text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-tpc-gold" />
                Reflection
              </CardTitle>
              <CardDescription>{reflectionPrompt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    Your reflection has been saved.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-green-600 hover:text-green-700"
                  >
                    Write another reflection
                  </Button>
                </div>
              ) : (
                <>
                  <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Share your thoughts and what God is speaking to you..."
                    className="min-h-[120px] resize-none"
                  />
                  <Button
                    onClick={handleSubmitReflection}
                    disabled={submitting || !reflection.trim()}
                    className="w-full bg-tpc-navy hover:bg-tpc-navy/90 text-white"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Save Reflection
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Link href="/prayer">
            <Button variant="outline" className="gap-2">
              <Heart className="h-4 w-4" />
              Prayer Wall
            </Button>
          </Link>
          <Link href="/teachings">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Teachings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
