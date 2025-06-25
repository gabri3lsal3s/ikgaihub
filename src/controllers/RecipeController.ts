import { RecipeService } from '../services/RecipeService'
import { Recipe, CreateRecipeData, UpdateRecipeData, MealType } from '../types'
import toast from 'react-hot-toast'

export class RecipeController {
  private recipes: Recipe[] = []
  private loading: boolean = false
  private error: string | null = null

  // Getters
  getRecipes(): Recipe[] {
    return this.recipes
  }

  getLoading(): boolean {
    return this.loading
  }

  getError(): string | null {
    return this.error
  }

  getRecipesByMealType(mealType: MealType): Recipe[] {
    return this.recipes.filter(recipe => recipe.meal_type === mealType)
  }

  getPreferredRecipe(mealType: MealType): Recipe | null {
    return this.recipes.find(recipe => 
      recipe.meal_type === mealType && recipe.is_preferred
    ) || null
  }

  // Setters
  setRecipes(recipes: Recipe[]): void {
    this.recipes = recipes
  }

  setLoading(loading: boolean): void {
    this.loading = loading
  }

  setError(error: string | null): void {
    this.error = error
  }

  // Operações CRUD
  async loadAllRecipes(): Promise<void> {
    this.setLoading(true)
    this.setError(null)

    try {
      const response = await RecipeService.getAllRecipes()
      
      if (response.error) {
        this.setError(response.error)
        toast.error('Erro ao carregar receitas')
        return
      }

      this.setRecipes(response.data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.setError(errorMessage)
      toast.error('Erro ao carregar receitas')
    } finally {
      this.setLoading(false)
    }
  }

  async loadRecipesByMealType(mealType: MealType): Promise<void> {
    this.setLoading(true)
    this.setError(null)

    try {
      const response = await RecipeService.getRecipesByMealType(mealType)
      
      if (response.error) {
        this.setError(response.error)
        toast.error('Erro ao carregar receitas')
        return
      }

      // Atualiza apenas as receitas do tipo específico
      const otherRecipes = this.recipes.filter(recipe => recipe.meal_type !== mealType)
      this.setRecipes([...otherRecipes, ...response.data])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.setError(errorMessage)
      toast.error('Erro ao carregar receitas')
    } finally {
      this.setLoading(false)
    }
  }

  async createRecipe(recipeData: CreateRecipeData): Promise<Recipe | null> {
    this.setLoading(true)
    this.setError(null)

    try {
      const response = await RecipeService.createRecipe(recipeData)
      
      if (response.error) {
        this.setError(response.error)
        toast.error('Erro ao criar receita')
        return null
      }

      if (response.data) {
        this.recipes.unshift(response.data) // Adiciona no início
        toast.success('Receita criada com sucesso!')
        return response.data
      }

      return null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.setError(errorMessage)
      toast.error('Erro ao criar receita')
      return null
    } finally {
      this.setLoading(false)
    }
  }

  async updateRecipe(id: string, recipeData: UpdateRecipeData): Promise<Recipe | null> {
    this.setLoading(true)
    this.setError(null)

    try {
      const response = await RecipeService.updateRecipe(id, recipeData)
      
      if (response.error) {
        this.setError(response.error)
        toast.error('Erro ao atualizar receita')
        return null
      }

      if (response.data) {
        // Atualiza a receita na lista
        const index = this.recipes.findIndex(recipe => recipe.id === id)
        if (index !== -1) {
          this.recipes[index] = response.data
        }
        toast.success('Receita atualizada com sucesso!')
        return response.data
      }

      return null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.setError(errorMessage)
      toast.error('Erro ao atualizar receita')
      return null
    } finally {
      this.setLoading(false)
    }
  }

  async deleteRecipe(id: string): Promise<boolean> {
    this.setLoading(true)
    this.setError(null)

    try {
      const response = await RecipeService.deleteRecipe(id)
      
      if (response.error) {
        this.setError(response.error)
        toast.error('Erro ao deletar receita')
        return false
      }

      if (response.data) {
        // Remove a receita da lista
        this.recipes = this.recipes.filter(recipe => recipe.id !== id)
        toast.success('Receita deletada com sucesso!')
        return true
      }

      return false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.setError(errorMessage)
      toast.error('Erro ao deletar receita')
      return false
    } finally {
      this.setLoading(false)
    }
  }

  async setPreferredRecipe(id: string, mealType: MealType): Promise<Recipe | null> {
    this.setLoading(true)
    this.setError(null)

    try {
      const response = await RecipeService.setPreferredRecipe(id, mealType)
      
      if (response.error) {
        this.setError(response.error)
        toast.error('Erro ao definir receita preferida')
        return null
      }

      if (response.data) {
        // Atualiza as receitas do mesmo tipo
        this.recipes = this.recipes.map(recipe => {
          if (recipe.meal_type === mealType) {
            return {
              ...recipe,
              is_preferred: recipe.id === id
            }
          }
          return recipe
        })
        
        toast.success('Receita preferida definida com sucesso!')
        return response.data
      }

      return null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.setError(errorMessage)
      toast.error('Erro ao definir receita preferida')
      return null
    } finally {
      this.setLoading(false)
    }
  }

  async canAddMoreRecipes(mealType: MealType): Promise<boolean> {
    try {
      const response = await RecipeService.canAddMoreRecipes(mealType)
      
      if (response.error) {
        this.setError(response.error)
        return false
      }

      return response.data || false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.setError(errorMessage)
      return false
    }
  }

  async getRecipeStats() {
    try {
      const response = await RecipeService.getRecipeStats()
      
      if (response.error) {
        this.setError(response.error)
        return null
      }

      return response.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.setError(errorMessage)
      return null
    }
  }

  // Utilitários
  clearError(): void {
    this.setError(null)
  }

  clearRecipes(): void {
    this.setRecipes([])
  }

  // Busca local (sem fazer requisição)
  findRecipeById(id: string): Recipe | null {
    return this.recipes.find(recipe => recipe.id === id) || null
  }

  getRecipesCount(): number {
    return this.recipes.length
  }

  getRecipesCountByMealType(mealType: MealType): number {
    return this.recipes.filter(recipe => recipe.meal_type === mealType).length
  }
} 