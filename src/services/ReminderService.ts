import { supabase } from './supabase';
import { 
  Reminder, 
  ReminderSchedule, 
  NotificationSettings, 
  NotificationHistory,
  CreateReminderData,
  UpdateReminderData,
  ReminderWithSchedule,
  ReminderStats,
  ReminderType,
  NotificationType
} from '../types';

export class ReminderService {
  // =====================================================
  // CRUD DE LEMBRETES
  // =====================================================

  /**
   * Buscar todos os lembretes do usuário
   */
  static async getReminders(userId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('target_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar lembretes:', error);
      throw error;
    }
  }

  /**
   * Buscar lembrete por ID
   */
  static async getReminderById(id: string): Promise<Reminder | null> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar lembrete:', error);
      throw error;
    }
  }

  /**
   * Criar novo lembrete
   */
  static async createReminder(userId: string, reminderData: CreateReminderData): Promise<Reminder> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: userId,
          ...reminderData,
          is_active: true,
          notification_enabled: reminderData.notification_enabled ?? true
        })
        .select()
        .single();

      if (error) throw error;

      // Se for recorrente, gerar agendamentos
      if (data.is_recurring && data.recurrence_pattern) {
        await this.generateSchedules(data.id);
      } else {
        // Criar agendamento único
        await this.createSchedule(data.id, data.target_date, data.target_time);
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar lembrete:', error);
      throw error;
    }
  }

  /**
   * Atualizar lembrete
   */
  static async updateReminder(id: string, updateData: UpdateReminderData): Promise<Reminder> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Se mudou a recorrência, regenerar agendamentos
      if (updateData.is_recurring !== undefined || updateData.recurrence_pattern) {
        await this.deleteSchedules(id);
        if (data.is_recurring && data.recurrence_pattern) {
          await this.generateSchedules(id);
        } else {
          await this.createSchedule(id, data.target_date, data.target_time);
        }
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
      throw error;
    }
  }

  /**
   * Deletar lembrete
   */
  static async deleteReminder(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error);
      throw error;
    }
  }

  // =====================================================
  // GERENCIAMENTO DE AGENDAMENTOS
  // =====================================================

  /**
   * Criar agendamento único
   */
  static async createSchedule(reminderId: string, targetDate: string, targetTime?: string | null): Promise<ReminderSchedule> {
    try {
      const scheduledTime = targetTime 
        ? `${targetDate}T${targetTime}`
        : `${targetDate}T09:00:00`;

      const { data, error } = await supabase
        .from('reminder_schedules')
        .insert({
          reminder_id: reminderId,
          scheduled_time: scheduledTime
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  /**
   * Gerar agendamentos recorrentes
   */
  static async generateSchedules(reminderId: string): Promise<void> {
    try {
      const reminder = await this.getReminderById(reminderId);
      if (!reminder || !reminder.is_recurring || !reminder.recurrence_pattern) {
        return;
      }

      const schedules: Partial<ReminderSchedule>[] = [];
      const startDate = new Date(reminder.target_date);
      const targetTime = reminder.target_time || '09:00:00';

      // Gerar agendamentos para os próximos 30 dias
      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        let shouldSchedule = false;

        switch (reminder.recurrence_pattern) {
          case 'daily':
            shouldSchedule = true;
            break;
          case 'weekly':
            if (reminder.recurrence_days?.includes(currentDate.getDay())) {
              shouldSchedule = true;
            }
            break;
          case 'monthly':
            if (currentDate.getDate() === startDate.getDate()) {
              shouldSchedule = true;
            }
            break;
        }

        if (shouldSchedule) {
          const scheduledTime = `${currentDate.toISOString().split('T')[0]}T${targetTime}`;
          schedules.push({
            reminder_id: reminderId,
            scheduled_time: scheduledTime
          });
        }
      }

      if (schedules.length > 0) {
        const { error } = await supabase
          .from('reminder_schedules')
          .insert(schedules);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao gerar agendamentos:', error);
      throw error;
    }
  }

  /**
   * Deletar todos os agendamentos de um lembrete
   */
  static async deleteSchedules(reminderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminder_schedules')
        .delete()
        .eq('reminder_id', reminderId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar agendamentos:', error);
      throw error;
    }
  }

  /**
   * Buscar agendamentos pendentes
   */
  static async getPendingSchedules(userId: string): Promise<ReminderSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('reminder_schedules')
        .select(`
          *,
          reminders!inner(user_id)
        `)
        .eq('reminders.user_id', userId)
        .eq('is_sent', false)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar agendamentos pendentes:', error);
      throw error;
    }
  }

  /**
   * Marcar agendamento como enviado
   */
  static async markScheduleAsSent(scheduleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminder_schedules')
        .update({
          is_sent: true,
          sent_at: new Date().toISOString()
        })
        .eq('id', scheduleId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar agendamento como enviado:', error);
      throw error;
    }
  }

  // =====================================================
  // CONFIGURAÇÕES DE NOTIFICAÇÃO
  // =====================================================

  /**
   * Buscar configurações de notificação do usuário
   */
  static async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Erro ao buscar configurações de notificação:', error);
      throw error;
    }
  }

  /**
   * Criar ou atualizar configurações de notificação
   */
  static async updateNotificationSettings(
    userId: string, 
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          ...settings
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error);
      throw error;
    }
  }

  // =====================================================
  // HISTÓRICO DE NOTIFICAÇÕES
  // =====================================================

  /**
   * Registrar notificação no histórico
   */
  static async logNotification(
    userId: string,
    notificationData: {
      reminder_id?: string;
      notification_type: NotificationType;
      title: string;
      body?: string;
    }
  ): Promise<NotificationHistory> {
    try {
      const { data, error } = await supabase
        .from('notification_history')
        .insert({
          user_id: userId,
          ...notificationData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao registrar notificação:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de notificações
   */
  static async getNotificationHistory(userId: string, limit = 50): Promise<NotificationHistory[]> {
    try {
      const { data, error } = await supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de notificações:', error);
      throw error;
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_history')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // =====================================================
  // ESTATÍSTICAS E RELATÓRIOS
  // =====================================================

  /**
   * Buscar estatísticas de lembretes
   */
  static async getReminderStats(userId: string): Promise<ReminderStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Total de lembretes
      const { count: totalReminders } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Lembretes ativos
      const { count: activeReminders } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Lembretes de hoje
      const { count: todayReminders } = await supabase
        .from('reminder_schedules')
        .select(`
          *,
          reminders!inner(user_id, is_active)
        `, { count: 'exact', head: true })
        .eq('reminders.user_id', userId)
        .eq('reminders.is_active', true)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${tomorrowStr}T00:00:00`);

      // Lembretes futuros
      const { count: upcomingReminders } = await supabase
        .from('reminder_schedules')
        .select(`
          *,
          reminders!inner(user_id, is_active)
        `, { count: 'exact', head: true })
        .eq('reminders.user_id', userId)
        .eq('reminders.is_active', true)
        .gte('scheduled_time', `${tomorrowStr}T00:00:00`);

      // Lembretes completados hoje
      const { count: completedToday } = await supabase
        .from('reminder_schedules')
        .select(`
          *,
          reminders!inner(user_id, is_active)
        `, { count: 'exact', head: true })
        .eq('reminders.user_id', userId)
        .eq('reminders.is_active', true)
        .eq('is_sent', true)
        .gte('sent_at', `${today}T00:00:00`)
        .lt('sent_at', `${tomorrowStr}T00:00:00`);

      return {
        total_reminders: totalReminders || 0,
        active_reminders: activeReminders || 0,
        today_reminders: todayReminders || 0,
        upcoming_reminders: upcomingReminders || 0,
        completed_today: completedToday || 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de lembretes:', error);
      throw error;
    }
  }

  /**
   * Buscar lembretes com agendamentos
   */
  static async getRemindersWithSchedules(userId: string): Promise<ReminderWithSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          reminder_schedules(*)
        `)
        .eq('user_id', userId)
        .order('target_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(reminder => {
        const schedules = reminder.reminder_schedules || [];
        const nextSchedule = schedules
          .filter((s: ReminderSchedule) => !s.is_sent && new Date(s.scheduled_time) > new Date())
          .sort((a: ReminderSchedule, b: ReminderSchedule) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())[0];

        return {
          ...reminder,
          schedules,
          next_schedule: nextSchedule
        };
      });
    } catch (error) {
      console.error('Erro ao buscar lembretes com agendamentos:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  /**
   * Verificar se está em horário silencioso
   */
  static isQuietHours(settings: NotificationSettings): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startTime = this.timeStringToMinutes(settings.quiet_hours_start);
    const endTime = this.timeStringToMinutes(settings.quiet_hours_end);
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Horário silencioso atravessa a meia-noite
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Converter string de tempo para minutos
   */
  private static timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Formatar data e hora para exibição
   */
  static formatDateTime(date: string, time?: string | null): string {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('pt-BR');
    
    if (time) {
      return `${formattedDate} às ${time}`;
    }
    
    return formattedDate;
  }

  /**
   * Obter ícone baseado no tipo de lembrete
   */
  static getReminderIcon(type: ReminderType): string {
    switch (type) {
      case 'meal':
        return '🍽️';
      case 'exercise':
        return '💪';
      case 'goal':
        return '🎯';
      case 'custom':
        return '🔔';
      default:
        return '📝';
    }
  }
} 