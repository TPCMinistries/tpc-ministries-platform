'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Shield,
  Users,
  User,
  Search,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Check,
  X,
  Crown,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Lock,
  Save,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface RolePermission {
  role: string
  permission_id: string
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  avatar_url: string | null
}

interface MemberPermission {
  id: string
  member_id: string
  permission_id: string
  granted: boolean
}

const ROLES = ['free', 'member', 'partner', 'staff', 'admin'] as const
const ROLE_LABELS: Record<string, string> = {
  free: 'Free',
  member: 'Member',
  partner: 'Partner',
  staff: 'Staff',
  admin: 'Admin',
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  free: <User className="h-4 w-4" />,
  member: <User className="h-4 w-4 text-green-600" />,
  partner: <Sparkles className="h-4 w-4 text-blue-600" />,
  staff: <Shield className="h-4 w-4 text-purple-600" />,
  admin: <Crown className="h-4 w-4 text-gold" />,
}

const CATEGORY_ORDER = ['members', 'content', 'events', 'giving', 'communications', 'groups', 'settings', 'reports']

export default function PermissionsPage() {
  const { toast } = useToast()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [memberPermissions, setMemberPermissions] = useState<MemberPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORY_ORDER))
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Fetch permissions
      const { data: perms } = await supabase
        .from('permissions')
        .select('*')
        .order('category')
        .order('name')

      // Fetch role permissions
      const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select('*')

      // Fetch staff/admin members for individual permissions
      const { data: staffMembers } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, role, avatar_url')
        .in('role', ['staff', 'admin'])
        .order('first_name')

      setPermissions(perms || [])
      setRolePermissions(rolePerms || [])
      setMembers(staffMembers || [])
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMemberPermissions = async (memberId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('member_permissions')
      .select('*')
      .eq('member_id', memberId)

    setMemberPermissions(data || [])
  }

  const hasRolePermission = (role: string, permissionId: string) => {
    return rolePermissions.some(rp => rp.role === role && rp.permission_id === permissionId)
  }

  const toggleRolePermission = async (role: string, permissionId: string) => {
    const supabase = createClient()
    const hasPermission = hasRolePermission(role, permissionId)

    setSaving(true)
    try {
      if (hasPermission) {
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role)
          .eq('permission_id', permissionId)
      } else {
        await supabase
          .from('role_permissions')
          .insert({ role, permission_id: permissionId })
      }

      // Refresh data
      const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select('*')

      setRolePermissions(rolePerms || [])

      toast({
        title: hasPermission ? 'Permission revoked' : 'Permission granted',
        description: `Updated ${ROLE_LABELS[role]} role permissions`,
      })
    } catch (error) {
      console.error('Error updating permission:', error)
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getMemberPermissionState = (memberId: string, permissionId: string): boolean | null => {
    const mp = memberPermissions.find(
      p => p.member_id === memberId && p.permission_id === permissionId
    )
    return mp ? mp.granted : null
  }

  const toggleMemberPermission = async (memberId: string, permissionId: string, currentState: boolean | null) => {
    const supabase = createClient()

    setSaving(true)
    try {
      if (currentState === null) {
        // No override exists, create one (grant)
        await supabase
          .from('member_permissions')
          .insert({ member_id: memberId, permission_id: permissionId, granted: true })
      } else if (currentState === true) {
        // Currently granted, switch to revoked
        await supabase
          .from('member_permissions')
          .update({ granted: false })
          .eq('member_id', memberId)
          .eq('permission_id', permissionId)
      } else {
        // Currently revoked, remove override
        await supabase
          .from('member_permissions')
          .delete()
          .eq('member_id', memberId)
          .eq('permission_id', permissionId)
      }

      await fetchMemberPermissions(memberId)

      toast({
        title: 'Permission updated',
        description: 'Individual permission override updated',
      })
    } catch (error) {
      console.error('Error updating member permission:', error)
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  const sortedCategories = Object.keys(permissionsByCategory).sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a)
    const bIndex = CATEGORY_ORDER.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  const filteredMembers = searchQuery
    ? members.filter(m =>
        `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin-settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Permissions Management
            </h1>
            <p className="text-gray-600 mt-1">Manage role-based and individual permissions</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-navy" />
          </div>
        ) : (
          <Tabs defaultValue="roles" className="space-y-6">
            <TabsList>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Role Permissions
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Individual Overrides
              </TabsTrigger>
            </TabsList>

            {/* Role Permissions Tab */}
            <TabsContent value="roles">
              <Card>
                <CardHeader>
                  <CardTitle>Role-Based Permissions</CardTitle>
                  <CardDescription>
                    Configure what each role can do. Admin role always has full access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600 w-1/3">Permission</th>
                          {ROLES.slice(0, -1).map(role => (
                            <th key={role} className="text-center py-3 px-4 font-medium">
                              <div className="flex items-center justify-center gap-1">
                                {ROLE_ICONS[role]}
                                <span>{ROLE_LABELS[role]}</span>
                              </div>
                            </th>
                          ))}
                          <th className="text-center py-3 px-4 font-medium">
                            <div className="flex items-center justify-center gap-1 text-gold">
                              {ROLE_ICONS.admin}
                              <span>Admin</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCategories.map(category => (
                          <>
                            <tr
                              key={`cat-${category}`}
                              className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                              onClick={() => toggleCategory(category)}
                            >
                              <td colSpan={6} className="py-2 px-4">
                                <div className="flex items-center gap-2 font-medium text-navy">
                                  {expandedCategories.has(category) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <span className="capitalize">{category}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {permissionsByCategory[category].length}
                                  </Badge>
                                </div>
                              </td>
                            </tr>
                            {expandedCategories.has(category) &&
                              permissionsByCategory[category].map(perm => (
                                <tr key={perm.id} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-4 pl-10">
                                    <div>
                                      <p className="font-medium text-sm">{perm.name}</p>
                                      <p className="text-xs text-gray-500">{perm.description}</p>
                                    </div>
                                  </td>
                                  {ROLES.slice(0, -1).map(role => (
                                    <td key={role} className="text-center py-3 px-4">
                                      <Switch
                                        checked={hasRolePermission(role, perm.id)}
                                        onCheckedChange={() => toggleRolePermission(role, perm.id)}
                                        disabled={saving}
                                      />
                                    </td>
                                  ))}
                                  <td className="text-center py-3 px-4">
                                    <div className="flex items-center justify-center">
                                      <Check className="h-5 w-5 text-green-500" />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Individual Permissions Tab */}
            <TabsContent value="members">
              <div className="grid grid-cols-3 gap-6">
                {/* Member List */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Staff & Admins</CardTitle>
                    <CardDescription>Select a member to manage their overrides</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredMembers.map(member => (
                        <button
                          key={member.id}
                          onClick={() => {
                            setSelectedMember(member)
                            fetchMemberPermissions(member.id)
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            selectedMember?.id === member.id
                              ? 'bg-navy text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className={selectedMember?.id === member.id ? 'bg-white/20 text-white' : ''}>
                              {member.first_name[0]}{member.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {member.first_name} {member.last_name}
                            </p>
                            <div className="flex items-center gap-1">
                              {ROLE_ICONS[member.role]}
                              <span className={`text-xs ${selectedMember?.id === member.id ? 'text-white/70' : 'text-gray-500'}`}>
                                {ROLE_LABELS[member.role]}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Permission Overrides */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedMember
                        ? `${selectedMember.first_name} ${selectedMember.last_name}'s Overrides`
                        : 'Permission Overrides'}
                    </CardTitle>
                    <CardDescription>
                      {selectedMember
                        ? 'Grant or revoke specific permissions that override their role defaults'
                        : 'Select a member to manage their permission overrides'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedMember ? (
                      <div className="text-center py-12 text-gray-500">
                        <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a member from the list to manage their permissions</p>
                      </div>
                    ) : selectedMember.role === 'admin' ? (
                      <div className="text-center py-12 text-gray-500">
                        <Crown className="h-12 w-12 mx-auto mb-4 text-gold opacity-50" />
                        <p className="font-medium text-navy">Admin Role</p>
                        <p className="text-sm">Admins have full access to all permissions</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {sortedCategories.map(category => (
                          <div key={category}>
                            <h3 className="font-medium text-navy capitalize mb-2 flex items-center gap-2">
                              {category}
                              <Badge variant="outline" className="text-xs">
                                {permissionsByCategory[category].length}
                              </Badge>
                            </h3>
                            <div className="space-y-1 pl-4">
                              {permissionsByCategory[category].map(perm => {
                                const roleHas = hasRolePermission(selectedMember.role, perm.id)
                                const override = getMemberPermissionState(selectedMember.id, perm.id)

                                const effectiveAccess = override !== null ? override : roleHas

                                return (
                                  <div
                                    key={perm.id}
                                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                                  >
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{perm.name}</p>
                                      <p className="text-xs text-gray-500">{perm.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {/* Role default indicator */}
                                      <span className={`text-xs ${roleHas ? 'text-green-600' : 'text-gray-400'}`}>
                                        Role: {roleHas ? 'Yes' : 'No'}
                                      </span>

                                      {/* Override button */}
                                      <button
                                        onClick={() => toggleMemberPermission(selectedMember.id, perm.id, override)}
                                        disabled={saving}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                          override === true
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : override === false
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {override === true
                                          ? 'Granted'
                                          : override === false
                                          ? 'Revoked'
                                          : 'Default'}
                                      </button>

                                      {/* Effective result */}
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        effectiveAccess ? 'bg-green-100' : 'bg-red-100'
                                      }`}>
                                        {effectiveAccess ? (
                                          <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <X className="h-4 w-4 text-red-600" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
