import React from 'react';
import { TrendingUp, Utensils, Dumbbell, Star, BarChart3 } from 'lucide-react';

interface QuickStatsProps {
  totalRecipes: number;
  totalExercises: number;
  preferredRecipes: number;
  recipesByMeal: Record<string, number>;
  exercisesByDay: Record<string, number>;
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalRecipes,
  totalExercises,
  preferredRecipes,
  recipesByMeal,
  exercisesByDay,
  className = ''
}) => {
  // Mapeamento de nomes das refeições
  const mealNames: Record<string, string> = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche Matinal',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Janta',
    night_snack: 'Ceia',
    additional: 'Adicional'
  };

  // Mapeamento de nomes dos dias da semana
  const dayNames: Record<string, string> = {
    '0': 'Domingo',
    '1': 'Segunda',
    '2': 'Terça',
    '3': 'Quarta',
    '4': 'Quinta',
    '5': 'Sexta',
    '6': 'Sábado'
  };

  // Calcular estatísticas adicionais
  const totalMeals = Object.keys(recipesByMeal).length;
  const totalDays = Object.keys(exercisesByDay).length;
  const avgRecipesPerMeal = totalMeals > 0 ? (totalRecipes / totalMeals).toFixed(1) : '0';
  const avgExercisesPerDay = totalDays > 0 ? (totalExercises / totalDays).toFixed(1) : '0';

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-ikigai-green" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Estatísticas Rápidas
        </h3>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-ikigai-green/10 rounded-lg">
          <Utensils className="h-8 w-8 text-ikigai-green mx-auto mb-2" />
          <p className="text-2xl font-bold text-ikigai-green">
            {totalRecipes}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Receitas
          </p>
        </div>

        <div className="text-center p-4 bg-ikigai-green/10 rounded-lg">
          <Dumbbell className="h-8 w-8 text-ikigai-green mx-auto mb-2" />
          <p className="text-2xl font-bold text-ikigai-green">
            {totalExercises}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Exercícios
          </p>
        </div>

        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {preferredRecipes}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Preferidas
          </p>
        </div>

        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalMeals}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Refeições
          </p>
        </div>
      </div>

      {/* Estatísticas detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por refeição */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Receitas por Refeição
          </h4>
          <div className="space-y-2">
            {Object.entries(recipesByMeal).map(([meal, count]) => (
              <div key={meal} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {mealNames[meal] || meal}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-ikigai-green h-2 rounded-full"
                      style={{
                        width: `${Math.min((count / Math.max(...Object.values(recipesByMeal))) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Média: {avgRecipesPerMeal} por refeição
          </p>
        </div>

        {/* Distribuição por dia */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Exercícios por Dia
          </h4>
          <div className="space-y-2">
            {Object.entries(exercisesByDay).map(([day, count]) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {dayNames[day] || day}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-ikigai-green h-2 rounded-full"
                      style={{
                        width: `${Math.min((count / Math.max(...Object.values(exercisesByDay))) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Média: {avgExercisesPerDay} por dia
          </p>
        </div>
      </div>

      {/* Estado vazio */}
      {totalRecipes === 0 && totalExercises === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum dado disponível ainda
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Adicione receitas e exercícios para ver estatísticas
          </p>
        </div>
      )}
    </div>
  );
}; 