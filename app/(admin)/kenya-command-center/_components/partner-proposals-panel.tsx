'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageSquare, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight,
  RefreshCw, Zap, User
} from 'lucide-react'

interface Proposal {
  id: string
  trip_id: string
  partner_id: string
  proposal_type: string
  title: string
  description: string
  status: string
  admin_response: string | null
  resolved_by_member_id: string | null
  created_at: string
  resolved_at: string | null
  updated_at: string
  kenya_trip_partners?: {
    id: string
    partner_type: string
    organization: string | null
    city: string | null
    members: { first_name: string; last_name: string } | null
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  implemented: 'bg-blue-100 text-blue-800',
}

export function PartnerProposalsPanel() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [updating, setUpdating] = useState(false)
  const [showResolved, setShowResolved] = useState(false)

  const fetchProposals = useCallback(async () => {
    try {
      const res = await fetch('/api/kenya/partner/proposals?all=true')
      if (!res.ok) return
      const data = await res.json()
      setProposals(data.proposals || [])
    } catch (err) {
      console.error('Failed to fetch proposals:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  const handleResolve = async (proposalId: string, status: 'approved' | 'rejected' | 'implemented') => {
    setUpdating(true)
    try {
      const res = await fetch('/api/kenya/partner/proposals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: proposalId,
          status,
          admin_response: responseText.trim() || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, ...data.proposal } : p))
        setRespondingTo(null)
        setResponseText('')
      }
    } catch (err) {
      console.error('Failed to update proposal:', err)
    } finally {
      setUpdating(false)
    }
  }

  const pending = proposals.filter(p => p.status === 'pending')
  const resolved = proposals.filter(p => p.status !== 'pending')

  return (
    <Card className={pending.length > 0 ? 'border-amber-200' : ''}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#006B3F]" />
          <span className="font-semibold text-navy">Partner Proposals</span>
          {pending.length > 0 && (
            <Badge className="bg-amber-100 text-amber-800">{pending.length} pending</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              fetchProposals()
            }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <CardContent className="pt-0 pb-4">
          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gray-400" />
            </div>
          ) : proposals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No partner proposals yet.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Pending Proposals */}
              {pending.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Needs Review</p>
                  {pending.map(p => {
                    const partnerInfo = p.kenya_trip_partners
                    const memberName = partnerInfo?.members
                      ? `${partnerInfo.members.first_name} ${partnerInfo.members.last_name}`
                      : 'Unknown Partner'

                    return (
                      <div key={p.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-navy">{p.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {memberName}
                              </span>
                              {partnerInfo?.partner_type && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  {partnerInfo.partner_type}
                                </Badge>
                              )}
                              {partnerInfo?.city && <span>{partnerInfo.city}</span>}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">
                            {p.proposal_type.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                        <p className="text-xs text-gray-400 mb-3">
                          Submitted {new Date(p.created_at).toLocaleDateString()}
                        </p>

                        {respondingTo === p.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Response to the partner (optional)..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={2}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleResolve(p.id, 'approved')}
                                disabled={updating}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleResolve(p.id, 'rejected')}
                                disabled={updating}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleResolve(p.id, 'implemented')}
                                disabled={updating}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Zap className="h-3.5 w-3.5 mr-1" />
                                Implemented
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setRespondingTo(null); setResponseText('') }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRespondingTo(p.id)}
                          >
                            Respond
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Resolved Proposals */}
              {resolved.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowResolved(!showResolved)}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700"
                  >
                    {showResolved ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Resolved ({resolved.length})
                  </button>
                  {showResolved && (
                    <div className="space-y-2 mt-2">
                      {resolved.map(p => {
                        const partnerInfo = p.kenya_trip_partners
                        const memberName = partnerInfo?.members
                          ? `${partnerInfo.members.first_name} ${partnerInfo.members.last_name}`
                          : 'Unknown Partner'

                        return (
                          <div key={p.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-navy">{p.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {memberName} - {new Date(p.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-800'}>
                                {p.status}
                              </Badge>
                            </div>
                            {p.admin_response && (
                              <p className="text-xs text-gray-500 mt-1 italic">
                                Response: {p.admin_response}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
