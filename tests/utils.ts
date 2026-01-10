import { NextRequest } from 'next/server'

/**
 * Create a mock NextRequest for API route testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
    searchParams?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {}, searchParams = {} } = options

  // Build URL with search params
  const urlObj = new URL(url, 'http://localhost:3000')
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body)
  }

  return new NextRequest(urlObj, requestInit)
}

/**
 * Parse JSON response from API route
 */
export async function parseJsonResponse(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Test helper for checking API error responses
 */
export function expectError(response: Response, status: number, messageContains?: string) {
  expect(response.status).toBe(status)
  if (messageContains) {
    return parseJsonResponse(response).then((body) => {
      expect(body.error?.toLowerCase() || '').toContain(messageContains.toLowerCase())
    })
  }
}

/**
 * Test helper for checking successful API responses
 */
export function expectSuccess(response: Response, status = 200) {
  expect(response.status).toBe(status)
  return parseJsonResponse(response)
}

/**
 * Mock common data for tests
 */
export const testData = {
  prayer: {
    id: 'prayer-123',
    request_text: 'Please pray for healing',
    category: 'health',
    is_public: true,
    is_anonymous: false,
    status: 'approved',
    member_id: 'member-123',
    created_at: new Date().toISOString(),
  },
  blogPost: {
    id: 'blog-123',
    slug: 'test-blog-post',
    title: 'Test Blog Post',
    content: 'This is test content',
    excerpt: 'Test excerpt',
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  teaching: {
    id: 'teaching-123',
    title: 'Test Teaching',
    description: 'Test description',
    video_url: 'https://youtube.com/watch?v=123',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  event: {
    id: 'event-123',
    title: 'Test Event',
    description: 'Test event description',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    location: 'Test Location',
    is_public: true,
    created_at: new Date().toISOString(),
  },
}
