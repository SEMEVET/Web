-- Politicas simples para que la app publica pueda leer, insertar y editar datos.
-- Usar solo si esta version MVP no tiene autenticacion.

alter table "Tutores" enable row level security;
alter table "Pacientes" enable row level security;
alter table "Consultas" enable row level security;
alter table "Vacunas_Desparacitaciones" enable row level security;

create policy "public_read_tutores" on "Tutores" for select to anon using (true);
create policy "public_insert_tutores" on "Tutores" for insert to anon with check (true);
create policy "public_update_tutores" on "Tutores" for update to anon using (true) with check (true);

create policy "public_read_pacientes" on "Pacientes" for select to anon using (true);
create policy "public_insert_pacientes" on "Pacientes" for insert to anon with check (true);
create policy "public_update_pacientes" on "Pacientes" for update to anon using (true) with check (true);

create policy "public_read_consultas" on "Consultas" for select to anon using (true);
create policy "public_insert_consultas" on "Consultas" for insert to anon with check (true);
create policy "public_update_consultas" on "Consultas" for update to anon using (true) with check (true);

create policy "public_read_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones" for select to anon using (true);
create policy "public_insert_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones" for insert to anon with check (true);
create policy "public_update_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones" for update to anon using (true) with check (true);
