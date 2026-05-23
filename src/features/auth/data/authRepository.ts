import { getSupabaseClient } from '../../../lib/supabaseClient'
import type { AuthProfile } from '../types/auth'

function mapProfile(row: {
  id: string
  nombre: string
  email: string
  rol: string
  telefono: string | null
  activo: boolean
}): AuthProfile {
  return {
    id: row.id,
    name: row.nombre,
    email: row.email,
    role: row.rol,
    phone: row.telefono ?? '',
    active: row.activo,
  }
}

export async function fetchCurrentProfile(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data ? mapProfile(data) : null
}

export async function upsertProfile(profile: {
  id: string
  name: string
  email: string
  phone?: string
  role?: string
}) {
  const { data, error } = await getSupabaseClient()
    .from('usuarios')
    .upsert({
      id: profile.id,
      nombre: profile.name,
      email: profile.email,
      telefono: profile.phone ?? null,
      rol: profile.role ?? 'veterinario',
      activo: true,
    })
    .select()
    .single()

  if (error) throw error
  return mapProfile(data)
}
