import React, { useState, useEffect } from 'react';
import { Achievement } from '../../types';
import { AchievementService } from '../../services/AchievementService';
import { Trophy, Star, Award, Zap } from 'lucide-react';

interface GoalAchievementsProps {
  goalId?: string;
}

export const GoalAchievements: React.FC<GoalAchievementsProps> = ({ 
  goalId
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, [goalId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      let achievementsData: Achievement[];
      
      if (goalId) {
        achievementsData = await AchievementService.getAchievementsByGoal(goalId);
      } else {
        achievementsData = await AchievementService.getAchievements();
      }
      
      setAchievements(achievementsData);
      
      // Calcular pontos totais
      const totalPoints = achievementsData.reduce((sum, achievement) => sum + achievement.points, 0);
      setTotalPoints(totalPoints);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'goal_completed':
        return <Trophy size={20} className="text-yellow-600" />;
      case 'streak':
        return <Zap size={20} className="text-blue-600" />;
      case 'milestone':
        return <Star size={20} className="text-purple-600" />;
      default:
        return <Award size={20} className="text-gray-600" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'goal_completed':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'streak':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'milestone':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Conquistas
        </h3>
        <div className="flex items-center gap-2">
          <Star size={16} className="text-yellow-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {totalPoints} pontos
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando conquistas...</p>
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-8">
          <Trophy size={48} className="text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma conquista ainda
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Continue trabalhando em suas metas para desbloquear conquistas!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border ${getAchievementColor(achievement.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getAchievementIcon(achievement.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {achievement.title}
                    </h4>
                    <span className="text-xs font-medium text-ikigai-green">
                      +{achievement.points} pts
                    </span>
                  </div>
                  {achievement.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Desbloqueado em {formatDate(achievement.unlocked_at)}
                    </span>
                    {achievement.icon && (
                      <span className="text-lg">{achievement.icon}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas de Conquistas */}
      {achievements.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-ikigai-green mb-1">
                {achievements.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Conquistas
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600 mb-1">
                {totalPoints}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Pontos Totais
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Atualizar */}
      <button
        onClick={loadAchievements}
        disabled={loading}
        className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'Atualizando...' : 'Atualizar Conquistas'}
      </button>
    </div>
  );
}; 