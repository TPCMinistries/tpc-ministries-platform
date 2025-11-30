'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Copy,
  Mail,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Users,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  XCircle,
  Send,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Invite {
  id: string
  code: string
  email: string | null
  name: string | null
  role: string
  max_uses: number
  use_count: number
  expires_at: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  used_at: string | null
  inviter: { first_name: string; last_name: string } | null
  used_by_member: { first_name: string; last_name: string; email: string } | null
}

export default function AdminInvitesPage() {
  const { toast } = useToast()
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all')

  // Single invite form
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteNotes, setInviteNotes] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('')
  const [creating, setCreating] = useState(false)
  const [createdInvite, setCreatedInvite] = useState<{ code: string; url: string } | null>(null)

  // Bulk invite form
  const [bulkList, setBulkList] = useState('')
  const [bulkSendEmails, setBulkSendEmails] = useState(true)
  const [bulkExpiresInDays, setBulkExpiresInDays] = useState<number | ''>('')
  const [bulkCreating, setBulkCreating] = useState(false)

  const fetchInvites = async () => {
    try {
      const response = await fetch(`/api/admin/invites?status=${filter}`)
      if (!response.ok) throw new Error('Failed to fetch invites')
      const data = await response.json()
      setInvites(data)
    } catch (error) {
      console.error('Error fetching invites:', error)
      toast({ title: 'Error', description: 'Failed to load invites', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [filter])

  const handleCreateInvite = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: inviteName || undefined,
          email: inviteEmail || undefined,
          sendEmail: sendEmail && !!inviteEmail,
          expiresInDays: expiresInDays || undefined,
          notes: inviteNotes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invite')
      }

      setCreatedInvite({ code: data.invite.code, url: data.inviteUrl })

      toast({
        title: 'Invite Created!',
        description: data.emailSent ? `Email sent to ${inviteEmail}` : 'Copy the link to share',
      })

      fetchInvites()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const handleBulkCreate = async () => {
    setBulkCreating(true)
    try {
      // Parse bulk list (name, email per line or just email)
      const lines = bulkList.split('\n').filter((l) => l.trim())
      const inviteList = lines.map((line) => {
        const parts = line.split(',').map((p) => p.trim())
        if (parts.length >= 2) {
          return { name: parts[0], email: parts[1] }
        }
        return { email: parts[0] }
      })

      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_create',
          invites: inviteList,
          sendEmails: bulkSendEmails,
          expiresInDays: bulkExpiresInDays || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invites')
      }

      toast({
        title: 'Invites Created!',
        description: `Created ${data.created} invites${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
      })

      setBulkOpen(false)
      setBulkList('')
      fetchInvites()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setBulkCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied!', description: 'Link copied to clipboard' })
  }

  const handleResend = async (inviteId: string) => {
    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', inviteId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      toast({ title: 'Email Sent!', description: 'Reminder email sent successfully' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleDeactivate = async (inviteId: string) => {
    try {
      await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deactivate', inviteId }),
      })
      fetchInvites()
      toast({ title: 'Deactivated', description: 'Invite link has been deactivated' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to deactivate invite', variant: 'destructive' })
    }
  }

  const handleDelete = async (inviteId: string) => {
    if (!confirm('Delete this invite? This cannot be undone.')) return

    try {
      await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', inviteId }),
      })
      fetchInvites()
      toast({ title: 'Deleted', description: 'Invite has been deleted' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete invite', variant: 'destructive' })
    }
  }

  const getStatusBadge = (invite: Invite) => {
    if (invite.use_count > 0) {
      return <Badge className="bg-green-100 text-green-800">Used</Badge>
    }
    if (!invite.is_active) {
      return <Badge variant="secondary">Deactivated</Badge>
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
  }

  const resetCreateForm = () => {
    setInviteName('')
    setInviteEmail('')
    setInviteNotes('')
    setSendEmail(true)
    setExpiresInDays('')
    setCreatedInvite(null)
  }

  const activeCount = invites.filter(
    (i) => i.is_active && i.use_count === 0 && (!i.expires_at || new Date(i.expires_at) > new Date())
  ).length
  const usedCount = invites.filter((i) => i.use_count > 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invite Management</h1>
          <p className="text-muted-foreground">Create and manage member invite links</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Bulk Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Create Invites</DialogTitle>
                <DialogDescription>
                  Add multiple people at once. Enter one per line: name, email
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Invite List</Label>
                  <Textarea
                    placeholder="John Doe, john@example.com
Jane Smith, jane@example.com
bob@example.com"
                    value={bulkList}
                    onChange={(e) => setBulkList(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: Name, Email (or just Email)
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Send invitation emails</Label>
                  <Switch checked={bulkSendEmails} onCheckedChange={setBulkSendEmails} />
                </div>
                <div>
                  <Label>Expires in (days)</Label>
                  <Input
                    type="number"
                    placeholder="Never"
                    value={bulkExpiresInDays}
                    onChange={(e) =>
                      setBulkExpiresInDays(e.target.value ? parseInt(e.target.value) : '')
                    }
                  />
                </div>
                <Button onClick={handleBulkCreate} disabled={bulkCreating} className="w-full">
                  {bulkCreating ? 'Creating...' : 'Create Invites'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open)
              if (!open) resetCreateForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{createdInvite ? 'Invite Created!' : 'Create New Invite'}</DialogTitle>
                <DialogDescription>
                  {createdInvite
                    ? 'Share this link with the person you want to invite'
                    : 'Generate a unique invite link'}
                </DialogDescription>
              </DialogHeader>

              {createdInvite ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-mono text-lg font-bold text-green-800">{createdInvite.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <Input value={createdInvite.url} readOnly className="font-mono text-sm" />
                    <Button onClick={() => copyToClipboard(createdInvite.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={resetCreateForm}>
                      Create Another
                    </Button>
                    <Button className="flex-1" onClick={() => setCreateOpen(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Name (optional)</Label>
                    <Input
                      placeholder="John Doe"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email (optional)</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  {inviteEmail && (
                    <div className="flex items-center justify-between">
                      <Label>Send invitation email now</Label>
                      <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
                    </div>
                  )}
                  <div>
                    <Label>Expires in (days)</Label>
                    <Input
                      type="number"
                      placeholder="Never"
                      value={expiresInDays}
                      onChange={(e) =>
                        setExpiresInDays(e.target.value ? parseInt(e.target.value) : '')
                      }
                    />
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea
                      placeholder="Internal notes about this invite..."
                      value={inviteNotes}
                      onChange={(e) => setInviteNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleCreateInvite} disabled={creating} className="w-full">
                    {creating ? 'Creating...' : 'Generate Invite Link'}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invites</CardDescription>
            <CardTitle className="text-3xl">{invites.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active (Unused)</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Used</CardDescription>
            <CardTitle className="text-3xl text-green-600">{usedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'used' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('used')}
        >
          Used
        </Button>
        <Button variant="ghost" size="sm" onClick={() => fetchInvites()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Invites Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : invites.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invites yet</p>
              <p className="text-sm">Create your first invite to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invite</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {invite.name || invite.email || 'General Invite'}
                        </p>
                        {invite.email && invite.name && (
                          <p className="text-sm text-muted-foreground">{invite.email}</p>
                        )}
                        {invite.used_by_member && (
                          <p className="text-sm text-green-600">
                            Used by: {invite.used_by_member.first_name}{' '}
                            {invite.used_by_member.last_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{invite.code}</code>
                    </TableCell>
                    <TableCell>{getStatusBadge(invite)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invite.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/join/${invite.code}`
                              )
                            }
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          {invite.email && invite.use_count === 0 && (
                            <DropdownMenuItem onClick={() => handleResend(invite.id)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Resend Email
                            </DropdownMenuItem>
                          )}
                          {invite.is_active && invite.use_count === 0 && (
                            <DropdownMenuItem onClick={() => handleDeactivate(invite.id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(invite.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
