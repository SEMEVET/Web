import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { AuthGate } from '../features/auth/components/AuthGate'
import { AuthProvider } from '../features/auth/context/AuthProvider'
import { ClinicRecordsProvider } from '../features/clinic-records/context/ClinicRecordsProvider'
import { ConsultationStatusPage } from '../features/clinic-records/pages/ConsultationStatusPage'
import { ConsultationsPage } from '../features/clinic-records/pages/ConsultationsPage'
import { ExportDataPage } from '../features/clinic-records/pages/ExportDataPage'
import { HomePage } from '../features/clinic-records/pages/HomePage'
import { MedicalHistoryPage } from '../features/clinic-records/pages/MedicalHistoryPage'
import { PatientsPage } from '../features/clinic-records/pages/PatientsPage'
import { TutorsPage } from '../features/clinic-records/pages/TutorsPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { useAuth } from '../features/auth/context/useAuth'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/*"
            element={
              <AuthGate>
                <ClinicRecordsProvider>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Navigate to="/home" replace />} />
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/tutores" element={<TutorsPage />} />
                      <Route path="/pacientes" element={<PatientsPage />} />
                      <Route path="/consultas" element={<ConsultationsPage />} />
                      <Route path="/estado-consultas" element={<ConsultationStatusPage />} />
                      <Route path="/historial" element={<MedicalHistoryPage />} />
                      <Route path="/exportar" element={<ExportDataPage />} />
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                  </AppShell>
                </ClinicRecordsProvider>
              </AuthGate>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function LoginRoute() {
  const { session } = useAuth()

  if (!isSupabaseConfigured) {
    return <LoginPage mode="missing-config" />
  }

  if (session) {
    return <Navigate to="/home" replace />
  }

  return <LoginPage mode="login" />
}
