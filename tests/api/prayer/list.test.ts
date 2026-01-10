import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/prayer/list/route'
import { createMockRequest, parseJsonResponse } from '@/tests/utils'
import { createMockSupabaseClient, createMockQueryBuilder } from '@/tests/__mocks__/supabase'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

describe('GET /api/prayer/list', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated prayer requests', async () => {
    const mockPrayers = [
      {
        id: 'prayer-1',
        request_text: 'Prayer request 1',
        category: 'health',
        is_anonymous: false,
        is_answered: false,
        prayer_count: 5,
        created_at: new Date().toISOString(),
        member_id: 'member-1',
        members: {
          id: 'member-1',
          email: 'test@example.com',
          raw_user_meta_data: { full_name: 'Test User' },
        },
      },
      {
        id: 'prayer-2',
        request_text: 'Prayer request 2',
        category: 'family',
        is_anonymous: true,
        is_answered: false,
        prayer_count: 10,
        created_at: new Date().toISOString(),
        member_id: 'member-2',
        members: {
          id: 'member-2',
          email: 'another@example.com',
          raw_user_meta_data: { full_name: 'Another User' },
        },
      },
    ]

    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: mockPrayers, error: null, count: 2 })),
    }

    const mockClient = createMockSupabaseClient()
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/list', {
      method: 'GET',
      searchParams: { page: '1', limit: '20' },
    })

    const response = await GET(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(body.data).toHaveLength(2)
    expect(body.pagination).toBeDefined()
    expect(body.pagination.page).toBe(1)
  })

  it('should hide member details for anonymous prayers', async () => {
    const mockPrayers = [
      {
        id: 'prayer-1',
        request_text: 'Anonymous prayer',
        category: 'spiritual',
        is_anonymous: true,
        is_answered: false,
        prayer_count: 3,
        created_at: new Date().toISOString(),
        member_id: 'member-1',
        members: {
          id: 'member-1',
          email: 'secret@example.com',
          raw_user_meta_data: { full_name: 'Secret User' },
        },
      },
    ]

    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: mockPrayers, error: null, count: 1 })),
    }

    const mockClient = createMockSupabaseClient()
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/list', {
      method: 'GET',
    })

    const response = await GET(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(200)
    expect(body.data[0].requester).toBe('Anonymous')
    expect(body.data[0].members).toBeUndefined()
    expect(body.data[0].member_id).toBeUndefined()
  })

  it('should filter by category', async () => {
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
    }

    const mockClient = createMockSupabaseClient()
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/list', {
      method: 'GET',
      searchParams: { category: 'health' },
    })

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('category', 'health')
  })

  it('should return 500 on database error', async () => {
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: null, error: { message: 'Database error' }, count: 0 })),
    }

    const mockClient = createMockSupabaseClient()
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/list', {
      method: 'GET',
    })

    const response = await GET(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBeDefined()
  })
})
