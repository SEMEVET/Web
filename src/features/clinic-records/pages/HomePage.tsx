import { ClipboardList, HeartPulse, ShieldCheck, Stethoscope, Users } from 'lucide-react'
import { MetricCard } from '../../../components/ui/MetricCard'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { isSupabaseConfigured } from '../../../lib/supabaseClient'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'

export function HomePage() {
  const { records, isLoading, error } = useClinicRecordsContext()
  const latestConsultations = records.consultations.slice(0, 3)

  return (
    <div className="dashboard">
      <section className="hero-panel">
        <div className="hero-copy">
          <span>ATENCIÓN VETERINARIA A DOMICILIO</span>
          <h1>GESTIÓN CLÍNICA SEMEVET</h1>
          <p>
            Plataforma clínica para coordinar atenciones domiciliarias, mantener fichas
            actualizadas y dar seguimiento ordenado a cada paciente.
          </p>
        </div>
        <div className="hero-card">
          <Stethoscope size={28} aria-hidden="true" />
          <strong>{isSupabaseConfigured ? 'Supabase conectado' : 'Modo local de prueba'}</strong>
          <p>
            La app está preparada para operar con tablas clínicas simples y crecer por
            módulos sin agregar complejidad innecesaria.
          </p>
        </div>
      </section>

      {(isLoading || error) && (
        <section className={error ? 'status-banner error' : 'status-banner'}>
          {error ?? 'Cargando registros desde Supabase...'}
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
          detail="Atenciones domiciliarias"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Prevención"
          value={records.preventiveCare.length}
          detail="Vacunas y desparasitaciones"
        />
      </section>

      <section className="activity-panel">
        <SectionHeader
          eyebrow="ACTIVIDAD"
          title="Últimos movimientos"
          description="Vista rápida del trabajo clínico registrado en la plataforma."
        />
        <div className="activity-columns">
          <MiniList
            title="Tutores recientes"
            emptyText="Aún no hay tutores registrados."
            items={records.tutors.slice(0, 3).map((tutor) => ({
              id: String(tutor.id),
              title: tutor.fullName,
              detail: tutor.phone,
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
