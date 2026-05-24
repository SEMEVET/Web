import type { ReactNode } from 'react'
import { ClipboardList, Download, HeartPulse, House, Stethoscope, Users, WalletCards } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/context/useAuth'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { profile, user, signOut } = useAuth()
  const navItems = [
    { to: '/home', label: 'Inicio', icon: House },
    { to: '/tutores', label: 'Tutores', icon: Users },
    { to: '/pacientes', label: 'Pacientes', icon: HeartPulse },
    { to: '/consultas', label: 'Consultas', icon: Stethoscope },
    { to: '/estado-consultas', label: 'Estado de Consultas', icon: WalletCards },
    { to: '/historial', label: 'Historial Clínico', icon: ClipboardList },
    { to: '/exportar', label: 'Exportar Datos', icon: Download },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <NavLink className="brand" to="/home" aria-label="SEMEVET inicio">
          <img src="/brand/semevet-logo.png" alt="Logo SEMEVET" />
          <span>SEMEVET</span>
        </NavLink>

        <nav className="nav-list">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              to={to}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-status">
          <span className="status-dot" aria-hidden="true" />
          <span className="sidebar-status-copy">
            <strong>{isSupabaseConfigured ? 'Sesión' : 'Modo inicial'}</strong>
            <span>
              {isSupabaseConfigured ? profile?.name ?? user?.email ?? 'activa' : 'Sin credenciales configuradas'}
            </span>
          </span>
        </div>
        <button className="logout-button" type="button" onClick={() => void signOut()}>
          Cerrar sesión
        </button>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
