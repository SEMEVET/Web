import { useState, type FormEvent } from 'react'
import { FormMessage } from '../../../components/ui/FormMessage'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { isGenericTutor, type ClinicalExam, type Patient, type PaymentMethod, type Tutor } from '../types/clinicRecords'

type ClinicalExamFormProps = {
  patients: Patient[]
  tutors: Tutor[]
  onSubmit: (exam: Omit<ClinicalExam, 'id'>) => Promise<ClinicalExam | void>
}

const examTypes = [
  'Biopsia con bordes',
  'Biopsia simple',
  'T4 + Tsh',
  'Citología',
  'Cultivo y antibiograma',
  'Leptospira',
  'Lipasa Pancreática Específica C',
  'Lipasa Pancreática Específica F',
  'Parasitológico',
  'SDMA',
  'Toxicológico Completo',
  'Toxicológico Parcial',
  'Perfil Bioquímico + Hemograma',
  'Urianálisis Completo',
  'Urianálisis Con Medición',
  'Urocultivo',
  'Recuento de reticulocitos',
]

const initialForm: Omit<ClinicalExam, 'id'> = {
  patientId: '',
  examType: '',
  value: '',
  paymentMethod: '',
  sampleDate: '',
  sampleType: '',
  observations: '',
}

type ClinicalExamField = keyof typeof initialForm
type ClinicalExamErrors = Partial<Record<ClinicalExamField, string>>

const paymentMethods: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mixto']

export function ClinicalExamForm({ patients, tutors, onSubmit }: ClinicalExamFormProps) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<ClinicalExamErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const hasPatients = patients.length > 0
  const patientOptions = patients.map((patient) => ({
    value: String(patient.id),
    label: formatPatientOption(patient, tutors),
    searchText: `${patient.name} ${patient.species} ${patient.breed} ${patient.microchip}`,
  }))

  function updateField(field: ClinicalExamField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage(null)
  }

  function validateForm() {
    const nextErrors: ClinicalExamErrors = {}

    if (!form.patientId) nextErrors.patientId = 'Selecciona el paciente.'
    if (!form.examType) nextErrors.examType = 'Selecciona el tipo de examen.'
    if (!form.value.trim()) nextErrors.value = 'Ingresa el valor.'
    if (form.value.trim() && !isValidNumber(form.value)) nextErrors.value = 'El valor debe ser numérico. Puedes usar coma o punto.'
    if (form.value.trim() && isValidNumber(form.value) && Number(normalizeDecimalValue(form.value)) < 0) {
      nextErrors.value = 'El valor no puede ser negativo.'
    }
    if (!form.sampleDate) nextErrors.sampleDate = 'Selecciona la fecha de toma de muestra.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Revisa los campos marcados en rojo antes de guardar.' })
      return
    }

    const payload: Omit<ClinicalExam, 'id'> = {
      patientId: form.patientId,
      examType: form.examType,
      value: normalizeDecimalValue(form.value),
      paymentMethod: form.paymentMethod,
      sampleDate: form.sampleDate,
      sampleType: form.sampleType.trim(),
      observations: form.observations.trim(),
    }

    try {
      setIsSaving(true)
      await onSubmit(payload)
      setForm(initialForm)
      setErrors({})
      setMessage({ type: 'success', text: 'Examen guardado correctamente en Supabase.' })
    } catch {
      setMessage({
        type: 'error',
        text: 'No se pudo guardar el examen. Revisa permisos RLS, conexión o migración de Supabase.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit} noValidate>
      <label className={errors.patientId ? 'field-error' : undefined}>
        <span className="field-label">Nombre paciente <span className="required-mark">*</span></span>
        <SearchableSelect
          disabled={!hasPatients}
          emptyText="No hay pacientes que coincidan"
          options={patientOptions}
          placeholder={hasPatients ? 'Buscar paciente' : 'Registra un paciente primero'}
          value={String(form.patientId)}
          onChange={(value) => updateField('patientId', value)}
        />
        {errors.patientId && <small className="field-error-text">{errors.patientId}</small>}
      </label>

      <label className={errors.examType ? 'field-error' : undefined}>
        <span className="field-label">Tipo examen <span className="required-mark">*</span></span>
        <select required value={form.examType} onChange={(event) => updateField('examType', event.target.value)}>
          <option value="">Seleccionar examen</option>
          {examTypes.map((examType) => (
            <option key={examType} value={examType}>{examType}</option>
          ))}
        </select>
        {errors.examType && <small className="field-error-text">{errors.examType}</small>}
      </label>

      <label className={errors.value ? 'field-error' : undefined}>
        <span className="field-label">Valor <span className="required-mark">*</span></span>
        <input required inputMode="decimal" value={form.value} onChange={(event) => updateField('value', event.target.value)} />
        {errors.value && <small className="field-error-text">{errors.value}</small>}
      </label>

      <label className={errors.sampleDate ? 'field-error' : undefined}>
        <span className="field-label">Fecha de toma de muestra <span className="required-mark">*</span></span>
        <input required type="date" value={form.sampleDate} onChange={(event) => updateField('sampleDate', event.target.value)} />
        {errors.sampleDate && <small className="field-error-text">{errors.sampleDate}</small>}
      </label>

      <label>
        Método de pago
        <select value={form.paymentMethod} onChange={(event) => updateField('paymentMethod', event.target.value as PaymentMethod | '')}>
          <option value="">Sin registrar</option>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </label>

      <label>
        Tipo de muestra
        <input value={form.sampleType} onChange={(event) => updateField('sampleType', event.target.value)} />
      </label>

      <label className="wide-field">
        Observaciones
        <textarea value={form.observations} onChange={(event) => updateField('observations', event.target.value)} />
      </label>

      {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
      <button type="submit" disabled={!hasPatients || isSaving}>
        {isSaving ? 'Guardando examen...' : 'Registrar examen'}
      </button>
    </form>
  )
}

function isValidNumber(value: string) {
  return Number.isFinite(Number(normalizeDecimalValue(value)))
}

function normalizeDecimalValue(value: string) {
  return value.trim().replace(',', '.')
}

function formatPatientOption(patient: Patient, tutors: Tutor[]) {
  const tutor = tutors.find((currentTutor) => String(currentTutor.id) === String(patient.tutorId))
  const tutorName = isGenericTutor(tutor) ? 'Sin tutor registrado' : tutor?.fullName ?? 'Sin tutor asociado'

  return `${patient.name} - Tutor: ${tutorName}`
}
