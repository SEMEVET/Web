import { SectionHeader } from '../../../components/ui/SectionHeader'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'
import { TutorForm } from '../components/TutorForm'

export function TutorsPage() {
  const { records, actions, error } = useClinicRecordsContext()

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="TUTORES"
        title="Tutores"
        description="Registro de responsables, datos de contacto y dirección para atención domiciliaria."
      />

      {error && <section className="status-banner error">{error}</section>}

      <section className="content-grid">
        <article className="module-card">
          <SectionHeader
            eyebrow="NUEVO REGISTRO"
            title="Registrar tutor"
          />
          <TutorForm onSubmit={actions.addTutor} />
        </article>

        <article className="module-card">
          <SectionHeader
            eyebrow="DIRECTORIO"
            title="Tutores registrados"
            description="Listado simple para revisar los contactos cargados."
          />
          <div className="data-list">
            {records.tutors.length === 0 ? (
              <p className="empty-text">Aún no hay tutores registrados.</p>
            ) : (
              records.tutors.map((tutor) => (
                <article className="data-card" key={tutor.id}>
                  <strong>{tutor.fullName}</strong>
                  <span>{tutor.phone}</span>
                  <small>{tutor.email || 'Sin correo registrado'}</small>
                  <small>{tutor.address}</small>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
}

function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="page-intro">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}
