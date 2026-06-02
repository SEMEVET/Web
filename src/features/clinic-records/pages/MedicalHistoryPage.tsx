import { useMemo, useState } from 'react'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'
import type { Consultation, Patient, Tutor } from '../types/clinicRecords'
import { isGenericTutor } from '../types/clinicRecords'

export function MedicalHistoryPage() {
  const { records, error } = useClinicRecordsContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')

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
            patient.microchip,
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
  const selectedPatient = selectedRow?.patient
  const selectedTutor = selectedRow?.tutor
  const selectedTutorName = selectedRow?.tutorName ?? 'Sin tutor registrado'
  const patientOptions = filteredRows.map(({ patient, tutorName, searchText }) => ({
    value: String(patient.id),
    label: `${patient.name} - ${tutorName}`,
    searchText,
  }))

  const consultations = selectedPatient
    ? records.consultations.filter((consultation) => String(consultation.patientId) === String(selectedPatient.id))
    : []
  const preventiveCare = selectedPatient
    ? records.preventiveCare.filter((care) => String(care.patientId) === String(selectedPatient.id))
    : []

  return (
    <div className="page-stack">
      <section className="page-intro">
        <span>HISTORIAL CLÍNICO</span>
        <h1>Historial Clínico</h1>
      </section>

      {error && <section className="status-banner error">{error}</section>}

      <section className="module-card">
        <SectionHeader
          eyebrow="BÚSQUEDA"
          title="Seleccionar paciente"
          description="Filtra por nombre de mascota, tutor, teléfono, correo o microchip."
        />

        <div className="consultation-toolbar">
          <label>
            Buscar mascota o dueño
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setSelectedPatientId('')
              }}
              placeholder="Ej: Simba, Felipe, +569..., microchip"
            />
          </label>

          <label>
            Paciente
            <SearchableSelect
              disabled={!hasSearchTerm || filteredRows.length === 0}
              emptyText={hasSearchTerm ? 'Sin resultados' : 'Busca una mascota o tutor primero'}
              options={patientOptions}
              placeholder={!hasSearchTerm ? 'Busca una mascota o tutor primero' : filteredRows.length === 0 ? 'Sin resultados' : 'Buscar paciente'}
              value={selectedPatient ? String(selectedPatient.id) : ''}
              onChange={setSelectedPatientId}
            />
          </label>
        </div>
      </section>

      <section className="history-list">
        {!selectedPatient ? (
          <article className="module-card">
            <SectionHeader
              eyebrow="SIN RESULTADOS"
              title={hasSearchTerm ? 'No hay historial disponible' : 'Busca un paciente para revisar su historial'}
              description={hasSearchTerm ? 'Ajusta el filtro de búsqueda.' : 'Ingresa el nombre de la mascota, tutor, teléfono, correo o microchip.'}
            />
          </article>
        ) : (
          <article className="history-card">
            <header>
              <div>
                <span>{selectedPatient.species || 'Sin especie registrada'}</span>
                <h2>{selectedPatient.name}</h2>
                <p>
                  {selectedPatient.breed || 'Sin raza registrada'} · {selectedPatient.sex || 'Sin sexo registrado'}
                </p>
                <p>Tutor: {selectedTutorName}</p>
              </div>
              <strong>{consultations.length + preventiveCare.length} eventos</strong>
            </header>

            <PatientSummary patient={selectedPatient} tutor={selectedTutor} tutorName={selectedTutorName} />

            <div className="history-columns">
              <Timeline
                title="Consultas"
                emptyText="Sin consultas registradas."
                items={consultations.map((consultation) => ({
                  id: String(consultation.id),
                  date: consultation.date,
                  title: consultation.reason,
                  detail: consultation.definitiveDiagnosis || consultation.presumptiveDiagnosis || 'Sin diagnóstico registrado',
                  consultation,
                }))}
              />
              <Timeline
                title="Prevención"
                emptyText="Sin vacunas o desparasitaciones registradas."
                items={preventiveCare.map((care) => ({
                  id: String(care.id),
                  date: care.applicationDate || 'Fecha de aplicación no registrada',
                  title: `${care.careType}: ${care.product}`,
                  detail: care.nextDate ? `Próxima fecha: ${care.nextDate}` : 'Sin próxima fecha',
                }))}
              />
            </div>
          </article>
        )}
      </section>
    </div>
  )
}

type PatientSummaryProps = {
  patient: Patient
  tutor?: Tutor
  tutorName: string
}

