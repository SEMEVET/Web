-- SEMEVET - Bloqueo RLS de fichas clinicas para un administrador global.
-- Objetivo: impedir acceso anonimo y permitir lectura/edicion solo a
-- contacto.semevet@gmail.com con rol administrador_global.

begin;

alter table public.tutores enable row level security;
alter table public.pacientes enable row level security;
alter table public.consultas enable row level security;
alter table public.vacunas_desparasitaciones enable row level security;
alter table public.usuarios enable row level security;

revoke all on table public.tutores from anon;
revoke all on table public.pacientes from anon;
revoke all on table public.consultas from anon;
revoke all on table public.vacunas_desparasitaciones from anon;
revoke all on table public.usuarios from anon;

grant usage on schema public to authenticated;
grant select, insert, update on table public.tutores to authenticated;
grant select, insert, update on table public.pacientes to authenticated;
grant select, insert, update on table public.consultas to authenticated;
grant select, insert, update on table public.vacunas_desparasitaciones to authenticated;
revoke all on table public.usuarios from authenticated;
grant select on table public.usuarios to authenticated;
grant update (nombre, telefono) on table public.usuarios to authenticated;

do $$
declare
  sequence_name text;
begin
  foreach sequence_name in array array[
    pg_get_serial_sequence('public.tutores', 'id'),
    pg_get_serial_sequence('public.pacientes', 'id'),
    pg_get_serial_sequence('public.consultas', 'id'),
    pg_get_serial_sequence('public.vacunas_desparasitaciones', 'id')
  ]
  loop
    if sequence_name is not null then
      execute format('grant usage, select on sequence %s to authenticated', sequence_name);
    end if;
  end loop;
end
$$;

do $$
declare
  admin_user_id uuid;
begin
  select id
  into admin_user_id
  from auth.users
  where lower(email) = 'contacto.semevet@gmail.com'
  limit 1;

  if admin_user_id is null then
    raise exception 'No existe usuario Supabase Auth con email contacto.semevet@gmail.com';
  end if;

  if exists (
    select 1
    from public.usuarios
    where lower(email) = 'contacto.semevet@gmail.com'
      and id <> admin_user_id
  ) then
    raise exception 'Existe un perfil public.usuarios con contacto.semevet@gmail.com asociado a otro usuario';
  end if;

  insert into public.usuarios (id, nombre, email, rol, activo)
  values (
    admin_user_id,
    'SEMEVET Administrador',
    'contacto.semevet@gmail.com',
    'administrador_global',
    true
  )
  on conflict (id) do update
  set email = excluded.email,
      rol = excluded.rol,
      activo = true,
      nombre = coalesce(nullif(public.usuarios.nombre, ''), excluded.nombre);

  update public.usuarios
  set activo = false
  where id <> admin_user_id;
end
$$;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'usuarios',
        'tutores',
        'pacientes',
        'consultas',
        'vacunas_desparasitaciones'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

create policy "semevet_usuarios_lee_su_perfil"
on public.usuarios
for select
to authenticated
using (
  (select auth.uid()) = id
  and lower(email) = 'contacto.semevet@gmail.com'
  and rol = 'administrador_global'
  and activo is true
);

create policy "semevet_usuarios_actualiza_su_perfil_activo"
on public.usuarios
for update
to authenticated
using (
  (select auth.uid()) = id
  and lower(email) = 'contacto.semevet@gmail.com'
  and rol = 'administrador_global'
  and activo is true
)
with check (
  (select auth.uid()) = id
  and lower(email) = 'contacto.semevet@gmail.com'
  and rol = 'administrador_global'
  and activo is true
);

create policy "semevet_tutores_activos_select"
on public.tutores
for select
to authenticated
using (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_tutores_activos_insert"
on public.tutores
for insert
to authenticated
with check (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_tutores_activos_update"
on public.tutores
for update
to authenticated
using (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
)
with check (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_pacientes_activos_select"
on public.pacientes
for select
to authenticated
using (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_pacientes_activos_insert"
on public.pacientes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_pacientes_activos_update"
on public.pacientes
for update
to authenticated
using (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
)
with check (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_consultas_activos_select"
on public.consultas
for select
to authenticated
using (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_consultas_activos_insert"
on public.consultas
for insert
to authenticated
with check (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_consultas_activos_update"
on public.consultas
for update
to authenticated
using (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
)
with check (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_vacunas_desparasitaciones_activos_select"
on public.vacunas_desparasitaciones
for select
to authenticated
using (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_vacunas_desparasitaciones_activos_insert"
on public.vacunas_desparasitaciones
for insert
to authenticated
with check (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

create policy "semevet_vacunas_desparasitaciones_activos_update"
on public.vacunas_desparasitaciones
for update
to authenticated
using (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
)
with check (
  exists (
    select 1
    from public.usuarios
    where usuarios.id = (select auth.uid())
      and lower(usuarios.email) = 'contacto.semevet@gmail.com'
      and usuarios.rol = 'administrador_global'
      and usuarios.activo is true
  )
);

commit;
