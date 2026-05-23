alter table public.consultas
add column if not exists tipo_atencion text,
add column if not exists antecedentes_relevantes text,
add column if not exists peso numeric(6,2),
add column if not exists hidratacion text,
add column if not exists condicion_corporal text,
add column if not exists dolor text,
add column if not exists hallazgos_clinicos text,
add column if not exists diagnosticos_diferenciales text,
add column if not exists medicamentos_indicados text,
add column if not exists examenes_sugeridos text,
add column if not exists criterio_control text,
add column if not exists criterio_derivacion text,
add column if not exists observaciones_internas text;

comment on column public.consultas.tipo_atencion is 'Tipo operativo de atención veterinaria.';
comment on column public.consultas.antecedentes_relevantes is 'Antecedentes clínicos relevantes para ficha SOAP.';
comment on column public.consultas.peso is 'Peso registrado al momento de la consulta.';
comment on column public.consultas.hidratacion is 'Evaluación de hidratación del paciente.';
comment on column public.consultas.condicion_corporal is 'Condición corporal del paciente.';
comment on column public.consultas.dolor is 'Evaluación o descripción de dolor.';
comment on column public.consultas.hallazgos_clinicos is 'Hallazgos clínicos relevantes del examen.';
comment on column public.consultas.diagnosticos_diferenciales is 'Diagnósticos diferenciales considerados.';
comment on column public.consultas.medicamentos_indicados is 'Medicamentos indicados al tutor.';
comment on column public.consultas.examenes_sugeridos is 'Exámenes sugeridos o pendientes.';
comment on column public.consultas.criterio_control is 'Criterio clínico para control posterior.';
comment on column public.consultas.criterio_derivacion is 'Criterio clínico para derivación.';
comment on column public.consultas.observaciones_internas is 'Notas internas no necesariamente comunicadas al tutor.';
