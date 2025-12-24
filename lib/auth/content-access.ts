// Content Access Control Utilities
// Maps content tier requirements to the role hierarchy

import { hasMinimumRole, type MemberRole } from './roles'

// Map old tier values to new role hierarchy
export function tierToRole(tier: string | null | undefined): MemberRole {
  switch (tier) {
    case 'covenant':
    case 'partner':
      return 'partner'
    case 'member':
      return 'member'
    case 'free':
    default:
      return 'free'
  }
}

/**
 * Check if a user can access content based on tier requirement
 * @param userRole - The user's role (from members.role)
 * @param contentTier - The content's tier_required field
 * @returns true if user can access
 */
export function canAccessContent(
  userRole: string | null | undefined,
  contentTier: string | null | undefined
): boolean {
  const requiredRole = tierToRole(contentTier)
  return hasMinimumRole(userRole, requiredRole)
}

/**
 * Filter an array of content items by user's access level
 * @param items - Array of content items with tier_required field
 * @param userRole - The user's role
 * @param tierField - The field name containing tier requirement (default: 'tier_required')
 * @returns Items the user can access
 */
export function filterByAccess<T extends Record<string, any>>(
  items: T[],
  userRole: string | null | undefined,
  tierField: string = 'tier_required'
): T[] {
  return items.filter(item => canAccessContent(userRole, item[tierField]))
}

/**
 * Add access info to content items (for UI display)
 * @param items - Array of content items
 * @param userRole - The user's role
 * @param tierField - The field name containing tier requirement
 * @returns Items with added `canAccess` and `requiredRole` fields
 */
export function addAccessInfo<T extends Record<string, any>>(
  items: T[],
  userRole: string | null | undefined,
  tierField: string = 'tier_required'
): (T & { canAccess: boolean; requiredRole: string })[] {
  return items.map(item => ({
    ...item,
    canAccess: canAccessContent(userRole, item[tierField]),
    requiredRole: tierToRole(item[tierField]),
  }))
}

/**
 * Get upgrade message for a required role
 */
export function getUpgradeMessage(requiredRole: string): string {
  switch (requiredRole) {
    case 'admin':
      return 'This content is admin-only.'
    case 'staff':
      return 'This content is for staff members.'
    case 'partner':
      return 'Become a Partner to unlock this content.'
    case 'member':
      return 'Join as a Member to access this content.'
    default:
      return 'Sign up to access this content.'
  }
}
