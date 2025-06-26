import { supabase } from './supabase';
import { Goal, GoalProgress, CreateGoalForm, UpdateGoalForm, GoalStats, GoalProgressData } from '../types';

export class GoalService {
  // Buscar todas as metas do usuário
  static async getGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar metas: ${error.message}`);
    }

    return data || [];
  }

  // Buscar meta específica
  static async getGoal(id: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar meta: ${error.message}`);
    }

    return data;
  }

  // Criar nova meta
  static async createGoal(goalData: CreateGoalForm): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert([goalData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar meta: ${error.message}`);
    }

    return data;
  }

  // Atualizar meta
  static async updateGoal(id: string, updates: UpdateGoalForm): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar meta: ${error.message}`);
    }

    return data;
  }

  // Deletar meta
  static async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar meta: ${error.message}`);
    }
  }

  // Adicionar progresso à meta
  static async addProgress(goalId: string, value: number, date?: string): Promise<GoalProgress> {
    const progressData = {
      goal_id: goalId,
      date: date || new Date().toISOString().split('T')[0],
      value
    };

    const { data, error } = await supabase
      .from('goal_progress')
      .upsert([progressData], { onConflict: 'goal_id,date' })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar progresso: ${error.message}`);
    }

    return data;
  }

  // Buscar progresso de uma meta
  static async getGoalProgress(goalId: string, startDate?: string, endDate?: string): Promise<GoalProgress[]> {
    let query = supabase
      .from('goal_progress')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar progresso: ${error.message}`);
    }

    return data || [];
  }

  // Buscar progresso usando função SQL personalizada
  static async getGoalProgressData(goalId: string, startDate: string, endDate: string): Promise<GoalProgressData[]> {
    const { data, error } = await supabase
      .rpc('get_goal_progress', {
        p_goal_id: goalId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) {
      throw new Error(`Erro ao buscar dados de progresso: ${error.message}`);
    }

    return data || [];
  }

  // Buscar estatísticas de metas do usuário
  static async getGoalStats(): Promise<GoalStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_goals_stats', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        console.error('Erro na função RPC:', error);
        // Retornar valores padrão em caso de erro
        return {
          total_goals: 0,
          active_goals: 0,
          completed_goals: 0,
          completion_rate: 0,
          total_points: 0
        };
      }

      return data?.[0] || {
        total_goals: 0,
        active_goals: 0,
        completed_goals: 0,
        completion_rate: 0,
        total_points: 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retornar valores padrão em caso de erro
      return {
        total_goals: 0,
        active_goals: 0,
        completed_goals: 0,
        completion_rate: 0,
        total_points: 0
      };
    }
  }

  // Buscar metas por tipo
  static async getGoalsByType(type: 'exercise' | 'nutrition' | 'general'): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar metas por tipo: ${error.message}`);
    }

    return data || [];
  }

  // Buscar metas por status
  static async getGoalsByStatus(status: 'active' | 'completed' | 'paused' | 'cancelled'): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar metas por status: ${error.message}`);
    }

    return data || [];
  }

  // Buscar metas ativas
  static async getActiveGoals(): Promise<Goal[]> {
    return this.getGoalsByStatus('active');
  }

  // Buscar metas completadas
  static async getCompletedGoals(): Promise<Goal[]> {
    return this.getGoalsByStatus('completed');
  }

  // Calcular progresso percentual de uma meta
  static calculateProgressPercentage(goal: Goal): number {
    if (goal.target_value === 0) return 0;
    const percentage = (goal.current_value / goal.target_value) * 100;
    return Math.min(percentage, 100); // Máximo 100%
  }

  // Verificar se meta está próxima do prazo
  static isGoalNearDeadline(goal: Goal, daysThreshold: number = 7): boolean {
    if (!goal.end_date) return false;
    
    const endDate = new Date(goal.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= daysThreshold && diffDays >= 0;
  }

  // Verificar se meta está atrasada
  static isGoalOverdue(goal: Goal): boolean {
    if (!goal.end_date) return false;
    
    const endDate = new Date(goal.end_date);
    const today = new Date();
    
    return endDate < today && goal.status === 'active';
  }
} 