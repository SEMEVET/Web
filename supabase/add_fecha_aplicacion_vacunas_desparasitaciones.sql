alter table public.vacunas_desparasitaciones
add column if not exists fecha_aplicacion date;

update public.vacunas_desparasitaciones
set fecha_aplicacion = fecha_creacion::date
where fecha_aplicacion is null
  and fecha_creacion is not null;

comment on column public.vacunas_desparasitaciones.fecha_aplicacion
is 'Fecha real en que se aplicó la vacuna o desparasitación.';
