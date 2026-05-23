import { getSupabaseClient } from '../../../lib/supabaseClient'
import type { Database } from '../../../lib/database.types'
import type {
  ClinicRecords,
  Consultation,
  Patient,
  PreventiveCare,
  Tutor,
} from '../types/clinicRecords'
import { GENERIC_TUTOR_NAME, GENERIC_TUTOR_OBSERVATION } from '../types/clinicRecords'

type TutorRow = Database['public']['Tables']['tutores']['Row']
type TutorInsert = Database['public']['Tables']['tutores']['Insert']
type PatientRow = Database['public']['Tables']['pacientes']['Row']
type PatientInsert = Database['public']['Tables']['pacientes']['Insert']
type ConsultationRow = Database['public']['Tables']['consultas']['Row']
type ConsultationInsert = Database['public']['Tables']['consultas']['Insert']
type ConsultationUpdate = Database['public']['Tables']['consultas']['Update']
type PreventiveCareRow = Database['public']['Tables']['vacunas_desparasitaciones']['Row']
type PreventiveCareInsert = Database['public']['Tables']['vacunas_desparasitaciones']['Insert']

function emptyToNull(value: string) {
  return value.trim() === '' ? null : value.trim()
}

function toNumberOrNull(value: string) {
  const trimmed = value.trim().replace(',', '.')
  if (!trimmed) return null
  const numberValue = Number(trimmed)
  return Number.isNaN(numberValue) ? null : numberValue
}

function toStringValue(value: number | null) {
  return value === null ? '' : String(value)
}

function removeUndefined<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T
}

function mapTutor(row: TutorRow): Tutor {
  return {
    id: row.id,
    fullName: row.nombre,
    phone: String(row.telefono),
    email: row.correo ?? '',
    address: row.direccion,
    comuna: row.comuna ?? '',
    observations: row.observaciones ?? '',
  }
}

function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    tutorId: row.id_tutor ?? '',
    tutorName: '',
    name: row.nombre,
    species: row.especie,
    breed: row.raza ?? '',
    sex: row.sexo ?? '',
    age: toStringValue(row.edad),
    weight: toStringValue(row.peso),
    previousDiseases: row.enfermedades_previas ?? '',
    sterilized: Boolean(row.esterilizado),
    birthsCount: toStringValue(row.numero_partos),
    microchip: row.microchip ?? '',
    allergies: row.alergias ?? '',
    previousSurgeries: row.cirugias_previas ?? '',
    livesWithAnimals: Boolean(row.vive_con_animales),
    animalHousemates: row.cuales ?? '',
  }
}

function mapConsultation(row: ConsultationRow): Consultation {
  return {
    id: row.id,
    patientId: row.paciente_id,
    date: row.fecha,
    attentionType: '',
    reason: row.motivo,
    anamnesis: row.anamnesis ?? '',
    physicalExam: row.examen_fisico ?? '',
    temperature: toStringValue(row.temperatura),
    heartRate: toStringValue(row.frecuencia_cardiaca),
    respiratoryRate: toStringValue(row.frecuencia_respiratoria),
    mucousMembranes: row.mucosas ?? '',
    tllc: row.tllc ?? '',
    presumptiveDiagnosis: row.diagnostico_presuntivo ?? '',
    definitiveDiagnosis: row.diagnostico_definitivo ?? '',
    treatment: row.tratamiento ?? '',
    indications: row.indicaciones ?? '',
    nextControl: row['proximo control'] ?? '',
    value: toStringValue(row.valor),
    paymentStatus: (row.estado_pago ?? '') as Consultation['paymentStatus'],
  }
}

function mapPreventiveCare(row: PreventiveCareRow): PreventiveCare {
  return {
    id: row.id,
    patientId: row.paciente_id,
    careType: row.tipo as PreventiveCare['careType'],
    product: row.producto,
    applicationDate: row.fecha_aplicacion ?? '',
    nextDate: row.proxima_fecha ?? '',
    observations: row.observaciones ?? '',
  }
}

function toTutorInsert(tutor: Omit<Tutor, 'id'>): TutorInsert {
  return {
    nombre: tutor.fullName.trim(),
    telefono: tutor.phone.trim(),
    correo: emptyToNull(tutor.email),
    direccion: tutor.address.trim(),
    comuna: emptyToNull(tutor.comuna),
    observaciones: emptyToNull(tutor.observations),
  }
}

