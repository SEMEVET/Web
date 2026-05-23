import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../../../lib/supabaseClient'
import { fetchCurrentProfile, upsertProfile } from '../data/authRepository'
import type { AuthProfile } from '../types/auth'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isActive = true
    const client = getSupabaseClient()

    async function loadSession() {
      const { data, error: sessionError } = await client.auth.getSession()

      if (!isActive) return

      if (sessionError) {
        setError(sessionError.message)
      }

      setSession(data.session)

      if (data.session?.user) {
        try {
          const currentProfile = await fetchCurrentProfile(data.session.user.id)

          if (isActive) {
            setProfile(currentProfile)
          }
        } catch (profileError) {
          if (isActive) {
            setError(
              profileError instanceof Error
                ? profileError.message
                : 'No se pudo cargar el perfil de usuario.',
            )
            setProfile(null)
          }
        }
      }

      if (isActive) {
        setIsLoading(false)
      }
    }

    void loadSession()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)

      if (!nextSession?.user) {
        setProfile(null)
        return
      }

      void fetchCurrentProfile(nextSession.user.id).then(setProfile).catch(() => setProfile(null))
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      error,
      async signIn(email, password) {
        setError(null)
        const { data, error: signInError } = await getSupabaseClient().auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          throw signInError
        }

        setSession(data.session)

        if (data.user) {
          const currentProfile = await fetchCurrentProfile(data.user.id)
          setProfile(currentProfile)
        }
      },
      async signUp({ name, email, password, phone }) {
        setError(null)
        const { data, error: signUpError } = await getSupabaseClient().auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
            },
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          throw signUpError
        }

        if (data.user) {
          const savedProfile = await upsertProfile({
            id: data.user.id,
            name,
            email,
            phone,
          })
          setProfile(savedProfile)
        }

        setSession(data.session)
      },
      async signOut() {
        setError(null)
        const { error: signOutError } = await getSupabaseClient().auth.signOut()

        if (signOutError) {
          setError(signOutError.message)
          throw signOutError
        }

        setSession(null)
        setProfile(null)
      },
    }),
    [error, isLoading, profile, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
