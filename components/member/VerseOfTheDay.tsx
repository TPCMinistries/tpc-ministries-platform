'use client'

import { useState, useEffect } from 'react'
import VerseCard from '@/components/VerseCard'
import { getVerseOfTheDay, type VerseOfTheDay as VerseType } from '@/lib/bible-api'
import { createClient } from '@/lib/supabase/client'

interface VerseOfTheDayProps {
  className?: string
}

export default function VerseOfTheDayWidget({ className = '' }: VerseOfTheDayProps) {
  const [verse, setVerse] = useState<VerseType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchVerseOfTheDay()
  }, [])

  const fetchVerseOfTheDay = async () => {
    setLoading(true)
    try {
      const data = await getVerseOfTheDay()
      setVerse(data)
    } catch (error) {
      console.error('Failed to fetch verse of the day:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!verse) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Get member ID
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) return

    // Save to verse_interactions table
    const { error } = await supabase
      .from('verse_interactions')
      .insert({
        member_id: member.id,
        verse_reference: verse.reference,
        verse_text: verse.text,
        interaction_type: 'saved',
        created_at: new Date().toISOString()
      })

    if (!error) {
      setSaved(true)
    }
  }

  const handleShare = async () => {
    if (!verse) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) return

    // Log share interaction
    await supabase
      .from('verse_interactions')
      .insert({
        member_id: member.id,
        verse_reference: verse.reference,
        verse_text: verse.text,
        interaction_type: 'shared',
        created_at: new Date().toISOString()
      })
  }

  if (loading) {
    return (
      <VerseCard
        reference=""
        text=""
        loading={true}
        variant="featured"
        className={className}
      />
    )
  }

  if (!verse) {
    return null
  }

  return (
    <VerseCard
      reference={verse.reference}
      text={verse.text}
      translation={verse.translation}
      variant="featured"
      onSave={handleSave}
      onShare={handleShare}
      saved={saved}
      className={className}
    />
  )
}
