import { useMemo, useState } from 'react'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { PatientForm } from '../components/PatientForm'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'
import type { Patient, Tutor } from '../types/clinicRecords'
import { isGenericTutor } from '../types/clinicRecords'

export function PatientsPage() {
  const { records, actions, error } = useClinicRecordsContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const patientRows = useMemo(
    () =>
      records.patients.map((patient) => {
        const tutor = findTutor(records.tutors, patient.tutorId)
        const tutorName = formatTutorName(tutor)

        return {
          patient,
          tutor,
          tutorName,
          searchText: [
            patient.name,
            patient.species,
            patient.breed,
            patient.sex,
            patient.age,
            patient.weight,
            patient.microchip,
            patient.previousDiseases,
            patient.allergies,
            patient.previousSurgeries,
            patient.animalHousemates,
            tutorName,
            tutor?.phone,
            tutor?.email,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        }
      }),
    [records.patients, records.tutors],
  )

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return []

    return patientRows.filter((row) => row.searchText.includes(query))
  }, [patientRows, searchTerm])

  const hasSearchTerm = searchTerm.trim().length > 0
  const selectedRow = hasSearchTerm
    ? filteredRows.find((row) => String(row.patient.id) === selectedPatientId) ?? filteredRows[0]
    : undefined
  const patientOptions = filteredRows.map(({ patient, tutorName, searchText }) => ({
    value: String(patient.id),
    label: `${patient.name} - ${tutorName}`,
    searchText,
  }))

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
            title="Buscar paciente"
            description="Busca por mascota, tutor, teléfono, microchip, raza o antecedente registrado."
          />

          <div className="consultation-toolbar">
            <label>
              Buscar paciente o tutor
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setSelectedPatientId('')
                }}
                placeholder="Ej: Beausejour, Felipe, microchip, alergia"
              />
            </label>

            <label>
              Paciente
              <SearchableSelect
                disabled={!hasSearchTerm || filteredRows.length === 0}
                emptyText={hasSearchTerm ? 'Sin resultados' : 'Busca un paciente primero'}
                options={patientOptions}
                placeholder={!hasSearchTerm ? 'Busca un paciente primero' : filteredRows.length === 0 ? 'Sin resultados' : 'Seleccionar paciente'}
                value={selectedRow ? String(selectedRow.patient.id) : ''}
                onChange={setSelectedPatientId}
              />
            </label>
          </div>

          <div className="data-list patient-result-list">
            {records.patients.length === 0 ? (
              <p className="empty-text">Aún no hay pacientes registrados.</p>
            ) : !selectedRow ? (
              <p className="empty-text">
                {hasSearchTerm ? 'No hay pacientes que coincidan con la búsqueda.' : 'Busca un paciente para ver su ficha completa.'}
              </p>
            ) : (
              <PatientDetailCard
                patient={selectedRow.patient}
                tutor={selectedRow.tutor}
                tutorName={selectedRow.tutorName}
              />
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

type PatientDetailCardProps = {
  patient: Patient
  tutor?: Tutor
  tutorName: string
}

function PatientDetailCard({ patient, tutor, tutorName }: PatientDetailCardProps) {
  const details = [
    ['Tutor', tutorName],
    ['Contacto tutor', isGenericTutor(tutor) ? 'No registrado' : tutor?.phone || 'No registrado'],
    ['Correo tutor', isGenericTutor(tutor) ? 'No registrado' : tutor?.email || 'No registrado'],
    ['Especie', patient.species],
    ['Raza', patient.breed],
    ['Sexo', patient.sex],
    ['Edad', patient.age],
    ['Peso', patient.weight ? `${patient.weight} kg` : ''],
    ['Microchip', patient.microchip],
    ['Estado reproductivo', patient.sterilized ? 'Esterilizado' : 'No esterilizado'],
    ['Número de partos', patient.birthsCount],
    ['Enfermedades previas', patient.previousDiseases],
    ['Alergias', patient.allergies],
    ['Cirugías previas', patient.previousSurgeries],
    ['Vive con animales', patient.livesWithAnimals ? 'Sí' : 'No'],
    ['Cuáles', patient.livesWithAnimals ? patient.animalHousemates : 'No aplica'],
  ]

  return (
    <article className="data-card patient-detail-card">
      <header>
        <span>{patient.species || 'Sin especie registrada'}</span>
        <strong>{patient.name}</strong>
        <small>Tutor: {tutorName}</small>
      </header>

      <dl className="patient-detail-grid">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || 'No registrado'}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

function findTutor(tutors: Tutor[], tutorId: Patient['tutorId']) {
  return tutors.find((currentTutor) => String(currentTutor.id) === String(tutorId))
}

function formatTutorName(tutor?: Tutor) {
  if (isGenericTutor(tutor)) return 'Sin tutor registrado'
  return tutor?.fullName ?? 'Tutor no encontrado'
}
