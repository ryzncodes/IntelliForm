import {renderHook, act} from '@testing-library/react';
import {useAuth} from '../use-auth';
import {createClient} from '@/lib/supabase/client';
import {useRouter} from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

describe('useAuth', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  const mockSupabase = {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('signIn', () => {
    it('redirects to dashboard on successful login', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({error: null});
      const {result} = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      expect(mockRouter.refresh).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('sets error on failed login', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        error: new Error('Invalid credentials'),
      });
      const {result} = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@example.com', 'wrong-password');
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('redirects to login with verification message on successful signup', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({error: null});
      const {result} = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp('test@example.com', 'password');
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/login?verified=true');
    });
  });

  describe('signInWithProvider', () => {
    it('initiates OAuth flow with correct provider', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValueOnce({
        data: {url: 'https://oauth-url.com'},
        error: null,
      });
      const {result} = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInWithProvider('google');
      });

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          queryParams: {
            next: '/dashboard',
          },
        },
      });
    });
  });

  describe('signOut', () => {
    it('redirects to login page on successful logout', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({error: null});
      const {result} = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });
});
