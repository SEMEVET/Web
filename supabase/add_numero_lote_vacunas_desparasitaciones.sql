alter table public.vacunas_desparasitaciones
add column if not exists numero_lote text;

comment on column public.vacunas_desparasitaciones.numero_lote
is 'Número de lote opcional para vacunas.';
