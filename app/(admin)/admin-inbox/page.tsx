'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Inbox,
  Send,
  Star,
  Trash2,
  Archive,
  Search,
  Loader2,
  Mail,
  MailOpen,
  Reply,
  Forward,
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  Paperclip,
  Clock,
  User,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Email {
  id: string
  from_email: string
  from_name?: string
  to_email: string
  subject: string
  body_text?: string
  body_html?: string
  is_read: boolean
  is_starred: boolean
  folder: string
  received_at: string
  members?: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}

export default function AdminInboxPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  // Compose modal
  const [showCompose, setShowCompose] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeMessage, setComposeMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<Email | null>(null)
  const [sending, setSending] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchEmails()
  }, [currentFolder])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/inbox?folder=${currentFolder}&search=${searchQuery}`)
      const data = await res.json()

      if (data.success) {
        setEmails(data.emails || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (emailId: string, read: boolean) => {
    try {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emailId, is_read: read })
      })
      fetchEmails()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update email', variant: 'destructive' })
    }
  }

  const handleStar = async (emailId: string, starred: boolean) => {
    try {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emailId, is_starred: starred })
      })
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, is_starred: starred } : e))
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update email', variant: 'destructive' })
    }
  }

  const handleDelete = async (emailIds: string[]) => {
    try {
      await fetch(`/api/admin/inbox?ids=${emailIds.join(',')}`, { method: 'DELETE' })
      toast({ title: 'Success', description: 'Email(s) moved to trash' })
      setSelectedEmail(null)
      setSelectedEmails(new Set())
      fetchEmails()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete email', variant: 'destructive' })
    }
  }

  const handleArchive = async (emailIds: string[]) => {
    try {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: emailIds, folder: 'archive' })
      })
      toast({ title: 'Success', description: 'Email(s) archived' })
      setSelectedEmail(null)
      setSelectedEmails(new Set())
      fetchEmails()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to archive email', variant: 'destructive' })
    }
  }

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeMessage) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          html: `<div style="font-family: sans-serif; max-width: 600px;">
            <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">TPC Ministries</h1>
            </div>
            <div style="padding: 30px 20px; background: white;">
              ${composeMessage.replace(/\n/g, '<br>')}
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
              TPC Ministries | <a href="https://tpcmin.org" style="color: #c9a961;">tpcmin.org</a>
            </div>
          </div>`,
          replyToId: replyingTo?.id,
          threadId: replyingTo?.thread_id
        })
      })

      const data = await res.json()

      if (data.success) {
        toast({ title: 'Success', description: 'Email sent successfully' })
        setShowCompose(false)
        resetCompose()
        fetchEmails()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send email', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const resetCompose = () => {
    setComposeTo('')
    setComposeSubject('')
    setComposeMessage('')
    setReplyingTo(null)
  }

  const handleReply = (email: Email) => {
    setReplyingTo(email)
    setComposeTo(email.from_email)
    setComposeSubject(`Re: ${email.subject}`)
    setComposeMessage(`\n\n---\nOn ${formatDate(email.received_at)}, ${email.from_name || email.from_email} wrote:\n${email.body_text || ''}`)
    setShowCompose(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const folders = [
    { name: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
    { name: 'sent', label: 'Sent', icon: Send },
    { name: 'starred', label: 'Starred', icon: Star },
    { name: 'archive', label: 'Archive', icon: Archive },
    { name: 'trash', label: 'Trash', icon: Trash2 },
  ]

  return (
    <div className="flex-1 h-[calc(100vh-4rem)]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r p-4 flex flex-col">
          <Button
            onClick={() => { resetCompose(); setShowCompose(true) }}
            className="w-full bg-navy hover:bg-navy/90 mb-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>

          <nav className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.name}
                onClick={() => { setCurrentFolder(folder.name); setSelectedEmail(null) }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentFolder === folder.name
                    ? 'bg-navy text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <folder.icon className="h-4 w-4" />
                <span className="flex-1">{folder.label}</span>
                {folder.count !== undefined && folder.count > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">{folder.count}</Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Email List */}
        <div className={`${selectedEmail ? 'w-96' : 'flex-1'} border-r flex flex-col`}>
          {/* Toolbar */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchEmails()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchEmails}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {selectedEmails.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedEmails.size} selected</span>
                <Button variant="ghost" size="sm" onClick={() => handleArchive(Array.from(selectedEmails))}>
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(Array.from(selectedEmails))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Mail className="h-12 w-12 mb-2 opacity-50" />
                <p>No emails in {currentFolder}</p>
              </div>
            ) : (
              <div className="divide-y">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => {
                      setSelectedEmail(email)
                      if (!email.is_read) handleMarkAsRead(email.id, true)
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                    } ${!email.is_read ? 'bg-white font-semibold' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(email.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          setSelectedEmails(prev => {
                            const newSet = new Set(prev)
                            if (newSet.has(email.id)) newSet.delete(email.id)
                            else newSet.add(email.id)
                            return newSet
                          })
                        }}
                        className="mt-1"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStar(email.id, !email.is_starred) }}
                        className="mt-0.5"
                      >
                        <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`truncate ${!email.is_read ? 'text-navy' : 'text-gray-700'}`}>
                            {email.from_name || email.from_email}
                          </span>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {formatDate(email.received_at)}
                          </span>
                        </div>
                        <div className={`text-sm truncate ${!email.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {email.subject || '(No Subject)'}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {email.body_text?.substring(0, 100) || ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email View */}
        {selectedEmail && (
          <div className="flex-1 flex flex-col bg-white">
            {/* Email Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleReply(selectedEmail)}>
                  <Reply className="h-4 w-4 mr-1" /> Reply
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleArchive([selectedEmail.id])}>
                  <Archive className="h-4 w-4 mr-1" /> Archive
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete([selectedEmail.id])}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>

              <h2 className="text-xl font-semibold text-navy mb-3">
                {selectedEmail.subject || '(No Subject)'}
              </h2>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-navy" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedEmail.from_name || selectedEmail.from_email}</span>
                    {selectedEmail.members && (
                      <Badge variant="outline" className="text-xs">Member</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedEmail.from_email}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(selectedEmail.received_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedEmail.body_html ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-gray-700">
                  {selectedEmail.body_text || 'No content'}
                </div>
              )}
            </div>

            {/* Quick Reply */}
            <div className="p-4 border-t bg-gray-50">
              <Button onClick={() => handleReply(selectedEmail)} className="bg-navy hover:bg-navy/90">
                <Reply className="h-4 w-4 mr-2" />
                Reply to this email
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{replyingTo ? 'Reply' : 'Compose Email'}</DialogTitle>
            <DialogDescription>
              Send an email from info@tpcmin.com
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="compose-to">To</Label>
              <Input
                id="compose-to"
                type="email"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label htmlFor="compose-subject">Subject</Label>
              <Input
                id="compose-subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div>
              <Label htmlFor="compose-message">Message</Label>
              <textarea
                id="compose-message"
                className="w-full min-h-[250px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                placeholder="Write your message..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCompose(false); resetCompose() }}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={sending} className="bg-navy hover:bg-navy/90">
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
