import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ReminderService } from '../services/ReminderService';
import { 
  Reminder, 
  ReminderWithSchedule, 
  ReminderStats, 
  CreateReminderData, 
  UpdateReminderData,
  NotificationSettings,
  NotificationHistory
} from '../types';

export const useReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersWithSchedules, setRemindersWithSchedules] = useState<ReminderWithSchedule[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // CARREGAMENTO DE DADOS
  // =====================================================

  const loadReminders = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [remindersData, remindersWithSchedulesData, statsData, settingsData, historyData] = await Promise.all([
        ReminderService.getReminders(user.id),
        ReminderService.getRemindersWithSchedules(user.id),
        ReminderService.getReminderStats(user.id),
        ReminderService.getNotificationSettings(user.id),
        ReminderService.getNotificationHistory(user.id, 20)
      ]);

      setReminders(remindersData);
      setRemindersWithSchedules(remindersWithSchedulesData);
      setStats(statsData);
      setNotificationSettings(settingsData);
      setNotificationHistory(historyData);
    } catch (err) {
      console.error('Erro ao carregar lembretes:', err);
      setError('Erro ao carregar lembretes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  // =====================================================
  // CRUD DE LEMBRETES
  // =====================================================

  const createReminder = useCallback(async (reminderData: CreateReminderData): Promise<Reminder> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setError(null);
      const newReminder = await ReminderService.createReminder(user.id, reminderData);
      
      // Atualizar estado local
      setReminders(prev => [...prev, newReminder]);
      await loadReminders(); // Recarregar dados completos
      
      return newReminder;
    } catch (err) {
      console.error('Erro ao criar lembrete:', err);
      setError('Erro ao criar lembrete');
      throw err;
    }
  }, [user, loadReminders]);

  const updateReminder = useCallback(async (id: string, updateData: UpdateReminderData): Promise<Reminder> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setError(null);
      const updatedReminder = await ReminderService.updateReminder(id, updateData);
      
      // Atualizar estado local
      setReminders(prev => prev.map(r => r.id === id ? updatedReminder : r));
      await loadReminders(); // Recarregar dados completos
      
      return updatedReminder;
    } catch (err) {
      console.error('Erro ao atualizar lembrete:', err);
      setError('Erro ao atualizar lembrete');
      throw err;
    }
  }, [user, loadReminders]);

  const deleteReminder = useCallback(async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setError(null);
      await ReminderService.deleteReminder(id);
      
      // Atualizar estado local
      setReminders(prev => prev.filter(r => r.id !== id));
      await loadReminders(); // Recarregar dados completos
    } catch (err) {
      console.error('Erro ao deletar lembrete:', err);
      setError('Erro ao deletar lembrete');
      throw err;
    }
  }, [user, loadReminders]);

  const toggleReminderActive = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    await updateReminder(id, { is_active: isActive });
  }, [updateReminder]);

  // =====================================================
  // CONFIGURAÇÕES DE NOTIFICAÇÃO
  // =====================================================

  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setError(null);
      const updatedSettings = await ReminderService.updateNotificationSettings(user.id, settings);
      setNotificationSettings(updatedSettings);
    } catch (err) {
      console.error('Erro ao atualizar configurações de notificação:', err);
      setError('Erro ao atualizar configurações de notificação');
      throw err;
    }
  }, [user]);

  // =====================================================
  // HISTÓRICO DE NOTIFICAÇÕES
  // =====================================================

  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setError(null);
      await ReminderService.markNotificationAsRead(notificationId);
      
      // Atualizar estado local
      setNotificationHistory(prev => 
        prev.map(n => n.id === notificationId 
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
        )
      );
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      setError('Erro ao marcar notificação como lida');
      throw err;
    }
  }, [user]);

  const loadMoreNotificationHistory = useCallback(async (limit = 20): Promise<void> => {
    if (!user) return;

    try {
      setError(null);
      const history = await ReminderService.getNotificationHistory(user.id, limit);
      setNotificationHistory(history);
    } catch (err) {
      console.error('Erro ao carregar histórico de notificações:', err);
      setError('Erro ao carregar histórico de notificações');
      throw err;
    }
  }, [user]);

  // =====================================================
  // UTILITÁRIOS E FILTROS
  // =====================================================

  const getRemindersByType = useCallback((type: string): Reminder[] => {
    return reminders.filter(r => r.reminder_type === type);
  }, [reminders]);

  const getActiveReminders = useCallback((): Reminder[] => {
    return reminders.filter(r => r.is_active);
  }, [reminders]);

  const getTodayReminders = useCallback((): ReminderWithSchedule[] => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return remindersWithSchedules.filter(r => 
      r.schedules?.some(s => 
        !s.is_sent && s.scheduled_time.startsWith(todayStr)
      )
    );
  }, [remindersWithSchedules]);

  const getUpcomingReminders = useCallback((): ReminderWithSchedule[] => {
    const now = new Date();
    return remindersWithSchedules.filter(r => 
      r.next_schedule && new Date(r.next_schedule.scheduled_time) > now
    ).sort((a, b) => {
      if (!a.next_schedule || !b.next_schedule) return 0;
      return new Date(a.next_schedule.scheduled_time).getTime() - new Date(b.next_schedule.scheduled_time).getTime();
    });
  }, [remindersWithSchedules]);

  const getOverdueReminders = useCallback((): ReminderWithSchedule[] => {
    const now = new Date();
    return remindersWithSchedules.filter(r => 
      r.schedules?.some(s => 
        !s.is_sent && new Date(s.scheduled_time) < now
      )
    );
  }, [remindersWithSchedules]);

  // =====================================================
  // REFRESH E RESET
  // =====================================================

  const refresh = useCallback(() => {
    loadReminders();
  }, [loadReminders]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =====================================================
  // ESTADOS DERIVADOS
  // =====================================================

  const hasActiveReminders = reminders.some(r => r.is_active);
  const hasTodayReminders = getTodayReminders().length > 0;
  const hasOverdueReminders = getOverdueReminders().length > 0;
  const unreadNotificationsCount = notificationHistory.filter(n => !n.is_read).length;

  return {
    // Estados
    reminders,
    remindersWithSchedules,
    stats,
    notificationSettings,
    notificationHistory,
    loading,
    error,

    // Ações CRUD
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminderActive,

    // Configurações
    updateNotificationSettings,

    // Histórico
    markNotificationAsRead,
    loadMoreNotificationHistory,

    // Filtros
    getRemindersByType,
    getActiveReminders,
    getTodayReminders,
    getUpcomingReminders,
    getOverdueReminders,

    // Utilitários
    refresh,
    clearError,

    // Estados derivados
    hasActiveReminders,
    hasTodayReminders,
    hasOverdueReminders,
    unreadNotificationsCount
  };
}; 