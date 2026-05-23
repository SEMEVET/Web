import type { ReactNode } from 'react'
import { useClinicRecords } from '../hooks/useClinicRecords'
import { ClinicRecordsContext } from './clinicRecordsContext'

type ClinicRecordsProviderProps = {
  children: ReactNode
}

export function ClinicRecordsProvider({ children }: ClinicRecordsProviderProps) {
  const clinicRecords = useClinicRecords()

  return (
    <ClinicRecordsContext.Provider value={clinicRecords}>
      {children}
    </ClinicRecordsContext.Provider>
  )
}
