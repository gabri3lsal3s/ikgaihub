import { supabase } from './supabase'
import { Exercise, CreateExerciseData, UpdateExerciseData, ApiResponse, PaginatedResponse } from '../types'

export class ExerciseService {
  /**
   * Busca todos os exercícios do usuário
   */
  static async getAllExercises(): Promise<PaginatedResponse<Exercise>> {
    try {
      const { data, error, count } = await supabase
        .from('exercises')
        .select('*', { count: 'exact' })
        .order('day_of_week', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) {
        return { data: [], count: 0, error: error.message }
      }

      return { data: data || [], count: count || 0, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: [], count: 0, error: errorMessage }
    }
  }

  /**
   * Busca exercícios por dia da semana
   */
  static async getExercisesByDay(dayOfWeek: number): Promise<PaginatedResponse<Exercise>> {
    try {
      const { data, error, count } = await supabase
        .from('exercises')
        .select('*', { count: 'exact' })
        .eq('day_of_week', dayOfWeek)
        .order('order_index', { ascending: true })

      if (error) {
        return { data: [], count: 0, error: error.message }
      }

      return { data: data || [], count: count || 0, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: [], count: 0, error: errorMessage }
    }
  }

  /**
   * Busca um exercício específico por ID
   */
  static async getExerciseById(id: string): Promise<ApiResponse<Exercise>> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Cria um novo exercício
   */
  static async createExercise(exerciseData: CreateExerciseData): Promise<ApiResponse<Exercise>> {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Incluir o user_id nos dados do exercício
      const exerciseWithUserId = {
        ...exerciseData,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseWithUserId])
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Atualiza um exercício existente
   */
  static async updateExercise(id: string, exerciseData: UpdateExerciseData): Promise<ApiResponse<Exercise>> {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Verificar se o exercício pertence ao usuário
      const { data: existingExercise, error: fetchError } = await supabase
        .from('exercises')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        return { data: null, error: 'Exercício não encontrado' }
      }

      if (existingExercise.user_id !== user.id) {
        return { data: null, error: 'Você não tem permissão para editar este exercício' }
      }

      const { data, error } = await supabase
        .from('exercises')
        .update(exerciseData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Remove um exercício
   */
  static async deleteExercise(id: string): Promise<ApiResponse<boolean>> {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Verificar se o exercício pertence ao usuário
      const { data: existingExercise, error: fetchError } = await supabase
        .from('exercises')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        return { data: null, error: 'Exercício não encontrado' }
      }

      if (existingExercise.user_id !== user.id) {
        return { data: null, error: 'Você não tem permissão para deletar este exercício' }
      }

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)

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
   * Reordena exercícios de um dia específico
   */
  static async reorderExercises(_dayOfWeek: number, exerciseIds: string[]): Promise<ApiResponse<boolean>> {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Atualizar a ordem de cada exercício
      for (let i = 0; i < exerciseIds.length; i++) {
        const { error } = await supabase
          .from('exercises')
          .update({ order_index: i })
          .eq('id', exerciseIds[i])
          .eq('user_id', user.id)

        if (error) {
          return { data: null, error: error.message }
        }
      }

      return { data: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Busca estatísticas dos exercícios do usuário
   */
  static async getExerciseStats(): Promise<ApiResponse<{
    total: number
    byDay: Record<number, number>
    totalSets: number
    totalReps: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('day_of_week, sets, reps')

      if (error) {
        return { data: null, error: error.message }
      }

      const stats = {
        total: data?.length || 0,
        byDay: {
          0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
        } as Record<number, number>,
        totalSets: 0,
        totalReps: 0
      }

      data?.forEach(exercise => {
        stats.byDay[exercise.day_of_week]++
        stats.totalSets += exercise.sets || 0
        stats.totalReps += (exercise.sets || 0) * (exercise.reps || 0)
      })

      return { data: stats, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Busca exercícios do dia atual
   */
  static async getTodayExercises(): Promise<PaginatedResponse<Exercise>> {
    try {
      const today = new Date().getDay() // 0 = domingo, 1 = segunda, etc.
      return await this.getExercisesByDay(today)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: [], count: 0, error: errorMessage }
    }
  }
} 