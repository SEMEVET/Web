import { useMemo, useState } from 'react'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'
import { isGenericTutor, type Consultation, type Patient, type PaymentMethod, type PaymentStatus, type Tutor } from '../types/clinicRecords'

const paymentStatuses: PaymentStatus[] = ['Pendiente', 'Abonado', 'Pagado', 'Social']
const filterStatuses: Array<PaymentStatus | 'Todas'> = ['Todas', ...paymentStatuses]
const periodOptions = ['Mes', 'Semana', 'Año'] as const
const paymentMethods: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mixto']
type PeriodFilter = typeof periodOptions[number]

export function ConsultationStatusPage() {
  const { records, actions, error } = useClinicRecordsContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'Todas'>('Todas')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('Mes')
  const [periodValue, setPeriodValue] = useState(getInitialPeriodValue('Mes'))
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
            consultation.paymentMethod,
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
      const matchesPeriod = isConsultationInPeriod(consultation.date, periodFilter, periodValue)

      return matchesSearch && matchesStatus && matchesPeriod
    })
  }, [consultationRows, periodFilter, periodValue, searchTerm, statusFilter])

  const paymentSummary = useMemo(
    () =>
      paymentStatuses.map((status) => {
        const consultations = filteredConsultations
          .map(({ consultation }) => consultation)
          .filter((consultation) => consultation.paymentStatus === status)
        const amount = consultations.reduce((total, consultation) => total + parseMoneyValue(consultation.value), 0)

        return {
          status,
          count: consultations.length,
          amount,
        }
      }),
    [filteredConsultations],
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

  async function handlePaymentMethodChange(consultationId: Consultation['id'], paymentMethod: PaymentMethod | '') {
    try {
      setPaymentMessage(null)
      setSavingConsultationId(consultationId)
      await actions.updateConsultation(consultationId, { paymentMethod })
      setPaymentMessage('Método de pago actualizado correctamente.')
    } catch {
      setPaymentMessage('No se pudo actualizar el método de pago. Revisa la conexión o permisos.')
    } finally {
      setSavingConsultationId(null)
    }
  }

  function handlePeriodFilterChange(period: PeriodFilter) {
    setPeriodFilter(period)
    setPeriodValue(getInitialPeriodValue(period))
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <span>ESTADO DE CONSULTAS</span>
        <h1>Estado de Consultas</h1>
        <p>Indicadores de pago y trazabilidad de consultas por semana, mes o año.</p>
      </section>

      {error && <section className="status-banner error">{error}</section>}

      <section className="activity-panel">
        <SectionHeader
          eyebrow="FILTROS"
          title="Periodo de análisis"
        />

        <div className="consultation-toolbar">
          <label>
            Vista
            <select value={periodFilter} onChange={(event) => handlePeriodFilterChange(event.target.value as PeriodFilter)}>
              {periodOptions.map((period) => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </label>

          <label>
            Periodo
            <input
              type={getPeriodInputType(periodFilter)}
              value={periodValue}
              onChange={(event) => setPeriodValue(event.target.value)}
            />
          </label>

          <label>
            Estado de pago
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PaymentStatus | 'Todas')}>
              {filterStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <label>
            Buscar paciente o tutor
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ej: Simba, Felipe, +569..., microchip"
            />
          </label>
        </div>
      </section>

      <section className="payment-summary-grid" aria-label="Resumen de estados de pago">
        {paymentSummary.map(({ status, count, amount }) => (
          <article className={`payment-summary-card ${status.toLowerCase()}`} key={status}>
            <span>{status}</span>
            <strong>{count}</strong>
            <small>{formatCurrency(amount)}</small>
          </article>
        ))}
      </section>

      <section className="activity-panel">
        <SectionHeader
          eyebrow="TRAZABILIDAD"
          title="Consultas del periodo"
        />

        {paymentMessage && <p className="form-message success">{paymentMessage}</p>}

        <div className="consultation-list">
          {filteredConsultations.length === 0 ? (
            <p className="empty-text">No hay consultas que coincidan con los filtros seleccionados.</p>
          ) : (
            filteredConsultations.map(({ consultation, patient, tutor }) => (
              <ConsultationTraceCard
                consultation={consultation}
                key={consultation.id}
                patient={patient}
                tutor={tutor}
                isSaving={savingConsultationId === consultation.id}
                onPaymentStatusChange={handlePaymentStatusChange}
                onPaymentMethodChange={handlePaymentMethodChange}
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
  onPaymentMethodChange: (consultationId: Consultation['id'], paymentMethod: PaymentMethod | '') => Promise<void>
}

function ConsultationTraceCard({
  consultation,
  patient,
  tutor,
  isSaving,
  onPaymentStatusChange,
  onPaymentMethodChange,
}: ConsultationTraceCardProps) {
  const currentPaymentStatus = consultation.paymentStatus || 'Pendiente'
  const currentPaymentMethod = consultation.paymentMethod || ''

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
          <div>
            <dt>Método de pago</dt>
            <dd>{currentPaymentMethod || 'Sin registrar'}</dd>
          </div>
        </dl>

        <p>{consultation.reason || 'Sin motivo registrado.'}</p>
      </div>

      <div className="consultation-payment">
        <span>{formatCurrency(parseMoneyValue(consultation.value))}</span>
        <label>
          Actualizar pago
          <select disabled={isSaving} value={currentPaymentStatus} onChange={(event) => void onPaymentStatusChange(consultation.id, event.target.value as PaymentStatus)}>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Método de pago
          <select disabled={isSaving} value={currentPaymentMethod} onChange={(event) => void onPaymentMethodChange(consultation.id, event.target.value as PaymentMethod | '')}>
            <option value="">Sin registrar</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
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

function getPeriodInputType(period: PeriodFilter) {
  if (period === 'Semana') return 'week'
  if (period === 'Año') return 'number'
  return 'month'
}

function getInitialPeriodValue(period: PeriodFilter) {
  const today = new Date()
  const year = today.getFullYear()

  if (period === 'Año') return String(year)
  if (period === 'Semana') return `${year}-W${String(getIsoWeek(today)).padStart(2, '0')}`

  return `${year}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

function isConsultationInPeriod(dateValue: string, period: PeriodFilter, periodValue: string) {
  if (!dateValue || !periodValue) return false
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return false

  if (period === 'Año') return String(date.getFullYear()) === periodValue
  if (period === 'Mes') return dateValue.startsWith(periodValue)

  return `${date.getFullYear()}-W${String(getIsoWeek(date)).padStart(2, '0')}` === periodValue
}

function getIsoWeek(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNumber = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))

  return Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
