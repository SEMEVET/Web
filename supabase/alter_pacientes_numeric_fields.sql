alter table public.pacientes
alter column edad type numeric(5,2)
using edad::numeric;

alter table public.pacientes
alter column peso type numeric(6,2)
using peso::numeric;
