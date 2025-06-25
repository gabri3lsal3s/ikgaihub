import { useState, useCallback } from 'react'
import { ProgressService } from '../services/ProgressService'
import type { 
  CreateExerciseCompletionData,
  CreateRecipeCompletionData,
  ProgressFilters
} from '../services/ProgressService'

export const useProgress = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Marcar exercício como concluído
  const completeExercise = useCallback(async (data: CreateExerciseCompletionData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await ProgressService.completeExercise(data)
      
      if (result.error) {
        setError(result.error)
        return { error: result.error }
      }

      return { data: result.data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Marcar receita como concluída
  const completeRecipe = useCallback(async (data: CreateRecipeCompletionData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await ProgressService.completeRecipe(data)
      
      if (result.error) {
        setError(result.error)
        return { error: result.error }
      }

      return { data: result.data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Verificar se exercício foi concluído hoje
  const isExerciseCompletedToday = useCallback(async (exerciseId: string) => {
    try {
      const result = await ProgressService.isExerciseCompletedToday(exerciseId)
      
      if (result.error) {
        return { data: false, error: result.error }
      }

      return { data: result.data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      return { data: false, error: errorMessage }
    }
  }, [])

  // Verificar se receita foi concluída hoje
  const isRecipeCompletedToday = useCallback(async (recipeId: string) => {
    try {
      const result = await ProgressService.isRecipeCompletedToday(recipeId)
      
      if (result.error) {
        return { data: false, error: result.error }
      }

      return { data: result.data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      return { data: false, error: errorMessage }
    }
  }, [])

  // Obter estatísticas de progresso
  const getProgressStats = useCallback(async (filters: ProgressFilters) => {
    setLoading(true)
    setError(null)

    try {
      const result = await ProgressService.getProgressStats(filters)
      
      if (result.error) {
        setError(result.error)
        return { data: null, error: result.error }
      }

      return { data: result.data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Obter dados para gráficos
  const getProgressChart = useCallback(async (filters: ProgressFilters) => {
    setLoading(true)
    setError(null)

    try {
      const result = await ProgressService.getProgressChart(filters)
      
      if (result.error) {
        setError(result.error)
        return { data: null, error: result.error }
      }

      return { data: result.data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Remover conclusão de exercício
  const removeExerciseCompletion = useCallback(async (completionId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await ProgressService.removeExerciseCompletion(completionId)
      
      if (result.error) {
        setError(result.error)
        return { error: result.error }
      }

      return { data: result.data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Remover conclusão de receita
  const removeRecipeCompletion = useCallback(async (completionId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await ProgressService.removeRecipeCompletion(completionId)
      
      if (result.error) {
        setError(result.error)
        return { error: result.error }
      }

      return { data: result.data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    completeExercise,
    completeRecipe,
    isExerciseCompletedToday,
    isRecipeCompletedToday,
    getProgressStats,
    getProgressChart,
    removeExerciseCompletion,
    removeRecipeCompletion,
    clearError
  }
} 