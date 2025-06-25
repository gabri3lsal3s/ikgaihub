import React, { useState, useEffect } from 'react'
import { useExercises } from '../hooks/useExercises'
import { ExerciseForm } from '../components/ExerciseForm'
import { ExerciseCard } from '../components/ExerciseCard'
import { Exercise, CreateExerciseData, UpdateExerciseData } from '../types'

const ExercisePage: React.FC = () => {
  const {
    exercises,
    loading,
    stats,
    fetchExercisesByDay,
    createExercise,
    updateExercise,
    deleteExercise,
    reorderExercises
  } = useExercises()

  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay())
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])

  const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' }
  ]

  // Filtrar exercícios por dia selecionado
  useEffect(() => {
    const filtered = exercises.filter(exercise => exercise.day_of_week === selectedDay)
    setFilteredExercises(filtered.sort((a, b) => a.order_index - b.order_index))
  }, [exercises, selectedDay])

  // Carregar exercícios do dia selecionado
  useEffect(() => {
    fetchExercisesByDay(selectedDay)
  }, [selectedDay, fetchExercisesByDay])

  const handleDayChange = (day: number) => {
    setSelectedDay(day)
    setShowForm(false)
    setEditingExercise(null)
  }

  const handleCreateExercise = async (data: CreateExerciseData) => {
    const result = await createExercise(data)
    if (!result.error) {
      setShowForm(false)
    }
    return result
  }

  const handleUpdateExercise = async (data: UpdateExerciseData) => {
    if (!editingExercise) return { error: 'Exercício não encontrado' }
    
    const result = await updateExercise(editingExercise.id, data)
    if (!result.error) {
      setShowForm(false)
      setEditingExercise(null)
    }
    return result
  }

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setShowForm(true)
  }

  const handleDeleteExercise = async (id: string) => {
    await deleteExercise(id)
  }

  const handleReorderExercise = async (exerciseId: string, direction: 'up' | 'down') => {
    const currentIndex = filteredExercises.findIndex(ex => ex.id === exerciseId)
    if (currentIndex === -1) return

    const newExercises = [...filteredExercises]
    let targetIndex: number

    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1
    } else if (direction === 'down' && currentIndex < newExercises.length - 1) {
      targetIndex = currentIndex + 1
    } else {
      return
    }

    // Trocar posições
    [newExercises[currentIndex], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[currentIndex]]

    // Atualizar order_index
    const exerciseIds = newExercises.map(ex => ex.id)
    await reorderExercises(selectedDay, exerciseIds)
  }

  const handleFormSubmit = async (data: CreateExerciseData | UpdateExerciseData) => {
    if (editingExercise) {
      return await handleUpdateExercise(data as UpdateExerciseData)
    } else {
      return await handleCreateExercise(data as CreateExerciseData)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingExercise(null)
  }

  const getDayStats = (day: number) => {
    if (!stats) return { count: 0, totalSets: 0, totalReps: 0 }
    
    const dayExercises = exercises.filter(ex => ex.day_of_week === day)
    const totalSets = dayExercises.reduce((sum, ex) => sum + ex.sets, 0)
    const totalReps = dayExercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0)
    
    return {
      count: dayExercises.length,
      totalSets,
      totalReps
    }
  }

  if (loading.isLoading && exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando exercícios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meus Exercícios</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seu plano de treinos semanal
          </p>
        </div>

        {/* Estatísticas Gerais */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Exercícios</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Séries</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSets}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Repetições</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReps}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dias Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.values(stats.byDay).filter(count => count > 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seletor de Dias */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Selecione o Dia</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map(day => {
                const dayStats = getDayStats(day.value)
                const isSelected = selectedDay === day.value
                const isToday = new Date().getDay() === day.value
                
                return (
                  <button
                    key={day.value}
                    onClick={() => handleDayChange(day.value)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">{day.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {dayStats.count} exercícios
                      </div>
                      {isToday && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Exercícios */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Exercícios - {daysOfWeek[selectedDay].label}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredExercises.length} exercícios • {getDayStats(selectedDay).totalSets} séries • {getDayStats(selectedDay).totalReps} repetições
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Novo Exercício
                </button>
              </div>
              
              <div className="p-6">
                {loading.isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando...</p>
                  </div>
                ) : filteredExercises.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum exercício</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Comece adicionando seu primeiro exercício para {daysOfWeek[selectedDay].label.toLowerCase()}.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Adicionar Exercício
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredExercises.map((exercise, index) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onEdit={handleEditExercise}
                        onDelete={handleDeleteExercise}
                        onReorder={handleReorderExercise}
                        canMoveUp={index > 0}
                        canMoveDown={index < filteredExercises.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 sticky top-8">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
                  </h3>
                </div>
                <div className="p-6">
                  <ExerciseForm
                    exercise={editingExercise || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={loading.isLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Erro */}
        {loading.error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erro ao carregar exercícios
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{loading.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExercisePage 