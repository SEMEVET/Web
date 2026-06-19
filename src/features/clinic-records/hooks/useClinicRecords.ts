import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured } from '../../../lib/supabaseClient'
import {
  fetchClinicRecords,
  getOrCreateGenericTutor,
  insertClinicalExam,
  insertConsultation,
  insertPatient,
  insertPreventiveCare,
  insertTutor,
  updateConsultation as updateConsultationRecord,
  updateClinicalExam as updateClinicalExamRecord,
  updatePatient as updatePatientRecord,
  updatePreventiveCare as updatePreventiveCareRecord,
  updateTutor as updateTutorRecord,
} from '../data/clinicRecordsRepository'
import type {
  ClinicRecords,
  ClinicalExam,
  Consultation,
  Patient,
  PreventiveCare,
  Tutor,
} from '../types/clinicRecords'
import {
  GENERIC_TUTOR_NAME,
  GENERIC_TUTOR_OBSERVATION,
  NO_TUTOR_MARKER,
  isGenericTutor,
} from '../types/clinicRecords'

const initialRecords: ClinicRecords = {
  tutors: [],
  patients: [],
  consultations: [],
  preventiveCare: [],
  exams: [],
}

function createId() {
  return crypto.randomUUID()
}

function sortPatientsByName(patients: Patient[]) {
  return [...patients].sort((firstPatient, secondPatient) =>
    firstPatient.name.localeCompare(secondPatient.name, 'es', { sensitivity: 'base' }),
  )
}

export function useClinicRecords() {
  const [records, setRecords] = useState<ClinicRecords>(initialRecords)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isActive = true

    async function loadRecords() {
      try {
        setError(null)
        const remoteRecords = await fetchClinicRecords()

        if (isActive) {
          setRecords({
            ...remoteRecords,
            patients: sortPatientsByName(remoteRecords.patients),
          })
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los datos.')
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadRecords()

    return () => {
      isActive = false
    }
  }, [])

  const actions = useMemo(
    () => ({
      async addTutor(tutor: Omit<Tutor, 'id'>) {
        setError(null)
        const savedTutor = isSupabaseConfigured ? await insertTutor(tutor) : { ...tutor, id: createId() }

        setRecords((current) => ({
          ...current,
          tutors: [savedTutor, ...current.tutors],
        }))

        return savedTutor
      },
      async updateTutor(id: Tutor['id'], tutor: Partial<Omit<Tutor, 'id'>>) {
        setError(null)
        const savedTutor = isSupabaseConfigured ? await updateTutorRecord(id, tutor) : null

        setRecords((current) => ({
          ...current,
          tutors: current.tutors.map((currentTutor) =>
            currentTutor.id === id ? { ...currentTutor, ...(savedTutor ?? tutor) } : currentTutor,
          ),
        }))

        return savedTutor
      },
      async addPatient(patient: Omit<Patient, 'id'>) {
        setError(null)
        let patientToSave = patient

        if (patient.tutorId === NO_TUTOR_MARKER) {
          let genericTutor = records.tutors.find(isGenericTutor)

          if (!genericTutor) {
            const genericTutorPayload: Omit<Tutor, 'id'> = {
              fullName: GENERIC_TUTOR_NAME,
              phone: '0',
              email: '',
              address: 'Sin dirección registrada',
              comuna: '',
              observations: GENERIC_TUTOR_OBSERVATION,
            }

            const savedGenericTutor = isSupabaseConfigured
              ? await getOrCreateGenericTutor()
              : { ...genericTutorPayload, id: createId() }

            genericTutor = savedGenericTutor

            setRecords((current) => ({
              ...current,
              tutors: [savedGenericTutor, ...current.tutors],
            }))
          }

          if (!genericTutor) {
            throw new Error('No se pudo preparar el tutor genérico para pacientes sin tutor.')
          }

          patientToSave = {
            ...patient,
            tutorId: genericTutor.id,
            tutorName: genericTutor.fullName,
          }
        }

        const savedPatient = isSupabaseConfigured
          ? await insertPatient(patientToSave)
          : { ...patientToSave, id: createId() }

        setRecords((current) => ({
          ...current,
          patients: sortPatientsByName([savedPatient, ...current.patients]),
        }))

        return savedPatient
      },
      async updatePatient(id: Patient['id'], patient: Partial<Omit<Patient, 'id'>>) {
        setError(null)
        const savedPatient = isSupabaseConfigured ? await updatePatientRecord(id, patient) : null

        setRecords((current) => ({
          ...current,
          patients: sortPatientsByName(
            current.patients.map((currentPatient) =>
              currentPatient.id === id ? { ...currentPatient, ...(savedPatient ?? patient) } : currentPatient,
            ),
          ),
        }))

        return savedPatient
      },
      async addConsultation(consultation: Omit<Consultation, 'id'>) {
        setError(null)
        const savedConsultation = isSupabaseConfigured
          ? await insertConsultation(consultation)
          : { ...consultation, id: createId() }

        setRecords((current) => ({
          ...current,
          consultations: [savedConsultation, ...current.consultations],
        }))

        return savedConsultation
      },
      async updateConsultation(id: Consultation['id'], consultation: Partial<Omit<Consultation, 'id'>>) {
        setError(null)
        const savedConsultation = isSupabaseConfigured
          ? await updateConsultationRecord(id, consultation)
          : null

        setRecords((current) => ({
          ...current,
          consultations: current.consultations.map((currentConsultation) =>
            currentConsultation.id === id
              ? { ...currentConsultation, ...(savedConsultation ?? consultation) }
              : currentConsultation,
          ),
        }))

        return savedConsultation
      },
      async addPreventiveCare(preventiveCare: Omit<PreventiveCare, 'id'>) {
        setError(null)
        const savedPreventiveCare = isSupabaseConfigured
          ? await insertPreventiveCare(preventiveCare)
          : { ...preventiveCare, id: createId() }

        setRecords((current) => ({
          ...current,
          preventiveCare: [savedPreventiveCare, ...current.preventiveCare],
        }))

        return savedPreventiveCare
      },
      async addClinicalExam(exam: Omit<ClinicalExam, 'id'>) {
        setError(null)
        const savedExam = isSupabaseConfigured
          ? await insertClinicalExam(exam)
          : { ...exam, id: createId() }

        setRecords((current) => ({
          ...current,
          exams: [savedExam, ...current.exams],
        }))

        return savedExam
      },
      async updatePreventiveCare(id: PreventiveCare['id'], preventiveCare: Partial<Omit<PreventiveCare, 'id'>>) {
        setError(null)
        const savedPreventiveCare = isSupabaseConfigured
          ? await updatePreventiveCareRecord(id, preventiveCare)
          : null

        setRecords((current) => ({
          ...current,
          preventiveCare: current.preventiveCare.map((currentPreventiveCare) =>
            currentPreventiveCare.id === id
              ? { ...currentPreventiveCare, ...(savedPreventiveCare ?? preventiveCare) }
              : currentPreventiveCare,
          ),
        }))

        return savedPreventiveCare
      },
      async updateClinicalExam(id: ClinicalExam['id'], exam: Partial<Omit<ClinicalExam, 'id'>>) {
        setError(null)
        const savedExam = isSupabaseConfigured
          ? await updateClinicalExamRecord(id, exam)
          : null

        setRecords((current) => ({
          ...current,
          exams: current.exams.map((currentExam) =>
            currentExam.id === id
              ? { ...currentExam, ...(savedExam ?? exam) }
              : currentExam,
          ),
        }))

        return savedExam
      },
    }),
    [records.tutors],
  )

  return { records, actions, isLoading, error }
}
