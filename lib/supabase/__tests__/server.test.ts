import {createClient} from '../server';
import {cookies} from 'next/headers';

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn((url, key, options) => {
    // Trigger a cookie operation to test cookie management
    options.cookies.get('test-cookie');
    return {
      auth: {
        getSession: jest.fn(),
      },
    };
  }),
}));

describe('Supabase Server Client', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {...OLD_ENV};
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('creates a server client with environment variables', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const client = createClient();

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it('creates a client with cookie management', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    createClient();

    expect(cookies).toHaveBeenCalled();
  });
});
