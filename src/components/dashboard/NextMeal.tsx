import React, { useState, useEffect } from 'react';
import { Utensils, Clock, Star, Circle, CheckCircle2 } from 'lucide-react';
import { Recipe } from '../../types';
import { useProgress } from '../../hooks/useProgress';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface NextMealProps {
  nextMeal: string | null;
  recipes: Recipe[];
  timeRemaining: string;
  onRefreshStats?: () => void;
  className?: string;
}

export const NextMeal: React.FC<NextMealProps> = ({
  nextMeal,
  recipes,
  timeRemaining,
  onRefreshStats,
  className = ''
}) => {
  const { completeRecipe, removeRecipeCompletion, getTodayRecipeCompletion } = useProgress();
  const [completedRecipes, setCompletedRecipes] = useState<Set<string>>(new Set());
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());

  const preferredRecipe = recipes.find(recipe => recipe.is_preferred);
  const otherRecipes = recipes.filter(recipe => !recipe.is_preferred);

  // Verificar receitas já concluídas ao carregar
  useEffect(() => {
    const checkCompletedRecipes = async () => {
      const completed = new Set<string>();
      
      for (const recipe of recipes) {
        const result = await getTodayRecipeCompletion(recipe.id);
        if (result.data) {
          completed.add(recipe.id);
        }
      }
      
      setCompletedRecipes(completed);
    };

    if (recipes.length > 0) {
      checkCompletedRecipes();
    }
  }, [recipes, getTodayRecipeCompletion]);

  const handleToggleCompletion = async (recipe: Recipe) => {
    const recipeId = recipe.id;
    const isCompleted = completedRecipes.has(recipeId);

    setLoadingStates(prev => new Set(prev).add(recipeId));

    try {
      if (isCompleted) {
        // Buscar o ID da conclusão da receita hoje
        const { data: completion, error } = await getTodayRecipeCompletion(recipeId);
        if (error || !completion) {
          toast.error('Erro ao buscar conclusão para remover');
        } else {
          await removeRecipeCompletion(completion.id);
          setCompletedRecipes(prev => {
            const newSet = new Set(prev);
            newSet.delete(recipeId);
            return newSet;
          });
          if (typeof onRefreshStats === 'function') onRefreshStats();
          toast.success('Receita desmarcada como concluída');
        }
      } else {
        // Marcar como concluída
        const result = await completeRecipe({
          recipe_id: recipeId,
          meal_type: recipe.meal_type,
          rating: 5, // Rating padrão
          notes: ''
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          setCompletedRecipes(prev => new Set(prev).add(recipeId));
          toast.success('Receita marcada como concluída!');
        }
      }
    } catch {
      toast.error('Erro ao atualizar status da receita');
    } finally {
      setLoadingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  const completedCount = completedRecipes.size;
  const completionRate = recipes.length > 0 ? (completedCount / recipes.length) * 100 : 0;

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Utensils className="h-6 w-6 text-ikigai-green" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Próxima Refeição
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {timeRemaining}
        </div>
      </div>

      {nextMeal ? (
        <div className="space-y-4">
          {/* Nome da refeição */}
          <div className="text-center py-3 bg-ikigai-green/10 rounded-lg">
            <h4 className="text-lg font-semibold text-ikigai-green">
              {nextMeal}
            </h4>
          </div>

          {/* Barra de progresso */}
          {recipes.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progresso: {completedCount}/{recipes.length}</span>
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

          {/* Receita preferida */}
          {preferredRecipe && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Receita Preferida
                </span>
              </div>
              <div className={`p-3 rounded-lg border transition-all duration-200 ${
                completedRecipes.has(preferredRecipe.id)
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className={`font-medium transition-all duration-200 ${
                      completedRecipes.has(preferredRecipe.id)
                        ? 'text-green-800 dark:text-green-200 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {preferredRecipe.name}
                    </h5>
                    <div className="flex items-center gap-4 mt-1">
                      {preferredRecipe.prep_time && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ⏱️ {preferredRecipe.prep_time} min
                        </span>
                      )}
                      {preferredRecipe.calories && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          🔥 {preferredRecipe.calories} cal
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleCompletion(preferredRecipe)}
                    disabled={loadingStates.has(preferredRecipe.id)}
                    className={`flex-shrink-0 ml-3 transition-all duration-200 ${
                      loadingStates.has(preferredRecipe.id) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                    }`}
                  >
                    {completedRecipes.has(preferredRecipe.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 hover:text-ikigai-green" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Outras receitas */}
          {otherRecipes.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Outras Opções ({otherRecipes.length})
              </span>
              <div className="space-y-2">
                {otherRecipes.slice(0, 2).map((recipe) => {
                  const isCompleted = completedRecipes.has(recipe.id);
                  const isLoading = loadingStates.has(recipe.id);

                  return (
                    <div
                      key={recipe.id}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className={`font-medium transition-all duration-200 ${
                            isCompleted
                              ? 'text-green-800 dark:text-green-200 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {recipe.name}
                          </h5>
                          <div className="flex items-center gap-4 mt-1">
                            {recipe.prep_time && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ⏱️ {recipe.prep_time} min
                              </span>
                            )}
                            {recipe.calories && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                🔥 {recipe.calories} cal
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleCompletion(recipe)}
                          disabled={isLoading}
                          className={`flex-shrink-0 ml-3 transition-all duration-200 ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 hover:text-ikigai-green" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {otherRecipes.length > 2 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    +{otherRecipes.length - 2} receitas adicionais
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {recipes.length === 0 && (
            <div className="text-center py-6">
              <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Nenhuma receita cadastrada para {nextMeal}
              </p>
              <Link
                to="/meal-plan"
                className="btn btn-primary btn-sm"
              >
                Adicionar Receitas
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Não há próximas refeições programadas
          </p>
        </div>
      )}

      {/* Link para página de plano alimentar */}
      {recipes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Link
            to="/meal-plan"
            className="btn btn-outline btn-sm w-full"
          >
            Ver Plano Alimentar
          </Link>
        </div>
      )}
    </div>
  );
}; 