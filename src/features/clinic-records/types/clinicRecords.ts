export type PaymentStatus = 'Pendiente' | 'Abonado' | 'Pagado' | 'Social'

export const NO_TUTOR_MARKER = '__NO_TUTOR__'

export const GENERIC_TUTOR_NAME = 'SIN TUTOR'

export const GENERIC_TUTOR_OBSERVATION = 'Tutor genérico para pacientes sin tutor registrado.'

export type Tutor = {
  id: number | string
  fullName: string
  phone: string
  email: string
  address: string
  comuna: string
  observations: string
}

export type Patient = {
  id: number | string
  tutorId: number | string
  tutorName: string
  name: string
  species: string
  breed: string
  sex: string
  age: string
  weight: string
  previousDiseases: string
  sterilized: boolean
  birthsCount: string
  microchip: string
  allergies: string
  previousSurgeries: string
  livesWithAnimals: boolean
  animalHousemates: string
}

export type Consultation = {
  id: number | string
  patientId: number | string
  date: string
  attentionType: string
  reason: string
  anamnesis: string
  physicalExam: string
  temperature: string
  heartRate: string
  respiratoryRate: string
  mucousMembranes: string
  tllc: string
  presumptiveDiagnosis: string
  definitiveDiagnosis: string
  treatment: string
  indications: string
  nextControl: string
  value: string
  paymentStatus: PaymentStatus | ''
}

export type PreventiveCare = {
  id: number | string
  patientId: number | string
  careType: 'Vacuna' | 'Desparasitación'
  product: string
  applicationDate: string
  nextDate: string
  observations: string
}

export type ClinicRecords = {
  tutors: Tutor[]
  patients: Patient[]
  consultations: Consultation[]
  preventiveCare: PreventiveCare[]
}

export function isGenericTutor(tutor?: Tutor) {
  return tutor?.fullName.trim().toUpperCase() === GENERIC_TUTOR_NAME
    || tutor?.observations.trim() === GENERIC_TUTOR_OBSERVATION
}
