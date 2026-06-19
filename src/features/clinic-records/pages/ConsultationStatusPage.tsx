import { useMemo, useState } from 'react'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'
import {
  isGenericTutor,
  type ClinicalExam,
  type Consultation,
  type Patient,
  type PaymentMethod,
  type PaymentStatus,
  type PreventiveCare,
  type Tutor,
} from '../types/clinicRecords'

const paymentStatuses: PaymentStatus[] = ['Pendiente', 'Abonado', 'Pagado', 'Social']
const filterStatuses: Array<PaymentStatus | 'Todas'> = ['Todas', ...paymentStatuses]
const periodOptions = ['Mes', 'Semana', 'Año'] as const
const paymentMethods: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mixto']
type PeriodFilter = typeof periodOptions[number]
type IncomeType = 'Consulta' | 'Vacuna' | 'Desparasitación' | 'Examen'

type IncomeRecord = {
  id: number | string
  type: IncomeType
  title: string
  detail: string
  date: string
  value: string
  paymentMethod: PaymentMethod | ''
  patient?: Patient
  tutor?: Tutor
  consultation?: Consultation
  preventiveCare?: PreventiveCare
  exam?: ClinicalExam
  searchText: string
}

export function ConsultationStatusPage() {
  const { records, actions, error } = useClinicRecordsContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'Todas'>('Todas')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('Mes')
  const [periodValue, setPeriodValue] = useState(getInitialPeriodValue('Mes'))
  const [savingRecordKey, setSavingRecordKey] = useState<string | null>(null)
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)

  const incomeRecords = useMemo(() => {
    const consultations = records.consultations.map((consultation): IncomeRecord => {
      const patient = findPatient(records.patients, consultation.patientId)
      const tutor = patient ? findTutor(records.tutors, patient.tutorId) : undefined

      return createIncomeRecord({
        id: consultation.id,
        type: 'Consulta',
        title: consultation.reason || consultation.attentionType || 'Consulta clínica',
        detail: consultation.attentionType || 'Atención veterinaria',
        date: consultation.date,
        value: consultation.value,
        paymentMethod: consultation.paymentMethod,
        patient,
        tutor,
        consultation,
      })
    })

    const preventiveCare = records.preventiveCare.map((care): IncomeRecord => {
      const patient = findPatient(records.patients, care.patientId)
      const tutor = patient ? findTutor(records.tutors, patient.tutorId) : undefined
      const type: IncomeType = care.careType === 'Vacuna' ? 'Vacuna' : 'Desparasitación'

      return createIncomeRecord({
        id: care.id,
        type,
        title: care.product || type,
        detail: care.careType,
        date: care.applicationDate,
        value: care.value,
        paymentMethod: care.paymentMethod,
        patient,
        tutor,
        preventiveCare: care,
      })
    })

    const exams = records.exams.map((exam): IncomeRecord => {
      const patient = findPatient(records.patients, exam.patientId)
      const tutor = patient ? findTutor(records.tutors, patient.tutorId) : undefined

      return createIncomeRecord({
        id: exam.id,
        type: 'Examen',
        title: exam.examType,
        detail: exam.sampleType || 'Muestra no especificada',
        date: exam.sampleDate,
        value: exam.value,
        paymentMethod: exam.paymentMethod,
        patient,
        tutor,
        exam,
      })
    })

    return [...consultations, ...preventiveCare, ...exams]
  }, [records.consultations, records.exams, records.patients, records.preventiveCare, records.tutors])

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return incomeRecords.filter((record) => {
      const matchesSearch = query === '' || record.searchText.includes(query)
      const matchesPeriod = isDateInPeriod(record.date, periodFilter, periodValue)
      const matchesStatus =
        record.type !== 'Consulta'
          || statusFilter === 'Todas'
          || record.consultation?.paymentStatus === statusFilter

      return matchesSearch && matchesPeriod && matchesStatus
    })
  }, [incomeRecords, periodFilter, periodValue, searchTerm, statusFilter])

  const recordsByType = useMemo(
    () => ({
      consultations: filteredRecords.filter((record) => record.type === 'Consulta'),
      vaccines: filteredRecords.filter((record) => record.type === 'Vacuna'),
      deworming: filteredRecords.filter((record) => record.type === 'Desparasitación'),
      exams: filteredRecords.filter((record) => record.type === 'Examen'),
    }),
    [filteredRecords],
  )

  const typeSummary = useMemo(
    () => [
      createSummary('Consultas', recordsByType.consultations),
      createSummary('Vacunas', recordsByType.vaccines),
      createSummary('Desparasitación', recordsByType.deworming),
      createSummary('Exámenes', recordsByType.exams),
    ],
    [recordsByType],
  )

  const totalAmount = typeSummary.reduce((total, summary) => total + summary.amount, 0)
  const totalCount = typeSummary.reduce((total, summary) => total + summary.count, 0)
  const paymentMethodSummary = paymentMethods.map((method) => {
    const recordsWithMethod = filteredRecords.filter((record) => record.paymentMethod === method)
    return {
      method,
      count: recordsWithMethod.length,
      amount: recordsWithMethod.reduce((total, record) => total + parseMoneyValue(record.value), 0),
    }
  })

  async function handleConsultationStatusChange(consultationId: Consultation['id'], paymentStatus: PaymentStatus) {
    await savePaymentChange(`consultation-status-${consultationId}`, async () => {
      await actions.updateConsultation(consultationId, { paymentStatus })
      return 'Estado de pago actualizado correctamente.'
    })
  }

  async function handlePaymentMethodChange(record: IncomeRecord, paymentMethod: PaymentMethod | '') {
    await savePaymentChange(`${record.type}-${record.id}`, async () => {
      if (record.type === 'Consulta') {
        await actions.updateConsultation(record.id, { paymentMethod })
      }

      if (record.type === 'Vacuna' || record.type === 'Desparasitación') {
        await actions.updatePreventiveCare(record.id, { paymentMethod })
      }

      if (record.type === 'Examen') {
        await actions.updateClinicalExam(record.id, { paymentMethod })
      }

      return 'Método de pago actualizado correctamente.'
    })
  }

  async function savePaymentChange(recordKey: string, updateRecord: () => Promise<string>) {
    try {
      setPaymentMessage(null)
      setSavingRecordKey(recordKey)
      const successMessage = await updateRecord()
      setPaymentMessage(successMessage)
    } catch {
      setPaymentMessage('No se pudo actualizar el registro. Revisa la conexión o permisos.')
    } finally {
      setSavingRecordKey(null)
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
        <p>Indicadores de ingresos por consultas, vacunas, desparasitaciones y exámenes.</p>
      </section>

      {error && <section className="status-banner error">{error}</section>}

      <section className="activity-panel">
        <SectionHeader eyebrow="FILTROS" title="Periodo de análisis" />

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
            Estado consulta
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
              placeholder="Ej: Simba, Felipe, microchip"
            />
          </label>
        </div>
      </section>

      <section className="payment-summary-grid" aria-label="Resumen de ingresos">
        <article className="payment-summary-card total">
          <span>Total del periodo</span>
          <strong>{totalCount}</strong>
          <small>{formatCurrency(totalAmount)}</small>
        </article>
        {typeSummary.map(({ label, count, amount }) => (
          <article className="payment-summary-card" key={label}>
            <span>{label}</span>
            <strong>{count}</strong>
            <small>{formatCurrency(amount)}</small>
          </article>
        ))}
      </section>

      <section className="activity-panel">
        <SectionHeader eyebrow="MÉTODOS DE PAGO" title="Resumen por método" />
        <div className="payment-summary-grid compact">
          {paymentMethodSummary.map(({ method, count, amount }) => (
            <article className="payment-summary-card" key={method}>
              <span>{method}</span>
              <strong>{count}</strong>
              <small>{formatCurrency(amount)}</small>
            </article>
          ))}
        </div>
      </section>

      {paymentMessage && <section className="form-message success">{paymentMessage}</section>}

      <IncomeSection
        emptyText="No hay consultas que coincidan con los filtros seleccionados."
        records={recordsByType.consultations}
        savingRecordKey={savingRecordKey}
        title="Consultas"
        onPaymentMethodChange={handlePaymentMethodChange}
        onPaymentStatusChange={handleConsultationStatusChange}
      />

      <IncomeSection
        emptyText="No hay vacunas registradas en este periodo."
        records={recordsByType.vaccines}
        savingRecordKey={savingRecordKey}
        title="Vacunas"
        onPaymentMethodChange={handlePaymentMethodChange}
        onPaymentStatusChange={handleConsultationStatusChange}
      />

      <IncomeSection
        emptyText="No hay desparasitaciones registradas en este periodo."
        records={recordsByType.deworming}
        savingRecordKey={savingRecordKey}
        title="Desparasitación"
        onPaymentMethodChange={handlePaymentMethodChange}
        onPaymentStatusChange={handleConsultationStatusChange}
      />

      <IncomeSection
        emptyText="No hay exámenes registrados en este periodo."
        records={recordsByType.exams}
        savingRecordKey={savingRecordKey}
        title="Exámenes"
        onPaymentMethodChange={handlePaymentMethodChange}
        onPaymentStatusChange={handleConsultationStatusChange}
      />
    </div>
  )
}

