-- Politicas para exigir login antes de acceder a datos clinicos.
-- Ejecutar despues de crear usuarios en Supabase Auth.

alter table "Tutores" enable row level security;
alter table "Pacientes" enable row level security;
alter table "Consultas" enable row level security;
alter table "Vacunas_Desparacitaciones" enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on table "Tutores" to authenticated;
grant select, insert, update on table "Pacientes" to authenticated;
grant select, insert, update on table "Consultas" to authenticated;
grant select, insert, update on table "Vacunas_Desparacitaciones" to authenticated;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "public_read_tutores" on "Tutores";
drop policy if exists "public_insert_tutores" on "Tutores";
drop policy if exists "public_update_tutores" on "Tutores";
drop policy if exists "public_read_pacientes" on "Pacientes";
drop policy if exists "public_insert_pacientes" on "Pacientes";
drop policy if exists "public_update_pacientes" on "Pacientes";
drop policy if exists "public_read_consultas" on "Consultas";
drop policy if exists "public_insert_consultas" on "Consultas";
drop policy if exists "public_update_consultas" on "Consultas";
drop policy if exists "public_read_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones";
drop policy if exists "public_insert_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones";
drop policy if exists "public_update_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones";

create policy "authenticated_read_tutores" on "Tutores" for select to authenticated using (true);
create policy "authenticated_insert_tutores" on "Tutores" for insert to authenticated with check (true);
create policy "authenticated_update_tutores" on "Tutores" for update to authenticated using (true) with check (true);

create policy "authenticated_read_pacientes" on "Pacientes" for select to authenticated using (true);
create policy "authenticated_insert_pacientes" on "Pacientes" for insert to authenticated with check (true);
create policy "authenticated_update_pacientes" on "Pacientes" for update to authenticated using (true) with check (true);

create policy "authenticated_read_consultas" on "Consultas" for select to authenticated using (true);
create policy "authenticated_insert_consultas" on "Consultas" for insert to authenticated with check (true);
create policy "authenticated_update_consultas" on "Consultas" for update to authenticated using (true) with check (true);

create policy "authenticated_read_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones" for select to authenticated using (true);
create policy "authenticated_insert_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones" for insert to authenticated with check (true);
create policy "authenticated_update_vacunas_desparacitaciones" on "Vacunas_Desparacitaciones" for update to authenticated using (true) with check (true);
