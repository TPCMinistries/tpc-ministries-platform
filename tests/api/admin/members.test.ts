import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/members/route'
import { createMockRequest, parseJsonResponse } from '@/tests/utils'
import { createMockSupabaseClient, mockAuthenticatedUser, mockMember, mockAdminMember } from '@/tests/__mocks__/supabase'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

describe('Admin Members API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/members', () => {
    it('should return 401 if user is not authenticated', async () => {
      const mockClient = createMockSupabaseClient({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        },
      })

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const request = createMockRequest('/api/admin/members', { method: 'GET' })
      const response = await GET(request)
      const body = await parseJsonResponse(response)

      expect(response.status).toBe(401)
      expect(body.error).toBe('Unauthorized')
    })

    it('should return 403 if user is not admin', async () => {
      // Non-admin member
      let queryCount = 0
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn(() => {
          queryCount++
          // First query checks admin status
          if (queryCount === 1) {
            return Promise.resolve({ data: { is_admin: false, role: 'member' }, error: null })
          }
          return Promise.resolve({ data: null, error: null })
        }),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      }

      const mockClient = createMockSupabaseClient({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
        },
      })
      mockClient.from = vi.fn(() => mockQueryBuilder)

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const request = createMockRequest('/api/admin/members', { method: 'GET' })
      const response = await GET(request)
      const body = await parseJsonResponse(response)

      expect(response.status).toBe(403)
      expect(body.error).toBe('Forbidden')
    })

    it('should return members list for admin user', async () => {
      const mockMembers = [mockMember, mockAdminMember]

      let queryCount = 0
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn(() => {
          queryCount++
          // First query checks admin status
          if (queryCount === 1) {
            return Promise.resolve({ data: { is_admin: true, role: 'admin' }, error: null })
          }
          return Promise.resolve({ data: null, error: null })
        }),
        then: vi.fn((resolve) => resolve({ data: mockMembers, error: null })),
      }

      const mockClient = createMockSupabaseClient({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
        },
      })
      mockClient.from = vi.fn(() => mockQueryBuilder)

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const request = createMockRequest('/api/admin/members', { method: 'GET' })
      const response = await GET(request)
      const body = await parseJsonResponse(response)

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.members).toBeDefined()
      expect(body.stats).toBeDefined()
    })
  })

  describe('POST /api/admin/members', () => {
    it('should return 400 if required fields are missing', async () => {
      let queryCount = 0
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => {
          queryCount++
          if (queryCount === 1) {
            return Promise.resolve({ data: { is_admin: true, role: 'admin' }, error: null })
          }
          return Promise.resolve({ data: null, error: null })
        }),
      }

      const mockClient = createMockSupabaseClient({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
        },
      })
      mockClient.from = vi.fn(() => mockQueryBuilder)

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const request = createMockRequest('/api/admin/members', {
        method: 'POST',
        body: {
          first_name: 'John',
          // Missing last_name and email
        },
      })

      const response = await POST(request)
      const body = await parseJsonResponse(response)

      expect(response.status).toBe(400)
      expect(body.error).toContain('required')
    })

    it('should return 400 if email already exists', async () => {
      let queryCount = 0
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => {
          queryCount++
          if (queryCount === 1) {
            // Admin check
            return Promise.resolve({ data: { is_admin: true, role: 'admin' }, error: null })
          }
          if (queryCount === 2) {
            // Email exists check - return existing member
            return Promise.resolve({ data: { id: 'existing-id' }, error: null })
          }
          return Promise.resolve({ data: null, error: null })
        }),
      }

      const mockClient = createMockSupabaseClient({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
        },
      })
      mockClient.from = vi.fn(() => mockQueryBuilder)

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const request = createMockRequest('/api/admin/members', {
        method: 'POST',
        body: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'existing@example.com',
        },
      })

      const response = await POST(request)
      const body = await parseJsonResponse(response)

      expect(response.status).toBe(400)
      expect(body.error).toContain('already exists')
    })
  })

  describe('DELETE /api/admin/members', () => {
    it('should return 400 when trying to delete own account', async () => {
      let queryCount = 0
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => {
          queryCount++
          if (queryCount === 1) {
            // Admin check
            return Promise.resolve({ data: { is_admin: true, role: 'admin' }, error: null })
          }
          if (queryCount === 2) {
            // Target member lookup - return own user_id
            return Promise.resolve({ data: { user_id: mockAuthenticatedUser.id }, error: null })
          }
          return Promise.resolve({ data: null, error: null })
        }),
        then: vi.fn((resolve) => resolve({ data: null, error: null })),
      }

      const mockClient = createMockSupabaseClient({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
        },
      })
      mockClient.from = vi.fn(() => mockQueryBuilder)

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const request = createMockRequest('/api/admin/members?id=self-id', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const body = await parseJsonResponse(response)

      expect(response.status).toBe(400)
      expect(body.error).toContain('cannot delete your own')
    })
  })
})
