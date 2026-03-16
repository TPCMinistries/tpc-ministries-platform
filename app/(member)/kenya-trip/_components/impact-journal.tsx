'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Heart, Plus, BookOpen } from 'lucide-react'

const IMPACT_CATEGORIES = [
  { value: 'prayer', label: 'Prayer / Ministry' },
  { value: 'medical', label: 'Medical Care' },
  { value: 'teaching', label: 'Teaching / Training' },
  { value: 'business', label: 'Business Mentoring' },
  { value: 'supplies', label: 'Supplies Distributed' },
  { value: 'general', label: 'General Impact' },
]

const REFLECTION_PROMPTS = [
  'What impacted you most today?',
  'How did you see God move today?',
  'What challenged you? What surprised you?',
  'Describe a moment of connection with someone today.',
  'What will you carry home from today\'s experience?',
]

export function ImpactJournal({ tripId, participantId }: { tripId: string; participantId: string }) {
  const [impactLogs, setImpactLogs] = useState<any[]>([])
  const [reflections, setReflections] = useState<any[]>([])
  const [showImpactForm, setShowImpactForm] = useState(false)
  const [showReflectionForm, setShowReflectionForm] = useState(false)
  const [newImpact, setNewImpact] = useState({ category: 'general', description: '', people_count: '', city: '' })
  const [newReflection, setNewReflection] = useState({ content: '', prompt: '', is_shared: false })
  const [activeSection, setActiveSection] = useState<'impact' | 'reflections'>('impact')

  useEffect(() => {
    fetchData()
  }, [tripId, participantId])

  const fetchData = async () => {
    const supabase = createClient()
    const [impactRes, reflRes] = await Promise.all([
      supabase.from('kenya_trip_impact_logs').select('*').eq('trip_id', tripId).eq('participant_id', participantId).order('created_at', { ascending: false }),
      supabase.from('kenya_trip_reflections').select('*').eq('trip_id', tripId).eq('participant_id', participantId).order('created_at', { ascending: false }),
    ])
    setImpactLogs(impactRes.data || [])
    setReflections(reflRes.data || [])
  }

  const handleAddImpact = async () => {
    if (!newImpact.description.trim()) return
    const supabase = createClient()
    await supabase.from('kenya_trip_impact_logs').insert({
      trip_id: tripId,
      participant_id: participantId,
      category: newImpact.category,
      description: newImpact.description,
      people_count: parseInt(newImpact.people_count) || 0,
      city: newImpact.city,
    })
    setNewImpact({ category: 'general', description: '', people_count: '', city: '' })
    setShowImpactForm(false)
    fetchData()
  }

  const handleAddReflection = async () => {
    if (!newReflection.content.trim()) return
    const supabase = createClient()
    await supabase.from('kenya_trip_reflections').insert({
      trip_id: tripId,
      participant_id: participantId,
      content: newReflection.content,
      prompt: newReflection.prompt || REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)],
      is_shared: newReflection.is_shared,
    })
    setNewReflection({ content: '', prompt: '', is_shared: false })
    setShowReflectionForm(false)
    fetchData()
  }

  const totalPeople = impactLogs.reduce((sum: number, l: any) => sum + (l.people_count || 0), 0)

  return (
    <div className="space-y-6">
      {/* Section toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection('impact')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSection === 'impact' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Impact Log ({impactLogs.length})
        </button>
        <button
          onClick={() => setActiveSection('reflections')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSection === 'reflections' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Reflections ({reflections.length})
        </button>
      </div>

      {activeSection === 'impact' && (
        <>
          {/* Impact Summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-navy/5 border-navy/10">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-navy">{impactLogs.length}</p>
                <p className="text-xs text-gray-500">Activities Logged</p>
              </CardContent>
            </Card>
            <Card className="bg-navy/5 border-navy/10">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-navy">{totalPeople}</p>
                <p className="text-xs text-gray-500">People Served</p>
              </CardContent>
            </Card>
          </div>

          {/* Add Impact */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Impact Log</CardTitle>
              <Button size="sm" onClick={() => setShowImpactForm(!showImpactForm)}>
                <Plus className="h-4 w-4 mr-1" /> Log Impact
              </Button>
            </CardHeader>
            <CardContent>
              {showImpactForm && (
                <div className="p-4 bg-gray-50 rounded-lg mb-4 space-y-3">
                  <select
                    value={newImpact.category}
                    onChange={e => setNewImpact(p => ({ ...p, category: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {IMPACT_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <Textarea
                    placeholder="What did you do? (e.g., 'Prayed with 15 people at the medical camp')"
                    value={newImpact.description}
                    onChange={e => setNewImpact(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="People served"
                      value={newImpact.people_count}
                      onChange={e => setNewImpact(p => ({ ...p, people_count: e.target.value }))}
                    />
                    <Input
                      placeholder="City"
                      value={newImpact.city}
                      onChange={e => setNewImpact(p => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddImpact}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowImpactForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {impactLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-6 text-sm">No impact logged yet. Start recording your kingdom work!</p>
              ) : (
                <div className="space-y-3">
                  {impactLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Heart className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{log.description}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">{log.category}</Badge>
                          {log.people_count > 0 && <Badge variant="outline" className="text-[10px]">{log.people_count} people</Badge>}
                          {log.city && <Badge variant="outline" className="text-[10px]">{log.city}</Badge>}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeSection === 'reflections' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              My Reflections
            </CardTitle>
            <Button size="sm" onClick={() => {
              setNewReflection(p => ({ ...p, prompt: REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)] }))
              setShowReflectionForm(!showReflectionForm)
            }}>
              <Plus className="h-4 w-4 mr-1" /> Write
            </Button>
          </CardHeader>
          <CardContent>
            {showReflectionForm && (
              <div className="p-4 bg-amber-50 rounded-lg mb-4 space-y-3">
                <p className="text-sm font-medium text-amber-800 italic">&ldquo;{newReflection.prompt || 'What impacted you most today?'}&rdquo;</p>
                <Textarea
                  placeholder="Write your reflection..."
                  value={newReflection.content}
                  onChange={e => setNewReflection(p => ({ ...p, content: e.target.value }))}
                  rows={4}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={newReflection.is_shared}
                      onChange={e => setNewReflection(p => ({ ...p, is_shared: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    Share with the team
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddReflection}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowReflectionForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {reflections.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">Your private journal. Capture your experience before the details fade.</p>
            ) : (
              <div className="space-y-4">
                {reflections.map((r: any) => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-lg">
                    {r.prompt && <p className="text-xs text-amber-700 italic mb-1">&ldquo;{r.prompt}&rdquo;</p>}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-gray-400">
                        {new Date(r.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {r.is_shared && <Badge variant="secondary" className="text-[10px]">Shared</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
