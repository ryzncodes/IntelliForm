import { createClient } from '../client'

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}))

describe('Supabase Client', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('creates a client with environment variables', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const client = createClient()

    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
}) 