import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Star, Zap } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import type { ProgressFilters, ChartDataPoint } from '../../services/ProgressService';

interface ProgressStatsProps {
  className?: string;
}

interface ProgressStatsData {
  period: 'weekly' | 'monthly' | 'yearly';
  exercises_completed: number;
  recipes_completed: number;
  total_calories: number;
  total_exercise_time: number;
  streak_days: number;
  average_rating: number;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({ className = '' }) => {
  const { getProgressStats, getProgressChart, loading, error } = useProgress();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [stats, setStats] = useState<ProgressStatsData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const periods = [
    { value: 'weekly', label: 'Semanal', icon: Calendar },
    { value: 'monthly', label: 'Mensal', icon: BarChart3 },
    { value: 'yearly', label: 'Anual', icon: TrendingUp },
  ] as const;

  const loadStats = useCallback(async (period: 'weekly' | 'monthly' | 'yearly') => {
    const filters: ProgressFilters = { period };
    
    const [statsResult, chartResult] = await Promise.all([
      getProgressStats(filters),
      getProgressChart(filters)
    ]);

    if (statsResult.data) {
      setStats(statsResult.data);
    }

    if (chartResult.data) {
      setChartData(chartResult.data);
    }
  }, [getProgressStats, getProgressChart]);

  useEffect(() => {
    loadStats(selectedPeriod);
  }, [selectedPeriod, loadStats]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const formatDate = (dateString: string, period: string): string => {
    const date = new Date(dateString);
    
    switch (period) {
      case 'weekly':
        return date.toLocaleDateString('pt-BR', { weekday: 'short' });
      case 'monthly':
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      case 'yearly':
        return date.toLocaleDateString('pt-BR', { month: 'short' });
      default:
        return date.toLocaleDateString('pt-BR');
    }
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum dado disponível para o período selecionado
          </p>
        </div>
      );
    }

    const maxValue = Math.max(
      ...chartData.map(d => Math.max(d.exercises_completed, d.recipes_completed))
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progresso Diário
          </h4>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-ikigai-green rounded"></div>
              <span>Exercícios</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Receitas</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-500 dark:text-gray-400">
                {formatDate(data.date, selectedPeriod)}
              </div>
              <div className="flex-1 flex gap-1">
                {/* Barra de exercícios */}
                <div 
                  className="bg-ikigai-green rounded transition-all duration-300"
                  style={{ 
                    width: `${(data.exercises_completed / Math.max(maxValue, 1)) * 100}%`,
                    height: '20px'
                  }}
                ></div>
                {/* Barra de receitas */}
                <div 
                  className="bg-blue-500 rounded transition-all duration-300"
                  style={{ 
                    width: `${(data.recipes_completed / Math.max(maxValue, 1)) * 100}%`,
                    height: '20px'
                  }}
                ></div>
              </div>
              <div className="w-12 text-xs text-gray-600 dark:text-gray-400 text-right">
                {data.exercises_completed + data.recipes_completed}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-ikigai-green" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estatísticas de Progresso
          </h3>
        </div>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2 mb-6">
        {periods.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setSelectedPeriod(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedPeriod === value
                ? 'bg-ikigai-green text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Estatísticas principais */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.exercises_completed}
            </p>
            <p className="text-xs text-green-600">
              Exercícios Concluídos
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {stats.recipes_completed}
            </p>
            <p className="text-xs text-blue-600">
              Receitas Concluídas
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {stats.streak_days}
            </p>
            <p className="text-xs text-purple-600">
              Dias Consecutivos
            </p>
          </div>

          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.average_rating.toFixed(1)}
            </p>
            <p className="text-xs text-yellow-600">
              Avaliação Média
            </p>
          </div>
        </div>
      )}

      {/* Estatísticas detalhadas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tempo Total de Exercício
            </h4>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatTime(stats.total_exercise_time)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calorias Consumidas
            </h4>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.total_calories.toLocaleString()} cal
            </p>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-green mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">
              Erro ao carregar estatísticas: {error}
            </p>
          </div>
        ) : (
          renderChart()
        )}
      </div>
    </div>
  );
}; 