function toPatientInsert(patient: Omit<Patient, 'id'>): PatientInsert {
  return {
    id_tutor: patient.tutorId === '' ? null : Number(patient.tutorId),
    nombre: patient.name.trim(),
    especie: patient.species.trim(),
    raza: emptyToNull(patient.breed),
    sexo: emptyToNull(patient.sex),
    edad: toNumberOrNull(patient.age),
    peso: toNumberOrNull(patient.weight),
    enfermedades_previas: emptyToNull(patient.previousDiseases),
    esterilizado: patient.sterilized,
    numero_partos: patient.sterilized ? null : toNumberOrNull(patient.birthsCount),
    microchip: emptyToNull(patient.microchip),
    alergias: emptyToNull(patient.allergies),
    cirugias_previas: emptyToNull(patient.previousSurgeries),
    vive_con_animales: patient.livesWithAnimals,
    cuales: patient.livesWithAnimals ? emptyToNull(patient.animalHousemates) : null,
  }
}

function toConsultationInsert(consultation: Omit<Consultation, 'id'>): ConsultationInsert {
  return {
    paciente_id: Number(consultation.patientId),
    fecha: consultation.date,
    motivo: consultation.reason.trim(),
    anamnesis: emptyToNull(consultation.anamnesis),
    examen_fisico: emptyToNull(consultation.physicalExam),
    temperatura: toNumberOrNull(consultation.temperature),
    frecuencia_cardiaca: toNumberOrNull(consultation.heartRate),
    frecuencia_respiratoria: toNumberOrNull(consultation.respiratoryRate),
    mucosas: emptyToNull(consultation.mucousMembranes),
    tllc: emptyToNull(consultation.tllc),
    diagnostico_presuntivo: emptyToNull(consultation.presumptiveDiagnosis),
    diagnostico_definitivo: emptyToNull(consultation.definitiveDiagnosis),
    tratamiento: emptyToNull(consultation.treatment),
    indicaciones: emptyToNull(consultation.indications),
    'proximo control': emptyToNull(consultation.nextControl),
    valor: toNumberOrNull(consultation.value),
    estado_pago: emptyToNull(consultation.paymentStatus),
  }
}

function toConsultationUpdate(consultation: Partial<Omit<Consultation, 'id'>>): ConsultationUpdate {
  return removeUndefined({
    paciente_id: consultation.patientId === undefined ? undefined : Number(consultation.patientId),
    fecha: consultation.date,
    motivo: consultation.reason?.trim(),
    anamnesis: consultation.anamnesis === undefined ? undefined : emptyToNull(consultation.anamnesis),
    examen_fisico: consultation.physicalExam === undefined ? undefined : emptyToNull(consultation.physicalExam),
    temperatura: consultation.temperature === undefined ? undefined : toNumberOrNull(consultation.temperature),
    frecuencia_cardiaca: consultation.heartRate === undefined ? undefined : toNumberOrNull(consultation.heartRate),
    frecuencia_respiratoria: consultation.respiratoryRate === undefined ? undefined : toNumberOrNull(consultation.respiratoryRate),
    mucosas: consultation.mucousMembranes === undefined ? undefined : emptyToNull(consultation.mucousMembranes),
    tllc: consultation.tllc === undefined ? undefined : emptyToNull(consultation.tllc),
    diagnostico_presuntivo:
      consultation.presumptiveDiagnosis === undefined ? undefined : emptyToNull(consultation.presumptiveDiagnosis),
    diagnostico_definitivo:
      consultation.definitiveDiagnosis === undefined ? undefined : emptyToNull(consultation.definitiveDiagnosis),
    tratamiento: consultation.treatment === undefined ? undefined : emptyToNull(consultation.treatment),
    indicaciones: consultation.indications === undefined ? undefined : emptyToNull(consultation.indications),
    'proximo control': consultation.nextControl === undefined ? undefined : emptyToNull(consultation.nextControl),
    valor: consultation.value === undefined ? undefined : toNumberOrNull(consultation.value),
    estado_pago: consultation.paymentStatus === undefined ? undefined : emptyToNull(consultation.paymentStatus),
  })
}

function toPreventiveCareInsert(preventiveCare: Omit<PreventiveCare, 'id'>): PreventiveCareInsert {
  return {
    paciente_id: Number(preventiveCare.patientId),
    tipo: preventiveCare.careType,
    producto: preventiveCare.product.trim(),
    fecha_aplicacion: preventiveCare.applicationDate,
    proxima_fecha: emptyToNull(preventiveCare.nextDate),
    observaciones: emptyToNull(preventiveCare.observations),
  }
}

