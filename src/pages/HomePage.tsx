import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { TodayExercises } from '../components/dashboard/TodayExercises';
import { NextMeal } from '../components/dashboard/NextMeal';
import { QuickStats } from '../components/dashboard/QuickStats';
import { NutritionStats } from '../components/dashboard/NutritionStats';
import { ExerciseStats } from '../components/dashboard/ExerciseStats';
import { GoalStats } from '../components/dashboard/GoalStats';
import ReminderWidget from '../components/dashboard/ReminderWidget';

const HomePage: React.FC = () => {
  const { stats, loading, error, refresh } = useDashboard();

  return (
    <DashboardLayout loading={loading} onRefresh={refresh}>
      {/* Widgets principais em grid responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercícios de Hoje */}
        <TodayExercises 
          exercises={stats?.todayExercises || []}
        />

        {/* Próxima Refeição */}
        <NextMeal
          nextMeal={stats?.timeInfo?.nextMeal || null}
          recipes={stats?.nextMealRecipes || []}
          timeRemaining={stats?.timeInfo?.formattedTimeRemaining || ''}
        />
      </div>

      {/* Estatísticas Rápidas */}
      <QuickStats
        totalRecipes={stats?.totalRecipes || 0}
        totalExercises={stats?.totalExercises || 0}
        preferredRecipes={stats?.preferredRecipes || 0}
        recipesByMeal={stats?.recipesByMeal || {}}
        exercisesByDay={stats?.exercisesByDay || {}}
      />

      {/* Estatísticas Especializadas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Estatísticas de Nutrição */}
        <NutritionStats />

        {/* Estatísticas de Exercícios */}
        <ExerciseStats />

        {/* Estatísticas de Metas */}
        <GoalStats />

        {/* Widget de Lembretes */}
        <ReminderWidget />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="card p-6 border border-red-200 dark:border-red-800">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Erro ao carregar dados do dashboard
            </p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">
              {error}
            </p>
            <button
              onClick={refresh}
              className="btn btn-primary btn-sm mt-3"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Informações do projeto (apenas se não há dados) */}
      {stats && stats.totalRecipes === 0 && stats.totalExercises === 0 && !loading && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sobre o Projeto
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              O <strong>IkigaiHub</strong> é um PWA mobile-first desenvolvido para facilitar a gestão de saúde pessoal.
              Atualmente estamos na <strong>Fase 6</strong> do desenvolvimento, com o sistema de metas implementado.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fase 1</p>
                <p className="text-sm font-semibold text-ikigai-green">✅ Concluída</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fase 2</p>
                <p className="text-sm font-semibold text-ikigai-green">✅ Concluída</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fase 3</p>
                <p className="text-sm font-semibold text-ikigai-green">✅ Concluída</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fase 4</p>
                <p className="text-sm font-semibold text-ikigai-green">✅ Concluída</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fase 5</p>
                <p className="text-sm font-semibold text-ikigai-green">✅ Concluída</p>
              </div>
              <div className="text-center p-3 bg-ikigai-green/10 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fase 6</p>
                <p className="text-sm font-semibold text-ikigai-green">🔄 Ativa</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HomePage; 