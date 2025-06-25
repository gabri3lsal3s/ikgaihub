import { ExerciseService } from '../services/ExerciseService'
import { Exercise, CreateExerciseData, UpdateExerciseData, ApiResponse, PaginatedResponse } from '../types'

export class ExerciseController {
  /**
   * Busca todos os exercícios do usuário
   */
  static async getAllExercises(): Promise<PaginatedResponse<Exercise>> {
    return await ExerciseService.getAllExercises()
  }

  /**
   * Busca exercícios por dia da semana
   */
  static async getExercisesByDay(dayOfWeek: number): Promise<PaginatedResponse<Exercise>> {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return { data: [], count: 0, error: 'Dia da semana inválido' }
    }
    return await ExerciseService.getExercisesByDay(dayOfWeek)
  }

  /**
   * Busca um exercício específico por ID
   */
  static async getExerciseById(id: string): Promise<ApiResponse<Exercise>> {
    if (!id || id.trim() === '') {
      return { data: null, error: 'ID do exercício é obrigatório' }
    }
    return await ExerciseService.getExerciseById(id)
  }

  /**
   * Cria um novo exercício
   */
  static async createExercise(exerciseData: CreateExerciseData): Promise<ApiResponse<Exercise>> {
    // Validações
    if (!exerciseData.name || exerciseData.name.trim() === '') {
      return { data: null, error: 'Nome do exercício é obrigatório' }
    }

    if (exerciseData.day_of_week < 0 || exerciseData.day_of_week > 6) {
      return { data: null, error: 'Dia da semana deve estar entre 0 (domingo) e 6 (sábado)' }
    }

    if (exerciseData.sets && exerciseData.sets < 1) {
      return { data: null, error: 'Número de séries deve ser maior que 0' }
    }

    if (exerciseData.reps && exerciseData.reps < 1) {
      return { data: null, error: 'Número de repetições deve ser maior que 0' }
    }

    if (exerciseData.duration && exerciseData.duration < 1) {
      return { data: null, error: 'Duração deve ser maior que 0' }
    }

    if (exerciseData.weight && exerciseData.weight < 0) {
      return { data: null, error: 'Peso não pode ser negativo' }
    }

    return await ExerciseService.createExercise(exerciseData)
  }

  /**
   * Atualiza um exercício existente
   */
  static async updateExercise(id: string, exerciseData: UpdateExerciseData): Promise<ApiResponse<Exercise>> {
    if (!id || id.trim() === '') {
      return { data: null, error: 'ID do exercício é obrigatório' }
    }

    // Validações
    if (exerciseData.name !== undefined && exerciseData.name.trim() === '') {
      return { data: null, error: 'Nome do exercício não pode estar vazio' }
    }

    if (exerciseData.day_of_week !== undefined && (exerciseData.day_of_week < 0 || exerciseData.day_of_week > 6)) {
      return { data: null, error: 'Dia da semana deve estar entre 0 (domingo) e 6 (sábado)' }
    }

    if (exerciseData.sets !== undefined && exerciseData.sets < 1) {
      return { data: null, error: 'Número de séries deve ser maior que 0' }
    }

    if (exerciseData.reps !== undefined && exerciseData.reps < 1) {
      return { data: null, error: 'Número de repetições deve ser maior que 0' }
    }

    if (exerciseData.duration !== undefined && exerciseData.duration < 1) {
      return { data: null, error: 'Duração deve ser maior que 0' }
    }

    if (exerciseData.weight !== undefined && exerciseData.weight < 0) {
      return { data: null, error: 'Peso não pode ser negativo' }
    }

    return await ExerciseService.updateExercise(id, exerciseData)
  }

  /**
   * Remove um exercício
   */
  static async deleteExercise(id: string): Promise<ApiResponse<boolean>> {
    if (!id || id.trim() === '') {
      return { data: null, error: 'ID do exercício é obrigatório' }
    }
    return await ExerciseService.deleteExercise(id)
  }

  /**
   * Reordena exercícios de um dia específico
   */
  static async reorderExercises(dayOfWeek: number, exerciseIds: string[]): Promise<ApiResponse<boolean>> {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return { data: null, error: 'Dia da semana inválido' }
    }

    if (!exerciseIds || exerciseIds.length === 0) {
      return { data: null, error: 'Lista de exercícios é obrigatória' }
    }

    // Validar se todos os IDs são válidos
    for (const id of exerciseIds) {
      if (!id || id.trim() === '') {
        return { data: null, error: 'ID de exercício inválido na lista' }
      }
    }

    return await ExerciseService.reorderExercises(dayOfWeek, exerciseIds)
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
    return await ExerciseService.getExerciseStats()
  }

  /**
   * Busca exercícios do dia atual
   */
  static async getTodayExercises(): Promise<PaginatedResponse<Exercise>> {
    return await ExerciseService.getTodayExercises()
  }

  /**
   * Valida dados de exercício
   */
  static validateExerciseData(data: Partial<CreateExerciseData>): string[] {
    const errors: string[] = []

    if (data.name !== undefined && data.name.trim() === '') {
      errors.push('Nome do exercício é obrigatório')
    }

    if (data.day_of_week !== undefined && (data.day_of_week < 0 || data.day_of_week > 6)) {
      errors.push('Dia da semana deve estar entre 0 (domingo) e 6 (sábado)')
    }

    if (data.sets !== undefined && data.sets < 1) {
      errors.push('Número de séries deve ser maior que 0')
    }

    if (data.reps !== undefined && data.reps < 1) {
      errors.push('Número de repetições deve ser maior que 0')
    }

    if (data.duration !== undefined && data.duration < 1) {
      errors.push('Duração deve ser maior que 0')
    }

    if (data.weight !== undefined && data.weight < 0) {
      errors.push('Peso não pode ser negativo')
    }

    return errors
  }

  /**
   * Formata dados de exercício para exibição
   */
  static formatExerciseForDisplay(exercise: Exercise): {
    id: string
    name: string
    dayName: string
    sets: string
    reps: string
    duration: string
    weight: string
    description: string
  } {
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    return {
      id: exercise.id,
      name: exercise.name,
      dayName: daysOfWeek[exercise.day_of_week] || 'Desconhecido',
      sets: exercise.sets ? `${exercise.sets} séries` : 'Não definido',
      reps: exercise.reps ? `${exercise.reps} reps` : 'Não definido',
      duration: exercise.duration ? `${exercise.duration} min` : 'Não definido',
      weight: exercise.weight ? `${exercise.weight} kg` : 'Não definido',
      description: exercise.description || 'Sem descrição'
    }
  }
} 