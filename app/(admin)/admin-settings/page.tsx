'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Settings as SettingsIcon,
  Shield,
  UserX,
  UserPlus,
  Search,
  Loader2,
  User,
  Check,
  Crown,
  Sparkles as SparklesIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Member {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
  tier: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<Member[]>([])
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [currentUser, setCurrentUser] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'grant' | 'revoke'
    member: Member | null
  }>({ open: false, type: 'grant', member: null })
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setCurrentUser(memberData)
      }

      // Get all admins
      const { data: adminsData, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_admin', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching admins:', error)
        toast({
          title: 'Error',
          description: 'Failed to load admin users',
          variant: 'destructive',
        })
      } else {
        setAdmins(adminsData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchMembers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const supabase = createClient()
    setSearching(true)

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_admin', false) // Only show non-admin members
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20)
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error searching members:', error)
      } else {
        setSearchResults(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleGrantAdmin = async () => {
    if (!confirmDialog.member) return

    const supabase = createClient()
    setProcessing(true)

    try {
      const { error } = await supabase
        .from('members')
        .update({
          is_admin: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', confirmDialog.member.id)

      if (error) {
        console.error('Error granting admin access:', error)
        toast({
          title: 'Error',
          description: 'Failed to grant admin access',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: `Admin access granted to ${confirmDialog.member.first_name} ${confirmDialog.member.last_name}`,
        })
        setSearchQuery('')
        setSearchResults([])
        fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setProcessing(false)
      setConfirmDialog({ open: false, type: 'grant', member: null })
    }
  }

  const handleRevokeAdmin = async () => {
    if (!confirmDialog.member) return

    const supabase = createClient()
    setProcessing(true)

    try {
      const { error } = await supabase
        .from('members')
        .update({
          is_admin: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', confirmDialog.member.id)

      if (error) {
        console.error('Error revoking admin access:', error)
        toast({
          title: 'Error',
          description: 'Failed to revoke admin access',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: `Admin access revoked from ${confirmDialog.member.first_name} ${confirmDialog.member.last_name}`,
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setProcessing(false)
      setConfirmDialog({ open: false, type: 'revoke', member: null })
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'covenant':
        return (
          <Badge className="bg-gold/20 text-gold border-gold/30">
            <Crown className="h-3 w-3 mr-1" />
            Covenant
          </Badge>
        )
      case 'partner':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <SparklesIcon className="h-3 w-3 mr-1" />
            Partner
          </Badge>
        )
      default:
        return <Badge variant="outline">Free</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-gold" />
            <h1 className="text-4xl font-bold text-navy">Admin Settings</h1>
          </div>
          <p className="text-gray-600">Manage admin users and permissions</p>
        </div>

        {/* Current Admins */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy flex items-center gap-2">
              <Shield className="h-6 w-6 text-gold" />
              Admin Users
            </CardTitle>
            <CardDescription>
              {admins.length} user{admins.length !== 1 ? 's' : ''} with admin access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No admin users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-navy/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-navy" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-navy">
                            {admin.first_name} {admin.last_name}
                          </h3>
                          {currentUser?.id === admin.id && (
                            <Badge className="bg-green-100 text-green-700">You</Badge>
                          )}
                          {getTierBadge(admin.tier)}
                        </div>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Admin since {formatDate(admin.created_at)}
                        </p>
                      </div>
                    </div>
                    {currentUser?.id !== admin.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmDialog({ open: true, type: 'revoke', member: admin })
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Remove Access
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grant Admin Access */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-gold" />
              Grant Admin Access
            </CardTitle>
            <CardDescription>Search for members to grant admin access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search members by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchMembers(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>

              {searching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-navy" />
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-navy" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-navy">
                              {member.first_name} {member.last_name}
                            </p>
                            {getTierBadge(member.tier)}
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setConfirmDialog({ open: true, type: 'grant', member })
                        }
                        className="bg-gold hover:bg-gold/90 text-navy"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Make Admin
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No members found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-navy flex items-center gap-2">
              <Shield className="h-6 w-6 text-gold" />
              Admin Permissions
            </CardTitle>
            <CardDescription>What admin users can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                'Manage all content (teachings, prophecies, events, resources)',
                'View and manage all members',
                'Assign personal prophecies to members',
                'Send emails and SMS to members',
                'View all donations and giving history',
                'Manage prayer requests',
                'Access admin dashboard and analytics',
                'Grant or revoke admin access to other users',
                'Upload and manage media files',
                'View and reply to member messages',
              ].map((permission, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{permission}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ ...confirmDialog, open })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">
                {confirmDialog.type === 'grant' ? 'Grant Admin Access?' : 'Revoke Admin Access?'}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog.type === 'grant'
                  ? `Are you sure you want to grant admin access to ${confirmDialog.member?.first_name} ${confirmDialog.member?.last_name}? They will be able to manage all content and members.`
                  : `Are you sure you want to revoke admin access from ${confirmDialog.member?.first_name} ${confirmDialog.member?.last_name}? They will no longer be able to access the admin portal.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmDialog({ open: false, type: 'grant', member: null })
                }
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  confirmDialog.type === 'grant' ? handleGrantAdmin : handleRevokeAdmin
                }
                disabled={processing}
                className={
                  confirmDialog.type === 'grant'
                    ? 'bg-gold hover:bg-gold/90 text-navy'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : confirmDialog.type === 'grant' ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Grant Access
                  </>
                ) : (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Revoke Access
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
