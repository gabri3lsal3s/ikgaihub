import React from 'react'
import { Exercise } from '../types'
import { ExerciseController } from '../controllers/ExerciseController'

interface ExerciseCardProps {
  exercise: Exercise
  onEdit: (exercise: Exercise) => void
  onDelete: (id: string) => void
  onReorder?: (exerciseId: string, direction: 'up' | 'down') => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onEdit,
  onDelete,
  onReorder,
  canMoveUp = false,
  canMoveDown = false
}) => {
  const formattedExercise = ExerciseController.formatExerciseForDisplay(exercise)

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar este exercício?')) {
      onDelete(exercise.id)
    }
  }

  const handleReorder = (direction: 'up' | 'down') => {
    if (onReorder) {
      onReorder(exercise.id, direction)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {formattedExercise.dayName}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {/* Botões de reordenação */}
            {onReorder && (
              <>
                <button
                  onClick={() => handleReorder('up')}
                  disabled={!canMoveUp}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover para cima"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleReorder('down')}
                  disabled={!canMoveDown}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover para baixo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Botões de ação */}
            <button
              onClick={() => onEdit(exercise)}
              className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Editar exercício"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Deletar exercício"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-4">
        {/* Nome do exercício */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {formattedExercise.name}
        </h3>

        {/* Descrição */}
        {exercise.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {exercise.description}
          </p>
        )}

        {/* Detalhes do exercício */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{formattedExercise.sets}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{formattedExercise.reps}</span>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="space-y-2">
          {exercise.duration && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">{formattedExercise.duration}</span>
            </div>
          )}
          
          {exercise.weight && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">{formattedExercise.weight}</span>
            </div>
          )}
        </div>

        {/* Ordem */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Ordem no treino</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">#{exercise.order_index + 1}</span>
          </div>
        </div>
      </div>

      {/* Footer com estatísticas */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Total: {exercise.sets * exercise.reps} repetições</span>
          <span>Criado em {new Date(exercise.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  )
} 