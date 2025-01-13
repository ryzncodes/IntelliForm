import { createClient } from '../server'
import { cookies } from 'next/headers'

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
    },
  })),
}))

describe('Supabase Server Client', () => {
  const OLD_ENV = process.env
  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...OLD_ENV }
    ;(cookies as jest.Mock).mockResolvedValue(mockCookieStore)
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('creates a server client with environment variables', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const client = await createClient()

    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })

  it('throws an error if environment variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    await expect(createClient()).rejects.toThrow('Missing environment variables for Supabase client')
  })

  it('creates a client with cookie management', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    await createClient()

    expect(cookies).toHaveBeenCalled()
  })
}) 