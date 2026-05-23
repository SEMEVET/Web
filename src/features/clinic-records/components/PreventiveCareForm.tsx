import { useState, type FormEvent } from 'react'
import { FormMessage } from '../../../components/ui/FormMessage'
import type { Patient, PreventiveCare } from '../types/clinicRecords'

type PreventiveCareFormProps = {
  patients: Patient[]
  onSubmit: (preventiveCare: Omit<PreventiveCare, 'id'>) => Promise<PreventiveCare | void>
}

const initialForm: Omit<PreventiveCare, 'id'> = {
  patientId: '',
  careType: 'Vacuna',
  product: '',
  applicationDate: '',
  nextDate: '',
  observations: '',
}

type PreventiveCareField = keyof typeof initialForm
type PreventiveCareErrors = Partial<Record<PreventiveCareField, string>>

export function PreventiveCareForm({ patients, onSubmit }: PreventiveCareFormProps) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<PreventiveCareErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const hasPatients = patients.length > 0

  function updateField<Field extends PreventiveCareField>(field: Field, value: (typeof initialForm)[Field]) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage(null)
  }

  function validateForm() {
    const nextErrors: PreventiveCareErrors = {}

    if (!form.patientId) nextErrors.patientId = 'Selecciona el paciente.'
    if (!form.careType) nextErrors.careType = 'Selecciona el tipo.'
    if (!form.product.trim()) nextErrors.product = 'Ingresa el producto aplicado.'
    if (!form.applicationDate) nextErrors.applicationDate = 'Selecciona la fecha de aplicación.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Revisa los campos marcados en rojo antes de guardar.' })
      return
    }

    const payload = {
      ...form,
      product: form.product.trim(),
      observations: form.observations.trim(),
    }

    try {
      setIsSaving(true)
      await onSubmit(payload)
      setForm(initialForm)
      setErrors({})
      setMessage({ type: 'success', text: 'Registro preventivo guardado correctamente en Supabase.' })
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : ''

      setMessage({
        type: 'error',
        text: errorMessage.includes('fecha_aplicacion')
          ? 'No se pudo guardar: falta la columna fecha_aplicacion en Supabase. Ejecuta el SQL de migración y vuelve a intentar.'
          : 'No se pudo guardar el registro. Revisa permisos RLS o conexión de Supabase.',
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
      <label className={errors.careType ? 'field-error' : undefined}>
        <span className="field-label">Tipo <span className="required-mark">*</span></span>
        <select value={form.careType} onChange={(event) => updateField('careType', event.target.value as PreventiveCare['careType'])}>
          <option>Vacuna</option>
          <option>Desparasitación</option>
        </select>
        {errors.careType && <small className="field-error-text">{errors.careType}</small>}
      </label>
      <label className={errors.product ? 'field-error' : undefined}>
        <span className="field-label">Producto <span className="required-mark">*</span></span>
        <input required value={form.product} onChange={(event) => updateField('product', event.target.value)} />
        {errors.product && <small className="field-error-text">{errors.product}</small>}
      </label>
      <label className={errors.applicationDate ? 'field-error' : undefined}>
        <span className="field-label">Fecha aplicación <span className="required-mark">*</span></span>
        <input required type="date" value={form.applicationDate} onChange={(event) => updateField('applicationDate', event.target.value)} />
        {errors.applicationDate && <small className="field-error-text">{errors.applicationDate}</small>}
      </label>
      <label>
        Próxima fecha
        <input type="date" value={form.nextDate} onChange={(event) => updateField('nextDate', event.target.value)} />
      </label>
      <label className="wide-field">
        Observaciones
        <textarea value={form.observations} onChange={(event) => updateField('observations', event.target.value)} />
      </label>
      {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
      <button type="submit" disabled={!hasPatients || isSaving}>
        {isSaving ? 'Guardando registro...' : 'Registrar prevención'}
      </button>
    </form>
  )
}
