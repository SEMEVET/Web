import { SectionHeader } from '../../../components/ui/SectionHeader'
import { ConsultationForm } from '../components/ConsultationForm'
import { PreventiveCareForm } from '../components/PreventiveCareForm'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'

export function ConsultationsPage() {
  const { records, actions, error } = useClinicRecordsContext()

  return (
    <div className="page-stack">
      <section className="page-intro">
        <span>CONSULTAS</span>
        <h1>Consultas</h1>
        <p>Registro clínico de atenciones veterinarias, vacunas y desparasitaciones.</p>
      </section>

      {error && <section className="status-banner error">{error}</section>}

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
    </div>
  )
}
