import { useState, type FormEvent } from 'react'
import { FormMessage } from '../../../components/ui/FormMessage'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { isGenericTutor, type Patient, type PreventiveCare, type Tutor } from '../types/clinicRecords'

type PreventiveCareFormProps = {
  patients: Patient[]
  tutors: Tutor[]
  onSubmit: (preventiveCare: Omit<PreventiveCare, 'id'>) => Promise<PreventiveCare | void>
}

type PreventiveCareFields = Omit<PreventiveCare, 'id'>
type PreventiveCareErrors = Partial<Record<keyof PreventiveCareFields, string>>

const initialVaccineForm: PreventiveCareFields = {
  patientId: '',
  careType: 'Vacuna',
  product: '',
  batchNumber: '',
  applicationDate: '',
  nextDate: '',
  observations: '',
}

const initialDewormingForm: PreventiveCareFields = {
  patientId: '',
  careType: 'Desparasitación interna',
  product: '',
  batchNumber: '',
  applicationDate: '',
  nextDate: '',
  observations: '',
}

const vaccineTypes = ['Antirrábica', 'Óctuple', 'Triple felina', 'Traqueobronquitis', 'Leucemia']
const dewormingTypes: PreventiveCare['careType'][] = ['Desparasitación interna', 'Desparasitación externa', 'Ambas']

export function PreventiveCareForm({ patients, tutors, onSubmit }: PreventiveCareFormProps) {
  return (
    <div className="preventive-forms-stack">
      <PreventiveCareSubform
        buttonText="Registrar vacuna"
        eyebrow="VACUNAS"
        initialForm={initialVaccineForm}
        patients={patients}
        productLabel="Tipo de vacuna"
        productOptions={vaccineTypes}
        successText="Vacuna guardada correctamente en Supabase."
        title="Registrar vacuna"
        tutors={tutors}
        onSubmit={onSubmit}
      />
      <PreventiveCareSubform
        buttonText="Registrar desparasitación"
        eyebrow="DESPARASITACIÓN"
        initialForm={initialDewormingForm}
        patients={patients}
        productLabel="Nombre del producto"
        successText="Desparasitación guardada correctamente en Supabase."
        title="Registrar desparasitación"
        tutors={tutors}
        onSubmit={onSubmit}
      />
    </div>
  )
}

type PreventiveCareSubformProps = PreventiveCareFormProps & {
  buttonText: string
  eyebrow: string
  initialForm: PreventiveCareFields
  productLabel: string
  productOptions?: string[]
  successText: string
  title: string
}

function PreventiveCareSubform({
  buttonText,
  eyebrow,
  initialForm,
  patients,
  productLabel,
  productOptions = [],
  successText,
  title,
  tutors,
  onSubmit,
}: PreventiveCareSubformProps) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<PreventiveCareErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const hasPatients = patients.length > 0
  const isVaccineForm = form.careType === 'Vacuna'
  const patientOptions = patients.map((patient) => ({
    value: String(patient.id),
    label: formatPatientOption(patient, tutors),
    searchText: `${patient.name} ${patient.species} ${patient.breed} ${patient.microchip}`,
  }))

  function updateField<Field extends keyof PreventiveCareFields>(field: Field, value: PreventiveCareFields[Field]) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage(null)
  }

  function validateForm() {
    const nextErrors: PreventiveCareErrors = {}

    if (!form.patientId) nextErrors.patientId = 'Selecciona el paciente.'
    if (!form.careType) nextErrors.careType = 'Selecciona el tipo.'
    if (!form.product.trim()) nextErrors.product = isVaccineForm ? 'Selecciona el tipo de vacuna.' : 'Ingresa el producto aplicado.'
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

    const payload: Omit<PreventiveCare, 'id'> = {
      ...form,
      product: form.product.trim(),
      batchNumber: form.batchNumber.trim(),
      observations: form.observations.trim(),
    }

    try {
      setIsSaving(true)
      await onSubmit(payload)
      setForm(initialForm)
      setErrors({})
      setMessage({ type: 'success', text: successText })
    } catch (saveError) {
      const errorMessage = getErrorMessage(saveError)

      setMessage({
        type: 'error',
        text: errorMessage.includes('numero_lote')
          ? 'No se pudo guardar: falta la columna numero_lote en Supabase. Ejecuta la migración y vuelve a intentar.'
          : 'No se pudo guardar el registro. Revisa permisos RLS o conexión de Supabase.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="record-form preventive-subform" onSubmit={handleSubmit} noValidate>
      <div className="subform-heading">
        <span>{eyebrow}</span>
        <h3>{title}</h3>
      </div>

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

      {isVaccineForm ? (
        <label className={errors.product ? 'field-error' : undefined}>
          <span className="field-label">{productLabel} <span className="required-mark">*</span></span>
          <select required value={form.product} onChange={(event) => updateField('product', event.target.value)}>
            <option value="">Seleccionar vacuna</option>
            {productOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.product && <small className="field-error-text">{errors.product}</small>}
        </label>
      ) : (
        <>
          <label className={errors.careType ? 'field-error' : undefined}>
            <span className="field-label">Tipo <span className="required-mark">*</span></span>
            <select value={form.careType} onChange={(event) => updateField('careType', event.target.value as PreventiveCare['careType'])}>
              {dewormingTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.careType && <small className="field-error-text">{errors.careType}</small>}
          </label>
          <label className={errors.product ? 'field-error' : undefined}>
            <span className="field-label">{productLabel} <span className="required-mark">*</span></span>
            <input required value={form.product} onChange={(event) => updateField('product', event.target.value)} />
            {errors.product && <small className="field-error-text">{errors.product}</small>}
          </label>
        </>
      )}

      {isVaccineForm && (
        <label>
          Número de lote
          <input value={form.batchNumber} onChange={(event) => updateField('batchNumber', event.target.value)} />
        </label>
      )}

      <label className={errors.applicationDate ? 'field-error' : undefined}>
        <span className="field-label">Fecha aplicación <span className="required-mark">*</span></span>
        <input required type="date" value={form.applicationDate} onChange={(event) => updateField('applicationDate', event.target.value)} />
        {errors.applicationDate && <small className="field-error-text">{errors.applicationDate}</small>}
      </label>
      <label>
        Próxima aplicación
        <input type="date" value={form.nextDate} onChange={(event) => updateField('nextDate', event.target.value)} />
      </label>
      {!isVaccineForm && (
        <label className="wide-field">
          Observaciones
          <textarea value={form.observations} onChange={(event) => updateField('observations', event.target.value)} />
        </label>
      )}
      {message && <FormMessage type={message.type}>{message.text}</FormMessage>}
      <button type="submit" disabled={!hasPatients || isSaving}>
        {isSaving ? 'Guardando registro...' : buttonText}
      </button>
    </form>
  )
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
