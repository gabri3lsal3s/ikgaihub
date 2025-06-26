import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Clock, Circle, CheckCircle2 } from 'lucide-react';
import { Exercise } from '../../types';
import { useProgress } from '../../hooks/useProgress';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface TodayExercisesProps {
  exercises: Exercise[];
  className?: string;
  onRefreshStats?: () => void;
}

export const TodayExercises: React.FC<TodayExercisesProps> = ({
  exercises,
  className = '',
  onRefreshStats
}) => {
  const { completeExercise, removeExerciseCompletion, getTodayExerciseCompletion, getProgressStats } = useProgress();
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());

  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const totalReps = exercises.reduce((sum, exercise) => sum + (exercise.sets * exercise.reps), 0);

  // Verificar exercícios já concluídos ao carregar
  useEffect(() => {
    const checkCompletedExercises = async () => {
      const completed = new Set<string>();
      
      for (const exercise of exercises) {
        const result = await getTodayExerciseCompletion(exercise.id);
        if (result.data) {
          completed.add(exercise.id);
        }
      }
      
      setCompletedExercises(completed);
    };

    if (exercises.length > 0) {
      checkCompletedExercises();
    }
  }, [exercises, getTodayExerciseCompletion]);

  const handleToggleCompletion = async (exercise: Exercise) => {
    const exerciseId = exercise.id;
    const isCompleted = completedExercises.has(exerciseId);

    setLoadingStates(prev => new Set(prev).add(exerciseId));

    try {
      if (isCompleted) {
        // Buscar o ID da conclusão do exercício hoje
        const { data: completion, error } = await getTodayExerciseCompletion(exerciseId);
        if (error || !completion) {
          toast.error('Erro ao buscar conclusão para remover');
        } else {
          await removeExerciseCompletion(completion.id);
        setCompletedExercises(prev => {
          const newSet = new Set(prev);
          newSet.delete(exerciseId);
          return newSet;
        });
          if (typeof onRefreshStats === 'function') onRefreshStats();
        toast.success('Exercício desmarcado como concluído');
        }
      } else {
        // Marcar como concluído
        const result = await completeExercise({
          exercise_id: exerciseId,
          sets_completed: exercise.sets,
          reps_completed: exercise.reps,
          weight_used: exercise.weight,
          duration_completed: exercise.duration,
          notes: ''
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          setCompletedExercises(prev => new Set(prev).add(exerciseId));
          toast.success('Exercício marcado como concluído!');
        }
      }
    } catch {
      toast.error('Erro ao atualizar status do exercício');
    } finally {
      setLoadingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(exerciseId);
        return newSet;
      });
    }
  };

  const completedCount = completedExercises.size;
  const completionRate = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Dumbbell className="h-6 w-6 text-ikigai-green" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Exercícios de Hoje
          </h3>
        </div>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-ikigai-green">
            {exercises.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Exercícios
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-ikigai-green">
            {totalSets}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Séries
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-ikigai-green">
            {totalReps}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Repetições
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-ikigai-green">
            {Math.round(completionRate)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Concluído
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      {exercises.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progresso: {completedCount}/{exercises.length}</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-ikigai-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Lista de exercícios */}
      {exercises.length > 0 ? (
        <div className="space-y-3">
          {exercises.slice(0, 3).map((exercise) => {
            const isCompleted = completedExercises.has(exercise.id);
            const isLoading = loadingStates.has(exercise.id);

            return (
              <div
                key={exercise.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => handleToggleCompletion(exercise)}
                    disabled={isLoading}
                    className={`flex-shrink-0 transition-all duration-200 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 hover:text-ikigai-green" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium transition-all duration-200 ${
                      isCompleted 
                        ? 'text-green-800 dark:text-green-200 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {exercise.name}
                    </p>
                    <p className={`text-sm transition-all duration-200 ${
                      isCompleted 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {exercise.sets} x {exercise.reps}
                      {exercise.weight && ` • ${exercise.weight}kg`}
                    </p>
                  </div>
                </div>
                {exercise.duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {Math.round(exercise.duration / 60)}min
                  </div>
                )}
              </div>
            );
          })}
          
          {exercises.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                +{exercises.length - 3} exercícios restantes
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Nenhum exercício programado para hoje
          </p>
          <Link
            to="/exercises"
            className="btn btn-primary btn-sm"
          >
            Adicionar Exercícios
          </Link>
        </div>
      )}

      {/* Link para página de exercícios */}
      {exercises.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Link
            to="/exercises"
            className="btn btn-outline btn-sm w-full"
          >
            Ver Todos os Exercícios
          </Link>
        </div>
      )}
    </div>
  );
}; 