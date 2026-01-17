'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Mail,
  Send,
  Search,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Inbox,
  CheckCircle,
  Reply,
  ArrowLeft,
  MailOpen,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface Email {
  id: string
  from_email: string
  from_name: string
  to_email: string
  subject: string
  body_text: string
  body_html: string
  is_read: boolean
  is_starred: boolean
  folder: string
  thread_id: string
  received_at: string
  members?: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}

interface SentEmail {
  id: string
  to_emails: string[]
  subject: string
  body_html: string
  sent_at: string
  resend_status: string
}

type Folder = 'inbox' | 'sent' | 'starred' | 'trash'

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | SentEmail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<Folder>('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyMode, setReplyMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
    replyToId: null as string | null,
  })

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/inbox?folder=${currentFolder}&search=${searchQuery}`)
      const data = await res.json()

      if (data.success) {
        if (currentFolder === 'sent') {
          setSentEmails(data.emails || [])
          setEmails([])
        } else {
          setEmails(data.emails || [])
          setSentEmails([])
        }
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Error fetching emails:', err)
      toast({ title: 'Error', description: 'Failed to load emails', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [currentFolder, searchQuery, toast])

  useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.body) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeData.to,
          subject: composeData.subject,
          html: composeData.body.replace(/\n/g, '<br>'),
          replyToId: composeData.replyToId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({ title: 'Success', description: 'Email sent successfully' })
        setComposeOpen(false)
        setReplyMode(false)
        setComposeData({ to: '', subject: '', body: '', replyToId: null })
        fetchEmails()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to send email', variant: 'destructive' })
      }
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to send email', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const handleMarkRead = async (ids: string[], isRead: boolean) => {
    try {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, is_read: isRead }),
      })
      fetchEmails()
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  const handleStar = async (id: string, isStarred: boolean) => {
    try {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_starred: !isStarred }),
      })
      setEmails(emails.map(e => e.id === id ? { ...e, is_starred: !isStarred } : e))
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  const handleDelete = async (ids: string[]) => {
    try {
      await fetch(`/api/admin/inbox?ids=${ids.join(',')}`, { method: 'DELETE' })
      fetchEmails()
      setSelectedEmail(null)
      setSelectedIds(new Set())
      toast({ title: 'Success', description: 'Email(s) moved to trash' })
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleReply = (email: Email) => {
    setComposeData({
      to: email.from_email,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `\n\n---\nOn ${format(new Date(email.received_at), 'PPP')}, ${email.from_name} wrote:\n> ${email.body_text?.split('\n').join('\n> ')}`,
      replyToId: email.id,
    })
    setReplyMode(true)
    setComposeOpen(true)
  }

  const openEmail = async (email: Email) => {
    setSelectedEmail(email)
    if (!email.is_read) {
      await handleMarkRead([email.id], true)
    }
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  const formatEmailDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return format(d, 'h:mm a')
    } else if (diffDays < 7) {
      return format(d, 'EEE')
    } else {
      return format(d, 'MMM d')
    }
  }

  const toggleSelectAll = () => {
    const currentEmails = currentFolder === 'sent' ? sentEmails : emails
    if (selectedIds.size === currentEmails.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(currentEmails.map(e => e.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const folders = [
    { key: 'inbox' as Folder, label: 'Inbox', icon: Inbox, count: unreadCount },
    { key: 'sent' as Folder, label: 'Sent', icon: Send },
    { key: 'starred' as Folder, label: 'Starred', icon: Star },
    { key: 'trash' as Folder, label: 'Trash', icon: Trash2 },
  ]

  const displayEmails = currentFolder === 'sent' ? sentEmails : emails

  return (
    <div className="flex-1 p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-navy">Email Inbox</h1>
            <p className="text-gray-600">Manage your ministry communications</p>
          </div>
          <Button className="bg-navy hover:bg-navy/90" onClick={() => { setComposeOpen(true); setReplyMode(false); setComposeData({ to: '', subject: '', body: '', replyToId: null }) }}>
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0 hidden lg:block">
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.key}
                  onClick={() => { setCurrentFolder(folder.key); setSelectedEmail(null); setSelectedIds(new Set()) }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentFolder === folder.key
                      ? 'bg-navy text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <folder.icon className="h-4 w-4" />
                    {folder.label}
                  </div>
                  {folder.count !== undefined && folder.count > 0 && (
                    <Badge className={currentFolder === folder.key ? 'bg-white text-navy' : 'bg-navy text-white'}>
                      {folder.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {selectedEmail && currentFolder !== 'sent' ? (
              /* Email Detail View */
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => handleReply(selectedEmail as Email)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete([selectedEmail.id])}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-navy mb-4">{(selectedEmail as Email).subject}</h2>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-navy text-white">
                          {getInitials((selectedEmail as Email).from_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{(selectedEmail as Email).from_name}</p>
                            <p className="text-sm text-gray-500">{(selectedEmail as Email).from_email}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {format(new Date((selectedEmail as Email).received_at), 'PPP p')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          To: {(selectedEmail as Email).to_email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    {(selectedEmail as Email).body_html ? (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: (selectedEmail as Email).body_html }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-gray-700">
                        {(selectedEmail as Email).body_text}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Email List View */
              <Card>
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === displayEmails.length && displayEmails.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                      {selectedIds.size > 0 && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleMarkRead(Array.from(selectedIds), true)}>
                            <MailOpen className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleMarkRead(Array.from(selectedIds), false)}>
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(Array.from(selectedIds))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search emails..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && fetchEmails()}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchEmails}>
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-navy" />
                    </div>
                  ) : displayEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <Inbox className="h-12 w-12 mb-2 opacity-50" />
                      <p>No emails in {currentFolder}</p>
                    </div>
                  ) : currentFolder === 'sent' ? (
                    /* Sent Emails List */
                    <div className="divide-y">
                      {sentEmails.map((email) => (
                        <div
                          key={email.id}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(email.id)}
                            onChange={() => toggleSelect(email.id)}
                            className="rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">To:</span>
                              <span className="font-medium text-sm truncate">{email.to_emails.join(', ')}</span>
                            </div>
                            <p className="text-sm text-gray-900 truncate">{email.subject}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {email.resend_status === 'delivered' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {email.resend_status === 'bounced' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatEmailDate(email.sent_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Inbox Emails List */
                    <div className="divide-y">
                      {emails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => openEmail(email)}
                          className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                            !email.is_read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(email.id)}
                            onChange={() => toggleSelect(email.id)}
                            className="rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStar(email.id, email.is_starred) }}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </button>
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-navy/10 text-navy text-xs">
                              {getInitials(email.from_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${!email.is_read ? 'font-semibold' : ''}`}>
                                {email.from_name}
                              </span>
                              {email.members && (
                                <Badge variant="outline" className="text-[10px] px-1">Member</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${!email.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                {email.subject}
                              </span>
                              <span className="text-sm text-gray-500 truncate hidden sm:inline">
                                - {email.body_text?.slice(0, 60)}...
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {formatEmailDate(email.received_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Compose Dialog */}
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{replyMode ? 'Reply to Email' : 'Compose Email'}</DialogTitle>
              <DialogDescription>
                {replyMode ? 'Send a reply to this conversation' : 'Send an email from info@tpcmin.com'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  placeholder="Write your message..."
                  className="min-h-[200px]"
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-navy hover:bg-navy/90" onClick={handleSendEmail} disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
