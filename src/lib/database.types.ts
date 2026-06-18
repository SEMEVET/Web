export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nombre: string
          email: string
          rol: string
          telefono: string | null
          activo: boolean
          created_at: string | null
        }
        Insert: {
          id: string
          nombre: string
          email: string
          rol?: string
          telefono?: string | null
          activo?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          rol?: string
          telefono?: string | null
          activo?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      tutores: {
        Row: {
          id: number
          nombre: string
          telefono: number | string
          correo: string | null
          direccion: string
          comuna: string | null
          observaciones: string | null
          consentimiento_datos: boolean | null
          fecha_creacion: string | null
        }
        Insert: {
          id?: number
          nombre: string
          telefono: number | string
          correo?: string | null
          direccion: string
          comuna?: string | null
          observaciones?: string | null
          consentimiento_datos?: boolean | null
          fecha_creacion?: string | null
        }
        Update: {
          id?: number
          nombre?: string
          telefono?: number | string
          correo?: string | null
          direccion?: string
          comuna?: string | null
          observaciones?: string | null
          consentimiento_datos?: boolean | null
          fecha_creacion?: string | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          id: number
          id_tutor: number | null
          nombre: string
          especie: string
          raza: string | null
          sexo: string | null
          edad: number | null
          peso: number | null
          enfermedades_previas: string | null
          esterilizado: boolean | null
          numero_partos: number | null
          microchip: string | null
          alergias: string | null
          cirugias_previas: string | null
          vive_con_animales: boolean | null
          cuales: string | null
          fecha_creacion: string | null
        }
        Insert: {
          id?: number
          id_tutor?: number | null
          nombre: string
          especie: string
          raza?: string | null
          sexo?: string | null
          edad?: number | null
          peso?: number | null
          enfermedades_previas?: string | null
          esterilizado?: boolean | null
          numero_partos?: number | null
          microchip?: string | null
          alergias?: string | null
          cirugias_previas?: string | null
          vive_con_animales?: boolean | null
          cuales?: string | null
          fecha_creacion?: string | null
        }
        Update: {
          id?: number
          id_tutor?: number | null
          nombre?: string
          especie?: string
          raza?: string | null
          sexo?: string | null
          edad?: number | null
          peso?: number | null
          enfermedades_previas?: string | null
          esterilizado?: boolean | null
          numero_partos?: number | null
          microchip?: string | null
          alergias?: string | null
          cirugias_previas?: string | null
          vive_con_animales?: boolean | null
          cuales?: string | null
          fecha_creacion?: string | null
        }
        Relationships: []
      }
      consultas: {
        Row: {
          id: number
          paciente_id: number
          fecha: string
          tipo_atencion: string | null
          motivo: string
          anamnesis: string | null
          antecedentes_relevantes: string | null
          examen_fisico: string | null
          temperatura: number | null
          frecuencia_cardiaca: number | null
          frecuencia_respiratoria: number | null
          peso: number | null
          mucosas: string | null
          tllc: string | null
          hidratacion: string | null
          condicion_corporal: string | null
          dolor: string | null
          hallazgos_clinicos: string | null
          diagnostico_presuntivo: string | null
          diagnosticos_diferenciales: string | null
          diagnostico_definitivo: string | null
          tratamiento: string | null
          medicamentos_indicados: string | null
          examenes_sugeridos: string | null
          indicaciones: string | null
          criterio_control: string | null
          criterio_derivacion: string | null
          'proximo control': string | null
          observaciones_internas: string | null
          valor: number | null
          estado_pago: string | null
          metodo_pago: string | null
          fecha_creacion: string | null
        }
        Insert: {
          id?: number
          paciente_id: number
          fecha: string
          tipo_atencion?: string | null
          motivo: string
          anamnesis?: string | null
          antecedentes_relevantes?: string | null
          examen_fisico?: string | null
          temperatura?: number | null
          frecuencia_cardiaca?: number | null
          frecuencia_respiratoria?: number | null
          peso?: number | null
          mucosas?: string | null
          tllc?: string | null
          hidratacion?: string | null
          condicion_corporal?: string | null
          dolor?: string | null
          hallazgos_clinicos?: string | null
          diagnostico_presuntivo?: string | null
          diagnosticos_diferenciales?: string | null
          diagnostico_definitivo?: string | null
          tratamiento?: string | null
          medicamentos_indicados?: string | null
          examenes_sugeridos?: string | null
          indicaciones?: string | null
          criterio_control?: string | null
          criterio_derivacion?: string | null
          'proximo control'?: string | null
          observaciones_internas?: string | null
          valor?: number | null
          estado_pago?: string | null
          metodo_pago?: string | null
          fecha_creacion?: string | null
        }
        Update: {
          id?: number
          paciente_id?: number
          fecha?: string
          tipo_atencion?: string | null
          motivo?: string
          anamnesis?: string | null
          antecedentes_relevantes?: string | null
          examen_fisico?: string | null
          temperatura?: number | null
          frecuencia_cardiaca?: number | null
          frecuencia_respiratoria?: number | null
          peso?: number | null
          mucosas?: string | null
          tllc?: string | null
          hidratacion?: string | null
          condicion_corporal?: string | null
          dolor?: string | null
          hallazgos_clinicos?: string | null
          diagnostico_presuntivo?: string | null
          diagnosticos_diferenciales?: string | null
          diagnostico_definitivo?: string | null
          tratamiento?: string | null
          medicamentos_indicados?: string | null
          examenes_sugeridos?: string | null
          indicaciones?: string | null
          criterio_control?: string | null
          criterio_derivacion?: string | null
          'proximo control'?: string | null
          observaciones_internas?: string | null
          valor?: number | null
          estado_pago?: string | null
          metodo_pago?: string | null
          fecha_creacion?: string | null
        }
        Relationships: []
      }
      vacunas_desparasitaciones: {
        Row: {
          id: number
          paciente_id: number
          tipo: string
          producto: string
          numero_lote: string | null
          fecha_aplicacion: string | null
          proxima_fecha: string | null
          valor: number | null
          observaciones: string | null
          fecha_creacion: string | null
        }
        Insert: {
          id?: number
          paciente_id: number
          tipo: string
          producto: string
          numero_lote?: string | null
          fecha_aplicacion?: string | null
          proxima_fecha?: string | null
          valor?: number | null
          observaciones?: string | null
          fecha_creacion?: string | null
        }
        Update: {
          id?: number
          paciente_id?: number
          tipo?: string
          producto?: string
          numero_lote?: string | null
          fecha_aplicacion?: string | null
          proxima_fecha?: string | null
          valor?: number | null
          observaciones?: string | null
          fecha_creacion?: string | null
        }
        Relationships: []
      }
      examenes: {
        Row: {
          id: number
          paciente_id: number
          tipo_examen: string
          valor: number | null
          fecha_toma_muestra: string
          tipo_muestra: string | null
          observaciones: string | null
          fecha_creacion: string | null
        }
        Insert: {
          id?: number
          paciente_id: number
          tipo_examen: string
          valor?: number | null
          fecha_toma_muestra: string
          tipo_muestra?: string | null
          observaciones?: string | null
          fecha_creacion?: string | null
        }
        Update: {
          id?: number
          paciente_id?: number
          tipo_examen?: string
          valor?: number | null
          fecha_toma_muestra?: string
          tipo_muestra?: string | null
          observaciones?: string | null
          fecha_creacion?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
