import { useState, useEffect, useCallback } from 'react'
import { ExerciseController } from '../controllers/ExerciseController'
import { Exercise, CreateExerciseData, UpdateExerciseData, LoadingState } from '../types'
import toast from 'react-hot-toast'

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null
  })
  const [stats, setStats] = useState<{
    total: number
    byDay: Record<number, number>
    totalSets: number
    totalReps: number
  } | null>(null)

  // Buscar todos os exercícios
  const fetchExercises = useCallback(async () => {
    setLoading({ isLoading: true, error: null })
    
    try {
      const response = await ExerciseController.getAllExercises()
      
      if (response.error) {
        setLoading({ isLoading: false, error: response.error })
        toast.error(`Erro ao carregar exercícios: ${response.error}`)
        return
      }

      setExercises(response.data)
      setLoading({ isLoading: false, error: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setLoading({ isLoading: false, error: errorMessage })
      toast.error(`Erro ao carregar exercícios: ${errorMessage}`)
    }
  }, [])

  // Buscar exercícios por dia
  const fetchExercisesByDay = useCallback(async (dayOfWeek: number) => {
    setLoading({ isLoading: true, error: null })
    
    try {
      const response = await ExerciseController.getExercisesByDay(dayOfWeek)
      
      if (response.error) {
        setLoading({ isLoading: false, error: response.error })
        toast.error(`Erro ao carregar exercícios: ${response.error}`)
        return
      }

      setExercises(response.data)
      setLoading({ isLoading: false, error: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setLoading({ isLoading: false, error: errorMessage })
      toast.error(`Erro ao carregar exercícios: ${errorMessage}`)
    }
  }, [])

  // Buscar exercícios do dia atual
  const fetchTodayExercises = useCallback(async () => {
    setLoading({ isLoading: true, error: null })
    
    try {
      const response = await ExerciseController.getTodayExercises()
      
      if (response.error) {
        setLoading({ isLoading: false, error: response.error })
        toast.error(`Erro ao carregar exercícios de hoje: ${response.error}`)
        return
      }

      setExercises(response.data)
      setLoading({ isLoading: false, error: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setLoading({ isLoading: false, error: errorMessage })
      toast.error(`Erro ao carregar exercícios de hoje: ${errorMessage}`)
    }
  }, [])

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const response = await ExerciseController.getExerciseStats()
      
      if (response.error) {
        toast.error(`Erro ao carregar estatísticas: ${response.error}`)
        return
      }

      setStats(response.data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao carregar estatísticas: ${errorMessage}`)
    }
  }, [])

  // Criar exercício
  const createExercise = useCallback(async (exerciseData: CreateExerciseData) => {
    setLoading({ isLoading: true, error: null })
    
    try {
      const response = await ExerciseController.createExercise(exerciseData)
      
      if (response.error) {
        setLoading({ isLoading: false, error: response.error })
        toast.error(`Erro ao criar exercício: ${response.error}`)
        return { error: response.error }
      }

      setExercises(prev => [...prev, response.data!])
      setLoading({ isLoading: false, error: null })
      toast.success('Exercício criado com sucesso!')
      
      // Atualizar estatísticas
      await fetchStats()
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setLoading({ isLoading: false, error: errorMessage })
      toast.error(`Erro ao criar exercício: ${errorMessage}`)
      return { error: errorMessage }
    }
  }, [fetchStats])

  // Atualizar exercício
  const updateExercise = useCallback(async (id: string, exerciseData: UpdateExerciseData) => {
    setLoading({ isLoading: true, error: null })
    
    try {
      const response = await ExerciseController.updateExercise(id, exerciseData)
      
      if (response.error) {
        setLoading({ isLoading: false, error: response.error })
        toast.error(`Erro ao atualizar exercício: ${response.error}`)
        return { error: response.error }
      }

      setExercises(prev => prev.map(exercise => 
        exercise.id === id ? response.data! : exercise
      ))
      setLoading({ isLoading: false, error: null })
      toast.success('Exercício atualizado com sucesso!')
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setLoading({ isLoading: false, error: errorMessage })
      toast.error(`Erro ao atualizar exercício: ${errorMessage}`)
      return { error: errorMessage }
    }
  }, [])

  // Deletar exercício
  const deleteExercise = useCallback(async (id: string) => {
    setLoading({ isLoading: true, error: null })
    
    try {
      const response = await ExerciseController.deleteExercise(id)
      
      if (response.error) {
        setLoading({ isLoading: false, error: response.error })
        toast.error(`Erro ao deletar exercício: ${response.error}`)
        return { error: response.error }
      }

      setExercises(prev => prev.filter(exercise => exercise.id !== id))
      setLoading({ isLoading: false, error: null })
      toast.success('Exercício deletado com sucesso!')
      
      // Atualizar estatísticas
      await fetchStats()
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setLoading({ isLoading: false, error: errorMessage })
      toast.error(`Erro ao deletar exercício: ${errorMessage}`)
      return { error: errorMessage }
    }
  }, [fetchStats])

  // Reordenar exercícios
  const reorderExercises = useCallback(async (dayOfWeek: number, exerciseIds: string[]) => {
    try {
      const response = await ExerciseController.reorderExercises(dayOfWeek, exerciseIds)
      
      if (response.error) {
        toast.error(`Erro ao reordenar exercícios: ${response.error}`)
        return { error: response.error }
      }

      // Recarregar exercícios para refletir a nova ordem
      await fetchExercisesByDay(dayOfWeek)
      toast.success('Exercícios reordenados com sucesso!')
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao reordenar exercícios: ${errorMessage}`)
      return { error: errorMessage }
    }
  }, [fetchExercisesByDay])

  // Buscar exercício por ID
  const getExerciseById = useCallback(async (id: string) => {
    try {
      const response = await ExerciseController.getExerciseById(id)
      
      if (response.error) {
        toast.error(`Erro ao buscar exercício: ${response.error}`)
        return { data: null, error: response.error }
      }

      return { data: response.data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao buscar exercício: ${errorMessage}`)
      return { data: null, error: errorMessage }
    }
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    fetchExercises()
    fetchStats()
  }, [fetchExercises, fetchStats])

  return {
    exercises,
    loading,
    stats,
    fetchExercises,
    fetchExercisesByDay,
    fetchTodayExercises,
    fetchStats,
    createExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    getExerciseById
  }
} 