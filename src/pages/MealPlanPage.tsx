import React, { useState } from 'react'
import { Plus, Utensils } from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'
import { RecipeForm } from '../components/RecipeForm'
import { RecipeCard } from '../components/RecipeCard'
import { Recipe, MealType, CreateRecipeData, UpdateRecipeData } from '../types'

const MealPlanPage: React.FC = () => {
  const {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    setPreferredRecipe,
    getRecipesByMealType,
    getRecipesCountByMealType
  } = useRecipes()

  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast')

  const mealTypes: Array<{ id: MealType; name: string; time: string; limit: number }> = [
    { id: 'breakfast', name: 'Café da Manhã', time: '07:00', limit: 4 },
    { id: 'morning_snack', name: 'Lanche da Manhã', time: '10:00', limit: 4 },
    { id: 'lunch', name: 'Almoço', time: '12:00', limit: 4 },
    { id: 'afternoon_snack', name: 'Lanche da Tarde', time: '15:00', limit: 4 },
    { id: 'dinner', name: 'Jantar', time: '19:00', limit: 4 },
    { id: 'night_snack', name: 'Ceia', time: '21:00', limit: 4 },
  ]

  const handleCreateRecipe = async (data: CreateRecipeData) => {
    await createRecipe(data)
    setShowForm(false)
  }

  const handleUpdateRecipe = async (data: UpdateRecipeData) => {
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, data)
      setEditingRecipe(null)
    }
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setSelectedMealType(recipe.meal_type)
    setShowForm(true)
  }

  const handleDeleteRecipe = async (id: string) => {
    await deleteRecipe(id)
  }

  const handleSetPreferred = async (id: string, mealType: MealType) => {
    await setPreferredRecipe(id, mealType)
  }

  const handleAddRecipe = (mealType: MealType) => {
    setSelectedMealType(mealType)
    setEditingRecipe(null)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingRecipe(null)
  }

  const handleFormSubmit = async (data: CreateRecipeData | UpdateRecipeData) => {
    if (editingRecipe) {
      await handleUpdateRecipe(data as UpdateRecipeData)
    } else {
      await handleCreateRecipe(data as CreateRecipeData)
    }
  }

  if (loading && recipes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando receitas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Plano Alimentar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas receitas e preferências por refeição
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {recipes.length} receitas
          </span>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Seção de refeições */}
      <div className="space-y-6">
        {mealTypes.map((meal) => {
          const mealRecipes = getRecipesByMealType(meal.id)
          const recipeCount = getRecipesCountByMealType(meal.id)
          const canAdd = recipeCount < meal.limit

          return (
            <div key={meal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Utensils className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {meal.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{meal.time}</span>
                      <span>{recipeCount}/{meal.limit} receitas</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddRecipe(meal.id)}
                  disabled={!canAdd}
                  className={`px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                    canAdd
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              
              {mealRecipes.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Nenhuma receita cadastrada para {meal.name.toLowerCase()}
                  </p>
                  {canAdd && (
                    <button
                      onClick={() => handleAddRecipe(meal.id)}
                      className="mt-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
                    >
                      Criar primeira receita
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mealRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onEdit={handleEditRecipe}
                      onDelete={handleDeleteRecipe}
                      onSetPreferred={handleSetPreferred}
                      canSetPreferred={!recipe.is_preferred}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Seção de receitas adicionais */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Utensils className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Receitas Adicionais
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receitas extras sem limite de quantidade
              </p>
            </div>
          </div>
          <button
            onClick={() => handleAddRecipe('additional')}
            className="px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
        
        {(() => {
          const additionalRecipes = getRecipesByMealType('additional')
          return additionalRecipes.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Nenhuma receita adicional cadastrada
              </p>
              <button
                onClick={() => handleAddRecipe('additional')}
                className="mt-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
              >
                Criar primeira receita adicional
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {additionalRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onEdit={handleEditRecipe}
                  onDelete={handleDeleteRecipe}
                  onSetPreferred={handleSetPreferred}
                  canSetPreferred={false} // Receitas adicionais não podem ser preferidas
                />
              ))}
            </div>
          )
        })()}
      </div>

      {/* Modal de formulário */}
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          mealType={selectedMealType}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          loading={loading}
        />
      )}
    </div>
  )
}

export default MealPlanPage 