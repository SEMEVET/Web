import { createClient } from '@supabase/supabase-js'
import { env, hasSupabaseEnv } from '../config/env'
import type { Database } from './database.types'

export const isSupabaseConfigured = hasSupabaseEnv

export const supabase = isSupabaseConfigured
  ? createClient<Database>(env.supabaseUrl, env.supabaseAnonKey)
  : null

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }

  return supabase
}
