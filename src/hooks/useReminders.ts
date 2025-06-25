import { useState, useEffect, useCallback } from 'react';
import { ReminderService } from '../services/ReminderService';
import { Reminder, CreateReminderForm, UseRemindersReturn } from '../types';
import toast from 'react-hot-toast';

export const useReminders = (): UseRemindersReturn => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReminderService.getReminders();
      setReminders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar lembretes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReminder = useCallback(async (reminderData: CreateReminderForm) => {
    try {
      setError(null);
      const newReminder = await ReminderService.createReminder(reminderData);
      setReminders(prev => [...prev, newReminder]);
      toast.success('Lembrete criado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lembrete';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateReminder = useCallback(async (id: string, updates: Partial<Reminder>) => {
    try {
      setError(null);
      const updatedReminder = await ReminderService.updateReminder(id, updates);
      setReminders(prev => prev.map(reminder => reminder.id === id ? updatedReminder : reminder));
      toast.success('Lembrete atualizado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lembrete';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    try {
      setError(null);
      await ReminderService.deleteReminder(id);
      setReminders(prev => prev.filter(reminder => reminder.id !== id));
      toast.success('Lembrete removido com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover lembrete';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const toggleReminder = useCallback(async (id: string, isActive: boolean) => {
    try {
      setError(null);
      const updatedReminder = await ReminderService.toggleReminder(id, isActive);
      setReminders(prev => prev.map(reminder => reminder.id === id ? updatedReminder : reminder));
      
      const status = isActive ? 'ativado' : 'desativado';
      toast.success(`Lembrete ${status} com sucesso!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status do lembrete';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchReminders();
  }, [fetchReminders]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    reminders,
    loading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    refresh
  };
}; 