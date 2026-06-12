import { useState, type FormEvent } from 'react'
import { FormMessage } from '../../../components/ui/FormMessage'
import type { Tutor } from '../types/clinicRecords'

type TutorFormProps = {
  onSubmit: (tutor: Omit<Tutor, 'id'>) => Promise<Tutor | void>
}

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  comuna: '',
  observations: '',
}

type TutorField = keyof typeof initialForm
type TutorErrors = Partial<Record<TutorField, string>>

export function TutorForm({ onSubmit }: TutorFormProps) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<TutorErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function updateField(field: TutorField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage(null)
  }

  function validateForm() {
    const nextErrors: TutorErrors = {}
    const normalizedPhone = normalizePhoneNumber(form.phone)

    if (!form.fullName.trim()) nextErrors.fullName = 'Ingresa el nombre del tutor.'
    if (!form.phone.trim()) {
      nextErrors.phone = 'Ingresa el teléfono del tutor.'
    } else if (!normalizedPhone || normalizedPhone.length < 8) {
      nextErrors.phone = 'Ingresa un teléfono válido. Puedes escribirlo con +56, espacios o guiones.'
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Ingresa un correo válido.'
    }
    if (!form.address.trim()) nextErrors.address = 'Ingresa la dirección de atención.'

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
      fullName: form.fullName.trim(),
      phone: normalizePhoneNumber(form.phone),
      email: form.email.trim(),
      address: form.address.trim(),
      comuna: form.comuna.trim(),
      observations: form.observations.trim(),
    }

    try {
      setIsSaving(true)
      await onSubmit(payload)
      setForm(initialForm)
      setErrors({})
      setMessage({ type: 'success', text: 'Tutor guardado correctamente en Supabase.' })
    } catch (saveError) {
      setMessage({
        type: 'error',
        text: getTutorSaveErrorMessage(saveError),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit} noValidate>
      <label className={errors.fullName ? 'field-error' : undefined}>
        <span className="field-label">Nombre <span className="required-mark">*</span></span>
        <input
          required
          value={form.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
          placeholder="Ej. Camila Rojas"
        />
        {errors.fullName && <small className="field-error-text">{errors.fullName}</small>}
      </label>
      <label className={errors.phone ? 'field-error' : undefined}>
        <span className="field-label">Teléfono <span className="required-mark">*</span></span>
        <input
          required
          inputMode="tel"
          value={form.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          placeholder="+56 9 1234 5678"
        />
        {errors.phone && <small className="field-error-text">{errors.phone}</small>}
      </label>
      <label className={errors.email ? 'field-error' : undefined}>
        Correo
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="correo@ejemplo.cl"
        />
        {errors.email && <small className="field-error-text">{errors.email}</small>}
      </label>
      <label className={errors.address ? 'field-error' : undefined}>
        <span className="field-label">Dirección <span className="required-mark">*</span></span>
        <input
          required
          value={form.address}
          onChange={(event) => updateField('address', event.target.value)}
          placeholder="Calle, número y referencia"
        />
        {errors.address && <small className="field-error-text">{errors.address}</small>}
      </label>
      <label>
        Comuna
        <input
          value={form.comuna}
          onChange={(event) => updateField('comuna', event.target.value)}
          placeholder="Ej. Las Condes"
        />
      </label>
      <label className="wide-field">
        Observaciones
        <textarea
          value={form.observations}
          onChange={(event) => updateField('observations', event.target.value)}
          placeholder="Notas de contacto, acceso, horarios o indicaciones relevantes"
        />
      </label>
      {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Guardando tutor...' : 'Registrar tutor'}
      </button>
    </form>
  )
}

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, '')
}

function getTutorSaveErrorMessage(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : ''

  if (message.toLowerCase().includes('telefono') || message.toLowerCase().includes('numeric')) {
    return 'No se pudo guardar el tutor. Revisa el teléfono: la base solo acepta números, sin + ni espacios.'
  }

  return 'No se pudo guardar el tutor. Revisa permisos RLS o conexión de Supabase.'
}
