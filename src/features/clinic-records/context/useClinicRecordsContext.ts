import { useContext } from 'react'
import { ClinicRecordsContext } from './clinicRecordsContext'

export function useClinicRecordsContext() {
  const context = useContext(ClinicRecordsContext)

  if (!context) {
    throw new Error('useClinicRecordsContext debe usarse dentro de ClinicRecordsProvider.')
  }

  return context
}