export async function fetchClinicRecords(): Promise<ClinicRecords> {
  const client = getSupabaseClient()

  const [tutors, patients, consultations, preventiveCare] = await Promise.all([
    client.from('tutores').select('*').order('id', { ascending: false }),
    client.from('pacientes').select('*').order('id', { ascending: false }),
    client.from('consultas').select('*').order('id', { ascending: false }),
    client.from('vacunas_desparasitaciones').select('*').order('id', { ascending: false }),
  ])

  if (tutors.error) throw tutors.error
  if (patients.error) throw patients.error
  if (consultations.error) throw consultations.error
  if (preventiveCare.error) throw preventiveCare.error

  return {
    tutors: tutors.data.map(mapTutor),
    patients: patients.data.map(mapPatient),
    consultations: consultations.data.map(mapConsultation),
    preventiveCare: preventiveCare.data.map(mapPreventiveCare),
  }
}

export async function insertTutor(tutor: Omit<Tutor, 'id'>) {
  const { data, error } = await getSupabaseClient()
    .from('tutores')
    .insert(toTutorInsert(tutor))
    .select()
    .single()

  if (error) throw error
  return mapTutor(data)
}

export async function getOrCreateGenericTutor() {
  const client = getSupabaseClient()
  const { data: existingTutor, error: searchError } = await client
    .from('tutores')
    .select()
    .eq('nombre', GENERIC_TUTOR_NAME)
    .limit(1)
    .maybeSingle()

  if (searchError) throw searchError
  if (existingTutor) return mapTutor(existingTutor)

  return insertTutor({
    fullName: GENERIC_TUTOR_NAME,
    phone: '0',
    email: '',
    address: 'Sin dirección registrada',
    comuna: '',
    observations: GENERIC_TUTOR_OBSERVATION,
  })
}

export async function updateTutor(id: Tutor['id'], tutor: Partial<Omit<Tutor, 'id'>>) {
  const { data, error } = await getSupabaseClient()
    .from('tutores')
    .update(removeUndefined(toTutorInsert({ ...emptyTutor, ...tutor })))
    .eq('id', Number(id))
    .select()
    .single()

  if (error) throw error
  return mapTutor(data)
}

export async function insertPatient(patient: Omit<Patient, 'id'>) {
  const { data, error } = await getSupabaseClient()
    .from('pacientes')
    .insert(toPatientInsert(patient))
    .select()
    .single()

  if (error) throw error
  return mapPatient(data)
}

export async function updatePatient(id: Patient['id'], patient: Partial<Omit<Patient, 'id'>>) {
  const { data, error } = await getSupabaseClient()
    .from('pacientes')
    .update(removeUndefined(toPatientInsert({ ...emptyPatient, ...patient })))
    .eq('id', Number(id))
    .select()
    .single()

  if (error) throw error
  return mapPatient(data)
}

export async function insertConsultation(consultation: Omit<Consultation, 'id'>) {
  const { data, error } = await getSupabaseClient()
    .from('consultas')
    .insert(toConsultationInsert(consultation))
    .select()
    .single()

  if (error) throw error
  return mapConsultation(data)
}

export async function updateConsultation(
  id: Consultation['id'],
  consultation: Partial<Omit<Consultation, 'id'>>,
) {
  const { data, error } = await getSupabaseClient()
    .from('consultas')
    .update(toConsultationUpdate(consultation))
    .eq('id', Number(id))
    .select()
    .single()

  if (error) throw error
  return mapConsultation(data)
}

export async function insertPreventiveCare(preventiveCare: Omit<PreventiveCare, 'id'>) {
  const { data, error } = await getSupabaseClient()
    .from('vacunas_desparasitaciones')
    .insert(toPreventiveCareInsert(preventiveCare))
    .select()
    .single()

  if (error) throw error
  return mapPreventiveCare(data)
}

export async function updatePreventiveCare(
  id: PreventiveCare['id'],
  preventiveCare: Partial<Omit<PreventiveCare, 'id'>>,
) {
  const { data, error } = await getSupabaseClient()
    .from('vacunas_desparasitaciones')
    .update(removeUndefined(toPreventiveCareInsert({ ...emptyPreventiveCare, ...preventiveCare })))
    .eq('id', Number(id))
    .select()
    .single()

  if (error) throw error
  return mapPreventiveCare(data)
}

const emptyTutor: Omit<Tutor, 'id'> = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  comuna: '',
  observations: '',
}

const emptyPatient: Omit<Patient, 'id'> = {
  tutorId: '',
  tutorName: '',
  name: '',
  species: '',
  breed: '',
  sex: '',
  age: '',
  weight: '',
  previousDiseases: '',
  sterilized: false,
  birthsCount: '',
  microchip: '',
  allergies: '',
  previousSurgeries: '',
  livesWithAnimals: false,
  animalHousemates: '',
}

const emptyPreventiveCare: Omit<PreventiveCare, 'id'> = {
  patientId: '',
  careType: 'Vacuna',
  product: '',
  applicationDate: '',
  nextDate: '',
  observations: '',
}
