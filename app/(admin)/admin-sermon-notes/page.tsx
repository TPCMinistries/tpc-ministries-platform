'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FileText,
  Sparkles,
  BookOpen,
  Loader2,
  CheckCircle,
  Copy,
  Download,
  Clock,
  Target,
  Heart,
  List,
  MessageSquare,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

interface SermonNotes {
  mainScripture: string
  theme: string
  keyPoints: string[]
  quotes: string[]
  applicationQuestions: string[]
  actionSteps: string[]
  prayerFocus: string
  relatedScriptures: string[]
}

interface SavedNotes {
  id: string
  sermonId: string
  sermonTitle?: string
  notes_json: SermonNotes
  generated_at: string
}

export default function AdminSermonNotesPage() {
  const [transcript, setTranscript] = useState('')
  const [sermonTitle, setSermonTitle] = useState('')
  const [sermonId, setSermonId] = useState('')
  const [generatedNotes, setGeneratedNotes] = useState<SermonNotes | null>(null)
  const [savedNotes, setSavedNotes] = useState<SavedNotes[]>([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate')

  useEffect(() => {
    fetchSavedNotes()
  }, [])

  const fetchSavedNotes = async () => {
    try {
      const res = await fetch('/api/ai/sermon-notes')
      if (res.ok) {
        const data = await res.json()
        setSavedNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Error fetching saved notes:', error)
    }
  }

  const generateNotes = async () => {
    if (!transcript.trim()) {
      alert('Please enter a sermon transcript')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/ai/sermon-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          sermonId: sermonId || undefined,
          save: true
        })
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedNotes(data.notes)
        fetchSavedNotes()
      } else {
        alert('Failed to generate notes')
      }
    } catch (error) {
      console.error('Error generating notes:', error)
      alert('Error generating notes')
    }
    setGenerating(false)
  }

  const copyToClipboard = () => {
    if (!generatedNotes) return

    const text = `
SERMON NOTES
============

Scripture: ${generatedNotes.mainScripture}
Theme: ${generatedNotes.theme}

KEY POINTS:
${generatedNotes.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

MEMORABLE QUOTES:
${generatedNotes.quotes.map(q => `• "${q}"`).join('\n')}

APPLICATION QUESTIONS:
${generatedNotes.applicationQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

ACTION STEPS:
${generatedNotes.actionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

PRAYER FOCUS:
${generatedNotes.prayerFocus}

RELATED SCRIPTURES:
${generatedNotes.relatedScriptures.join(', ')}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadNotes = () => {
    if (!generatedNotes) return

    const content = JSON.stringify(generatedNotes, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sermon-notes-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-gold" />
              AI Sermon Notes Generator
            </h1>
            <p className="text-gray-600">Generate structured notes from sermon transcripts using AI</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'generate'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Generate Notes
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'saved'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Saved Notes ({savedNotes.length})
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sermon Transcript
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Sermon Title (Optional)</Label>
                  <Input
                    value={sermonTitle}
                    onChange={e => setSermonTitle(e.target.value)}
                    placeholder="e.g., Walking in Faith"
                  />
                </div>
                <div>
                  <Label>Transcript *</Label>
                  <Textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder="Paste the sermon transcript here..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {transcript.length.toLocaleString()} characters
                  </p>
                </div>
                <Button
                  onClick={generateNotes}
                  disabled={generating || !transcript.trim()}
                  className="w-full bg-navy hover:bg-navy/90"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Notes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Notes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <div className="space-y-4">
              {generatedNotes ? (
                <>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyToClipboard}>
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={downloadNotes}>
                      <Download className="h-4 w-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>

                  {/* Scripture & Theme */}
                  <Card className="bg-gradient-to-r from-navy/5 to-gold/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <BookOpen className="h-6 w-6 text-navy flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-navy text-lg">{generatedNotes.mainScripture}</p>
                          <p className="text-gray-600 mt-1">{generatedNotes.theme}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Points */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <List className="h-4 w-4 text-navy" />
                        Key Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {generatedNotes.keyPoints.map((point, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  {/* Quotes */}
                  {generatedNotes.quotes.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gold" />
                          Memorable Quotes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generatedNotes.quotes.map((quote, i) => (
                            <div key={i} className="p-3 bg-gold/10 rounded-lg border-l-4 border-gold">
                              <p className="italic text-gray-700">"{quote}"</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Application Questions */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-purple-500" />
                        Application Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {generatedNotes.applicationQuestions.map((q, i) => (
                          <li key={i} className="flex gap-2 text-gray-700">
                            <span className="text-purple-500">?</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Action Steps */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                        Action Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {generatedNotes.actionSteps.map((step, i) => (
                          <li key={i} className="flex gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Prayer Focus */}
                  <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Prayer Focus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{generatedNotes.prayerFocus}</p>
                    </CardContent>
                  </Card>

                  {/* Related Scriptures */}
                  {generatedNotes.relatedScriptures.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-navy" />
                          Related Scriptures
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {generatedNotes.relatedScriptures.map((scripture, i) => (
                            <Badge key={i} variant="outline" className="text-navy">
                              {scripture}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No Notes Generated Yet
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                      Paste a sermon transcript and click "Generate AI Notes" to create structured study notes.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedNotes.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved sermon notes yet</p>
                </CardContent>
              </Card>
            ) : (
              savedNotes.map(notes => (
                <Card key={notes.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                  setGeneratedNotes(notes.notes_json)
                  setActiveTab('generate')
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-navy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy truncate">
                          {notes.notes_json.mainScripture || 'Sermon Notes'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{notes.notes_json.theme}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(notes.generated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {notes.notes_json.keyPoints?.length || 0} points
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {notes.notes_json.actionSteps?.length || 0} actions
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
