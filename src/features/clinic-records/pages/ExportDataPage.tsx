import { Download } from 'lucide-react'
import { SectionHeader } from '../../../components/ui/SectionHeader'
import { useClinicRecordsContext } from '../context/useClinicRecordsContext'
import type { ClinicRecords } from '../types/clinicRecords'

export function ExportDataPage() {
  const { records, error } = useClinicRecordsContext()
  const jsonPreview = JSON.stringify(records, null, 2)

  function handleExportJson() {
    downloadTextFile('semevet-datos.json', jsonPreview, 'application/json')
  }

  function handleExportCsv() {
    const csv = [
      createCsv('tutores', [
        ['id', 'nombre', 'telefono', 'correo', 'direccion', 'comuna', 'observaciones'],
        ...records.tutors.map((tutor) => [
          String(tutor.id),
          tutor.fullName,
          tutor.phone,
          tutor.email,
          tutor.address,
          tutor.comuna,
          tutor.observations,
        ]),
      ]),
      createCsv('pacientes', [
        [
          'id',
          'nombre',
          'especie',
          'raza',
          'sexo',
          'edad',
          'peso',
          'enfermedades_previas',
          'esterilizado',
          'numero_partos',
          'microchip',
          'alergias',
          'cirugias_previas',
          'vive_con_animales',
          'cuales',
        ],
        ...records.patients.map((patient) => [
          String(patient.id),
          patient.name,
          patient.species,
          patient.breed,
          patient.sex,
          patient.age,
          patient.weight,
          patient.previousDiseases,
          patient.sterilized ? 'Sí' : 'No',
          patient.birthsCount,
          patient.microchip,
          patient.allergies,
          patient.previousSurgeries,
          patient.livesWithAnimals ? 'Sí' : 'No',
          patient.animalHousemates,
        ]),
      ]),
      createCsv('consultas', [
        [
          'id',
          'paciente_id',
          'fecha',
          'tipo_atencion',
          'motivo',
          'anamnesis',
          'antecedentes_relevantes',
          'examen_fisico',
          'temperatura',
          'frecuencia_cardiaca',
          'frecuencia_respiratoria',
          'peso',
          'mucosas',
          'tllc',
          'hidratacion',
          'condicion_corporal',
          'dolor',
          'hallazgos_clinicos',
          'diagnostico_presuntivo',
          'diagnosticos_diferenciales',
          'diagnostico_definitivo',
          'tratamiento',
          'medicamentos_indicados',
          'examenes_sugeridos',
          'indicaciones',
          'criterio_control',
          'criterio_derivacion',
          'proximo_control',
          'observaciones_internas',
          'valor',
          'estado_pago',
        ],
        ...records.consultations.map((consultation) => [
          String(consultation.id),
          String(consultation.patientId),
          consultation.date,
          consultation.attentionType,
          consultation.reason,
          consultation.anamnesis,
          consultation.relevantHistory,
          consultation.physicalExam,
          consultation.temperature,
          consultation.heartRate,
          consultation.respiratoryRate,
          consultation.weight,
          consultation.mucousMembranes,
          consultation.tllc,
          consultation.hydration,
          consultation.bodyCondition,
          consultation.pain,
          consultation.clinicalFindings,
          consultation.presumptiveDiagnosis,
          consultation.differentialDiagnoses,
          consultation.definitiveDiagnosis,
          consultation.treatment,
          consultation.prescribedMedications,
          consultation.suggestedTests,
          consultation.indications,
          consultation.controlCriteria,
          consultation.referralCriteria,
          consultation.nextControl,
          consultation.internalObservations,
          consultation.value,
          consultation.paymentStatus,
        ]),
      ]),
      createCsv('prevencion', [
        ['id', 'paciente_id', 'tipo', 'producto', 'fecha_aplicacion', 'proxima_fecha', 'observaciones'],
        ...records.preventiveCare.map((care) => [
          String(care.id),
          String(care.patientId),
          care.careType,
          care.product,
          care.applicationDate,
          care.nextDate,
          care.observations,
        ]),
      ]),
    ].join('\n\n')

    downloadTextFile('semevet-datos.csv', csv, 'text/csv')
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <span>EXPORTAR DATOS</span>
        <h1>Exportar Datos</h1>
        <p>Descarga una copia simple de los registros cargados para respaldo o revisión externa.</p>
      </section>

      {error && <section className="status-banner error">{error}</section>}

      <section className="content-grid">
        <article className="module-card">
          <SectionHeader
            eyebrow="DESCARGAS"
            title="Formatos disponibles"
            description="JSON conserva la estructura completa. CSV facilita revisión en planillas."
          />
          <div className="export-actions">
            <button type="button" onClick={handleExportJson}>
              <Download size={18} aria-hidden="true" />
              Descargar JSON
            </button>
            <button type="button" onClick={handleExportCsv}>
              <Download size={18} aria-hidden="true" />
              Descargar CSV
            </button>
          </div>
          <ExportSummary records={records} />
        </article>

        <article className="module-card">
          <SectionHeader
            eyebrow="VISTA PREVIA"
            title="Datos actuales"
            description="Resumen técnico de los registros disponibles en la sesión."
          />
          <pre className="json-preview">{jsonPreview}</pre>
        </article>
      </section>
    </div>
  )
}

function ExportSummary({ records }: { records: ClinicRecords }) {
  return (
    <dl className="export-summary">
      <div>
        <dt>Tutores</dt>
        <dd>{records.tutors.length}</dd>
      </div>
      <div>
        <dt>Pacientes</dt>
        <dd>{records.patients.length}</dd>
      </div>
      <div>
        <dt>Consultas</dt>
        <dd>{records.consultations.length}</dd>
      </div>
      <div>
        <dt>Prevención</dt>
        <dd>{records.preventiveCare.length}</dd>
      </div>
    </dl>
  )
}

function createCsv(section: string, rows: string[][]) {
  const csvRows = rows.map((row) => row.map(escapeCsvValue).join(','))
  return [`# ${section}`, ...csvRows].join('\n')
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}
