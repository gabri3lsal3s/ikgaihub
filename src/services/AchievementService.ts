import { supabase } from './supabase';
import { Achievement } from '../types';

export class AchievementService {
  // Buscar todas as conquistas do usuário
  static async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('unlocked_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar conquistas: ${error.message}`);
    }

    return data || [];
  }

  // Buscar conquista específica
  static async getAchievement(id: string): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar conquista: ${error.message}`);
    }

    return data;
  }

  // Criar nova conquista
  static async createAchievement(achievementData: Omit<Achievement, 'id' | 'created_at'>): Promise<Achievement> {
    const { data, error } = await supabase
      .from('achievements')
      .insert([achievementData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar conquista: ${error.message}`);
    }

    return data;
  }

  // Buscar conquistas por tipo
  static async getAchievementsByType(type: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('type', type)
      .order('unlocked_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar conquistas por tipo: ${error.message}`);
    }

    return data || [];
  }

  // Buscar conquistas de uma meta específica
  static async getAchievementsByGoal(goalId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('goal_id', goalId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar conquistas da meta: ${error.message}`);
    }

    return data || [];
  }

  // Calcular total de pontos do usuário
  static async getTotalPoints(): Promise<number> {
    const { data, error } = await supabase
      .from('achievements')
      .select('points');

    if (error) {
      throw new Error(`Erro ao calcular pontos: ${error.message}`);
    }

    return data?.reduce((total, achievement) => total + achievement.points, 0) || 0;
  }

  // Verificar se conquista já foi desbloqueada
  static async isAchievementUnlocked(type: string, goalId?: string): Promise<boolean> {
    let query = supabase
      .from('achievements')
      .select('id')
      .eq('type', type);

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao verificar conquista: ${error.message}`);
    }

    return (data?.length || 0) > 0;
  }

  // Criar conquista de primeiro exercício
  static async createFirstExerciseAchievement(): Promise<Achievement | null> {
    const isUnlocked = await this.isAchievementUnlocked('first_exercise');
    
    if (isUnlocked) {
      return null;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    return this.createAchievement({
      user_id: user.id,
      goal_id: null,
      type: 'first_exercise',
      title: 'Primeiro Exercício',
      description: 'Completou seu primeiro exercício!',
      icon: 'dumbbell',
      points: 50,
      unlocked_at: new Date().toISOString()
    });
  }

  // Criar conquista de primeira receita
  static async createFirstRecipeAchievement(): Promise<Achievement | null> {
    const isUnlocked = await this.isAchievementUnlocked('first_recipe');
    
    if (isUnlocked) {
      return null;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    return this.createAchievement({
      user_id: user.id,
      goal_id: null,
      type: 'first_recipe',
      title: 'Primeira Receita',
      description: 'Completou sua primeira receita!',
      icon: 'chef-hat',
      points: 50,
      unlocked_at: new Date().toISOString()
    });
  }

  // Criar conquista de semana consistente
  static async createWeekStreakAchievement(): Promise<Achievement | null> {
    const isUnlocked = await this.isAchievementUnlocked('week_streak');
    
    if (isUnlocked) {
      return null;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    return this.createAchievement({
      user_id: user.id,
      goal_id: null,
      type: 'week_streak',
      title: 'Semana Consistente',
      description: 'Manteve consistência por 7 dias!',
      icon: 'flame',
      points: 200,
      unlocked_at: new Date().toISOString()
    });
  }

  // Criar conquista de mês consistente
  static async createMonthStreakAchievement(): Promise<Achievement | null> {
    const isUnlocked = await this.isAchievementUnlocked('month_streak');
    
    if (isUnlocked) {
      return null;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    return this.createAchievement({
      user_id: user.id,
      goal_id: null,
      type: 'month_streak',
      title: 'Mês Consistente',
      description: 'Manteve consistência por 30 dias!',
      icon: 'crown',
      points: 500,
      unlocked_at: new Date().toISOString()
    });
  }

  // Buscar conquistas recentes (últimas 5)
  static async getRecentAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('unlocked_at', { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`Erro ao buscar conquistas recentes: ${error.message}`);
    }

    return data || [];
  }

  // Buscar estatísticas de conquistas
  static async getAchievementStats(): Promise<{
    total: number;
    totalPoints: number;
    recentCount: number;
    byType: Record<string, number>;
  }> {
    const achievements = await this.getAchievements();
    
    const total = achievements.length;
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
    
    // Conquistas dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = achievements.filter(
      achievement => new Date(achievement.unlocked_at) >= sevenDaysAgo
    ).length;

    // Agrupar por tipo
    const byType: Record<string, number> = {};
    achievements.forEach(achievement => {
      byType[achievement.type] = (byType[achievement.type] || 0) + 1;
    });

    return {
      total,
      totalPoints,
      recentCount,
      byType
    };
  }
} 