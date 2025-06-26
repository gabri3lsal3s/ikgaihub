import React, { useState, useEffect } from 'react';
import { Goal, GoalProgress as GoalProgressType } from '../../types';
import { GoalService } from '../../services/GoalService';
import { Calendar, TrendingUp, BarChart3, Clock } from 'lucide-react';

interface GoalProgressProps {
  goal: Goal;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goal }) => {
  const [progressData, setProgressData] = useState<GoalProgressType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadProgressData();
  }, [goal.id, selectedPeriod]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      
      if (selectedPeriod === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      
      const data = await GoalService.getGoalProgress(
        goal.id,
        startDate.toISOString().split('T')[0],
        endDate
      );
      setProgressData(data);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressStats = () => {
    const totalProgress = progressData.reduce((sum, p) => sum + p.value, 0);
    const averageProgress = progressData.length > 0 ? totalProgress / progressData.length : 0;
    const daysWithProgress = progressData.length;
    
    return { totalProgress, averageProgress, daysWithProgress };
  };

  const getProgressTrend = () => {
    if (progressData.length < 2) return 'stable';
    
    const recent = progressData.slice(-3).reduce((sum, p) => sum + p.value, 0);
    const older = progressData.slice(-6, -3).reduce((sum, p) => sum + p.value, 0);
    
    if (recent > older * 1.2) return 'up';
    if (recent < older * 0.8) return 'down';
    return 'stable';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const stats = getProgressStats();
  const trend = getProgressTrend();

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Progresso Detalhado
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-ikigai-green text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-ikigai-green text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-ikigai-green mb-1">
            {stats.totalProgress}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total {selectedPeriod === 'week' ? 'da Semana' : 'do Mês'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.averageProgress.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Média por Dia
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {stats.daysWithProgress}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Dias Ativos
          </div>
        </div>
      </div>

      {/* Tendência */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <TrendingUp 
          size={16} 
          className={
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          } 
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {trend === 'up' ? 'Tendência positiva' : 
           trend === 'down' ? 'Tendência negativa' : 'Tendência estável'}
        </span>
      </div>

      {/* Lista de Progresso */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Calendar size={14} />
          <span>Histórico de Progresso</span>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ikigai-green mx-auto"></div>
          </div>
        ) : progressData.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <BarChart3 size={24} className="mx-auto mb-2" />
            <p className="text-sm">Nenhum progresso registrado neste período</p>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {progressData.map((progress) => (
              <div
                key={progress.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(progress.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ikigai-green">
                    +{progress.value} {goal.unit}
                  </span>
                  {progress.notes && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({progress.notes})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão de Atualizar */}
      <button
        onClick={loadProgressData}
        disabled={loading}
        className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'Atualizando...' : 'Atualizar Dados'}
      </button>
    </div>
  );
}; 