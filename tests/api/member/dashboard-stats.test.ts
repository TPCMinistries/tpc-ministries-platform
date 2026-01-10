import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/member/dashboard/stats/route'
import { createMockSupabaseClient, createMockQueryBuilder, mockAuthenticatedUser, mockMember } from '@/tests/__mocks__/supabase'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

describe('GET /api/member/dashboard/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
    })

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('should return 404 if member not found', async () => {
    const mockQueryBuilder = createMockQueryBuilder(null, null)
    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
      },
    })
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Member not found')
  })

  it('should return dashboard stats for authenticated member', async () => {
    // Create table-aware mock that returns different data based on table
    const createTableAwareMock = (table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn(() => {
        if (table === 'members') {
          return Promise.resolve({ data: mockMember, error: null })
        }
        if (table === 'member_streaks') {
          return Promise.resolve({ data: { current_streak: 5 }, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      }),
      then: vi.fn((resolve) => {
        if (table === 'member_activity') {
          return resolve({ data: [{ activity_type: 'teaching_viewed', created_at: new Date().toISOString() }], error: null })
        }
        if (table === 'member_assessment_results') {
          return resolve({ data: null, error: null, count: 2 })
        }
        return resolve({ data: null, error: null })
      }),
    })

    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
      },
    })
    mockClient.from = vi.fn((table: string) => createTableAwareMock(table))

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.stats).toBeDefined()
    expect(body.stats.total_content_consumed).toBeDefined()
    expect(body.stats.assessments_completed).toBeDefined()
    expect(body.stats.days_since_joining).toBeDefined()
  })

  it('should calculate days since joining correctly', async () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const recentMember = {
      ...mockMember,
      created_at: threeDaysAgo.toISOString(),
    }

    // Create table-aware mock that returns different data based on table
    const createTableAwareMock = (table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn(() => {
        if (table === 'members') {
          return Promise.resolve({ data: recentMember, error: null })
        }
        if (table === 'member_streaks') {
          return Promise.resolve({ data: { current_streak: 0 }, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      }),
      then: vi.fn((resolve) => {
        if (table === 'member_activity') {
          return resolve({ data: [], error: null })
        }
        if (table === 'member_assessment_results') {
          return resolve({ data: null, error: null, count: 0 })
        }
        return resolve({ data: null, error: null })
      }),
    })

    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
      },
    })
    mockClient.from = vi.fn((table: string) => createTableAwareMock(table))

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.stats.days_since_joining).toBeGreaterThanOrEqual(3)
    expect(body.stats.days_since_joining).toBeLessThanOrEqual(4) // Allow for timing variations
  })
})
