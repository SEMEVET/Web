# SEMEVET Web App

Base inicial responsive para SEMEVET, una atencion veterinaria a domicilio.

## Stack

- React + Vite + TypeScript
- Supabase como backend gratuito/serverless para la primera version
- Netlify para hosting estatico gratuito
- pnpm como gestor de paquetes

## Estructura

```text
src/
  app/                         Entrada principal de la app
  components/
    layout/                    Estructura visual comun
    ui/                        Componentes reutilizables simples
  features/
    clinic-records/            Tutores, pacientes, consultas y prevencion
  lib/                         Clientes externos, como Supabase
supabase/
  schema.sql                   Tablas iniciales sugeridas
public/
  brand/semevet-logo.png       Copia del logo base para la app
```

## Variables de entorno

Crear un archivo `.env.local` usando `.env.example` como base:

```text
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

Si esas variables no existen, la app funciona en modo inicial sin credenciales y
mantiene los registros solo durante la sesion del navegador.

La configuracion se centraliza en `src/config/env.ts`. El cliente tipado de
Supabase vive en `src/lib/supabaseClient.ts`, y las operaciones de consulta,
insercion y edicion estan preparadas en
`src/features/clinic-records/data/clinicRecordsRepository.ts`.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## Despliegue en Netlify

Netlify puede leer `netlify.toml`:

- Build command: `pnpm build`
- Publish directory: `dist`

Para conectar Supabase en produccion, agregar `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` en las variables de entorno del sitio Netlify.
