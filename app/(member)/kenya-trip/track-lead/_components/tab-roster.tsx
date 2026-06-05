'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, CheckCircle, XCircle, ChevronDown, ChevronUp, Save, X } from 'lucide-react'
import type { TrackLeadNote } from '../../_components/types'

interface TrackParticipant {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  passport_status: string
  visa_status: string
  payment_status: string
  service_track: string | null
  interest_form_completed_at: string | null
  travel_form_completed_at: string | null
  medical_form_completed_at: string | null
  waiver_signed_at: string | null
  flight_status: string | null
  application_status: string
}

interface TabRosterProps {
  trackParticipants: TrackParticipant[]
  trackLeadNotes: Record<string, TrackLeadNote>
  saveNote: (participantId: string, note: string) => Promise<boolean>
}

function StatusIcon({ done }: { done: boolean }) {
  return done ? (
    <CheckCircle className="h-4 w-4 text-green-500" />
  ) : (
    <XCircle className="h-4 w-4 text-gray-300" />
  )
}

function PaymentBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || 'pending'
  if (normalized === 'paid' || normalized === 'completed') {
    return <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>
  }
  if (normalized === 'partial') {
    return <Badge className="bg-amber-100 text-amber-800 text-xs">Partial</Badge>
  }
  return <Badge className="bg-gray-100 text-gray-600 text-xs">Pending</Badge>
}

function PassportBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || 'none'
  if (normalized === 'valid' || normalized === 'verified') {
    return <Badge className="bg-green-100 text-green-800 text-xs">Valid</Badge>
  }
  if (normalized === 'expired') {
    return <Badge className="bg-red-100 text-red-800 text-xs">Expired</Badge>
  }
  if (normalized === 'pending' || normalized === 'submitted') {
    return <Badge className="bg-amber-100 text-amber-800 text-xs">Pending</Badge>
  }
  return <Badge className="bg-gray-100 text-gray-600 text-xs">None</Badge>
}

function VisaBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || 'not_started'
  if (normalized === 'approved' || normalized === 'received') {
    return <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>
  }
  if (normalized === 'applied' || normalized === 'pending' || normalized === 'in_progress') {
    return <Badge className="bg-amber-100 text-amber-800 text-xs">In Progress</Badge>
  }
  if (normalized === 'denied') {
    return <Badge className="bg-red-100 text-red-800 text-xs">Denied</Badge>
  }
  return <Badge className="bg-gray-100 text-gray-600 text-xs">Not Started</Badge>
}

type FilterValue = 'all' | 'ready' | 'needs-attention' | 'overdue'

