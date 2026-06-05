import { vi } from 'vitest'

type MockQueryBuilder = Record<string, ReturnType<typeof vi.fn>>

interface MockClientOverrides {
  auth?: Record<string, unknown>
  storage?: Record<string, unknown>
  [key: string]: unknown
}

// Mock query builder that chains methods
export const createMockQueryBuilder = (data: unknown = null, error: unknown = null) => {
  const builder = {} as MockQueryBuilder
  builder.select = vi.fn(() => builder)
  builder.insert = vi.fn(() => builder)
  builder.update = vi.fn(() => builder)
  builder.delete = vi.fn(() => builder)
  builder.upsert = vi.fn(() => builder)
  builder.eq = vi.fn(() => builder)
  builder.neq = vi.fn(() => builder)
  builder.gt = vi.fn(() => builder)
  builder.gte = vi.fn(() => builder)
  builder.lt = vi.fn(() => builder)
  builder.lte = vi.fn(() => builder)
  builder.like = vi.fn(() => builder)
  builder.ilike = vi.fn(() => builder)
  builder.is = vi.fn(() => builder)
  builder.in = vi.fn(() => builder)
  builder.contains = vi.fn(() => builder)
  builder.containedBy = vi.fn(() => builder)
  builder.range = vi.fn(() => builder)
  builder.order = vi.fn(() => builder)
  builder.limit = vi.fn(() => builder)
  builder.offset = vi.fn(() => builder)
  builder.single = vi.fn(() => Promise.resolve({ data, error }))
  builder.maybeSingle = vi.fn(() => Promise.resolve({ data, error }))
  builder.then = vi.fn((resolve: (value: { data: unknown; error: unknown }) => unknown) =>
    resolve({ data, error })
  )
  return builder
}

// Mock Supabase client
export const createMockSupabaseClient = (overrides: MockClientOverrides = {}) => {
  const mockFrom: ReturnType<typeof vi.fn> = vi.fn(() => createMockQueryBuilder())

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      ...(overrides.auth ?? {}),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        download: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.jpg' } })),
      })),
      ...(overrides.storage ?? {}),
    },
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    ...overrides,
  }
}

// Mock authenticated user
export const mockAuthenticatedUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  role: 'authenticated',
}

// Mock member record
export const mockMember = {
  id: 'test-member-id-123',
  user_id: 'test-user-id-123',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  phone: '+1234567890',
  role: 'member',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock admin member
export const mockAdminMember = {
  ...mockMember,
  id: 'test-admin-id-123',
  role: 'admin',
  email: 'admin@example.com',
}
