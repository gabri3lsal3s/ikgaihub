import { supabase } from './supabase'
import type { 
  ApiResponse
} from '../types'

// Tipos específicos para progresso
export interface ExerciseCompletion {
  id: string;
  user_id: string;
  exercise_id: string;
  completed_at: string;
  sets_completed: number;
  reps_completed: number;
  weight_used?: number;
  duration_completed?: number;
  notes?: string;
  created_at: string;
}

export interface RecipeCompletion {
  id: string;
  user_id: string;
  recipe_id: string;
  completed_at: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional';
  rating?: number;
  notes?: string;
  created_at: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  date: string;
  exercises_completed: number;
  recipes_completed: number;
  total_calories: number;
  total_exercise_time: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressStats {
  period: 'weekly' | 'monthly' | 'yearly';
  exercises_completed: number;
  recipes_completed: number;
  total_calories: number;
  total_exercise_time: number;
  streak_days: number;
  average_rating: number;
}

export interface ChartDataPoint {
  date: string;
  exercises_completed: number;
  recipes_completed: number;
  total_calories: number;
  total_exercise_time: number;
}

export interface CreateExerciseCompletionData {
  exercise_id: string;
  sets_completed: number;
  reps_completed: number;
  weight_used?: number;
  duration_completed?: number;
  notes?: string;
}

export interface CreateRecipeCompletionData {
  recipe_id: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional';
  rating?: number;
  notes?: string;
}

export interface ProgressFilters {
  period: 'weekly' | 'monthly' | 'yearly';
  start_date?: string;
  end_date?: string;
  meal_type?: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional';
}

export class ProgressService {
  /**
   * Marca um exercício como concluído
   */
  static async completeExercise(data: CreateExerciseCompletionData): Promise<ApiResponse<ExerciseCompletion>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      const completionData = {
        ...data,
        user_id: user.id,
        completed_at: new Date().toISOString()
      }

      const { data: completion, error } = await supabase
        .from('exercise_completions')
        .insert([completionData])
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: completion, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Marca uma receita como concluída
   */
  static async completeRecipe(data: CreateRecipeCompletionData): Promise<ApiResponse<RecipeCompletion>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      const completionData = {
        ...data,
        user_id: user.id,
        completed_at: new Date().toISOString()
      }

      const { data: completion, error } = await supabase
        .from('recipe_completions')
        .insert([completionData])
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: completion, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Verifica se um exercício foi concluído hoje
   */
  static async isExerciseCompletedToday(exerciseId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('exercise_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { data: null, error: error.message }
      }

      return { data: !!data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Verifica se uma receita foi concluída hoje
   */
  static async isRecipeCompletedToday(recipeId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('recipe_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { data: null, error: error.message }
      }

      return { data: !!data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Obtém estatísticas de progresso para um período
   */
  static async getProgressStats(filters: ProgressFilters): Promise<ApiResponse<ProgressStats>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Calcular datas baseado no período
      const endDate = new Date()
      const startDate = new Date()

      switch (filters.period) {
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'yearly':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Buscar conclusões de exercícios
      const { data: exerciseCompletions, error: exerciseError } = await supabase
        .from('exercise_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())

      if (exerciseError) {
        return { data: null, error: exerciseError.message }
      }

      // Buscar conclusões de receitas
      const { data: recipeCompletions, error: recipeError } = await supabase
        .from('recipe_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())

      if (recipeError) {
        return { data: null, error: recipeError.message }
      }

      // Calcular estatísticas
      const exercises_completed = exerciseCompletions?.length || 0
      const recipes_completed = recipeCompletions?.length || 0
      const total_calories = recipeCompletions?.reduce((sum) => {
        // Aqui você precisaria buscar as calorias da receita
        return sum + 0 // Placeholder
      }, 0) || 0
      const total_exercise_time = exerciseCompletions?.reduce((sum, completion) => {
        return sum + (completion.duration_completed || 0)
      }, 0) || 0

      // Calcular streak (dias consecutivos)
      const streak_days = await this.calculateStreak(user.id)

      // Calcular rating médio
      const ratings = recipeCompletions?.map(c => c.rating).filter(r => r !== null) || []
      const average_rating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + (rating || 0), 0) / ratings.length 
        : 0

      const stats: ProgressStats = {
        period: filters.period,
        exercises_completed,
        recipes_completed,
        total_calories,
        total_exercise_time,
        streak_days,
        average_rating
      }

      return { data: stats, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Obtém dados para gráficos de progresso
   */
  static async getProgressChart(filters: ProgressFilters): Promise<ApiResponse<ChartDataPoint[]>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Calcular datas baseado no período
      const endDate = new Date()
      const startDate = new Date()

      switch (filters.period) {
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'yearly':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Buscar estatísticas diárias
      const { data: dailyStats, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      // Converter para formato do gráfico
      const chartData: ChartDataPoint[] = dailyStats?.map(stat => ({
        date: stat.date,
        exercises_completed: stat.exercises_completed,
        recipes_completed: stat.recipes_completed,
        total_calories: stat.total_calories,
        total_exercise_time: stat.total_exercise_time
      })) || []

      return { data: chartData, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Calcula o streak de dias consecutivos
   */
  private static async calculateStreak(userId: string): Promise<number> {
    try {
      const { data: dailyStats, error } = await supabase
        .from('daily_stats')
        .select('date')
        .eq('user_id', userId)
        .or('exercises_completed.gt.0,recipes_completed.gt.0')
        .order('date', { ascending: false })

      if (error || !dailyStats) {
        return 0
      }

      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const stat of dailyStats) {
        const statDate = new Date(stat.date)
        const diffDays = Math.floor((today.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === streak) {
          streak++
        } else {
          break
        }
      }

      return streak
    } catch {
      return 0
    }
  }

  /**
   * Remove uma conclusão de exercício
   */
  static async removeExerciseCompletion(completionId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      const { error } = await supabase
        .from('exercise_completions')
        .delete()
        .eq('id', completionId)
        .eq('user_id', user.id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Remove uma conclusão de receita
   */
  static async removeRecipeCompletion(completionId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      const { error } = await supabase
        .from('recipe_completions')
        .delete()
        .eq('id', completionId)
        .eq('user_id', user.id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }
} 