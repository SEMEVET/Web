alter table public.vacunas_desparasitaciones
add column if not exists metodo_pago text;

comment on column public.vacunas_desparasitaciones.metodo_pago is 'Metodo de pago usado para vacuna o desparasitacion.';

alter table public.examenes
add column if not exists metodo_pago text;

comment on column public.examenes.metodo_pago is 'Metodo de pago usado para el examen.';
