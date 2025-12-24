// TPC Ministries - Role System Utilities
// 5-tier hierarchy: free < member < partner < staff < admin

export type MemberRole = 'free' | 'member' | 'partner' | 'staff' | 'admin'

// Role hierarchy - higher index = more permissions
export const ROLE_HIERARCHY: MemberRole[] = ['free', 'member', 'partner', 'staff', 'admin']

// Role display information
export const ROLE_INFO: Record<MemberRole, {
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
}> = {
  free: {
    label: 'Free',
    description: 'New member with limited access',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    icon: 'User',
  },
  member: {
    label: 'Member',
    description: 'Engaged member with standard access',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    icon: 'UserCheck',
  },
  partner: {
    label: 'Partner',
    description: 'Committed supporter with premium access',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    icon: 'Sparkles',
  },
  staff: {
    label: 'Staff',
    description: 'Ministry team with admin access',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    icon: 'Users',
  },
  admin: {
    label: 'Admin',
    description: 'Full platform control',
    color: 'text-gold',
    bgColor: 'bg-gold/20',
    borderColor: 'border-gold/30',
    icon: 'Crown',
  },
}

/**
 * Get the numeric level of a role (0-4)
 */
export function getRoleLevel(role: string): number {
  const index = ROLE_HIERARCHY.indexOf(role as MemberRole)
  return index >= 0 ? index : 0
}

/**
 * Check if a user's role meets the minimum required role
 * @param userRole - The user's current role
 * @param requiredRole - The minimum role required
 * @returns true if userRole >= requiredRole in the hierarchy
 */
export function hasMinimumRole(userRole: string | undefined | null, requiredRole: MemberRole): boolean {
  if (!userRole) return requiredRole === 'free'
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole)
}

/**
 * Check if user can access content that requires a specific role
 */
export function canAccessContent(userRole: string | undefined | null, contentRequiredRole: string): boolean {
  return hasMinimumRole(userRole, contentRequiredRole as MemberRole)
}

/**
 * Check if user is staff or above (can access admin features)
 */
export function isStaffOrAbove(role: string | undefined | null): boolean {
  return hasMinimumRole(role, 'staff')
}

/**
 * Check if user is admin
 */
export function isAdmin(role: string | undefined | null): boolean {
  return role === 'admin'
}

/**
 * Check if user can manage financial/billing settings (admin only)
 */
export function canManageFinancials(role: string | undefined | null): boolean {
  return role === 'admin'
}

/**
 * Check if user can manage other members' roles (admin only)
 */
export function canManageRoles(role: string | undefined | null): boolean {
  return role === 'admin'
}

/**
 * Check if user can manage content (staff and above)
 */
export function canManageContent(role: string | undefined | null): boolean {
  return isStaffOrAbove(role)
}

/**
 * Get the next role in the hierarchy for promotion
 */
export function getNextRole(currentRole: string): MemberRole | null {
  const currentIndex = getRoleLevel(currentRole)
  if (currentIndex >= ROLE_HIERARCHY.length - 1) return null
  return ROLE_HIERARCHY[currentIndex + 1]
}

/**
 * Get the previous role in the hierarchy for demotion
 */
export function getPreviousRole(currentRole: string): MemberRole | null {
  const currentIndex = getRoleLevel(currentRole)
  if (currentIndex <= 0) return null
  return ROLE_HIERARCHY[currentIndex - 1]
}

/**
 * Convert old tier/is_admin to new role
 */
export function migrateToRole(tier?: string, isAdmin?: boolean): MemberRole {
  if (isAdmin) return 'admin'
  if (tier === 'covenant' || tier === 'partner') return 'partner'
  return 'free'
}

/**
 * Get roles that a user can assign to others
 * Admins can assign all roles
 * Staff can only assign free, member, partner (not staff/admin)
 */
export function getAssignableRoles(assignerRole: string | undefined | null): MemberRole[] {
  if (isAdmin(assignerRole)) {
    return [...ROLE_HIERARCHY]
  }
  if (isStaffOrAbove(assignerRole)) {
    return ['free', 'member', 'partner']
  }
  return []
}

/**
 * Format role for display
 */
export function formatRole(role: string | undefined | null): string {
  if (!role) return 'Free'
  const info = ROLE_INFO[role as MemberRole]
  return info?.label || 'Free'
}

/**
 * Get role badge classes for styling
 */
export function getRoleBadgeClasses(role: string | undefined | null): string {
  if (!role) role = 'free'
  const info = ROLE_INFO[role as MemberRole]
  if (!info) return 'bg-gray-100 text-gray-600 border-gray-200'
  return `${info.bgColor} ${info.color} ${info.borderColor}`
}
