'use client';

import {createClient} from '@/lib/supabase/client';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

type Provider = 'google' | 'github';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const {error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      router.push('/login?verified=true');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      setIsLoading(true);
      setError(null);

      const {data, error} = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            next: '/dashboard',
          },
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      // Redirect to the OAuth provider's login page
      window.location.href = data.url;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : `Failed to sign in with ${provider}`
      );
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {error} = await supabase.auth.signOut();
      if (error) throw error;

      router.push('/login');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    isLoading,
    error,
  };
}
