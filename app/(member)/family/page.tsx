'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  UserPlus,
  Heart,
  Home,
  Calendar,
  Gift,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Crown,
  Baby,
  User,
  Send,
  CheckCircle2,
  Clock,
  Cake,
  Star,
  BookOpen,
  Sparkles
} from 'lucide-react'

interface FamilyMember {
  id: string
  member_id: string
  relationship: string
  is_primary: boolean
  is_child: boolean
  member: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
    birth_date?: string
    tier?: string
  }
}

interface Family {
  id: string
  family_name: string
  created_at: string
  anniversary_date?: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface FamilyInvite {
  id: string
  email: string
  relationship: string
  status: string
  created_at: string
}

export default function FamilyPage() {
  const [family, setFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [invites, setInvites] = useState<FamilyInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [isHead, setIsHead] = useState(false)

  // Create family form
  const [showCreateFamily, setShowCreateFamily] = useState(false)
  const [familyName, setFamilyName] = useState('')
  const [anniversaryDate, setAnniversaryDate] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')

  // Invite form
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRelationship, setInviteRelationship] = useState('spouse')
  const [inviting, setInviting] = useState(false)

  // Add child form
  const [showAddChild, setShowAddChild] = useState(false)
  const [childFirstName, setChildFirstName] = useState('')
  const [childLastName, setChildLastName] = useState('')
  const [childBirthDate, setChildBirthDate] = useState('')
  const [addingChild, setAddingChild] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      setLoading(false)
      return
    }

    setMemberId(member.id)

    // Check if member belongs to a family
    const { data: familyMembership } = await supabase
      .from('family_members')
      .select(`
        *,
        family:families(*)
      `)
      .eq('member_id', member.id)
      .single()

    if (familyMembership && familyMembership.family) {
      setFamily(familyMembership.family as any)
      setIsHead(familyMembership.is_primary)

      // Fetch all family members
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select(`
          *,
          member:members(id, first_name, last_name, email, phone, birth_date, tier)
        `)
        .eq('family_id', familyMembership.family.id)
        .order('is_primary', { ascending: false })

      if (familyMembers) {
        setMembers(familyMembers as any)
      }

      // Fetch pending invites
      const { data: pendingInvites } = await supabase
        .from('family_invites')
        .select('*')
        .eq('family_id', familyMembership.family.id)
        .eq('status', 'pending')

      if (pendingInvites) {
        setInvites(pendingInvites)
      }
    }

