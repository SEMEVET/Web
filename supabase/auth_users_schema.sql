-- Tabla de perfiles de usuario para la app SEMEVET.
-- El login lo maneja Supabase Auth en auth.users.
-- Esta tabla guarda atributos operativos visibles para la app.

create table if not exists "Usuarios" (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null unique,
  rol text not null default 'veterinario',
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table "Usuarios" enable row level security;

create policy "usuarios_leen_su_perfil"
on "Usuarios"
for select
to authenticated
using (auth.uid() = id);

create policy "usuarios_crean_su_perfil"
on "Usuarios"
for insert
to authenticated
with check (auth.uid() = id);

create policy "usuarios_editan_su_perfil"
on "Usuarios"
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
