'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Hotel, MapPin, Phone, Mail, Building2, Calendar, Plus, Send
} from 'lucide-react'
import type { PartnerData } from './use-partner-data'

interface TabLogisticsProps {
  data: PartnerData
}

export function TabLogistics({ data }: TabLogisticsProps) {
  const { lodging, contacts, logisticsMatrix, submitProposal } = data
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitProposal = async () => {
    if (!proposalTitle.trim() || !proposalDescription.trim()) return
    setSubmitting(true)
    const success = await submitProposal('logistics_update', proposalTitle.trim(), proposalDescription.trim())
    if (success) {
      setProposalTitle('')
      setProposalDescription('')
      setShowProposalForm(false)
    }
    setSubmitting(false)
  }

  // Group logistics matrix by date
  const matrixByDate: Record<string, typeof logisticsMatrix> = {}
  for (const item of logisticsMatrix) {
    if (!matrixByDate[item.day_date]) matrixByDate[item.day_date] = []
    matrixByDate[item.day_date].push(item)
  }
  const sortedDates = Object.keys(matrixByDate).sort()

  return (
    <div className="space-y-6">
      {/* Propose Button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => setShowProposalForm(!showProposalForm)}
          className="bg-[#006B3F] hover:bg-[#005533]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Propose Logistics Update
        </Button>
      </div>

      {/* Proposal Form */}
      {showProposalForm && (
        <Card className="border-[#006B3F]/30 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">Propose a Logistics Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Proposal title (e.g., 'Update Mombasa hotel to Ocean View Resort')"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
            />
            <Textarea
              placeholder="Describe the logistics update and reasoning..."
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowProposalForm(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitProposal}
                disabled={submitting || !proposalTitle.trim() || !proposalDescription.trim()}
                className="bg-[#006B3F] hover:bg-[#005533]"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1" /> Submit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lodging Details */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
          <Hotel className="h-5 w-5" /> Lodging
        </h3>
        {lodging.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-400">
              No lodging details available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lodging.map((l) => (
              <Card key={l.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-navy">{l.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {l.city}
                      </p>
                    </div>
                    {l.booking_status && (
                      <Badge variant="outline" className="text-xs">
                        {l.booking_status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(l.check_in_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(l.check_out_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span>{l.total_rooms} room{l.total_rooms !== 1 ? 's' : ''}</span>
                  </div>
                  {l.notes && (
                    <p className="text-xs text-gray-400 mt-2">{l.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Key Contacts */}
      <div>
        <h3 className="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
          <Phone className="h-5 w-5" /> Key Contacts
        </h3>
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-400">
              No contacts available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {contacts.map((c) => (
              <Card key={c.id} className={c.is_primary ? 'border-[#006B3F]/30' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-navy">
                        {c.name}
                        {c.is_primary && (
                          <Badge className="ml-2 bg-[#006B3F]/10 text-[#006B3F] text-xs">Primary</Badge>
                        )}
                      </p>
                      {c.role && <p className="text-sm text-gray-500">{c.role}</p>}
                      {c.organization && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {c.organization}
                        </p>
                      )}
                    </div>
                    {c.city && (
                      <Badge variant="outline" className="text-xs">
                        {c.city}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Mail className="h-3.5 w-3.5" /> {c.email}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Logistics Matrix */}
      {sortedDates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Logistics Matrix
          </h3>
          <div className="space-y-3">
            {sortedDates.map(date => {
              const items = matrixByDate[date]
              const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
              })
              return (
                <Card key={date}>
                  <CardContent className="p-4">
                    <p className="font-medium text-navy mb-2">{dateLabel}</p>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-3 text-sm">
                          <Badge variant="outline" className="text-xs flex-shrink-0">{item.track}</Badge>
                          <p className="text-gray-600 whitespace-pre-line">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
