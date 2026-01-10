import { vi } from 'vitest'

// Mock query builder that chains methods
export const createMockQueryBuilder = (data: any = null, error: any = null) => {
  const builder: any = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    upsert: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    neq: vi.fn(() => builder),
    gt: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lt: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    like: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    is: vi.fn(() => builder),
    in: vi.fn(() => builder),
    contains: vi.fn(() => builder),
    containedBy: vi.fn(() => builder),
    range: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    offset: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data, error })),
    maybeSingle: vi.fn(() => Promise.resolve({ data, error })),
    then: vi.fn((resolve) => resolve({ data, error })),
  }
  return builder
}

// Mock Supabase client
export const createMockSupabaseClient = (overrides: any = {}) => {
  const mockFrom = vi.fn(() => createMockQueryBuilder())

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      ...overrides.auth,
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        download: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.jpg' } })),
      })),
      ...overrides.storage,
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
