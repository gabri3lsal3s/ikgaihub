import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para o banco de dados (serão gerados automaticamente pelo Supabase)
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Tipos específicos das tabelas
export type Recipe = Tables['recipes']['Row']
export type Exercise = Tables['exercises']['Row']
export type MealPreference = Tables['meal_preferences']['Row']
export type ActivityLog = Tables['activity_logs']['Row']

// Tipos para inserção
export type RecipeInsert = Tables['recipes']['Insert']
export type ExerciseInsert = Tables['exercises']['Insert']
export type MealPreferenceInsert = Tables['meal_preferences']['Insert']
export type ActivityLogInsert = Tables['activity_logs']['Insert']

// Tipos para atualização
export type RecipeUpdate = Tables['recipes']['Update']
export type ExerciseUpdate = Tables['exercises']['Update']
export type MealPreferenceUpdate = Tables['meal_preferences']['Update'] 