import React, { useState, useEffect } from 'react';
import { GoalService } from '../../services/GoalService';
import { GoalStats as GoalStatsType } from '../../types';
import { Target, TrendingUp } from 'lucide-react';

export const GoalStats: React.FC = () => {
  const [stats, setStats] = useState<GoalStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await GoalService.getGoalStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de metas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-green"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Target size={24} className="mx-auto mb-2" />
          <p className="text-sm">Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Target size={20} className="text-ikigai-green" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estatísticas de Metas
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-ikigai-green mb-1">
            {stats.total_goals}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total de Metas
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.active_goals}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Metas Ativas
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.completed_goals}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Concluídas
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {stats.completion_rate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Taxa de Conclusão
          </div>
        </div>
      </div>

      {stats.total_points > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={16} className="text-yellow-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {stats.total_points} pontos conquistados
            </span>
          </div>
        </div>
      )}

      {stats.total_goals === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nenhuma meta criada ainda
          </p>
          <a 
            href="/goals" 
            className="text-ikigai-green hover:text-ikigai-green/80 text-sm font-medium"
          >
            Criar primeira meta →
          </a>
        </div>
      )}
    </div>
  );
}; 