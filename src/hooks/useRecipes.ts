import { useState, useEffect, useCallback } from 'react'
import { RecipeController } from '../controllers/RecipeController'
import { Recipe, CreateRecipeData, UpdateRecipeData, MealType } from '../types'

export const useRecipes = () => {
  const [controller] = useState(() => new RecipeController())
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para atualizar o estado local
  const updateState = useCallback(() => {
    setRecipes(controller.getRecipes())
    setLoading(controller.getLoading())
    setError(controller.getError())
  }, [controller])

  // Carregar todas as receitas
  const loadAllRecipes = useCallback(async () => {
    await controller.loadAllRecipes()
    updateState()
  }, [controller, updateState])

  // Carregar receitas por tipo de refeição
  const loadRecipesByMealType = useCallback(async (mealType: MealType) => {
    await controller.loadRecipesByMealType(mealType)
    updateState()
  }, [controller, updateState])

  // Criar nova receita
  const createRecipe = useCallback(async (recipeData: CreateRecipeData) => {
    const result = await controller.createRecipe(recipeData)
    updateState()
    return result
  }, [controller, updateState])

  // Atualizar receita
  const updateRecipe = useCallback(async (id: string, recipeData: UpdateRecipeData) => {
    const result = await controller.updateRecipe(id, recipeData)
    updateState()
    return result
  }, [controller, updateState])

  // Deletar receita
  const deleteRecipe = useCallback(async (id: string) => {
    const result = await controller.deleteRecipe(id)
    updateState()
    return result
  }, [controller, updateState])

  // Definir receita preferida
  const setPreferredRecipe = useCallback(async (id: string, mealType: MealType) => {
    const result = await controller.setPreferredRecipe(id, mealType)
    updateState()
    return result
  }, [controller, updateState])

  // Obter estatísticas
  const getRecipeStats = useCallback(async () => {
    return await controller.getRecipeStats()
  }, [controller])

  // Limpar erro
  const clearError = useCallback(() => {
    controller.clearError()
    updateState()
  }, [controller, updateState])

  // Buscar receitas por tipo de refeição (local)
  const getRecipesByMealType = useCallback((mealType: MealType) => {
    return controller.getRecipesByMealType(mealType)
  }, [controller])

  // Buscar receita preferida (local)
  const getPreferredRecipe = useCallback((mealType: MealType) => {
    return controller.getPreferredRecipe(mealType)
  }, [controller])

  // Buscar receita por ID (local)
  const findRecipeById = useCallback((id: string) => {
    return controller.findRecipeById(id)
  }, [controller])

  // Obter contagem de receitas
  const getRecipesCount = useCallback(() => {
    return controller.getRecipesCount()
  }, [controller])

  // Obter contagem de receitas por tipo
  const getRecipesCountByMealType = useCallback((mealType: MealType) => {
    return controller.getRecipesCountByMealType(mealType)
  }, [controller])

  // Carregar receitas na inicialização
  useEffect(() => {
    loadAllRecipes()
  }, [loadAllRecipes])

  return {
    // Estado
    recipes,
    loading,
    error,
    
    // Ações
    loadAllRecipes,
    loadRecipesByMealType,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    setPreferredRecipe,
    getRecipeStats,
    clearError,
    
    // Utilitários locais
    getRecipesByMealType,
    getPreferredRecipe,
    findRecipeById,
    getRecipesCount,
    getRecipesCountByMealType
  }
} 