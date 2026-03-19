'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Gift,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wallet,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────

interface DelegateFinancial {
  id: string
  name: string
  email: string
  track: string
  applicationStatus: string
  tripCost: number
  scholarship: number
  selfPayments: number
  fundraising: number
  adminCredits: number
  totalCovered: number
  remaining: number
  surplus: number
  paymentStatus: string
}

interface AdminPayment {
  id: string
  participant_id: string
  trip_id: string
  amount: number
  category: string
  description: string | null
  created_at: string
  created_by_member_id: string | null
  members?: { first_name: string; last_name: string } | null
}

interface TrackSummary {
  track: string
  delegates: number
  totalCost: number
  totalCovered: number
  outstanding: number
}

interface CategoryBreakdown {
  category: string
  total: number
  count: number
}

interface FinancialReport {
  summary: {
    totalDelegates: number
    totalTripCost: number
    totalScholarships: number
    totalAdminCredits: number
    totalSelfPayments: number
    totalFundraising: number
    totalCovered: number
    totalOutstanding: number
    totalSurplus: number
  }
  byTrack: TrackSummary[]
  byDelegate: DelegateFinancial[]
  adminCreditsBreakdown: CategoryBreakdown[]
  adminPayments: AdminPayment[]
}

// ─── Constants ─────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'flight_credit', label: 'Flight Credit' },
  { value: 'hotel_credit', label: 'Hotel Credit' },
  { value: 'trip_sponsorship', label: 'Trip Sponsorship' },
  { value: 'church_gift', label: 'Church Gift' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'admin_adjustment', label: 'Admin Adjustment' },
  { value: 'refund_credit', label: 'Refund Credit' },
  { value: 'other', label: 'Other' },
] as const

const CATEGORY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map(c => [c.value, c.label])
)

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-red-100 text-red-800',
}

const TRACK_COLORS: Record<string, string> = {
  Ministry: 'bg-purple-500',
  Medical: 'bg-green-500',
  Education: 'bg-blue-500',
  Business: 'bg-yellow-500',
  Media: 'bg-pink-500',
  Flex: 'bg-gray-500',
}

// ─── Component ─────────────────────────────────────────

