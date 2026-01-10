import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/prayer/submit/route'
import { createMockRequest, parseJsonResponse } from '@/tests/utils'
import { createMockSupabaseClient, createMockQueryBuilder, mockAuthenticatedUser, mockMember } from '@/tests/__mocks__/supabase'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

describe('POST /api/prayer/submit', () => {
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

    const request = createMockRequest('/api/prayer/submit', {
      method: 'POST',
      body: {
        request_text: 'Please pray for me',
        category: 'spiritual',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toContain('Unauthorized')
  })

  it('should return 404 if member not found', async () => {
    // First call for getUser, second for member lookup
    const mockQueryBuilder = createMockQueryBuilder(null, null)
    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
      },
    })
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/submit', {
      method: 'POST',
      body: {
        request_text: 'Please pray for me',
        category: 'spiritual',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(404)
    expect(body.error).toContain('Member profile not found')
  })

  it('should return 400 if request_text is missing', async () => {
    const mockMemberQuery = createMockQueryBuilder({ id: mockMember.id }, null)
    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
      },
    })
    mockClient.from = vi.fn(() => mockMemberQuery)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/submit', {
      method: 'POST',
      body: {
        category: 'spiritual',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('should return 400 if request_text exceeds 500 characters', async () => {
    const longText = 'a'.repeat(501)

    const mockMemberQuery = createMockQueryBuilder({ id: mockMember.id }, null)
    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
      },
    })
    mockClient.from = vi.fn(() => mockMemberQuery)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/submit', {
      method: 'POST',
      body: {
        request_text: longText,
        category: 'spiritual',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toContain('500 characters')
  })

  it('should return 400 for invalid category', async () => {
    const mockMemberQuery = createMockQueryBuilder({ id: mockMember.id }, null)
    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
      },
    })
    mockClient.from = vi.fn(() => mockMemberQuery)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/submit', {
      method: 'POST',
      body: {
        request_text: 'Please pray for me',
        category: 'invalid-category',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toContain('category')
  })

  it('should return 201 on successful submission', async () => {
    const mockPrayer = {
      id: 'prayer-123',
      member_id: mockMember.id,
      request_text: 'Please pray for my health',
      category: 'health',
      is_public: true,
      is_anonymous: false,
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    // Create separate query builders for member lookup and prayer insert
    let callCount = 0
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { id: mockMember.id }, error: null })
        }
        return Promise.resolve({ data: mockPrayer, error: null })
      }),
    }

    const mockClient = createMockSupabaseClient({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockAuthenticatedUser }, error: null })),
      },
    })
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/prayer/submit', {
      method: 'POST',
      body: {
        request_text: 'Please pray for my health',
        category: 'health',
        is_public: true,
        is_anonymous: false,
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(body.message).toContain('submitted')
    expect(body.data).toBeDefined()
  })
})
