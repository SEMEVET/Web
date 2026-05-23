import { useState, type FormEvent } from 'react'
import { FormMessage } from '../../../components/ui/FormMessage'
import type { Consultation, Patient, PaymentStatus } from '../types/clinicRecords'

type ConsultationFormProps = {
  patients: Patient[]
  onSubmit: (consultation: Omit<Consultation, 'id'>) => Promise<Consultation | void>
}

const initialForm = {
  patientId: '',
  date: '',
  attentionType: '',
  reason: '',
  anamnesis: '',
  physicalExam: '',
  temperature: '',
  heartRate: '',
  respiratoryRate: '',
  mucousMembranes: '',
  tllc: '',
  presumptiveDiagnosis: '',
  definitiveDiagnosis: '',
  treatment: '',
  indications: '',
  nextControl: '',
  value: '',
  paymentStatus: '',
}

type ConsultationField = keyof typeof initialForm
type ConsultationErrors = Partial<Record<ConsultationField, string>>

export function ConsultationForm({ patients, onSubmit }: ConsultationFormProps) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<ConsultationErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const hasPatients = patients.length > 0

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
      if (value.trim() && Number.isNaN(Number(value))) nextErrors[field] = text
      if (value.trim() && Number(value) < 0) nextErrors[field] = 'El valor no puede ser negativo.'
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
      physicalExam: form.physicalExam.trim(),
      temperature: form.temperature.trim(),
      heartRate: form.heartRate.trim(),
      respiratoryRate: form.respiratoryRate.trim(),
      mucousMembranes: form.mucousMembranes.trim(),
      tllc: form.tllc.trim(),
      presumptiveDiagnosis: form.presumptiveDiagnosis.trim(),
      definitiveDiagnosis: form.definitiveDiagnosis.trim(),
      treatment: form.treatment.trim(),
      indications: form.indications.trim(),
      nextControl: form.nextControl,
      value: form.value.trim(),
      paymentStatus: form.paymentStatus.trim() as PaymentStatus | '',
    }

    try {
      setIsSaving(true)
      await onSubmit(payload)
      setForm(initialForm)
      setErrors({})
      setMessage({ type: 'success', text: 'Consulta guardada correctamente en Supabase.' })
    } catch {
      setMessage({
        type: 'error',
        text: 'No se pudo guardar la consulta. Revisa permisos RLS o conexión de Supabase.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit} noValidate>
      <label className={errors.patientId ? 'field-error' : undefined}>
        <span className="field-label">Nombre paciente <span className="required-mark">*</span></span>
        <select required disabled={!hasPatients} value={form.patientId} onChange={(event) => updateField('patientId', event.target.value)}>
          <option value="">{hasPatients ? 'Seleccionar paciente' : 'Registra un paciente primero'}</option>
          {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
        </select>
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
        <input required inputMode="numeric" value={form.value} onChange={(event) => updateField('value', event.target.value)} />
        {errors.value && <small className="field-error-text">{errors.value}</small>}
      </label>
      <label className={errors.paymentStatus ? 'field-error' : undefined}>
        <span className="field-label">Estado de pago <span className="required-mark">*</span></span>
        <select required value={form.paymentStatus} onChange={(event) => updateField('paymentStatus', event.target.value)}>
          <option value="">Seleccionar</option>
          <option>Pendiente</option>
          <option>Abonado</option>
          <option>Pagado</option>
          <option>Social</option>
        </select>
        {errors.paymentStatus && <small className="field-error-text">{errors.paymentStatus}</small>}
      </label>
      <label>
        Próximo control
        <input type="date" value={form.nextControl} onChange={(event) => updateField('nextControl', event.target.value)} />
      </label>
      <label className={`wide-field ${errors.reason ? 'field-error' : ''}`}>
        <span className="field-label">Motivo <span className="required-mark">*</span></span>
        <textarea required value={form.reason} onChange={(event) => updateField('reason', event.target.value)} />
        {errors.reason && <small className="field-error-text">{errors.reason}</small>}
      </label>
      <label className="wide-field">Anamnesis<textarea value={form.anamnesis} onChange={(event) => updateField('anamnesis', event.target.value)} /></label>
      <label className="wide-field">Examen físico<textarea value={form.physicalExam} onChange={(event) => updateField('physicalExam', event.target.value)} /></label>
      <label className={errors.temperature ? 'field-error' : undefined}>Temperatura<input inputMode="decimal" value={form.temperature} onChange={(event) => updateField('temperature', event.target.value)} />{errors.temperature && <small className="field-error-text">{errors.temperature}</small>}</label>
      <label className={errors.heartRate ? 'field-error' : undefined}>Frecuencia cardíaca<input inputMode="numeric" value={form.heartRate} onChange={(event) => updateField('heartRate', event.target.value)} />{errors.heartRate && <small className="field-error-text">{errors.heartRate}</small>}</label>
      <label className={errors.respiratoryRate ? 'field-error' : undefined}>Frecuencia respiratoria<input inputMode="numeric" value={form.respiratoryRate} onChange={(event) => updateField('respiratoryRate', event.target.value)} />{errors.respiratoryRate && <small className="field-error-text">{errors.respiratoryRate}</small>}</label>
      <label>Mucosas<input value={form.mucousMembranes} onChange={(event) => updateField('mucousMembranes', event.target.value)} /></label>
      <label>TLLC<input value={form.tllc} onChange={(event) => updateField('tllc', event.target.value)} /></label>
      <label className="wide-field">Diagnóstico presuntivo<textarea value={form.presumptiveDiagnosis} onChange={(event) => updateField('presumptiveDiagnosis', event.target.value)} /></label>
      <label className="wide-field">Diagnóstico definitivo<textarea value={form.definitiveDiagnosis} onChange={(event) => updateField('definitiveDiagnosis', event.target.value)} /></label>
      <label className="wide-field">Tratamiento<textarea value={form.treatment} onChange={(event) => updateField('treatment', event.target.value)} /></label>
      <label className="wide-field">Indicaciones<textarea value={form.indications} onChange={(event) => updateField('indications', event.target.value)} /></label>
      {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
      <button type="submit" disabled={!hasPatients || isSaving}>
        {isSaving ? 'Guardando consulta...' : 'Registrar consulta'}
      </button>
    </form>
  )
}
