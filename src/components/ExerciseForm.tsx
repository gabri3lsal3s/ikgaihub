import React, { useState, useEffect } from 'react'
import { CreateExerciseData, UpdateExerciseData, Exercise } from '../types'
import { ExerciseController } from '../controllers/ExerciseController'

interface ExerciseFormProps {
  exercise?: Exercise
  onSubmit: (data: CreateExerciseData | UpdateExerciseData) => Promise<{ error: string | null }>
  onCancel: () => void
  loading?: boolean
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  exercise,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateExerciseData>({
    name: '',
    description: '',
    sets: 3,
    reps: 10,
    duration: undefined,
    weight: undefined,
    day_of_week: 1,
    order_index: 0
  })

  const [errors, setErrors] = useState<string[]>([])

  // Preencher formulário com dados do exercício existente
  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        description: exercise.description || '',
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration || undefined,
        weight: exercise.weight || undefined,
        day_of_week: exercise.day_of_week,
        order_index: exercise.order_index
      })
    }
  }, [exercise])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sets' || name === 'reps' || name === 'duration' || name === 'weight' || name === 'day_of_week' || name === 'order_index'
        ? value === '' ? undefined : Number(value)
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar dados
    const validationErrors = ExerciseController.validateExerciseData(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    const result = await onSubmit(formData)
    
    if (result.error) {
      setErrors([result.error])
    }
  }

  const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {exercise ? 'Editar Exercício' : 'Novo Exercício'}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {exercise ? 'Atualize as informações do exercício' : 'Adicione um novo exercício ao seu plano'}
        </p>
      </div>

      {/* Nome do Exercício */}
      <div>
        <label htmlFor="name" className="label">
          Nome do Exercício *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="input"
          placeholder="Ex: Supino Reto"
          required
        />
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="label">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="input"
          placeholder="Descreva o exercício, técnica, observações..."
        />
      </div>

      {/* Dia da Semana */}
      <div>
        <label htmlFor="day_of_week" className="label">
          Dia da Semana *
        </label>
        <select
          id="day_of_week"
          name="day_of_week"
          value={formData.day_of_week}
          onChange={handleInputChange}
          className="input"
          required
        >
          {daysOfWeek.map(day => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </div>

      {/* Séries e Repetições */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sets" className="label">
            Séries *
          </label>
          <input
            type="number"
            id="sets"
            name="sets"
            value={formData.sets}
            onChange={handleInputChange}
            min="1"
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="reps" className="label">
            Repetições *
          </label>
          <input
            type="number"
            id="reps"
            name="reps"
            value={formData.reps}
            onChange={handleInputChange}
            min="1"
            className="input"
            required
          />
        </div>
      </div>

      {/* Duração e Peso */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className="label">
            Duração (minutos)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration || ''}
            onChange={handleInputChange}
            min="1"
            className="input"
            placeholder="Ex: 30"
          />
        </div>
        <div>
          <label htmlFor="weight" className="label">
            Peso (kg)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight || ''}
            onChange={handleInputChange}
            min="0"
            step="0.5"
            className="input"
            placeholder="Ex: 20"
          />
        </div>
      </div>

      {/* Ordem */}
      <div>
        <label htmlFor="order_index" className="label">
          Ordem no Treino
        </label>
        <input
          type="number"
          id="order_index"
          name="order_index"
          value={formData.order_index}
          onChange={handleInputChange}
          min="0"
          className="input"
          placeholder="Ex: 1 (primeiro exercício)"
        />
      </div>

      {/* Erros */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao {exercise ? 'atualizar' : 'criar'} exercício
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {exercise ? 'Atualizando...' : 'Criando...'}
            </div>
          ) : (
            exercise ? 'Atualizar Exercício' : 'Criar Exercício'
          )}
        </button>
      </div>
    </form>
  )
} 