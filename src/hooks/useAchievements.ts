import { useState, useEffect, useCallback } from 'react';
import { AchievementService } from '../services/AchievementService';
import { Achievement, UseAchievementsReturn } from '../types';
import toast from 'react-hot-toast';

export const useAchievements = (): UseAchievementsReturn => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AchievementService.getAchievements();
      setAchievements(data);
      
      // Calcular total de pontos
      const points = data.reduce((total, achievement) => total + achievement.points, 0);
      setTotalPoints(points);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar conquistas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    loading,
    error,
    totalPoints,
    refresh
  };
}; 