'use client'

import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const supabase = createClient()

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
  }

  const signOut = async () => {
    return supabase.auth.signOut()
  }

  return {
    signIn,
    signUp,
    signOut,
  }
} 