export function TabFinances() {
  const [report, setReport] = useState<FinancialReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDelegate, setExpandedDelegate] = useState<string | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('')
  const [creditForm, setCreditForm] = useState({
    amount: '',
    category: 'flight_credit',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Fetch data
  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/kenya/financial-report')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch financial report')
      }
      const data = await res.json()
      setReport(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  // Delegate payment entries (admin payments for the expanded delegate)
  const expandedPayments = useMemo(() => {
    if (!expandedDelegate || !report) return []
    return report.adminPayments.filter(p => p.participant_id === expandedDelegate)
  }, [expandedDelegate, report])

  // Open credit modal for a specific participant
  const openCreditModal = useCallback((participantId: string) => {
    setSelectedParticipantId(participantId)
    setCreditForm({ amount: '', category: 'flight_credit', description: '' })
    setShowCreditModal(true)
  }, [])

  // Submit credit
  const handleSubmitCredit = useCallback(async () => {
    if (!selectedParticipantId || !creditForm.amount || !creditForm.category) return
    const amount = parseFloat(creditForm.amount)
    if (isNaN(amount) || amount <= 0) return

    setSubmitting(true)
    try {
      // Get trip_id from first delegate
      const tripId = report?.adminPayments[0]?.trip_id
      // Or get from delegate data — find participant and derive trip
      const delegate = report?.byDelegate.find(d => d.id === selectedParticipantId)
      if (!delegate && !tripId) return

      const res = await fetch('/api/kenya/admin-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: selectedParticipantId,
          trip_id: tripId || '',
          amount,
          category: creditForm.category,
          description: creditForm.description || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreditModal(false)
        setCreditForm({ amount: '', category: 'flight_credit', description: '' })
        fetchReport()
      } else {
        alert(data.error || 'Failed to add credit')
      }
    } catch {
      alert('Failed to add credit')
    } finally {
      setSubmitting(false)
    }
  }, [selectedParticipantId, creditForm, report, fetchReport])

  // Delete credit
  const handleDeleteCredit = useCallback(async (id: string) => {
    if (!confirm('Remove this admin credit?')) return
    try {
      const res = await fetch(`/api/kenya/admin-payments?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) fetchReport()
    } catch {
      alert('Failed to delete credit')
    }
  }, [fetchReport])

  // ─── Loading / Error ─────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-navy" />
        <span className="ml-2 text-gray-600">Loading financial data...</span>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center py-12 text-red-600">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <span>{error || 'Failed to load financial data'}</span>
        <Button variant="outline" size="sm" className="ml-4" onClick={fetchReport}>Retry</Button>
      </div>
    )
  }

  const { summary, byTrack, byDelegate, adminCreditsBreakdown, adminPayments } = report

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Delegate Finances
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchReport}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button
            size="sm"
            className="bg-navy text-white hover:bg-navy/90"
            onClick={() => {
              setSelectedParticipantId(byDelegate[0]?.id || '')
              setCreditForm({ amount: '', category: 'flight_credit', description: '' })
              setShowCreditModal(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Credit
          </Button>
        </div>
      </div>

      {/* ── Section 1: Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">${summary.totalCovered.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">Total Revenue</p>
            <p className="text-[10px] text-gray-400">All sources combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-500">${summary.totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">Outstanding</p>
            <p className="text-[10px] text-gray-400">Still needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-5 w-5 text-gold mx-auto mb-1" />
            <p className="text-2xl font-bold text-gold">${summary.totalSurplus.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">Surplus</p>
            <p className="text-[10px] text-gray-400">For mission fund</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-5 w-5 text-navy mx-auto mb-1" />
            <p className="text-2xl font-bold text-navy">${summary.totalAdminCredits.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">Admin Credits</p>
            <p className="text-[10px] text-gray-400">Leadership covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue breakdown mini-bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-navy">Overall Progress</span>
            <span className="text-sm text-gray-500">
              ${summary.totalCovered.toLocaleString()} / ${summary.totalTripCost.toLocaleString()}
            </span>
          </div>
          <Progress
            value={summary.totalTripCost > 0 ? Math.min(100, (summary.totalCovered / summary.totalTripCost) * 100) : 0}
            className="h-3"
          />
          <div className="flex gap-4 mt-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Self-Paid: ${summary.totalSelfPayments.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Fundraising: ${summary.totalFundraising.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Admin Credits: ${summary.totalAdminCredits.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Scholarships: ${summary.totalScholarships.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Per-Delegate Financial Table ── */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Per-Delegate Breakdown
            <span className="text-gray-400 font-normal text-sm ml-1">({byDelegate.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide pl-4"></th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Track</th>
                  <th className="text-right p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Cost</th>
                  <th className="text-right p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Scholarship</th>
                  <th className="text-right p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Self-Paid</th>
                  <th className="text-right p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Fundraised</th>
                  <th className="text-right p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Credits</th>
                  <th className="text-right p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Covered</th>
                  <th className="text-right p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Remaining</th>
                  <th className="text-center p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-center p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {byDelegate.map(d => {
                  const isExpanded = expandedDelegate === d.id
                  const delegateAdminPayments = adminPayments.filter(p => p.participant_id === d.id)
                  const coverPercent = d.tripCost > 0 ? Math.min(100, (d.totalCovered / d.tripCost) * 100) : 0

                  return (
                    <tbody key={d.id}>
                      <tr
                        className={`group border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer ${
                          d.surplus > 0 ? 'bg-green-50/30' : ''
                        }`}
                        onClick={() => setExpandedDelegate(isExpanded ? null : d.id)}
                      >
                        <td className="p-2.5 pl-4">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </td>
                        <td className="p-2.5 font-medium text-navy">{d.name}</td>
                        <td className="p-2.5">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${TRACK_COLORS[d.track] || 'bg-gray-400'}`} />
                            <span className="text-gray-700">{d.track}</span>
                          </span>
                        </td>
                        <td className="p-2.5 text-right text-gray-700">${d.tripCost.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-gray-600">{d.scholarship > 0 ? `$${d.scholarship.toLocaleString()}` : '-'}</td>
                        <td className="p-2.5 text-right text-blue-600 font-medium">{d.selfPayments > 0 ? `$${d.selfPayments.toLocaleString()}` : '-'}</td>
                        <td className="p-2.5 text-right text-green-600 font-medium">{d.fundraising > 0 ? `$${d.fundraising.toLocaleString()}` : '-'}</td>
                        <td className="p-2.5 text-right text-purple-600 font-medium">{d.adminCredits > 0 ? `$${d.adminCredits.toLocaleString()}` : '-'}</td>
                        <td className="p-2.5 text-right font-semibold text-navy">${d.totalCovered.toLocaleString()}</td>
                        <td className="p-2.5 text-right">
                          {d.remaining > 0 ? (
                            <span className="font-semibold text-red-600">${d.remaining.toLocaleString()}</span>
                          ) : (
                            <span className="font-semibold text-green-600">
                              {d.surplus > 0 ? `+$${d.surplus.toLocaleString()}` : '$0'}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <Badge className={`text-[11px] ${STATUS_COLORS[d.paymentStatus] || STATUS_COLORS.pending}`}>
                            {d.paymentStatus}
                          </Badge>
                        </td>
                        <td className="p-2.5 text-center pr-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openCreditModal(d.id)
                            }}
                            className="px-2 py-1 text-[11px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            + Credit
                          </button>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={12} className="p-0">
                            <div className="px-6 py-4 space-y-3">
                              {/* Progress bar */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-600">Coverage Progress</span>
                                  <span className="text-xs text-gray-500">{Math.round(coverPercent)}%</span>
                                </div>
                                <Progress value={coverPercent} className="h-2" />
                              </div>

                              {/* Admin credits for this delegate */}
                              {delegateAdminPayments.length > 0 ? (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Admin Credits ({delegateAdminPayments.length})
                                  </h4>
                                  <div className="space-y-1.5">
                                    {delegateAdminPayments.map(ap => (
                                      <div key={ap.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                                        <div className="flex items-center gap-3">
                                          <Badge variant="outline" className="text-[10px]">
                                            {CATEGORY_LABEL_MAP[ap.category] || ap.category}
                                          </Badge>
                                          <span className="text-[13px] text-gray-700">{ap.description || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-[13px] font-semibold text-purple-600">${Number(ap.amount).toLocaleString()}</span>
                                          <span className="text-[11px] text-gray-400">
                                            {new Date(ap.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          </span>
                                          {ap.members && (
                                            <span className="text-[11px] text-gray-400">
                                              by {ap.members.first_name} {ap.members.last_name?.charAt(0)}.
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteCredit(ap.id)}
                                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                            title="Remove credit"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400">No admin credits for this delegate.</p>
                              )}

                              <button
                                type="button"
                                onClick={() => openCreditModal(d.id)}
                                className="px-3 py-1.5 text-[12px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors flex items-center gap-1.5"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add Credit for {d.name.split(' ')[0]}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )
                })}
                {byDelegate.length === 0 && (
                  <tr>
                    <td colSpan={12} className="p-12 text-center text-gray-400">
                      <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="text-[14px]">No delegates found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: By-Track Summary ── */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {byTrack.map(t => {
          const coverPercent = t.totalCost > 0 ? (t.totalCovered / t.totalCost) * 100 : 0
          return (
            <Card key={t.track} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${TRACK_COLORS[t.track] || 'bg-gray-400'}`} />
                  <span className="text-sm font-semibold text-navy">{t.track}</span>
                </div>
                <p className="text-xs text-gray-500">{t.delegates} delegate{t.delegates !== 1 ? 's' : ''}</p>
                <div className="mt-2">
                  <Progress value={Math.min(100, coverPercent)} className="h-1.5" />
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-green-600 font-medium">${t.totalCovered.toLocaleString()}</span>
                  <span className="text-gray-400">/ ${t.totalCost.toLocaleString()}</span>
                </div>
                {t.outstanding > 0 && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">${t.outstanding.toLocaleString()} outstanding</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Section 5: Admin Credits Log ── */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Admin Credits Log
            <span className="text-gray-400 font-normal text-sm ml-1">({adminPayments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {adminPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide pl-4">Date</th>
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Delegate</th>
                    <th className="text-right p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Amount</th>
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Category</th>
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Description</th>
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide pr-4">Added By</th>
                  </tr>
                </thead>
                <tbody>
                  {adminPayments.map(ap => {
                    const delegate = byDelegate.find(d => d.id === ap.participant_id)
                    return (
                      <tr key={ap.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 text-gray-600 whitespace-nowrap">
                          {new Date(ap.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-2.5 font-medium text-navy">{delegate?.name || 'Unknown'}</td>
                        <td className="p-2.5 text-right font-semibold text-purple-600">${Number(ap.amount).toLocaleString()}</td>
                        <td className="p-2.5">
                          <Badge variant="outline" className="text-[11px]">
                            {CATEGORY_LABEL_MAP[ap.category] || ap.category}
                          </Badge>
                        </td>
                        <td className="p-2.5 text-gray-600 max-w-[200px] truncate">{ap.description || '-'}</td>
                        <td className="p-2.5 pr-4 text-gray-500">
                          {ap.members ? `${ap.members.first_name} ${ap.members.last_name}` : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-[13px]">No admin credits added yet</p>
              <p className="text-[11px] mt-1">Use the &quot;Add Credit&quot; button to record leadership-covered expenses</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Admin Credits Category Breakdown ── */}
      {adminCreditsBreakdown.length > 0 && (
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy">Credits by Category</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {adminCreditsBreakdown.map(cb => (
                <div key={cb.category} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-xs font-medium text-purple-800">{CATEGORY_LABEL_MAP[cb.category] || cb.category}</p>
                  <p className="text-lg font-bold text-purple-600 mt-1">${cb.total.toLocaleString()}</p>
                  <p className="text-[11px] text-purple-400">{cb.count} entr{cb.count === 1 ? 'y' : 'ies'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Section 3: Add Credit Modal ── */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreditModal(false)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy">Add Admin Credit</h3>
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Participant select */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                  Delegate *
                </label>
                <select
                  value={selectedParticipantId}
                  onChange={e => setSelectedParticipantId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                >
                  {byDelegate.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.track}) — ${d.remaining.toLocaleString()} remaining
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={creditForm.amount}
                    onChange={e => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                  Category *
                </label>
                <select
                  value={creditForm.category}
                  onChange={e => setCreditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                  Description
                </label>
                <textarea
                  placeholder="e.g., Covered round-trip flight NYC-Nairobi"
                  value={creditForm.description}
                  onChange={e => setCreditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreditModal(false)}>
                Cancel
              </Button>
              <Button
                className="bg-navy text-white hover:bg-navy/90"
                onClick={handleSubmitCredit}
                disabled={submitting || !creditForm.amount || parseFloat(creditForm.amount) <= 0}
              >
                {submitting ? (
                  <><RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Adding...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 mr-1" /> Add Credit</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
