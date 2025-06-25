import React, { useState, useEffect, useCallback } from 'react';
import { Utensils, PieChart, Calendar, Target, Star, Zap } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import type { ProgressFilters, ChartDataPoint } from '../../services/ProgressService';

interface NutritionStatsProps {
  className?: string;
}

interface NutritionStatsData {
  period: 'weekly' | 'monthly' | 'yearly';
  recipes_completed: number;
  total_calories: number;
  average_rating: number;
  meal_distribution?: Record<string, number>;
  top_recipes?: Array<{
    name: string;
    completion_count: number;
    average_rating: number;
  }>;
}

export const NutritionStats: React.FC<NutritionStatsProps> = ({ className = '' }) => {
  const { getProgressStats, getProgressChart, loading, error } = useProgress();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [stats, setStats] = useState<NutritionStatsData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const periods = [
    { value: 'weekly', label: 'Semanal', icon: Calendar },
    { value: 'monthly', label: 'Mensal', icon: PieChart },
    { value: 'yearly', label: 'Anual', icon: Target },
  ] as const;

  const loadStats = useCallback(async (period: 'weekly' | 'monthly' | 'yearly') => {
    const filters: ProgressFilters = { period };
    
    const [statsResult, chartResult] = await Promise.all([
      getProgressStats(filters),
      getProgressChart(filters)
    ]);

    if (statsResult.data) {
      const nutritionStats: NutritionStatsData = {
        period: statsResult.data.period,
        recipes_completed: statsResult.data.recipes_completed,
        total_calories: statsResult.data.total_calories,
        average_rating: statsResult.data.average_rating,
        meal_distribution: {},
        top_recipes: []
      };
      setStats(nutritionStats);
    }

    if (chartResult.data) {
      setChartData(chartResult.data);
    }
  }, [getProgressStats, getProgressChart]);

  useEffect(() => {
    loadStats(selectedPeriod);
  }, [selectedPeriod, loadStats]);

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

  const renderPieChart = (data: Record<string, number>, title: string) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    if (total === 0) {
      return (
        <div className="text-center py-8">
          <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum dado disponível
          </p>
        </div>
      );
    }

    let currentAngle = 0;
    const segments = Object.entries(data).map(([label, value], index) => {
      const percentage = (value / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      return {
        label,
        value,
        percentage,
        startAngle,
        angle,
        color: colors[index % colors.length]
      };
    });

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
        
        {/* Gráfico de Pizza Simulado */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {segments.map((segment, index) => (
                <g key={index}>
                  <path
                    d={`M 50 50 L ${50 + 40 * Math.cos(segment.startAngle * Math.PI / 180)} ${50 + 40 * Math.sin(segment.startAngle * Math.PI / 180)} A 40 40 0 ${segment.angle > 180 ? 1 : 0} 1 ${50 + 40 * Math.cos((segment.startAngle + segment.angle) * Math.PI / 180)} ${50 + 40 * Math.sin((segment.startAngle + segment.angle) * Math.PI / 180)} Z`}
                    fill={segment.color}
                    stroke="#fff"
                    strokeWidth="1"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Legenda */}
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-600 dark:text-gray-400">
                  {segment.label}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {segment.value} ({segment.percentage.toFixed(1)}%)
              </span>
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
          <Utensils className="h-6 w-6 text-ikigai-green" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estatísticas de Nutrição
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
              <Utensils className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.recipes_completed}
            </p>
            <p className="text-xs text-green-600">
              Receitas Concluídas
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {stats.total_calories}
            </p>
            <p className="text-xs text-blue-600">
              Calorias Totais
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

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.meal_distribution || {}).length}
            </p>
            <p className="text-xs text-purple-600">
              Tipos de Refeição
            </p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por tipo de refeição */}
        <div className="card p-4">
          {renderPieChart(
            stats?.meal_distribution || {},
            'Distribuição por Tipo de Refeição'
          )}
        </div>

        {/* Progresso diário */}
        <div className="card p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Progresso Diário
          </h4>
          {chartData.length > 0 ? (
            <div className="space-y-2">
              {chartData.slice(0, 7).map((data, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(data.date, selectedPeriod)}
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-ikigai-green h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((data.recipes_completed / Math.max(...chartData.map(d => d.recipes_completed))) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="w-12 text-xs text-gray-600 dark:text-gray-400 text-right">
                    {data.recipes_completed}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum dado disponível
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Estado vazio */}
      {!stats && !loading && (
        <div className="text-center py-8">
          <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum dado nutricional disponível
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Complete receitas para ver estatísticas
          </p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Erro ao carregar estatísticas nutricionais
          </p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}; 