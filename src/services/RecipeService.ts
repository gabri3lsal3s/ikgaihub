import { supabase } from './supabase'
import { Recipe, CreateRecipeData, UpdateRecipeData, MealType, ApiResponse, PaginatedResponse } from '../types'

export class RecipeService {
  /**
   * Busca todas as receitas do usuário
   */
  static async getAllRecipes(): Promise<PaginatedResponse<Recipe>> {
    try {
      const { data, error, count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

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
   * Busca receitas por tipo de refeição
   */
  static async getRecipesByMealType(mealType: MealType): Promise<PaginatedResponse<Recipe>> {
    try {
      const { data, error, count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact' })
        .eq('meal_type', mealType)
        .order('is_preferred', { ascending: false })
        .order('created_at', { ascending: false })

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
   * Busca uma receita específica por ID
   */
  static async getRecipeById(id: string): Promise<ApiResponse<Recipe>> {
    try {
      const { data, error } = await supabase
        .from('recipes')
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
   * Busca a receita preferida de um tipo de refeição
   */
  static async getPreferredRecipe(mealType: MealType): Promise<ApiResponse<Recipe>> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('meal_type', mealType)
        .eq('is_preferred', true)
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
   * Cria uma nova receita
   */
  static async createRecipe(recipeData: CreateRecipeData): Promise<ApiResponse<Recipe>> {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Incluir o user_id nos dados da receita
      const recipeWithUserId = {
        ...recipeData,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeWithUserId])
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
   * Atualiza uma receita existente
   */
  static async updateRecipe(id: string, recipeData: UpdateRecipeData): Promise<ApiResponse<Recipe>> {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Verificar se a receita pertence ao usuário
      const { data: existingRecipe, error: fetchError } = await supabase
        .from('recipes')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        return { data: null, error: 'Receita não encontrada' }
      }

      if (existingRecipe.user_id !== user.id) {
        return { data: null, error: 'Você não tem permissão para editar esta receita' }
      }

      const { data, error } = await supabase
        .from('recipes')
        .update(recipeData)
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
   * Marca uma receita como preferida (desmarca outras do mesmo tipo)
   */
  static async setPreferredRecipe(id: string, mealType: MealType): Promise<ApiResponse<Recipe>> {
    try {
      // Primeiro, desmarca todas as receitas preferidas do mesmo tipo
      await supabase
        .from('recipes')
        .update({ is_preferred: false })
        .eq('meal_type', mealType)

      // Depois, marca a receita selecionada como preferida
      const { data, error } = await supabase
        .from('recipes')
        .update({ is_preferred: true })
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
   * Remove uma receita
   */
  static async deleteRecipe(id: string): Promise<ApiResponse<boolean>> {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      // Verificar se a receita pertence ao usuário
      const { data: existingRecipe, error: fetchError } = await supabase
        .from('recipes')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        return { data: null, error: 'Receita não encontrada' }
      }

      if (existingRecipe.user_id !== user.id) {
        return { data: null, error: 'Você não tem permissão para deletar esta receita' }
      }

      const { error } = await supabase
        .from('recipes')
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
   * Verifica se o usuário pode adicionar mais receitas para um tipo de refeição
   */
  static async canAddMoreRecipes(mealType: MealType): Promise<ApiResponse<boolean>> {
    try {
      // Para receitas adicionais, não há limite
      if (mealType === 'additional') {
        return { data: true, error: null }
      }

      // Para outros tipos, limite de 4 receitas
      const { count, error } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('meal_type', mealType)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (count || 0) < 4, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }

  /**
   * Busca estatísticas das receitas do usuário
   */
  static async getRecipeStats(): Promise<ApiResponse<{
    total: number
    byMealType: Record<MealType, number>
    preferredCount: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('meal_type, is_preferred')

      if (error) {
        return { data: null, error: error.message }
      }

      const stats = {
        total: data?.length || 0,
        byMealType: {
          breakfast: 0,
          morning_snack: 0,
          lunch: 0,
          afternoon_snack: 0,
          dinner: 0,
          night_snack: 0,
          additional: 0
        } as Record<MealType, number>,
        preferredCount: 0
      }

      data?.forEach(recipe => {
        stats.byMealType[recipe.meal_type as MealType]++
        if (recipe.is_preferred) {
          stats.preferredCount++
        }
      })

      return { data: stats, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { data: null, error: errorMessage }
    }
  }
} 