import React, { useState } from 'react'
import { Recipe, MealType } from '../types'
import { Edit, Trash2, Star, Clock, Flame, MoreVertical } from 'lucide-react'

interface RecipeCardProps {
  recipe: Recipe
  onEdit: (recipe: Recipe) => void
  onDelete: (id: string) => void
  onSetPreferred: (id: string, mealType: MealType) => void
  canSetPreferred?: boolean
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

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onEdit,
  onDelete,
  onSetPreferred,
  canSetPreferred = true
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleSetPreferred = () => {
    onSetPreferred(recipe.id, recipe.meal_type)
    setShowMenu(false)
  }

  const handleEdit = () => {
    onEdit(recipe)
    setShowMenu(false)
  }

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar esta receita?')) {
      onDelete(recipe.id)
    }
    setShowMenu(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {recipe.name}
              </h3>
              {recipe.is_preferred && (
                <Star className="text-yellow-500 fill-current" size={16} />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {MEAL_TYPE_LABELS[recipe.meal_type]}
            </p>
          </div>
          
          {/* Menu de opções */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={handleEdit}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit size={14} />
                  Editar
                </button>
                
                {canSetPreferred && !recipe.is_preferred && (
                  <button
                    onClick={handleSetPreferred}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Star size={14} />
                    Marcar como preferida
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Deletar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informações rápidas */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
          {recipe.prep_time && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{recipe.prep_time} min</span>
            </div>
          )}
          {recipe.calories && (
            <div className="flex items-center gap-1">
              <Flame size={14} />
              <span>{recipe.calories} kcal</span>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Botão para expandir/recolher detalhes */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-left text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
        >
          {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4">
            {/* Ingredientes */}
            {recipe.ingredients && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Ingredientes:
                </h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  {recipe.ingredients.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-1' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Modo de preparo */}
            {recipe.instructions && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Modo de preparo:
                </h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  {recipe.instructions.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-1' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Criada em {new Date(recipe.created_at).toLocaleDateString('pt-BR')}
          </span>
          {recipe.updated_at !== recipe.created_at && (
            <span>
              Atualizada em {new Date(recipe.updated_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 