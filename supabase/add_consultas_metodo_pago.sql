alter table public.consultas
add column if not exists metodo_pago text;

comment on column public.consultas.metodo_pago is 'Metodo de pago registrado para trazabilidad administrativa de la consulta.';
