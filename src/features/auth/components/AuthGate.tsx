import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../../lib/supabaseClient'
import { useAuth } from '../context/useAuth'
import { LoginPage } from '../pages/LoginPage'

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth()

  if (!isSupabaseConfigured) {
    return <LoginPage mode="missing-config" />
  }

  if (isLoading) {
    return (
      <div className="auth-page">
        <section className="auth-card">
          <img src="/brand/semevet-logo.png" alt="Logo SEMEVET" />
          <p className="auth-muted">Validando sesión...</p>
        </section>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