    setLoading(false)
  }

  const createFamily = async () => {
    if (!memberId || !familyName) return

    const supabase = createClient()

    // Create family
    const { data: newFamily, error: familyError } = await supabase
      .from('families')
      .insert({
        family_name: familyName,
        anniversary_date: anniversaryDate || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null
      })
      .select()
      .single()

    if (familyError || !newFamily) {
      console.error('Error creating family:', familyError)
      return
    }

    // Add current member as primary (head of household)
    await supabase
      .from('family_members')
      .insert({
        family_id: newFamily.id,
        member_id: memberId,
        relationship: 'self',
        is_primary: true,
        is_child: false
      })

    setShowCreateFamily(false)
    fetchData()
  }

  const inviteFamilyMember = async () => {
    if (!family || !inviteEmail) return

    setInviting(true)
    const supabase = createClient()

    await supabase.from('family_invites').insert({
      family_id: family.id,
      email: inviteEmail,
      relationship: inviteRelationship,
      invited_by: memberId,
      status: 'pending'
    })

    setInviting(false)
    setShowInviteDialog(false)
    setInviteEmail('')
    setInviteRelationship('spouse')
    fetchData()
  }

  const addChildToFamily = async () => {
    if (!family || !childFirstName || !childLastName) return

    setAddingChild(true)
    const supabase = createClient()

    // Create a child member record (no user account)
    const { data: childMember, error: memberError } = await supabase
      .from('members')
      .insert({
        first_name: childFirstName,
        last_name: childLastName,
        birth_date: childBirthDate || null,
        tier: 'free',
        is_child_account: true
      })
      .select()
      .single()

    if (memberError || !childMember) {
      console.error('Error creating child member:', memberError)
      setAddingChild(false)
      return
    }

    // Add to family
    await supabase.from('family_members').insert({
      family_id: family.id,
      member_id: childMember.id,
      relationship: 'child',
      is_primary: false,
      is_child: true
    })

    setAddingChild(false)
    setShowAddChild(false)
    setChildFirstName('')
    setChildLastName('')
    setChildBirthDate('')
    fetchData()
  }

  const cancelInvite = async (inviteId: string) => {
    const supabase = createClient()
    await supabase
      .from('family_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId)
    fetchData()
  }

  const removeFamilyMember = async (membershipId: string) => {
    const supabase = createClient()
    await supabase
      .from('family_members')
      .delete()
      .eq('id', membershipId)
    fetchData()
  }

  const getRelationshipIcon = (relationship: string, isChild: boolean) => {
    if (isChild) return Baby
    switch (relationship) {
      case 'spouse':
        return Heart
      case 'parent':
        return Crown
      case 'self':
        return User
      default:
        return Users
    }
  }

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      self: 'Head of Household',
      spouse: 'Spouse',
      child: 'Child',
      parent: 'Parent',
      sibling: 'Sibling',
      grandparent: 'Grandparent',
      other: 'Family Member'
    }
    return labels[relationship] || relationship
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getUpcomingBirthdays = () => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    return members
      .filter(m => m.member.birth_date)
      .map(m => {
        const birthDate = new Date(m.member.birth_date!)
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        )
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1)
        }
        return {
          ...m,
          nextBirthday: thisYearBirthday,
          daysUntil: Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        }
      })
      .filter(m => m.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }

  const upcomingBirthdays = getUpcomingBirthdays()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  // No family yet - show create option
  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-navy" />
              <h1 className="text-3xl font-bold text-navy">My Family</h1>
            </div>
            <p className="text-gray-600">
              Create a family account to connect with your household
            </p>
          </div>

          {!showCreateFamily ? (
            <Card className="text-center py-12">
              <CardContent>
                <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Family Account
                </h3>
                <p className="text-gray-500 mb-6">
                  Create a family account to link family members, track birthdays,
                  and manage your household together
                </p>
                <Button
                  onClick={() => setShowCreateFamily(true)}
                  className="bg-navy hover:bg-navy/90"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Create Family Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create Family Account</CardTitle>
                <CardDescription>
                  Set up your family profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Family Name *</Label>
                  <Input
                    placeholder="e.g., The Smith Family"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Wedding Anniversary (optional)</Label>
                  <Input
                    type="date"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Home Address (optional)</h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Street Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      <Input
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                      <Input
                        placeholder="ZIP"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={createFamily}
                    disabled={!familyName}
                    className="flex-1 bg-navy hover:bg-navy/90"
                  >
                    Create Family
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateFamily(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">{family.family_name}</h1>
          </div>
          <p className="text-gray-600">
            Manage your family members and household information
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-navy" />
              <p className="text-2xl font-bold text-navy">{members.length}</p>
              <p className="text-xs text-gray-500">Family Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Baby className="h-8 w-8 mx-auto mb-2 text-pink-500" />
              <p className="text-2xl font-bold text-navy">
                {members.filter(m => m.is_child).length}
              </p>
              <p className="text-xs text-gray-500">Children</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Mail className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold text-navy">{invites.length}</p>
              <p className="text-xs text-gray-500">Pending Invites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Cake className="h-8 w-8 mx-auto mb-2 text-gold" />
              <p className="text-2xl font-bold text-navy">{upcomingBirthdays.length}</p>
              <p className="text-xs text-gray-500">Upcoming Birthdays</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Birthdays Banner */}
        {upcomingBirthdays.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-gold/20 to-pink-100 border-gold">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cake className="h-6 w-6 text-gold" />
                <h2 className="text-lg font-bold text-navy">Upcoming Birthdays!</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                {upcomingBirthdays.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                    <Sparkles className="h-5 w-5 text-gold" />
                    <span className="font-medium text-navy">
                      {m.member.first_name}
                    </span>
                    <Badge className="bg-pink-100 text-pink-800">
                      {m.daysUntil === 0 ? 'Today!' : `in ${m.daysUntil} days`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="details">
              <Home className="h-4 w-4 mr-2" />
              Family Details
            </TabsTrigger>
            {isHead && (
              <TabsTrigger value="manage">
                <Edit2 className="h-4 w-4 mr-2" />
                Manage
              </TabsTrigger>
            )}
          </TabsList>

          {/* Family Members */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Family Members</CardTitle>
                  {isHead && (
                    <div className="flex gap-2">
                      <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Baby className="h-4 w-4 mr-2" />
                            Add Child
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Child</DialogTitle>
                            <DialogDescription>
                              Add a child to your family (no account needed)
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>First Name *</Label>
                                <Input
                                  value={childFirstName}
                                  onChange={(e) => setChildFirstName(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Last Name *</Label>
                                <Input
                                  value={childLastName}
                                  onChange={(e) => setChildLastName(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Birth Date</Label>
                              <Input
                                type="date"
                                value={childBirthDate}
                                onChange={(e) => setChildBirthDate(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <Button
                              onClick={addChildToFamily}
                              disabled={addingChild || !childFirstName || !childLastName}
                              className="w-full bg-navy hover:bg-navy/90"
                            >
                              {addingChild ? 'Adding...' : 'Add Child'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-navy hover:bg-navy/90">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite Family Member</DialogTitle>
                            <DialogDescription>
                              Send an invitation to join your family
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <Label>Email Address *</Label>
                              <Input
                                type="email"
                                placeholder="family@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Relationship</Label>
                              <Select
                                value={inviteRelationship}
                                onValueChange={setInviteRelationship}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="spouse">Spouse</SelectItem>
                                  <SelectItem value="parent">Parent</SelectItem>
                                  <SelectItem value="sibling">Sibling</SelectItem>
                                  <SelectItem value="grandparent">Grandparent</SelectItem>
                                  <SelectItem value="other">Other Family</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={inviteFamilyMember}
                              disabled={inviting || !inviteEmail}
                              className="w-full bg-navy hover:bg-navy/90"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {inviting ? 'Sending...' : 'Send Invitation'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((fm) => {
                    const Icon = getRelationshipIcon(fm.relationship, fm.is_child)
                    return (
                      <div
                        key={fm.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            fm.is_primary
                              ? 'bg-gold/20'
                              : fm.is_child
                              ? 'bg-pink-100'
                              : 'bg-navy/10'
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              fm.is_primary ? 'text-gold' : fm.is_child ? 'text-pink-500' : 'text-navy'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-navy">
                                {fm.member.first_name} {fm.member.last_name}
                              </p>
                              {fm.is_primary && (
                                <Badge className="bg-gold/20 text-gold-dark text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Head
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {getRelationshipLabel(fm.relationship)}
                              {fm.member.birth_date && (
                                <span className="ml-2">• Age {calculateAge(fm.member.birth_date)}</span>
                              )}
                            </p>
                            {fm.member.email && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" />
                                {fm.member.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {fm.member.tier && fm.member.tier !== 'free' && (
                            <Badge variant="outline" className="capitalize">
                              {fm.member.tier}
                            </Badge>
                          )}
                          {isHead && !fm.is_primary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFamilyMember(fm.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pending Invites */}
                {invites.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-navy mb-3">Pending Invitations</h4>
                    <div className="space-y-2">
                      {invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="font-medium text-gray-700">{invite.email}</p>
                              <p className="text-sm text-gray-500 capitalize">
                                {invite.relationship} • Pending
                              </p>
                            </div>
                          </div>
                          {isHead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelInvite(invite.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Family Details */}
          <TabsContent value="details">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-navy" />
                    Household Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-500">Family Name</Label>
                    <p className="font-medium text-navy">{family.family_name}</p>
                  </div>
                  {family.anniversary_date && (
                    <div>
                      <Label className="text-gray-500">Wedding Anniversary</Label>
                      <p className="font-medium text-navy flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        {new Date(family.anniversary_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {family.address && (
                    <div>
                      <Label className="text-gray-500">Address</Label>
                      <p className="font-medium text-navy">
                        {family.address}<br />
                        {family.city}, {family.state} {family.zip}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-500">Member Since</Label>
                    <p className="font-medium text-navy">
                      {new Date(family.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-navy" />
                    Family Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.filter(m => m.member.birth_date).map((m) => {
                      const birthDate = new Date(m.member.birth_date!)
                      return (
                        <div key={m.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Cake className="h-4 w-4 text-pink-500" />
                            <span className="text-sm">{m.member.first_name}'s Birthday</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {birthDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )
                    })}
                    {family.anniversary_date && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Wedding Anniversary</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(family.anniversary_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Family Giving Summary */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-navy" />
                    Family Giving
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Family giving summary coming soon</p>
                    <p className="text-sm mt-1">Combined giving reports for tax purposes</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manage (Head only) */}
          {isHead && (
            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle>Family Settings</CardTitle>
                  <CardDescription>
                    Manage your family account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Family Name</Label>
                      <Input
                        value={familyName || family.family_name}
                        onChange={(e) => setFamilyName(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Wedding Anniversary</Label>
                      <Input
                        type="date"
                        value={anniversaryDate || family.anniversary_date || ''}
                        onChange={(e) => setAnniversaryDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Home Address</h4>
                      <div className="space-y-3">
                        <Input
                          placeholder="Street Address"
                          value={address || family.address || ''}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            placeholder="City"
                            value={city || family.city || ''}
                            onChange={(e) => setCity(e.target.value)}
                          />
                          <Input
                            placeholder="State"
                            value={state || family.state || ''}
                            onChange={(e) => setState(e.target.value)}
                          />
                          <Input
                            placeholder="ZIP"
                            value={zip || family.zip || ''}
                            onChange={(e) => setZip(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <Button className="bg-navy hover:bg-navy/90">
                      Save Changes
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-red-600 mb-2">Danger Zone</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Deleting your family account will remove all family connections.
                      Individual member accounts will not be affected.
                    </p>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Family Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