type IncomeSectionProps = {
  emptyText: string
  records: IncomeRecord[]
  savingRecordKey: string | null
  title: string
  onPaymentMethodChange: (record: IncomeRecord, paymentMethod: PaymentMethod | '') => Promise<void>
  onPaymentStatusChange: (consultationId: Consultation['id'], paymentStatus: PaymentStatus) => Promise<void>
}

function IncomeSection({
  emptyText,
  records,
  savingRecordKey,
  title,
  onPaymentMethodChange,
  onPaymentStatusChange,
}: IncomeSectionProps) {
  const amount = records.reduce((total, record) => total + parseMoneyValue(record.value), 0)

  return (
    <section className="activity-panel">
      <SectionHeader eyebrow="TRAZABILIDAD" title={`${title} del periodo`} />
      <p className="section-total">{records.length} registros · {formatCurrency(amount)}</p>

      <div className="consultation-list">
        {records.length === 0 ? (
          <p className="empty-text">{emptyText}</p>
        ) : (
          records.map((record) => (
            <IncomeTraceCard
              key={`${record.type}-${record.id}`}
              record={record}
              isSaving={savingRecordKey === `${record.type}-${record.id}` || savingRecordKey === `consultation-status-${record.id}`}
              onPaymentMethodChange={onPaymentMethodChange}
              onPaymentStatusChange={onPaymentStatusChange}
            />
          ))
        )}
      </div>
    </section>
  )
}

