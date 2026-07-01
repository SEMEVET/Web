import {
  ClipboardList,
  FileDown,
  HeartPulse,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { MetricCard } from '../../../components/ui/MetricCard'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'

export function HomePage() {
  const { records, isLoading, error } = useClinicRecordsContext()
  const latestConsultations = records.consultations.slice(0, 3)
  const latestPatients = records.patients.slice(0, 3)
  const monthIncome = [...records.consultations, ...records.preventiveCare, ...records.exams]
    .filter((record) => getRecordDate(record).startsWith(getCurrentMonth()))
    .reduce((total, record) => total + parseMoneyValue(record.value), 0)

  return (
    <div className="dashboard">
      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="home-brand-mark">
            <img src="/brand/semevet-logo.png" alt="Logo SEMEVET" />
            <div>
              <span>SEMEVET</span>
              <strong>Atención veterinaria a domicilio</strong>
            </div>
          </div>

          <span className="home-eyebrow">GESTIÓN CLÍNICA DOMICILIARIA</span>
          <h1>Panel clínico para seguimiento, prevención y trazabilidad.</h1>
          <p>
            Registro operativo de tutores, pacientes, consultas SOAP, vacunas,
            desparasitaciones, exámenes e indicadores de pago.
          </p>

          <div className="home-actions" aria-label="Accesos principales">
            <NavLink className="home-action primary" to="/consultas">
              <Stethoscope size={18} aria-hidden="true" />
              Registrar atención
            </NavLink>
            <NavLink className="home-action" to="/historial">
              <Search size={18} aria-hidden="true" />
              Buscar historial
            </NavLink>
            <NavLink className="home-action" to="/estado-consultas">
              <WalletCards size={18} aria-hidden="true" />
              Estado financiero
            </NavLink>
          </div>
        </div>

        <div className="home-clinical-board" aria-label="Resumen operativo">
          <div>
            <span>Pacientes</span>
            <strong>{records.patients.length}</strong>
          </div>
          <div>
            <span>Consultas</span>
            <strong>{records.consultations.length}</strong>
          </div>
          <div>
            <span>Prevención</span>
            <strong>{records.preventiveCare.length}</strong>
          </div>
          <div>
            <span>Exámenes</span>
            <strong>{records.exams.length}</strong>
          </div>
          <div className="wide">
            <span>Ingresos del mes</span>
            <strong>{formatCurrency(monthIncome)}</strong>
          </div>
        </div>
      </section>

      {(isLoading || error) && (
        <section className={error ? 'status-banner error' : 'status-banner'}>
          {error ?? 'Cargando registros clínicos...'}
        </section>
      )}

      <section className="metrics-grid" aria-label="Resumen clínico">
        <MetricCard
          icon={Users}
          label="Tutores"
          value={records.tutors.length}
          detail="Contactos registrados"
        />
        <MetricCard
          icon={HeartPulse}
          label="Pacientes"
          value={records.patients.length}
          detail="Mascotas en seguimiento"
        />
        <MetricCard
          icon={ClipboardList}
          label="Consultas"
          value={records.consultations.length}
          detail="Atenciones registradas"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Prevención"
          value={records.preventiveCare.length}
          detail="Vacunas y desparasitaciones"
        />
      </section>

      <section className="home-workflow">
        <SectionHeader
          eyebrow="OPERACIÓN CLÍNICA"
          title="Trabajo diario"
          description="Accesos preparados para registrar, revisar y medir la atención veterinaria."
        />
        <div className="home-workflow-grid">
          <WorkflowLink
            icon={Users}
            title="Tutores y pacientes"
            detail="Mantén datos de contacto y fichas individuales disponibles antes de cada visita."
            to="/pacientes"
          />
          <WorkflowLink
            icon={ClipboardList}
            title="Consultas SOAP"
            detail="Registra motivo, anamnesis, examen físico, diagnóstico, tratamiento y control."
            to="/consultas"
          />
          <WorkflowLink
            icon={WalletCards}
            title="Pagos por prestación"
            detail="Consulta ingresos por consulta, vacuna, desparasitación y examen."
            to="/estado-consultas"
          />
          <WorkflowLink
            icon={FileDown}
            title="Exportar datos"
            detail="Descarga respaldos CSV para análisis, control interno o continuidad operativa."
            to="/exportar"
          />
        </div>
      </section>

      <section className="activity-panel home-activity-panel">
        <SectionHeader
          eyebrow="ACTIVIDAD"
          title="Últimos movimientos"
          description="Registros recientes disponibles para continuidad clínica."
        />
        <div className="activity-columns">
          <MiniList
            title="Pacientes recientes"
            emptyText="Aún no hay pacientes registrados."
            items={latestPatients.map((patient) => ({
              id: String(patient.id),
              title: patient.name,
              detail: [patient.species, patient.breed].filter(Boolean).join(' · '),
            }))}
          />
          <MiniList
            title="Consultas recientes"
            emptyText="Aún no hay consultas registradas."
            items={latestConsultations.map((consultation) => ({
              id: String(consultation.id),
              title: consultation.reason,
              detail: consultation.date,
            }))}
          />
        </div>
      </section>
    </div>
  )
}

type WorkflowLinkProps = {
  icon: LucideIcon
  title: string
  detail: string
  to: string
}

function WorkflowLink({ icon: Icon, title, detail, to }: WorkflowLinkProps) {
  return (
    <NavLink className="home-workflow-link" to={to}>
      <Icon size={22} aria-hidden="true" />
      <strong>{title}</strong>
      <span>{detail}</span>
    </NavLink>
  )
}

type MiniListProps = {
  title: string
  emptyText: string
  items: Array<{ id: string; title: string; detail: string }>
}

function MiniList({ title, emptyText, items }: MiniListProps) {
  return (
    <div className="record-list">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="empty-text">{emptyText}</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.detail || 'Sin detalle'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function getCurrentMonth() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

function getRecordDate(record: { date?: string; applicationDate?: string; sampleDate?: string }) {
  return record.date ?? record.applicationDate ?? record.sampleDate ?? ''
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
