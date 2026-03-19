'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare, Plus, Star, FileText, Trash2,
  ExternalLink, ChevronDown, ChevronRight, Save, Check, HelpCircle
} from 'lucide-react'
import type { Announcement, Document as TripDocument, FAQ } from './types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TabCommsProps {
  announcements: Announcement[]
  documents: TripDocument[]
  faqs: FAQ[]
  setShowAnnouncementModal: (show: boolean) => void
  updateAnnouncementField: (id: string, field: string, value: string | boolean) => void
  deleteAnnouncement: (id: string) => void
  addFaq: (question: string, answer: string) => void
  updateFaqField: (id: string, field: string, value: string) => void
  deleteFaq: (id: string) => void
  addDocument: (name: string, fileUrl: string, category: string) => void
  deleteDocument: (id: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIORITIES = ['all', 'urgent', 'high', 'normal', 'low'] as const
type PriorityFilter = (typeof PRIORITIES)[number]

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-yellow-500',
  normal: 'bg-blue-500',
  low: 'bg-gray-400',
}

const AUDIENCES = ['all', 'delegates', 'leaders', 'staff'] as const
const DOC_CATEGORIES = ['travel', 'medical', 'legal', 'logistics', 'other'] as const

const INPUT_CLASS =
  'bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none w-full'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TabComms({
  announcements,
  documents,
  faqs,
  setShowAnnouncementModal,
  updateAnnouncementField,
  deleteAnnouncement,
  addFaq,
  updateFaqField,
  deleteFaq,
  addDocument,
  deleteDocument,
  saveStatus,
}: TabCommsProps) {
  // -- Local state ----------------------------------------------------------

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')

  // FAQ expand state
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set())

  // Inline add-document form
  const [newDocName, setNewDocName] = useState('')
  const [newDocUrl, setNewDocUrl] = useState('')
  const [newDocCategory, setNewDocCategory] = useState<string>(DOC_CATEGORIES[0])

  // Inline add-FAQ form
  const [newFaqQuestion, setNewFaqQuestion] = useState('')
  const [newFaqAnswer, setNewFaqAnswer] = useState('')

  // -- Derived data ---------------------------------------------------------

  const filteredAnnouncements =
    priorityFilter === 'all'
      ? announcements
      : announcements.filter((a) => a.priority === priorityFilter)

  // Sort: pinned first
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.publish_at).getTime() - new Date(a.publish_at).getTime()
  })

  // -- Handlers -------------------------------------------------------------

  function toggleFaqExpand(id: string) {
    setExpandedFaqs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddDocument() {
    if (!newDocName.trim() || !newDocUrl.trim()) return
    addDocument(newDocName.trim(), newDocUrl.trim(), newDocCategory)
    setNewDocName('')
    setNewDocUrl('')
    setNewDocCategory(DOC_CATEGORIES[0])
  }

  function handleAddFaq() {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return
    addFaq(newFaqQuestion.trim(), newFaqAnswer.trim())
    setNewFaqQuestion('')
    setNewFaqAnswer('')
  }

  // -- Render ---------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Top bar — title + save status */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Communications</h2>
        <div className="h-5">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500 animate-pulse">
              <Save className="h-3.5 w-3.5" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              Save error
            </span>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ================================================================
            LEFT COLUMN — Announcements
           ================================================================ */}
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    priorityFilter === p
                      ? 'bg-navy text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => setShowAnnouncementModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Announcement
            </Button>
          </div>

          {/* Announcement cards */}
          {sortedAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {priorityFilter === 'all'
                    ? 'No announcements yet'
                    : `No ${priorityFilter} announcements`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`group relative border rounded-lg p-4 transition-colors ${
                    ann.is_pinned ? 'border-gold bg-gold/5' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Delete button — top-right, visible on hover */}
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    title="Delete announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-start gap-3">
                    {/* Priority dot */}
                    <div
                      className={`w-3 h-3 rounded-full mt-2 shrink-0 ${
                        PRIORITY_DOT[ann.priority] ?? 'bg-gray-400'
                      }`}
                    />

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Title + pin toggle */}
                      <div className="flex items-center gap-2">
                        <input
                          className={`${INPUT_CLASS} font-semibold text-navy`}
                          defaultValue={ann.title}
                          onBlur={(e) =>
                            e.target.value !== ann.title &&
                            updateAnnouncementField(ann.id, 'title', e.target.value)
                          }
                        />
                        <button
                          onClick={() =>
                            updateAnnouncementField(ann.id, 'is_pinned', !ann.is_pinned)
                          }
                          className={`shrink-0 transition-colors ${
                            ann.is_pinned
                              ? 'text-gold'
                              : 'text-gray-300 hover:text-gold'
                          }`}
                          title={ann.is_pinned ? 'Unpin' : 'Pin'}
                        >
                          <Star
                            className="h-4 w-4"
                            fill={ann.is_pinned ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <textarea
                        className={`${INPUT_CLASS} resize-none`}
                        rows={2}
                        defaultValue={ann.content}
                        onBlur={(e) =>
                          e.target.value !== ann.content &&
                          updateAnnouncementField(ann.id, 'content', e.target.value)
                        }
                      />

                      {/* Priority + Audience selects */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-gray-400 uppercase tracking-wide">
                            Priority
                          </label>
                          <select
                            className={`${INPUT_CLASS} w-auto`}
                            value={ann.priority}
                            onChange={(e) =>
                              updateAnnouncementField(ann.id, 'priority', e.target.value)
                            }
                          >
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-gray-400 uppercase tracking-wide">
                            Audience
                          </label>
                          <select
                            className={`${INPUT_CLASS} w-auto`}
                            value={ann.target_audience}
                            onChange={(e) =>
                              updateAnnouncementField(
                                ann.id,
                                'target_audience',
                                e.target.value
                              )
                            }
                          >
                            {AUDIENCES.map((a) => (
                              <option key={a} value={a}>
                                {a.charAt(0).toUpperCase() + a.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="text-[11px] text-gray-400 ml-auto">
                          {new Date(ann.publish_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================
            RIGHT COLUMN — Sidebar (Documents + FAQs)
           ================================================================ */}
        <div className="space-y-6">
          {/* ---- Documents ---- */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> Documents
                <Badge variant="secondary" className="ml-auto text-[11px]">
                  {documents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-gray-500 text-sm py-2">No documents uploaded</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-navy shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">
                          {doc.category}
                        </Badge>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-navy shrink-0"
                        title="Open document"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 shrink-0"
                        title="Delete document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline add-document form */}
              <div className="border-t pt-3 space-y-2">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                  Add Document
                </p>
                <input
                  className={INPUT_CLASS}
                  placeholder="Document name"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                />
                <input
                  className={INPUT_CLASS}
                  placeholder="File URL"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <select
                    className={`${INPUT_CLASS} flex-1`}
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value)}
                  >
                    {DOC_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddDocument}
                    disabled={!newDocName.trim() || !newDocUrl.trim()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---- FAQs ---- */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <HelpCircle className="h-4 w-4" /> FAQs
                <Badge variant="secondary" className="ml-auto text-[11px]">
                  {faqs.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqs.length === 0 ? (
                <p className="text-gray-500 text-sm py-2">No FAQs added</p>
              ) : (
                <div className="space-y-2">
                  {faqs.map((faq) => {
                    const isExpanded = expandedFaqs.has(faq.id)
                    return (
                      <div
                        key={faq.id}
                        className="group border border-gray-100 rounded-lg overflow-hidden"
                      >
                        {/* Question row — clickable to toggle */}
                        <div className="flex items-start gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <button
                            onClick={() => toggleFaqExpand(faq.id)}
                            className="mt-0.5 shrink-0 text-gray-400"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <input
                            className={`${INPUT_CLASS} font-medium text-navy flex-1`}
                            defaultValue={faq.question}
                            onBlur={(e) =>
                              e.target.value !== faq.question &&
                              updateFaqField(faq.id, 'question', e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={() => deleteFaq(faq.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 shrink-0 mt-0.5"
                            title="Delete FAQ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Answer — visible when expanded */}
                        {isExpanded && (
                          <div className="p-2.5 pt-0">
                            <textarea
                              className={`${INPUT_CLASS} resize-none mt-2`}
                              rows={3}
                              defaultValue={faq.answer}
                              onBlur={(e) =>
                                e.target.value !== faq.answer &&
                                updateFaqField(faq.id, 'answer', e.target.value)
                              }
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Inline add-FAQ form */}
              <div className="border-t pt-3 space-y-2">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                  Add FAQ
                </p>
                <input
                  className={INPUT_CLASS}
                  placeholder="Question"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                />
                <textarea
                  className={`${INPUT_CLASS} resize-none`}
                  rows={2}
                  placeholder="Answer"
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddFaq}
                  disabled={!newFaqQuestion.trim() || !newFaqAnswer.trim()}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