type IncomeTraceCardProps = {
  record: IncomeRecord
  isSaving: boolean
  onPaymentMethodChange: (record: IncomeRecord, paymentMethod: PaymentMethod | '') => Promise<void>
  onPaymentStatusChange: (consultationId: Consultation['id'], paymentStatus: PaymentStatus) => Promise<void>
}

function IncomeTraceCard({
  record,
  isSaving,
  onPaymentMethodChange,
  onPaymentStatusChange,
}: IncomeTraceCardProps) {
  const currentPaymentStatus = record.consultation?.paymentStatus || 'Pendiente'
  const currentPaymentMethod = record.paymentMethod || ''

  return (
    <article className="consultation-card">
      <div className="consultation-card-main">
        <header>
          <div>
            <span>{record.date || 'Fecha no registrada'} · {record.type}</span>
            <h3>{record.patient?.name ?? 'Paciente no encontrado'}</h3>
          </div>
          {record.type === 'Consulta' && (
            <strong className={`payment-pill ${currentPaymentStatus.toLowerCase()}`}>{currentPaymentStatus}</strong>
          )}
        </header>

        <dl className="consultation-meta">
          <div>
            <dt>Tutor</dt>
            <dd>{isGenericTutor(record.tutor) ? 'Sin tutor registrado' : record.tutor?.fullName ?? 'Sin tutor asociado'}</dd>
          </div>
          <div>
            <dt>Contacto</dt>
            <dd>{record.tutor?.phone || 'Sin teléfono'}</dd>
          </div>
          <div>
            <dt>Paciente</dt>
            <dd>{formatPatientIdentity(record.patient)}</dd>
          </div>
          <div>
            <dt>Método de pago</dt>
            <dd>{currentPaymentMethod || 'Sin registrar'}</dd>
          </div>
        </dl>

        <p>{record.title}</p>
        <p>{record.detail}</p>
      </div>

      <div className="consultation-payment">
        <span>{formatCurrency(parseMoneyValue(record.value))}</span>
        {record.type === 'Consulta' && (
          <label>
            Estado
            <select
              disabled={isSaving}
              value={currentPaymentStatus}
              onChange={(event) => void onPaymentStatusChange(record.id, event.target.value as PaymentStatus)}
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Método de pago
          <select
            disabled={isSaving}
            value={currentPaymentMethod}
            onChange={(event) => void onPaymentMethodChange(record, event.target.value as PaymentMethod | '')}
          >
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

function createIncomeRecord(record: Omit<IncomeRecord, 'searchText'>): IncomeRecord {
  return {
    ...record,
    searchText: [
      record.type,
      record.title,
      record.detail,
      record.patient?.name,
      record.patient?.species,
      record.patient?.breed,
      record.patient?.microchip,
      record.tutor?.fullName,
      record.tutor?.phone,
      record.consultation?.paymentStatus,
      record.paymentMethod,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  }
}

function createSummary(label: string, records: IncomeRecord[]) {
  return {
    label,
    count: records.length,
    amount: records.reduce((total, record) => total + parseMoneyValue(record.value), 0),
  }
}

function findPatient(patients: Patient[], patientId: number | string) {
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

function isDateInPeriod(dateValue: string, period: PeriodFilter, periodValue: string) {
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
