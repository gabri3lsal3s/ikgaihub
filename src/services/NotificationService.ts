import { supabase } from './supabase';
import { Achievement } from '../types';
import toast from 'react-hot-toast';

export class NotificationService {
  // Mostrar notificação de conquista desbloqueada
  static showAchievementNotification(achievement: Achievement) {
    toast.success(
      `🏆 ${achievement.title} - +${achievement.points} pontos`,
      {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534'
        }
      }
    );
  }

  // Mostrar notificação de meta completada
  static showGoalCompletedNotification(goalTitle: string) {
    toast.success(
      `🎯 Meta Concluída: ${goalTitle}`,
      {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534'
        }
      }
    );
  }

  // Mostrar notificação de progresso registrado
  static showProgressNotification(value: number, unit: string) {
    toast.success(
      `Progresso registrado: +${value} ${unit}`,
      {
        duration: 3000,
        position: 'top-right'
      }
    );
  }

  // Mostrar notificação de meta próxima do prazo
  static showDeadlineWarningNotification(goalTitle: string, daysLeft: number) {
    toast(
      `⏰ Prazo se aproximando: ${goalTitle} - ${daysLeft} dias restantes`,
      {
        duration: 6000,
        position: 'top-right',
        style: {
          background: '#fef3c7',
          border: '1px solid #fde68a',
          color: '#92400e'
        }
      }
    );
  }

  // Mostrar notificação de meta atrasada
  static showOverdueNotification(goalTitle: string) {
    toast.error(
      `⚠️ Meta Atrasada: ${goalTitle}`,
      {
        duration: 8000,
        position: 'top-right'
      }
    );
  }

  // Mostrar notificação de streak
  static showStreakNotification(streakDays: number) {
    toast.success(
      `🔥 Streak Ativo: ${streakDays} dias consecutivos`,
      {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#fef3c7',
          border: '1px solid #fde68a',
          color: '#92400e'
        }
      }
    );
  }

  // Verificar e mostrar notificações de prazos
  static async checkDeadlineNotifications() {
    try {
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('status', 'active')
        .not('end_date', 'is', null);

      if (error) {
        console.error('Erro ao verificar prazos:', error);
        return;
      }

      const today = new Date();
      
      goals?.forEach(goal => {
        if (!goal.end_date) return;
        
        const endDate = new Date(goal.end_date);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          // Meta atrasada
          this.showOverdueNotification(goal.title);
        } else if (diffDays <= 3) {
          // Meta próxima do prazo
          this.showDeadlineWarningNotification(goal.title, diffDays);
        }
      });
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  }

  // Configurar verificação periódica de notificações
  static setupPeriodicNotifications() {
    // Verificar a cada hora
    setInterval(() => {
      this.checkDeadlineNotifications();
    }, 60 * 60 * 1000);
    
    // Verificar na primeira execução
    this.checkDeadlineNotifications();
  }
} 