function PatientSummary({ patient, tutor, tutorName }: PatientSummaryProps) {
  return (
    <dl className="history-summary">
      <div>
        <dt>Tutor</dt>
        <dd>{tutorName}</dd>
      </div>
      <div>
        <dt>Contacto</dt>
        <dd>{isGenericTutor(tutor) ? 'No registrado' : tutor?.phone || 'No registrado'}</dd>
      </div>
      <div>
        <dt>Edad</dt>
        <dd>{patient.age || 'No registrada'}</dd>
      </div>
      <div>
        <dt>Peso</dt>
        <dd>{patient.weight ? `${patient.weight} kg` : 'No registrado'}</dd>
      </div>
      <div>
        <dt>Microchip</dt>
        <dd>{patient.microchip || 'No registrado'}</dd>
      </div>
      <div>
        <dt>Estado reproductivo</dt>
        <dd>{patient.sterilized ? 'Esterilizado' : 'No esterilizado'}</dd>
      </div>
    </dl>
  )
}

type TimelineProps = {
  title: string
  emptyText: string
  items: Array<{
    id: string
    date: string
    title: string
    detail: string
    consultation?: Consultation
  }>
}

function Timeline({ title, emptyText, items }: TimelineProps) {
  return (
    <div className="timeline">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="empty-text">{emptyText}</p>
      ) : (
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              {item.consultation ? (
                <ConsultationHistoryDetail consultation={item.consultation} />
              ) : (
                <>
                  <time>{item.date}</time>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

type ConsultationHistoryDetailProps = {
  consultation: Consultation
}

function ConsultationHistoryDetail({ consultation }: ConsultationHistoryDetailProps) {
  const vitalSigns = [
    ['Fecha', consultation.date],
    ['Tipo atención', consultation.attentionType],
    ['Método de pago', consultation.paymentMethod],
    ['Temperatura', formatWithUnit(consultation.temperature, '°C')],
    ['Frecuencia cardíaca', formatWithUnit(consultation.heartRate, 'lpm')],
    ['Frecuencia respiratoria', formatWithUnit(consultation.respiratoryRate, 'rpm')],
    ['Peso', formatWithUnit(consultation.weight, 'kg')],
    ['Mucosas', consultation.mucousMembranes],
    ['TLLC', consultation.tllc],
    ['Hidratación', consultation.hydration],
    ['Condición corporal', consultation.bodyCondition],
    ['Dolor', consultation.pain],
  ]

  const clinicalBlocks = [
    ['Motivo de consulta', consultation.reason],
    ['Anamnesis', consultation.anamnesis],
    ['Antecedentes relevantes', consultation.relevantHistory],
    ['Examen físico general', consultation.physicalExam],
    ['Hallazgos clínicos', consultation.clinicalFindings],
    ['Diagnóstico presuntivo', consultation.presumptiveDiagnosis],
    ['Diagnósticos diferenciales', consultation.differentialDiagnoses],
    ['Diagnóstico definitivo', consultation.definitiveDiagnosis],
    ['Tratamiento aplicado', consultation.treatment],
    ['Medicamentos indicados', consultation.prescribedMedications],
    ['Exámenes sugeridos', consultation.suggestedTests],
    ['Indicaciones al tutor', consultation.indications],
    ['Criterio de control', consultation.controlCriteria],
    ['Criterio de derivación', consultation.referralCriteria],
    ['Próximo control', consultation.nextControl],
    ['Observaciones internas', consultation.internalObservations],
  ]

  return (
    <article className="consultation-history-detail">
      <header>
        <time>{consultation.date}</time>
        <strong>{consultation.reason || 'Consulta sin motivo registrado'}</strong>
        <span>{consultation.paymentStatus || 'Sin estado de pago'}</span>
      </header>

      <dl className="consultation-vitals">
        {vitalSigns.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || 'No registrado'}</dd>
          </div>
        ))}
      </dl>

      <div className="consultation-soap-detail">
        {clinicalBlocks.map(([label, value]) => (
          <section key={label}>
            <h4>{label}</h4>
            <p>{value || 'No registrado'}</p>
          </section>
        ))}
      </div>
    </article>
  )
}

function formatWithUnit(value: string, unit: string) {
  return value ? `${value} ${unit}` : ''
}

function findTutor(tutors: Tutor[], tutorId: Patient['tutorId']) {
  return tutors.find((tutor) => String(tutor.id) === String(tutorId))
}

function formatTutorName(tutor?: Tutor) {
  if (isGenericTutor(tutor)) return 'Sin tutor registrado'
  return tutor?.fullName ?? 'Tutor no encontrado'
}
