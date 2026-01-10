'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface PermissionState {
  permissions: string[]
  role: string | null
  loading: boolean
  error: string | null
}

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const [state, setState] = useState<PermissionState>({
    permissions: [],
    role: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setState(prev => ({ ...prev, loading: false, error: 'Not authenticated' }))
        return
      }

      // Get member with role
      const { data: member } = await supabase
        .from('members')
        .select('id, role')
        .eq('user_id', user.id)
        .single()

      if (!member) {
        setState(prev => ({ ...prev, loading: false, error: 'Member not found' }))
        return
      }

      // Get role-based permissions
      const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select('permission:permissions(name)')
        .eq('role', member.role)

      // Get individual permission overrides
      const { data: memberPerms } = await supabase
        .from('member_permissions')
        .select('permission:permissions(name), granted')
        .eq('member_id', member.id)

      // Build permission list
      const permissions = new Set<string>()

      // Add role permissions
      rolePerms?.forEach((rp: any) => {
        if (rp.permission?.name) {
          permissions.add(rp.permission.name)
        }
      })

      // Apply individual overrides
      memberPerms?.forEach((mp: any) => {
        if (mp.permission?.name) {
          if (mp.granted) {
            permissions.add(mp.permission.name)
          } else {
            permissions.delete(mp.permission.name)
          }
        }
      })

      setState({
        permissions: Array.from(permissions),
        role: member.role,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load permissions' }))
    }
  }

  const hasPermission = useCallback((permission: string): boolean => {
    // Admins have all permissions
    if (state.role === 'admin') return true
    return state.permissions.includes(permission)
  }, [state.permissions, state.role])

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (state.role === 'admin') return true
    return permissions.some(p => state.permissions.includes(p))
  }, [state.permissions, state.role])

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (state.role === 'admin') return true
    return permissions.every(p => state.permissions.includes(p))
  }, [state.permissions, state.role])

  const isAdmin = state.role === 'admin'
  const isStaff = state.role === 'staff' || state.role === 'admin'

  return {
    ...state,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isStaff,
    refresh: fetchPermissions
  }
}

/**
 * Permission categories for UI grouping
 */
export const permissionCategories = {
  members: 'Member Management',
  content: 'Content Management',
  events: 'Events',
  giving: 'Giving & Finance',
  communications: 'Communications',
  groups: 'Groups',
  volunteers: 'Volunteers',
  prayer: 'Prayer',
  settings: 'Settings',
  analytics: 'Analytics & Reports'
}
