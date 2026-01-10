import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/public/contact/route'
import { createMockRequest, parseJsonResponse } from '@/tests/utils'
import { createMockSupabaseClient, createMockQueryBuilder } from '@/tests/__mocks__/supabase'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

describe('POST /api/public/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if name is missing', async () => {
    const request = createMockRequest('/api/public/contact', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        message: 'Hello',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('should return 400 if email is missing', async () => {
    const request = createMockRequest('/api/public/contact', {
      method: 'POST',
      body: {
        name: 'Test User',
        message: 'Hello',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('should return 400 if message is missing', async () => {
    const request = createMockRequest('/api/public/contact', {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('should return 400 for invalid email format', async () => {
    const request = createMockRequest('/api/public/contact', {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'invalid-email',
        message: 'Hello',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toContain('Invalid email')
  })

  it('should return 201 on successful submission', async () => {
    const mockSubmission = {
      id: 'submission-123',
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello',
      created_at: new Date().toISOString(),
    }

    const mockQueryBuilder = createMockQueryBuilder(mockSubmission, null)
    const mockClient = createMockSupabaseClient()
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/public/contact', {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello',
        category: 'general',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.message).toContain('Thank you')
  })

  it('should return 500 on database error', async () => {
    const mockQueryBuilder = createMockQueryBuilder(null, { message: 'Database error' })
    const mockClient = createMockSupabaseClient()
    mockClient.from = vi.fn(() => mockQueryBuilder)

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const request = createMockRequest('/api/public/contact', {
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello',
      },
    })

    const response = await POST(request)
    const body = await parseJsonResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBeDefined()
  })
})
