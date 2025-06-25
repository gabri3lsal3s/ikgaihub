import { useState, useEffect, useCallback } from 'react'
import { RecipeService } from '../services/RecipeService'
import { ExerciseService } from '../services/ExerciseService'
import type { Recipe, Exercise, MealType } from '../types'
import { getTimeInfo } from '../utils/timeUtils'

interface DashboardStats {
  totalRecipes: number
  totalExercises: number
  preferredRecipes: number
  recipesByMeal: Record<string, number>
  exercisesByDay: Record<string, number>
  todayExercises: Exercise[]
  timeInfo: {
    nextMeal: string | null
    formattedTimeRemaining: string
  }
  nextMealRecipes: Recipe[]
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar dados em paralelo
      const [recipesResult, exercisesResult] = await Promise.all([
        RecipeService.getAllRecipes(),
        ExerciseService.getAllExercises()
      ])

      if (recipesResult.error) {
        throw new Error(recipesResult.error)
      }

      if (exercisesResult.error) {
        throw new Error(exercisesResult.error)
      }

      const recipes = recipesResult.data || []
      const exercises = exercisesResult.data || []

      // Calcular estatísticas
      const totalRecipes = recipes.length
      const totalExercises = exercises.length
      const preferredRecipes = recipes.filter((r: Recipe) => r.is_preferred).length

      // Agrupar receitas por tipo de refeição
      const recipesByMeal: Record<string, number> = {
        breakfast: 0,
        morning_snack: 0,
        lunch: 0,
        afternoon_snack: 0,
        dinner: 0,
        night_snack: 0,
        additional: 0
      }

      recipes.forEach((recipe: Recipe) => {
        recipesByMeal[recipe.meal_type]++
      })

      // Agrupar exercícios por dia da semana
      const exercisesByDay: Record<string, number> = {
        '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0
      }

      exercises.forEach((exercise: Exercise) => {
        exercisesByDay[exercise.day_of_week.toString()]++
      })

      // Obter exercícios de hoje
      const today = new Date().getDay()
      const todayExercises = exercises
        .filter((exercise: Exercise) => exercise.day_of_week === today)
        .sort((a: Exercise, b: Exercise) => a.order_index - b.order_index)

      // Obter próxima refeição
      const timeInfo = getTimeInfo()
      const nextMeal = timeInfo.nextMeal
      const nextMealRecipes = recipes.filter((recipe: Recipe) => {
        // Mapear nome da refeição para MealType
        const mealTypeMapping: Record<string, MealType> = {
          'Café da manhã': 'breakfast',
          'Lanche da manhã': 'morning_snack',
          'Almoço': 'lunch',
          'Lanche da tarde': 'afternoon_snack',
          'Jantar': 'dinner',
          'Ceia': 'night_snack'
        }
        return recipe.meal_type === mealTypeMapping[nextMeal || '']
      })

      setStats({
        totalRecipes,
        totalExercises,
        preferredRecipes,
        recipesByMeal,
        exercisesByDay,
        todayExercises,
        timeInfo: {
          nextMeal,
          formattedTimeRemaining: timeInfo.formattedTimeRemaining
        },
        nextMealRecipes
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Carregar dados na inicialização
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    stats,
    loading,
    error,
    refresh
  }
} 