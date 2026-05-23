import { useMemo, useState } from 'react'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { ConsultationForm } from '../components/ConsultationForm'
import { PreventiveCareForm } from '../components/PreventiveCareForm'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'
import type { Consultation, Patient, PaymentStatus, Tutor } from '../types/clinicRecords'
import { isGenericTutor } from '../types/clinicRecords'

const paymentStatuses: PaymentStatus[] = ['Pendiente', 'Abonado', 'Pagado', 'Social']
const filterStatuses: Array<PaymentStatus | 'Todas'> = ['Todas', ...paymentStatuses]

export function ConsultationsPage() {
  const { records, actions, error } = useClinicRecordsContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'Todas'>('Todas')
  const [savingConsultationId, setSavingConsultationId] = useState<Consultation['id'] | null>(null)
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)

  const consultationRows = useMemo(
    () =>
      records.consultations.map((consultation) => {
        const patient = findPatient(records.patients, consultation.patientId)
        const tutor = patient ? findTutor(records.tutors, patient.tutorId) : undefined

        return {
          consultation,
          patient,
          tutor,
          searchText: [
            patient?.name,
            patient?.species,
            patient?.breed,
            patient?.microchip,
            tutor?.fullName,
            tutor?.phone,
            consultation.reason,
            consultation.paymentStatus,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        }
      }),
    [records.consultations, records.patients, records.tutors],
  )

  const filteredConsultations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return consultationRows.filter(({ consultation, searchText }) => {
      const matchesSearch = query === '' || searchText.includes(query)
      const matchesStatus = statusFilter === 'Todas' || consultation.paymentStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [consultationRows, searchTerm, statusFilter])

  const paymentSummary = useMemo(
    () =>
      paymentStatuses.map((status) => {
        const consultations = records.consultations.filter((consultation) => consultation.paymentStatus === status)
        const amount = consultations.reduce((total, consultation) => total + parseMoneyValue(consultation.value), 0)

        return {
          status,
          count: consultations.length,
          amount,
        }
      }),
    [records.consultations],
  )

  async function handlePaymentStatusChange(consultationId: Consultation['id'], paymentStatus: PaymentStatus) {
    try {
      setPaymentMessage(null)
      setSavingConsultationId(consultationId)
      await actions.updateConsultation(consultationId, { paymentStatus })
      setPaymentMessage('Estado de pago actualizado correctamente.')
    } catch {
      setPaymentMessage('No se pudo actualizar el estado de pago. Revisa la conexión o permisos.')
    } finally {
      setSavingConsultationId(null)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <span>CONSULTAS</span>
        <h1>Consultas</h1>
        <p>Registro operativo de atenciones veterinarias, trazabilidad de pagos y controles preventivos.</p>
      </section>

      {error && <section className="status-banner error">{error}</section>}

      <section className="payment-summary-grid" aria-label="Resumen de estados de pago">
        {paymentSummary.map(({ status, count, amount }) => (
          <article className={`payment-summary-card ${status.toLowerCase()}`} key={status}>
            <span>{status}</span>
            <strong>{count}</strong>
            <small>{formatCurrency(amount)}</small>
          </article>
        ))}
      </section>

      <section className="records-grid">
        <article className="module-card">
          <SectionHeader
            eyebrow="ATENCIÓN"
            title="Registrar consulta"
          />
          <ConsultationForm patients={records.patients} tutors={records.tutors} onSubmit={actions.addConsultation} />
        </article>

        <article className="module-card">
          <SectionHeader
            eyebrow="PREVENCIÓN"
            title="Vacunas y desparasitaciones"
          />
          <PreventiveCareForm
            patients={records.patients}
            tutors={records.tutors}
            onSubmit={actions.addPreventiveCare}
          />
        </article>
      </section>

      <section className="activity-panel">
        <SectionHeader
          eyebrow="TRAZABILIDAD"
          title="Buscar y actualizar consultas"
          description="Busca por paciente, tutor, teléfono, especie o microchip para diferenciar pacientes con nombres repetidos."
        />

        <div className="consultation-toolbar">
          <label>
            Buscar paciente o tutor
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ej: Simba, Felipe, +569..., microchip"
            />
          </label>

          <label>
            Estado de pago
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as PaymentStatus | 'Todas')}
            >
              {filterStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        {paymentMessage && <p className="form-message success">{paymentMessage}</p>}

        <div className="consultation-list">
          {filteredConsultations.length === 0 ? (
            <p className="empty-text">No hay consultas que coincidan con la búsqueda o filtro seleccionado.</p>
          ) : (
            filteredConsultations.map(({ consultation, patient, tutor }) => (
              <ConsultationTraceCard
                consultation={consultation}
                key={consultation.id}
                patient={patient}
                tutor={tutor}
                isSaving={savingConsultationId === consultation.id}
                onPaymentStatusChange={handlePaymentStatusChange}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

type ConsultationTraceCardProps = {
  consultation: Consultation
  patient?: Patient
  tutor?: Tutor
  isSaving: boolean
  onPaymentStatusChange: (consultationId: Consultation['id'], paymentStatus: PaymentStatus) => Promise<void>
}

function ConsultationTraceCard({
  consultation,
  patient,
  tutor,
  isSaving,
  onPaymentStatusChange,
}: ConsultationTraceCardProps) {
  const currentPaymentStatus = consultation.paymentStatus || 'Pendiente'

  return (
    <article className="consultation-card">
      <div className="consultation-card-main">
        <header>
          <div>
            <span>{consultation.date}</span>
            <h3>{patient?.name ?? 'Paciente no encontrado'}</h3>
          </div>
          <strong className={`payment-pill ${currentPaymentStatus.toLowerCase()}`}>{currentPaymentStatus}</strong>
        </header>

        <dl className="consultation-meta">
          <div>
            <dt>Tutor</dt>
            <dd>{isGenericTutor(tutor) ? 'Sin tutor registrado' : tutor?.fullName ?? 'Sin tutor asociado'}</dd>
          </div>
          <div>
            <dt>Contacto</dt>
            <dd>{tutor?.phone || 'Sin teléfono'}</dd>
          </div>
          <div>
            <dt>Paciente</dt>
            <dd>{formatPatientIdentity(patient)}</dd>
          </div>
          <div>
            <dt>Microchip</dt>
            <dd>{patient?.microchip || 'No registrado'}</dd>
          </div>
        </dl>

        <p>{consultation.reason || 'Sin motivo registrado.'}</p>
      </div>

      <div className="consultation-payment">
        <span>{formatCurrency(parseMoneyValue(consultation.value))}</span>
        <label>
          Actualizar pago
          <select
            disabled={isSaving}
            value={currentPaymentStatus}
            onChange={(event) =>
              void onPaymentStatusChange(consultation.id, event.target.value as PaymentStatus)
            }
          >
            {paymentStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
    </article>
  )
}

function findPatient(patients: Patient[], patientId: Consultation['patientId']) {
  return patients.find((patient) => String(patient.id) === String(patientId))
}

function findTutor(tutors: Tutor[], tutorId: Patient['tutorId']) {
  return tutors.find((tutor) => String(tutor.id) === String(tutorId))
}

function parseMoneyValue(value: string) {
  const numericValue = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(numericValue) ? numericValue : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', {
    currency: 'CLP',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function formatPatientIdentity(patient?: Patient) {
  if (!patient) return 'Paciente no encontrado'

  return [
    patient.species || 'Sin especie',
    patient.breed || 'Sin raza',
    patient.sex || 'Sin sexo',
    `ID ${patient.id}`,
  ].join(' · ')
}
