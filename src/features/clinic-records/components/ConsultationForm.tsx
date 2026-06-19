import { useState, type FormEvent } from 'react'
import { FormMessage } from '../../../components/ui/FormMessage'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { isGenericTutor, type Consultation, type Patient, type PaymentMethod, type PaymentStatus, type Tutor } from '../types/clinicRecords'

type ConsultationFormProps = {
  patients: Patient[]
  tutors: Tutor[]
  onSubmit: (consultation: Omit<Consultation, 'id'>) => Promise<Consultation | void>
}

const initialForm = {
  patientId: '',
  date: '',
  attentionType: '',
  reason: '',
  anamnesis: '',
  relevantHistory: '',
  physicalExam: '',
  temperature: '',
  heartRate: '',
  respiratoryRate: '',
  weight: '',
  mucousMembranes: '',
  tllc: '',
  hydration: '',
  bodyCondition: '',
  pain: '',
  clinicalFindings: '',
  presumptiveDiagnosis: '',
  differentialDiagnoses: '',
  definitiveDiagnosis: '',
  treatment: '',
  prescribedMedications: '',
  suggestedTests: '',
  indications: '',
  controlCriteria: '',
  referralCriteria: '',
  nextControl: '',
  internalObservations: '',
  value: '',
  paymentStatus: '',
  paymentMethod: '',
}

type ConsultationField = keyof typeof initialForm
type ConsultationErrors = Partial<Record<ConsultationField, string>>

const soapTextFields: Array<{ field: ConsultationField; label: string }> = [
  { field: 'reason', label: 'Motivo de consulta' },
  { field: 'anamnesis', label: 'Anamnesis' },
  { field: 'relevantHistory', label: 'Antecedentes relevantes' },
  { field: 'physicalExam', label: 'Examen físico general' },
  { field: 'clinicalFindings', label: 'Hallazgos clínicos' },
  { field: 'presumptiveDiagnosis', label: 'Diagnóstico presuntivo' },
  { field: 'differentialDiagnoses', label: 'Diagnósticos diferenciales' },
  { field: 'definitiveDiagnosis', label: 'Diagnóstico definitivo' },
  { field: 'treatment', label: 'Tratamiento aplicado' },
  { field: 'prescribedMedications', label: 'Medicamentos indicados' },
  { field: 'suggestedTests', label: 'Exámenes sugeridos' },
  { field: 'indications', label: 'Indicaciones al tutor' },
  { field: 'controlCriteria', label: 'Criterio de control' },
  { field: 'referralCriteria', label: 'Criterio de derivación' },
  { field: 'internalObservations', label: 'Observaciones internas' },
]

const paymentMethods: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mixto']

