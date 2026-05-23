import { createContext } from 'react'
import type { useClinicRecords } from '../hooks/useClinicRecords'

export type ClinicRecordsContextValue = ReturnType<typeof useClinicRecords>

export const ClinicRecordsContext = createContext<ClinicRecordsContextValue | null>(null)
