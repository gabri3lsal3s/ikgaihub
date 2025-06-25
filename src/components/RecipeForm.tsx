import React, { useState, useEffect } from 'react'
import { Recipe, CreateRecipeData, UpdateRecipeData, MealType } from '../types'
import { X, Save, Clock, Flame } from 'lucide-react'

interface RecipeFormProps {
  recipe?: Recipe | null
  mealType: MealType
  onSubmit: (data: CreateRecipeData | UpdateRecipeData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  morning_snack: 'Lanche da manhã',
  lunch: 'Almoço',
  afternoon_snack: 'Lanche da tarde',
  dinner: 'Jantar',
  night_snack: 'Ceia',
  additional: 'Receitas adicionais'
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  mealType,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateRecipeData>({
    name: '',
    ingredients: '',
    instructions: '',
    prep_time: undefined,
    calories: undefined,
    meal_type: mealType
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher formulário com dados da receita se estiver editando
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        ingredients: recipe.ingredients || '',
        instructions: recipe.instructions || '',
        prep_time: recipe.prep_time || undefined,
        calories: recipe.calories || undefined,
        meal_type: recipe.meal_type
      })
    }
  }, [recipe])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da receita é obrigatório'
    }

    if (!formData.ingredients?.trim()) {
      newErrors.ingredients = 'Ingredientes são obrigatórios'
    }

    if (!formData.instructions?.trim()) {
      newErrors.instructions = 'Modo de preparo é obrigatório'
    }

    if (formData.prep_time && formData.prep_time <= 0) {
      newErrors.prep_time = 'Tempo de preparo deve ser maior que zero'
    }

    if (formData.calories && formData.calories <= 0) {
      newErrors.calories = 'Calorias devem ser maiores que zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    await onSubmit(formData)
  }

  const handleInputChange = (field: keyof CreateRecipeData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {recipe ? 'Editar Receita' : 'Nova Receita'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {MEAL_TYPE_LABELS[mealType]}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome da Receita */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Receita *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.name 
                  ? 'border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              }`}
              placeholder="Ex: Aveia com banana e mel"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Ingredientes */}
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ingredientes *
            </label>
            <textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => handleInputChange('ingredients', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.ingredients 
                  ? 'border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              }`}
              placeholder="Liste os ingredientes necessários..."
            />
            {errors.ingredients && (
              <p className="mt-1 text-sm text-red-600">{errors.ingredients}</p>
            )}
          </div>

          {/* Modo de Preparo */}
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Modo de Preparo *
            </label>
            <textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.instructions 
                  ? 'border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              }`}
              placeholder="Descreva o passo a passo do preparo..."
            />
            {errors.instructions && (
              <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tempo de Preparo */}
            <div>
              <label htmlFor="prep_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={16} className="inline mr-1" />
                Tempo de Preparo (minutos)
              </label>
              <input
                type="number"
                id="prep_time"
                value={formData.prep_time || ''}
                onChange={(e) => handleInputChange('prep_time', e.target.value ? parseInt(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.prep_time 
                    ? 'border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                }`}
                placeholder="30"
                min="1"
              />
              {errors.prep_time && (
                <p className="mt-1 text-sm text-red-600">{errors.prep_time}</p>
              )}
            </div>

            {/* Calorias */}
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Flame size={16} className="inline mr-1" />
                Calorias (kcal)
              </label>
              <input
                type="number"
                id="calories"
                value={formData.calories || ''}
                onChange={(e) => handleInputChange('calories', e.target.value ? parseInt(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.calories 
                    ? 'border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                }`}
                placeholder="250"
                min="1"
              />
              {errors.calories && (
                <p className="mt-1 text-sm text-red-600">{errors.calories}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {recipe ? 'Atualizar' : 'Criar'} Receita
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 