export function TabRoster({ trackParticipants, trackLeadNotes, saveNote }: TabRosterProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Filter logic
  const isReady = (p: TrackParticipant) => {
    return (
      (p.passport_status === 'valid' || p.passport_status === 'verified') &&
      (p.visa_status === 'approved' || p.visa_status === 'received') &&
      (p.payment_status === 'paid' || p.payment_status === 'completed') &&
      p.interest_form_completed_at &&
      p.travel_form_completed_at &&
      p.medical_form_completed_at &&
      p.waiver_signed_at
    )
  }

  const needsAttention = (p: TrackParticipant) => {
    return !isReady(p)
  }

  const filtered = trackParticipants.filter(p => {
    const matchesSearch = search === '' ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    switch (filter) {
      case 'ready':
        return isReady(p)
      case 'needs-attention':
        return needsAttention(p)
      default:
        return true
    }
  })

  const handleToggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      setEditingNote(null)
    } else {
      setExpandedId(id)
      setEditingNote(null)
    }
  }

  const handleStartEditNote = (participantId: string) => {
    const existing = trackLeadNotes[participantId]
    setEditingNote(participantId)
    setNoteText(existing?.note || '')
  }

  const handleSaveNote = async (participantId: string) => {
    setSavingNote(true)
    await saveNote(participantId, noteText)
    setSavingNote(false)
    setEditingNote(null)
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search delegates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Delegates ({trackParticipants.length})</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="needs-attention">Needs Attention</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Passport</TableHead>
                  <TableHead className="text-center">Visa</TableHead>
                  <TableHead className="text-center">Payment</TableHead>
                  <TableHead className="text-center">Interest</TableHead>
                  <TableHead className="text-center">Travel</TableHead>
                  <TableHead className="text-center">Medical</TableHead>
                  <TableHead className="text-center">Waiver</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      No delegates found
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((p) => (
                  <>
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleToggleExpand(p.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-navy">{p.first_name} {p.last_name}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center"><PassportBadge status={p.passport_status} /></TableCell>
                      <TableCell className="text-center"><VisaBadge status={p.visa_status} /></TableCell>
                      <TableCell className="text-center"><PaymentBadge status={p.payment_status} /></TableCell>
                      <TableCell className="text-center"><StatusIcon done={!!p.interest_form_completed_at} /></TableCell>
                      <TableCell className="text-center"><StatusIcon done={!!p.travel_form_completed_at} /></TableCell>
                      <TableCell className="text-center"><StatusIcon done={!!p.medical_form_completed_at} /></TableCell>
                      <TableCell className="text-center"><StatusIcon done={!!p.waiver_signed_at} /></TableCell>
                      <TableCell>
                        {expandedId === p.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === p.id && (
                      <TableRow key={`${p.id}-detail`}>
                        <TableCell colSpan={9} className="bg-gray-50 p-0">
                          <div className="p-4 space-y-4">
                            {/* Full Readiness Checklist */}
                            <div>
                              <h4 className="text-sm font-semibold text-navy mb-2">Readiness Checklist</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                  { label: 'Passport', done: p.passport_status === 'valid' || p.passport_status === 'verified' },
                                  { label: 'Visa', done: p.visa_status === 'approved' || p.visa_status === 'received' },
                                  { label: 'Payment', done: p.payment_status === 'paid' || p.payment_status === 'completed' },
                                  { label: 'Interest Form', done: !!p.interest_form_completed_at },
                                  { label: 'Travel Form', done: !!p.travel_form_completed_at },
                                  { label: 'Medical Form', done: !!p.medical_form_completed_at },
                                  { label: 'Waiver', done: !!p.waiver_signed_at },
                                  { label: 'Flight', done: p.flight_status === 'booked' || p.flight_status === 'confirmed' },
                                ].map((item) => (
                                  <div key={item.label} className={`flex items-center gap-2 p-2 rounded text-sm ${item.done ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <StatusIcon done={item.done} />
                                    <span className={item.done ? 'text-green-700' : 'text-red-700'}>{item.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div>
                              <h4 className="text-sm font-semibold text-navy mb-1">Contact</h4>
                              <p className="text-sm text-gray-600">{p.phone || 'No phone'} | {p.email}</p>
                            </div>

                            {/* Track Lead Notes */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-navy">Your Notes</h4>
                                {editingNote !== p.id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStartEditNote(p.id)
                                    }}
                                  >
                                    {trackLeadNotes[p.id] ? 'Edit Note' : 'Add Note'}
                                  </Button>
                                )}
                              </div>

                              {editingNote === p.id ? (
                                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                  <Textarea
                                    placeholder="Add a note about this delegate..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveNote(p.id)}
                                      disabled={savingNote}
                                    >
                                      <Save className="h-3 w-3 mr-1" />
                                      {savingNote ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingNote(null)}
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : trackLeadNotes[p.id] ? (
                                <div className="p-3 bg-white rounded border text-sm text-gray-700 whitespace-pre-wrap">
                                  {trackLeadNotes[p.id].note}
                                  <p className="text-xs text-gray-400 mt-2">
                                    Last updated: {new Date(trackLeadNotes[p.id].updated_at).toLocaleDateString()}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 italic">No notes yet</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No delegates found</p>
        )}
        {filtered.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => handleToggleExpand(p.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-navy">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
                {expandedId === p.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <PassportBadge status={p.passport_status} />
                <VisaBadge status={p.visa_status} />
                <PaymentBadge status={p.payment_status} />
              </div>
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <StatusIcon done={!!p.interest_form_completed_at} />
                  <span>Interest</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <StatusIcon done={!!p.travel_form_completed_at} />
                  <span>Travel</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <StatusIcon done={!!p.medical_form_completed_at} />
                  <span>Medical</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <StatusIcon done={!!p.waiver_signed_at} />
                  <span>Waiver</span>
                </div>
              </div>
            </div>

            {expandedId === p.id && (
              <div className="border-t p-4 bg-gray-50 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-navy mb-1">Contact</h4>
                  <p className="text-sm text-gray-600">{p.phone || 'No phone'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-navy mb-1">Flight</h4>
                  <Badge className={
                    p.flight_status === 'booked' || p.flight_status === 'confirmed'
                      ? 'bg-green-100 text-green-800 text-xs'
                      : 'bg-gray-100 text-gray-600 text-xs'
                  }>
                    {p.flight_status || 'Not booked'}
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-navy">Your Notes</h4>
                    {editingNote !== p.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEditNote(p.id)
                        }}
                      >
                        {trackLeadNotes[p.id] ? 'Edit' : 'Add Note'}
                      </Button>
                    )}
                  </div>

                  {editingNote === p.id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Textarea
                        placeholder="Add a note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveNote(p.id)} disabled={savingNote}>
                          {savingNote ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingNote(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : trackLeadNotes[p.id] ? (
                    <div className="p-2 bg-white rounded border text-sm text-gray-700 whitespace-pre-wrap">
                      {trackLeadNotes[p.id].note}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No notes yet</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
