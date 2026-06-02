import { useState, type FormEvent } from 'react'
import { FormMessage } from '../../../components/ui/FormMessage'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { NO_TUTOR_MARKER, isGenericTutor, type Patient, type Tutor } from '../types/clinicRecords'

type PatientFormProps = {
  tutors: Tutor[]
  onSubmit: (patient: Omit<Patient, 'id'>) => Promise<Patient | void>
}

const initialForm = {
  withoutTutor: false,
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

type PatientField = keyof typeof initialForm
type PatientErrors = Partial<Record<PatientField, string>>

export function PatientForm({ tutors, onSubmit }: PatientFormProps) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<PatientErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const selectableTutors = tutors.filter((tutor) => !isGenericTutor(tutor))
  const hasTutors = selectableTutors.length > 0
  const tutorOptions = selectableTutors.map((tutor) => ({
    value: String(tutor.id),
    label: tutor.fullName,
    searchText: `${tutor.phone} ${tutor.email} ${tutor.comuna}`,
  }))

  function updateField(field: PatientField, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage(null)
  }

  function toggleWithoutTutor() {
    setForm((current) => ({
      ...current,
      withoutTutor: !current.withoutTutor,
      tutorId: !current.withoutTutor ? '' : current.tutorId,
      tutorName: !current.withoutTutor ? '' : current.tutorName,
    }))
    setErrors((current) => ({ ...current, tutorId: undefined }))
    setMessage(null)
  }

  function validateForm() {
    const nextErrors: PatientErrors = {}

    if (!form.withoutTutor && !form.tutorId) nextErrors.tutorId = 'Selecciona el tutor asociado.'
    if (!form.name.trim()) nextErrors.name = 'Ingresa el nombre del paciente.'
    if (!form.species.trim()) nextErrors.species = 'Selecciona la especie.'
    if (form.weight.trim() && !isValidNumber(form.weight)) {
      nextErrors.weight = 'Ingresa un peso válido. Puedes usar coma o punto, por ejemplo 6,5.'
    }
    if (form.weight.trim() && isValidNumber(form.weight) && Number(normalizeDecimalValue(form.weight)) < 0) {
      nextErrors.weight = 'El peso no puede ser negativo.'
    }
    if (!form.sterilized && form.birthsCount.trim() === '') nextErrors.birthsCount = 'Indica 0 si no ha tenido partos.'
    if (form.birthsCount.trim() && !isValidInteger(form.birthsCount)) {
      nextErrors.birthsCount = 'Ingresa un número entero de partos.'
    }
    if (form.birthsCount.trim() && isValidInteger(form.birthsCount) && Number(form.birthsCount) < 0) {
      nextErrors.birthsCount = 'El número de partos no puede ser negativo.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Revisa los campos marcados en rojo antes de guardar.' })
      return
    }

    const payload: Omit<Patient, 'id'> = {
      tutorId: form.withoutTutor ? NO_TUTOR_MARKER : form.tutorId,
      tutorName: form.withoutTutor ? '' : form.tutorName.trim(),
      name: form.name.trim(),
      species: form.species.trim(),
      breed: form.breed.trim(),
      sex: form.sex.trim(),
      age: form.age.trim(),
      weight: normalizeDecimalValue(form.weight),
      previousDiseases: form.previousDiseases.trim(),
      sterilized: form.sterilized,
      birthsCount: form.birthsCount.trim(),
      microchip: form.microchip.trim(),
      allergies: form.allergies.trim(),
      previousSurgeries: form.previousSurgeries.trim(),
      livesWithAnimals: form.livesWithAnimals,
      animalHousemates: form.animalHousemates.trim(),
    }

    try {
      setIsSaving(true)
      await onSubmit(payload)
      setForm(initialForm)
      setErrors({})
      setMessage({ type: 'success', text: 'Paciente guardado correctamente en Supabase.' })
    } catch (saveError) {
      const errorMessage = getErrorMessage(saveError)
      const fieldErrors = getPatientSaveFieldErrors(errorMessage)

      if (Object.keys(fieldErrors).length > 0) setErrors((current) => ({ ...current, ...fieldErrors }))
      setMessage({
        type: 'error',
        text: getPatientSaveErrorMessage(errorMessage),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit} noValidate>
      {!form.withoutTutor && (
        <label className={errors.tutorId ? 'field-error' : undefined}>
          <span className="field-label">Nombre tutor <span className="required-mark">*</span></span>
          <SearchableSelect
            disabled={!hasTutors}
            emptyText="No hay tutores que coincidan"
            options={tutorOptions}
            placeholder={hasTutors ? 'Buscar tutor' : 'Registra un tutor primero'}
            value={form.tutorId}
            onChange={(value) => {
              const tutor = selectableTutors.find((currentTutor) => String(currentTutor.id) === value)
              updateField('tutorId', value)
              updateField('tutorName', tutor?.fullName ?? '')
            }}
          />
          {errors.tutorId && <small className="field-error-text">{errors.tutorId}</small>}
        </label>
      )}

      <label className={form.withoutTutor ? 'switch-field no-tutor-switch no-tutor-switch-active' : 'switch-field no-tutor-switch'}>
        Sin tutor
        <button type="button" className={form.withoutTutor ? 'switch is-on' : 'switch'} onClick={toggleWithoutTutor} aria-pressed={form.withoutTutor}>
          <span />
          {form.withoutTutor ? 'Sí' : 'No'}
        </button>
      </label>

      <label className={errors.name ? 'field-error' : undefined}>
        <span className="field-label">Nombre <span className="required-mark">*</span></span>
        <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
        {errors.name && <small className="field-error-text">{errors.name}</small>}
      </label>
      <label className={errors.species ? 'field-error' : undefined}>
        <span className="field-label">Especie <span className="required-mark">*</span></span>
        <select required value={form.species} onChange={(event) => updateField('species', event.target.value)}>
          <option value="">Seleccionar</option>
          <option value="Felino">Felino</option>
          <option value="Canino">Canino</option>
        </select>
        {errors.species && <small className="field-error-text">{errors.species}</small>}
      </label>
      <label>Raza<input value={form.breed} onChange={(event) => updateField('breed', event.target.value)} /></label>
      <label>
        Sexo
        <select value={form.sex} onChange={(event) => updateField('sex', event.target.value)}>
          <option value="">Seleccionar</option>
          <option value="Macho">Macho</option>
          <option value="Hembra">Hembra</option>
        </select>
      </label>
      <label>Edad<input placeholder="Ej: 3 años, 6 meses" value={form.age} onChange={(event) => updateField('age', event.target.value)} /></label>
      <label className={errors.weight ? 'field-error' : undefined}>Peso<input type="text" inputMode="decimal" placeholder="Ej: 6,5" value={form.weight} onChange={(event) => updateField('weight', event.target.value)} />{errors.weight && <small className="field-error-text">{errors.weight}</small>}</label>
      <label>Microchip<input value={form.microchip} onChange={(event) => updateField('microchip', event.target.value)} /></label>
      <label className="switch-field">Esterilizado<button type="button" className={form.sterilized ? 'switch is-on' : 'switch'} onClick={() => updateField('sterilized', !form.sterilized)} aria-pressed={form.sterilized}><span />{form.sterilized ? 'Sí' : 'No'}</button></label>
      {!form.sterilized && (
        <label className={errors.birthsCount ? 'field-error' : undefined}>
          <span className="field-label">Número de partos <span className="required-mark">*</span></span>
          <input required type="number" min="0" step="1" value={form.birthsCount} onChange={(event) => updateField('birthsCount', event.target.value)} />
          {errors.birthsCount && <small className="field-error-text">{errors.birthsCount}</small>}
        </label>
      )}
      <label className="wide-field">Enfermedades previas<textarea value={form.previousDiseases} onChange={(event) => updateField('previousDiseases', event.target.value)} /></label>
      <label className="wide-field">Alergias<textarea value={form.allergies} onChange={(event) => updateField('allergies', event.target.value)} /></label>
      <label className="wide-field">Cirugías previas<textarea value={form.previousSurgeries} onChange={(event) => updateField('previousSurgeries', event.target.value)} /></label>
      <label className="switch-field">Vive con animales<button type="button" className={form.livesWithAnimals ? 'switch is-on' : 'switch'} onClick={() => updateField('livesWithAnimals', !form.livesWithAnimals)} aria-pressed={form.livesWithAnimals}><span />{form.livesWithAnimals ? 'Sí' : 'No'}</button></label>
      {form.livesWithAnimals && <label>Cuáles<input value={form.animalHousemates} onChange={(event) => updateField('animalHousemates', event.target.value)} /></label>}
      {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
      <button type="submit" disabled={isSaving}>{isSaving ? 'Guardando paciente...' : 'Registrar paciente'}</button>
    </form>
  )
}

function isValidNumber(value: string) {
  return Number.isFinite(Number(normalizeDecimalValue(value)))
}

function isValidInteger(value: string) {
  return Number.isInteger(Number(value.trim()))
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

function getPatientSaveFieldErrors(errorMessage: string): PatientErrors {
  if (errorMessage.includes('smallint')) {
    return { weight: 'Supabase está configurado para peso entero. Ejecuta la migración para permitir decimales.' }
  }

  return {}
}

function getPatientSaveErrorMessage(errorMessage: string) {
  if (errorMessage.includes('smallint')) {
    return 'No se pudo guardar: la columna peso en Supabase solo acepta números enteros. Ejecuta la migración para permitir decimales.'
  }

  return 'No se pudo guardar el paciente. Revisa permisos RLS o conexión de Supabase.'
}
