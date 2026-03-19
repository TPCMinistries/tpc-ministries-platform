'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Send, Users, Loader2, Check, Copy, RefreshCw, Ban } from 'lucide-react'
import type { KenyaInvite } from './types'

const TRACK_OPTIONS = ['Ministry', 'Medical', 'Education', 'Business', 'Media', 'Flex']
const ROLE_OPTIONS = [
  { value: 'member', label: 'Delegate' },
  { value: 'staff', label: 'Coordinator' },
  { value: 'admin', label: 'Admin' },
]

interface ModalInviteDelegateProps {
  show: boolean
  onClose: () => void
  kenyaInvites: KenyaInvite[]
  sendKenyaInvite: (invite: {
    firstName: string
    lastName: string
    email: string
    track: string
    role: string
    sendEmail: boolean
  }) => Promise<any>
  sendBulkKenyaInvites: (invites: {
    firstName: string
    lastName: string
    email: string
    track: string
    role: string
  }[]) => Promise<any>
  resendKenyaInvite: (inviteId: string) => Promise<any>
  deactivateKenyaInvite: (inviteId: string) => Promise<any>
}

type TabView = 'single' | 'bulk' | 'history'

export function ModalInviteDelegate({
  show, onClose, kenyaInvites,
  sendKenyaInvite, sendBulkKenyaInvites, resendKenyaInvite, deactivateKenyaInvite,
}: ModalInviteDelegateProps) {
  const [activeView, setActiveView] = useState<TabView>('single')

  // Single invite form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [track, setTrack] = useState('Flex')
  const [role, setRole] = useState('member')
  const [shouldSendEmail, setShouldSendEmail] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; inviteUrl?: string } | null>(null)

  // Bulk invite
  const [bulkText, setBulkText] = useState('')
  const [bulkTrack, setBulkTrack] = useState('Flex')
  const [bulkSending, setBulkSending] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ created: number; failed: number } | null>(null)

  // Resend/deactivate loading
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  if (!show) return null

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setTrack('Flex')
    setRole('member')
    setShouldSendEmail(true)
    setResult(null)
  }

  const handleSingleSend = async () => {
    if (!firstName.trim() || !email.trim()) return
    setSending(true)
    setResult(null)
    try {
      const data = await sendKenyaInvite({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        track,
        role,
        sendEmail: shouldSendEmail,
      })
      if (data.success) {
        const emailMsg = data.emailSent
          ? `Invite sent to ${email}`
          : data.emailError
            ? `Invite created but email failed: ${data.emailError}`
            : `Invite created (no email sent)`
        setResult({
          success: data.emailSent || !shouldSendEmail,
          message: emailMsg,
          inviteUrl: data.inviteUrl,
        })
        resetForm()
      } else {
        setResult({ success: false, message: data.error || 'Failed to create invite' })
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Failed to send invite' })
    } finally {
      setSending(false)
    }
  }

  const handleBulkSend = async () => {
    const lines = bulkText.trim().split('\n').filter(l => l.trim())
    if (lines.length === 0) return

    const invites = lines.map(line => {
      // Parse "First Last, email" or "First Last, email, track"
      const parts = line.split(',').map(s => s.trim())
      const nameParts = (parts[0] || '').split(/\s+/)
      return {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: parts[1] || '',
        track: parts[2] || bulkTrack,
        role: 'member' as const,
      }
    }).filter(inv => inv.firstName && inv.email)

    if (invites.length === 0) return

    setBulkSending(true)
    setBulkResult(null)
    try {
      const data = await sendBulkKenyaInvites(invites)
      setBulkResult({ created: data.created || 0, failed: data.failed || 0 })
      if (data.success) setBulkText('')
    } catch {
      setBulkResult({ created: 0, failed: invites.length })
    } finally {
      setBulkSending(false)
    }
  }

  const handleResend = async (inviteId: string) => {
    setActionLoading(inviteId)
    await resendKenyaInvite(inviteId)
    setActionLoading(null)
  }

  const handleDeactivate = async (inviteId: string) => {
    setActionLoading(inviteId)
    await deactivateKenyaInvite(inviteId)
    setActionLoading(null)
  }

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/join/${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const tabClasses = (view: TabView) =>
    `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
      activeView === view ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-navy">Invite to Kenya Trip</h2>
            <p className="text-sm text-gray-500 mt-1">Send branded invitations to delegates and coordinators</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 border-b flex-shrink-0">
          <button className={tabClasses('single')} onClick={() => setActiveView('single')}>
            <Send className="h-3.5 w-3.5 inline mr-1.5" />Single Invite
          </button>
          <button className={tabClasses('bulk')} onClick={() => setActiveView('bulk')}>
            <Users className="h-3.5 w-3.5 inline mr-1.5" />Bulk Invite
          </button>
          <button className={tabClasses('history')} onClick={() => setActiveView('history')}>
            Invite History ({kenyaInvites.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Single Invite */}
          {activeView === 'single' && (
            <div className="space-y-4">
              {result && (
                <div className={`p-3 rounded-lg text-sm ${result.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                  <p className="font-medium">{result.message}</p>
                  {result.inviteUrl && (
                    <p className="mt-1 text-xs break-all opacity-80">{result.inviteUrl}</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="delegate@example.com"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Service Track</Label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    {TRACK_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Role</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={shouldSendEmail}
                  onChange={(e) => setShouldSendEmail(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sendEmail" className="text-sm text-gray-700">Send invite email</label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-navy hover:bg-navy/90"
                  onClick={handleSingleSend}
                  disabled={sending || !firstName.trim() || !email.trim()}
                >
                  {sending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />Send Invite</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Invite */}
          {activeView === 'bulk' && (
            <div className="space-y-4">
              {bulkResult && (
                <div className={`p-3 rounded-lg text-sm ${bulkResult.failed === 0 ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                  {bulkResult.created} invite(s) created{bulkResult.failed > 0 ? `, ${bulkResult.failed} failed` : ''}
                </div>
              )}
              <div>
                <Label>Default Track</Label>
                <select
                  value={bulkTrack}
                  onChange={(e) => setBulkTrack(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                >
                  {TRACK_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Paste Invites (one per line)</Label>
                <p className="text-xs text-gray-500 mb-1">Format: First Last, email (optional: , track)</p>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={"John Doe, john@example.com\nJane Smith, jane@example.com, Medical\nBob Wilson, bob@example.com"}
                  rows={6}
                  className="w-full border rounded-lg px-4 py-2 mt-1 text-sm font-mono"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-navy hover:bg-navy/90"
                  onClick={handleBulkSend}
                  disabled={bulkSending || !bulkText.trim()}
                >
                  {bulkSending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                  ) : (
                    <><Users className="mr-2 h-4 w-4" />Send All Invites</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Invite History */}
          {activeView === 'history' && (
            <div className="space-y-3">
              {kenyaInvites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Send className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>No invites sent yet</p>
                </div>
              ) : (
                kenyaInvites.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{inv.name || 'No name'}</span>
                        {inv.service_track && (
                          <Badge variant="outline" className="text-[10px] px-1.5">{inv.service_track}</Badge>
                        )}
                        {inv.use_count > 0 ? (
                          <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5">Used</Badge>
                        ) : inv.is_active ? (
                          <Badge className="bg-blue-100 text-blue-800 text-[10px] px-1.5">Pending</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-[10px] px-1.5">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{inv.email || 'No email'}</p>
                      <p className="text-xs text-gray-400">
                        Sent {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                      <button
                        onClick={() => handleCopyLink(inv.code)}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors"
                        title="Copy invite link"
                      >
                        {copiedCode === inv.code ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      {inv.is_active && inv.use_count === 0 && inv.email && (
                        <button
                          onClick={() => handleResend(inv.id)}
                          disabled={actionLoading === inv.id}
                          className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition-colors disabled:opacity-50"
                          title="Resend email"
                        >
                          {actionLoading === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      {inv.is_active && inv.use_count === 0 && (
                        <button
                          onClick={() => handleDeactivate(inv.id)}
                          disabled={actionLoading === inv.id}
                          className="p-1.5 hover:bg-red-100 rounded text-red-500 transition-colors disabled:opacity-50"
                          title="Deactivate invite"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