export function ConsultationForm({ patients, tutors, onSubmit }: ConsultationFormProps) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<ConsultationErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const hasPatients = patients.length > 0
  const patientOptions = patients.map((patient) => ({
    value: String(patient.id),
    label: formatPatientOption(patient, tutors),
    searchText: `${patient.name} ${patient.species} ${patient.breed} ${patient.microchip}`,
  }))

  function updateField(field: ConsultationField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage(null)
  }

  function validateForm() {
    const nextErrors: ConsultationErrors = {}
    const numericFields: Array<[ConsultationField, string]> = [
      ['temperature', 'La temperatura debe ser un número válido.'],
      ['heartRate', 'La frecuencia cardíaca debe ser numérica.'],
      ['respiratoryRate', 'La frecuencia respiratoria debe ser numérica.'],
      ['weight', 'El peso debe ser numérico. Puedes usar coma o punto.'],
      ['value', 'El valor debe ser numérico.'],
    ]

    if (!form.patientId) nextErrors.patientId = 'Selecciona el paciente.'
    if (!form.date) nextErrors.date = 'Selecciona la fecha de atención.'
    if (!form.attentionType.trim()) nextErrors.attentionType = 'Ingresa el tipo de atención.'
    if (!form.value.trim()) nextErrors.value = 'Ingresa el valor de la consulta.'
    if (!form.paymentStatus) nextErrors.paymentStatus = 'Selecciona el estado de pago.'
    if (!form.reason.trim()) nextErrors.reason = 'Ingresa el motivo de la consulta.'

    numericFields.forEach(([field, text]) => {
      const value = form[field]
      const normalizedValue = normalizeDecimalValue(value)
      if (value.trim() && Number.isNaN(Number(normalizedValue))) nextErrors[field] = text
      if (value.trim() && Number(normalizedValue) < 0) nextErrors[field] = 'El valor no puede ser negativo.'
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Revisa los campos marcados en rojo antes de guardar.' })
      return
    }

    const payload: Omit<Consultation, 'id'> = {
      patientId: form.patientId,
      date: form.date,
      attentionType: form.attentionType.trim(),
      reason: form.reason.trim(),
      anamnesis: form.anamnesis.trim(),
      relevantHistory: form.relevantHistory.trim(),
      physicalExam: form.physicalExam.trim(),
      temperature: normalizeDecimalValue(form.temperature),
      heartRate: form.heartRate.trim(),
      respiratoryRate: form.respiratoryRate.trim(),
      weight: normalizeDecimalValue(form.weight),
      mucousMembranes: form.mucousMembranes.trim(),
      tllc: form.tllc.trim(),
      hydration: form.hydration.trim(),
      bodyCondition: form.bodyCondition.trim(),
      pain: form.pain.trim(),
      clinicalFindings: form.clinicalFindings.trim(),
      presumptiveDiagnosis: form.presumptiveDiagnosis.trim(),
      differentialDiagnoses: form.differentialDiagnoses.trim(),
      definitiveDiagnosis: form.definitiveDiagnosis.trim(),
      treatment: form.treatment.trim(),
      prescribedMedications: form.prescribedMedications.trim(),
      suggestedTests: form.suggestedTests.trim(),
      indications: form.indications.trim(),
      controlCriteria: form.controlCriteria.trim(),
      referralCriteria: form.referralCriteria.trim(),
      nextControl: form.nextControl,
      internalObservations: form.internalObservations.trim(),
      value: normalizeDecimalValue(form.value),
      paymentStatus: form.paymentStatus.trim() as PaymentStatus | '',
      paymentMethod: form.paymentMethod.trim() as PaymentMethod | '',
    }

    try {
      setIsSaving(true)
      await onSubmit(payload)
      setForm(initialForm)
      setErrors({})
      setMessage({ type: 'success', text: 'Consulta guardada correctamente en Supabase.' })
    } catch (saveError) {
      const errorMessage = getErrorMessage(saveError)
      setMessage({
        type: 'error',
        text: errorMessage.includes('column')
          ? 'No se pudo guardar la consulta. Ejecuta la migración SOAP de Supabase y vuelve a intentar.'
          : 'No se pudo guardar la consulta. Revisa permisos RLS o conexión de Supabase.',
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
          value={form.patientId}
          onChange={(value) => updateField('patientId', value)}
        />
        {errors.patientId && <small className="field-error-text">{errors.patientId}</small>}
      </label>
      <label className={errors.date ? 'field-error' : undefined}>
        <span className="field-label">Fecha <span className="required-mark">*</span></span>
        <input required type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} />
        {errors.date && <small className="field-error-text">{errors.date}</small>}
      </label>
      <label className={errors.attentionType ? 'field-error' : undefined}>
        <span className="field-label">Tipo atención <span className="required-mark">*</span></span>
        <input required value={form.attentionType} onChange={(event) => updateField('attentionType', event.target.value)} />
        {errors.attentionType && <small className="field-error-text">{errors.attentionType}</small>}
      </label>
      <label className={errors.value ? 'field-error' : undefined}>
        <span className="field-label">Valor <span className="required-mark">*</span></span>
        <input required inputMode="decimal" value={form.value} onChange={(event) => updateField('value', event.target.value)} />
        {errors.value && <small className="field-error-text">{errors.value}</small>}
      </label>
      <label className={errors.paymentStatus ? 'field-error' : undefined}>
        <span className="field-label">Estado de pago <span className="required-mark">*</span></span>
        <select required value={form.paymentStatus} onChange={(event) => updateField('paymentStatus', event.target.value)}>
          <option value="">Seleccionar</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Abonado">Abonado</option>
          <option value="Pagado">Pagado</option>
          <option value="Social">Social</option>
        </select>
        {errors.paymentStatus && <small className="field-error-text">{errors.paymentStatus}</small>}
      </label>
      <label>
        Método de pago
        <select value={form.paymentMethod} onChange={(event) => updateField('paymentMethod', event.target.value)}>
          <option value="">Sin registrar</option>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </label>

      <label className={errors.temperature ? 'field-error' : undefined}>Temperatura<input inputMode="decimal" value={form.temperature} onChange={(event) => updateField('temperature', event.target.value)} />{errors.temperature && <small className="field-error-text">{errors.temperature}</small>}</label>
      <label className={errors.heartRate ? 'field-error' : undefined}>Frecuencia cardíaca<input inputMode="numeric" value={form.heartRate} onChange={(event) => updateField('heartRate', event.target.value)} />{errors.heartRate && <small className="field-error-text">{errors.heartRate}</small>}</label>
      <label className={errors.respiratoryRate ? 'field-error' : undefined}>Frecuencia respiratoria<input inputMode="numeric" value={form.respiratoryRate} onChange={(event) => updateField('respiratoryRate', event.target.value)} />{errors.respiratoryRate && <small className="field-error-text">{errors.respiratoryRate}</small>}</label>
      <label className={errors.weight ? 'field-error' : undefined}>Peso<input inputMode="decimal" value={form.weight} onChange={(event) => updateField('weight', event.target.value)} />{errors.weight && <small className="field-error-text">{errors.weight}</small>}</label>
      <label>Mucosas<input value={form.mucousMembranes} onChange={(event) => updateField('mucousMembranes', event.target.value)} /></label>
      <label>TLLC<input value={form.tllc} onChange={(event) => updateField('tllc', event.target.value)} /></label>
      <label>Hidratación<input value={form.hydration} onChange={(event) => updateField('hydration', event.target.value)} /></label>
      <label>Condición corporal<input value={form.bodyCondition} onChange={(event) => updateField('bodyCondition', event.target.value)} /></label>
      <label>Dolor<input value={form.pain} onChange={(event) => updateField('pain', event.target.value)} /></label>
      <label>
        Próximo control
        <input type="date" value={form.nextControl} onChange={(event) => updateField('nextControl', event.target.value)} />
      </label>

      {soapTextFields.map(({ field, label }) => (
        <label className={`wide-field ${errors[field] ? 'field-error' : ''}`} key={field}>
          <span className="field-label">{label}{field === 'reason' && <span className="required-mark"> *</span>}</span>
          <textarea required={field === 'reason'} value={form[field]} onChange={(event) => updateField(field, event.target.value)} />
          {errors[field] && <small className="field-error-text">{errors[field]}</small>}
        </label>
      ))}

      {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
      <button type="submit" disabled={!hasPatients || isSaving}>
        {isSaving ? 'Guardando consulta...' : 'Registrar consulta'}
      </button>
    </form>
  )
}

function normalizeDecimalValue(value: string) {
  return value.trim().replace(',', '.')
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : ''
  }

  return ''
}

function formatPatientOption(patient: Patient, tutors: Tutor[]) {
  const tutor = tutors.find((currentTutor) => String(currentTutor.id) === String(patient.tutorId))
  const tutorName = isGenericTutor(tutor) ? 'Sin tutor registrado' : tutor?.fullName ?? 'Sin tutor asociado'

  return `${patient.name} - Tutor: ${tutorName}`
}
