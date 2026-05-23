import { SectionHeader } from '../../../components/ui/SectionHeader'
import { PatientForm } from '../components/PatientForm'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'
import type { Patient } from '../types/clinicRecords'
import { isGenericTutor } from '../types/clinicRecords'

export function PatientsPage() {
  const { records, actions, error } = useClinicRecordsContext()

  function getTutorName(tutorId: Patient['tutorId']) {
    const tutor = records.tutors.find((currentTutor) => String(currentTutor.id) === String(tutorId))

    if (isGenericTutor(tutor)) return 'Sin tutor registrado'

    return tutor?.fullName ?? 'Tutor no encontrado'
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <span>PACIENTES</span>
        <h1>Pacientes</h1>
        <p>Ficha inicial de mascotas asociadas a tutores registrados.</p>
      </section>

      {error && <section className="status-banner error">{error}</section>}

      <section className="content-grid">
        <article className="module-card">
          <SectionHeader
            eyebrow="NUEVO PACIENTE"
            title="Registrar paciente"
          />
          <PatientForm tutors={records.tutors} onSubmit={actions.addPatient} />
        </article>

        <article className="module-card">
          <SectionHeader
            eyebrow="FICHAS"
            title="Pacientes registrados"
            description="Mascotas disponibles para consultas y controles preventivos."
          />
          <div className="data-list">
            {records.patients.length === 0 ? (
              <p className="empty-text">Aún no hay pacientes registrados.</p>
            ) : (
              records.patients.map((patient) => (
                <article className="data-card" key={patient.id}>
                  <strong>{patient.name}</strong>
                  <span>{patient.species}</span>
                  <small>{patient.breed || 'Sin raza registrada'}</small>
                  <small>Tutor: {getTutorName(patient.tutorId)}</small>
                  <small>{patient.sex || 'Sin sexo registrado'}</small>
                  <small>{patient.sterilized ? 'Esterilizado' : 'No esterilizado'}</small>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

