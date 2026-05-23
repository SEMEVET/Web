import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { AuthProfile } from '../types/auth'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: AuthProfile | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (payload: { name: string; email: string; password: string; phone: string }) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
