import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export type UserRole = 'free' | 'member' | 'partner' | 'staff' | 'admin'

export interface AuthResult {
  user: any
  member: any
  isAdmin: boolean
  isStaff: boolean
  role: UserRole
}

export interface AuthError {
  error: string
  status: number
}

/**
 * Check if the current user is authenticated and optionally verify admin/staff role
 * @param options.requireAdmin - Require admin role (is_admin = true)
 * @param options.requireStaff - Require staff or admin role
 * @returns AuthResult or AuthError
 */
export async function checkAuth(options?: {
  requireAdmin?: boolean
  requireStaff?: boolean
}): Promise<AuthResult | AuthError> {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 }
  }

  // Get member record with role
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, role, is_admin, tier, first_name, last_name, email')
    .eq('user_id', user.id)
    .single()

  if (memberError || !member) {
    return { error: 'Member profile not found', status: 403 }
  }

  const isAdmin = member.is_admin === true
  const isStaff = isAdmin || member.role === 'staff' || member.role === 'admin'
  const role = (member.role || 'free') as UserRole

  // Check admin requirement
  if (options?.requireAdmin && !isAdmin) {
    return { error: 'Admin access required', status: 403 }
  }

  // Check staff requirement
  if (options?.requireStaff && !isStaff) {
    return { error: 'Staff access required', status: 403 }
  }

  return {
    user,
    member,
    isAdmin,
    isStaff,
    role,
  }
}

/**
 * Helper to return error response
 */
export function authErrorResponse(result: AuthError) {
  return NextResponse.json({ error: result.error }, { status: result.status })
}

/**
 * Check if result is an auth error
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return 'error' in result && 'status' in result
}

/**
 * Require admin access - returns error response if not admin
 * Use at the start of admin-only API routes
 */
export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const result = await checkAuth({ requireAdmin: true })

  if (isAuthError(result)) {
    return authErrorResponse(result)
  }

  return result
}

/**
 * Require staff access - returns error response if not staff/admin
 * Use at the start of staff-only API routes
 */
export async function requireStaff(): Promise<AuthResult | NextResponse> {
  const result = await checkAuth({ requireStaff: true })

  if (isAuthError(result)) {
    return authErrorResponse(result)
  }

  return result
}

/**
 * Require authenticated user - returns error response if not logged in
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const result = await checkAuth()

  if (isAuthError(result)) {
    return authErrorResponse(result)
  }

  return result
}
