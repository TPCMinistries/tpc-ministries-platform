'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageSquare, Plus, Send, CheckCircle, XCircle, Clock, Megaphone,
  ChevronDown, ChevronRight, Lightbulb
} from 'lucide-react'
import type { PartnerData } from './use-partner-data'

const PROPOSAL_TYPES = [
  { value: 'schedule_change', label: 'Schedule Change', description: 'Request changes to dates, times, or activities' },
  { value: 'logistics_update', label: 'Logistics Update', description: 'Changes to transportation, lodging, or facilities' },
  { value: 'venue_change', label: 'Venue Change', description: 'Suggest different venues or locations' },
  { value: 'resource_addition', label: 'Resource Addition', description: 'Request additional supplies or resources' },
  { value: 'announcement', label: 'Announcement', description: 'Submit an announcement for the delegation' },
  { value: 'other', label: 'Other', description: 'Any other proposal or suggestion' },
]

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 text-amber-800' },
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 text-green-800' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 text-red-800' },
  implemented: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100 text-blue-800' },
}

interface TabCoordinationProps {
  data: PartnerData
}

export function TabCoordination({ data }: TabCoordinationProps) {
  const { partner, proposals, announcements, submitProposal } = data

  const [showForm, setShowForm] = useState(false)
  const [proposalType, setProposalType] = useState('schedule_change')
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showTypes, setShowTypes] = useState(false)

  const canPropose = partner?.can_propose_changes ?? false

  const pendingProposals = proposals.filter(p => p.status === 'pending')
  const resolvedProposals = proposals.filter(p => p.status !== 'pending')

  const handleSubmit = async () => {
    if (!proposalTitle.trim() || !proposalDescription.trim()) return
    setSubmitting(true)
    const success = await submitProposal(proposalType, proposalTitle.trim(), proposalDescription.trim())
    if (success) {
      setProposalTitle('')
      setProposalDescription('')
      setProposalType('schedule_change')
      setShowForm(false)
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Create Proposal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-navy">
              <MessageSquare className="h-5 w-5 text-[#006B3F]" />
              Submit a Proposal
            </CardTitle>
            {canPropose && (
              <Button
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="bg-[#006B3F] hover:bg-[#005533]"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Proposal
              </Button>
            )}
          </div>
        </CardHeader>

        {!canPropose && (
          <CardContent className="pt-0">
            <p className="text-sm text-gray-500">
              Your account does not have permission to submit proposals. Contact the admin team for access.
            </p>
          </CardContent>
        )}

        {showForm && canPropose && (
          <CardContent className="space-y-4 border-t pt-4">
            {/* Type selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Proposal Type</label>
              <select
                value={proposalType}
                onChange={(e) => setProposalType(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
              >
                {PROPOSAL_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {PROPOSAL_TYPES.find(t => t.value === proposalType)?.description}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
              <Input
                placeholder="Brief title for your proposal"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea
                placeholder="Describe your proposal in detail..."
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !proposalTitle.trim() || !proposalDescription.trim()}
                className="bg-[#006B3F] hover:bg-[#005533]"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1" /> Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-navy text-base">
              <Clock className="h-5 w-5 text-amber-600" />
              Pending Proposals
              <Badge className="bg-amber-100 text-amber-800">{pendingProposals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingProposals.map(p => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resolved Proposals */}
      {resolvedProposals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-navy text-base">
              <CheckCircle className="h-5 w-5 text-gray-400" />
              Resolved Proposals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resolvedProposals.map(p => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Announcements (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-navy text-base">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
          <p className="text-xs text-gray-400">
            To send an announcement to delegates, submit a proposal of type &quot;Announcement&quot;.
          </p>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-navy">{a.title}</p>
                    {a.priority === 'urgent' && (
                      <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>
                    )}
                    {a.is_pinned && (
                      <Badge className="bg-amber-100 text-amber-800 text-xs">Pinned</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(a.publish_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposal Types Info */}
      <Card>
        <button
          onClick={() => setShowTypes(!showTypes)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span className="font-medium text-navy text-sm">Proposal Types Explained</span>
          </div>
          {showTypes ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </button>
        {showTypes && (
          <CardContent className="pt-0 pb-4">
            <div className="space-y-2">
              {PROPOSAL_TYPES.map(t => (
                <div key={t.value} className="flex gap-3 p-2">
                  <Badge variant="outline" className="text-xs flex-shrink-0">{t.label}</Badge>
                  <p className="text-sm text-gray-600">{t.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function ProposalCard({ proposal: p }: { proposal: {
  id: string
  proposal_type: string
  title: string
  description: string
  status: string
  admin_response: string | null
  created_at: string
  resolved_at: string | null
} }) {
  const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
  const StatusIcon = config.icon

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm text-navy">{p.title}</p>
            <Badge variant="outline" className="text-[10px]">
              {p.proposal_type.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">{p.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            Submitted {new Date(p.created_at).toLocaleDateString()}
          </p>
        </div>
        <Badge className={`${config.bg} flex items-center gap-1 flex-shrink-0`}>
          <StatusIcon className="h-3 w-3" />
          {p.status}
        </Badge>
      </div>

      {p.admin_response && (
        <div className="mt-2 p-2 bg-white rounded border-l-2 border-navy">
          <p className="text-xs font-medium text-navy">Admin Response:</p>
          <p className="text-sm text-gray-600">{p.admin_response}</p>
          {p.resolved_at && (
            <p className="text-xs text-gray-400 mt-1">
              Resolved {new Date(p.resolved_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
