import { useState, useEffect, useCallback } from 'react';
import { GoalService } from '../services/GoalService';
import { Goal, CreateGoalForm, UpdateGoalForm, UseGoalsReturn } from '../types';
import toast from 'react-hot-toast';

export const useGoals = (): UseGoalsReturn => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GoalService.getGoals();
      setGoals(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar metas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (goalData: CreateGoalForm) => {
    try {
      setError(null);
      const newGoal = await GoalService.createGoal(goalData);
      setGoals(prev => [newGoal, ...prev]);
      toast.success('Meta criada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar meta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateGoal = useCallback(async (id: string, updates: UpdateGoalForm) => {
    try {
      setError(null);
      const updatedGoal = await GoalService.updateGoal(id, updates);
      setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));
      toast.success('Meta atualizada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar meta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      setError(null);
      await GoalService.deleteGoal(id);
      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast.success('Meta removida com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover meta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const addProgress = useCallback(async (goalId: string, value: number, date?: string) => {
    try {
      setError(null);
      await GoalService.addProgress(goalId, value, date);
      
      // Atualizar a meta localmente com o novo progresso
      setGoals(prev => prev.map(goal => {
        if (goal.id === goalId) {
          return {
            ...goal,
            current_value: goal.current_value + value
          };
        }
        return goal;
      }));
      
      toast.success('Progresso registrado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar progresso';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    addProgress,
    refresh
  };
}; 