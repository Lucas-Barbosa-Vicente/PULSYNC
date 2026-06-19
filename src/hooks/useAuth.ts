'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, session, profile, loading, initialize, signInWithEmail, signUp, signOut } =
    useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return { user, session, profile, loading, signInWithEmail, signUp, signOut }
}
