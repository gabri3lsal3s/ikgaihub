import { supabase } from './supabase';
import { Reminder, CreateReminderForm } from '../types';

export class ReminderService {
  // Buscar todos os lembretes do usuário
  static async getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar lembretes: ${error.message}`);
    }

    return data || [];
  }

  // Buscar lembrete específico
  static async getReminder(id: string): Promise<Reminder | null> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar lembrete: ${error.message}`);
    }

    return data;
  }

  // Criar novo lembrete
  static async createReminder(reminderData: CreateReminderForm): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .insert([reminderData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar lembrete: ${error.message}`);
    }

    return data;
  }

  // Atualizar lembrete
  static async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar lembrete: ${error.message}`);
    }

    return data;
  }

  // Deletar lembrete
  static async deleteReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar lembrete: ${error.message}`);
    }
  }

  // Ativar/desativar lembrete
  static async toggleReminder(id: string, isActive: boolean): Promise<Reminder> {
    return this.updateReminder(id, { is_active: isActive });
  }

  // Buscar lembretes ativos
  static async getActiveReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_active', true)
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar lembretes ativos: ${error.message}`);
    }

    return data || [];
  }

  // Buscar lembretes por tipo
  static async getRemindersByType(type: 'exercise' | 'meal' | 'goal' | 'general'): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('type', type)
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar lembretes por tipo: ${error.message}`);
    }

    return data || [];
  }

  // Buscar lembretes para hoje
  static async getTodayReminders(): Promise<Reminder[]> {
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const dayOfWeek = today === 0 ? 7 : today; // Converter para formato do banco (1-7)

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_active', true)
      .contains('days_of_week', [dayOfWeek])
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar lembretes de hoje: ${error.message}`);
    }

    return data || [];
  }

  // Verificar se há lembretes próximos (próximos 30 minutos)
  static async getUpcomingReminders(minutesThreshold: number = 30): Promise<Reminder[]> {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const thresholdTime = new Date(now.getTime() + minutesThreshold * 60000);
    const thresholdTimeStr = thresholdTime.toTimeString().slice(0, 5);

    const todayReminders = await this.getTodayReminders();
    
    return todayReminders.filter(reminder => {
      const reminderTime = reminder.time;
      return reminderTime >= currentTime && reminderTime <= thresholdTimeStr;
    });
  }

  // Criar lembretes padrão para novos usuários
  static async createDefaultReminders(): Promise<Reminder[]> {
    const defaultReminders: CreateReminderForm[] = [
      {
        title: 'Hora do Exercício',
        description: 'Lembrete para fazer seus exercícios diários',
        type: 'exercise',
        time: '07:00',
        days_of_week: [1, 2, 3, 4, 5, 6, 7] // Todos os dias
      },
      {
        title: 'Café da Manhã',
        description: 'Hora de tomar o café da manhã',
        type: 'meal',
        time: '08:00',
        days_of_week: [1, 2, 3, 4, 5, 6, 7]
      },
      {
        title: 'Almoço',
        description: 'Hora do almoço',
        type: 'meal',
        time: '12:00',
        days_of_week: [1, 2, 3, 4, 5, 6, 7]
      },
      {
        title: 'Jantar',
        description: 'Hora do jantar',
        type: 'meal',
        time: '19:00',
        days_of_week: [1, 2, 3, 4, 5, 6, 7]
      }
    ];

    const createdReminders: Reminder[] = [];
    
    for (const reminderData of defaultReminders) {
      try {
        const reminder = await this.createReminder(reminderData);
        createdReminders.push(reminder);
      } catch (error) {
        console.error(`Erro ao criar lembrete padrão: ${error}`);
      }
    }

    return createdReminders;
  }

  // Verificar se usuário já tem lembretes
  static async hasReminders(): Promise<boolean> {
    const reminders = await this.getReminders();
    return reminders.length > 0;
  }

  // Buscar estatísticas de lembretes
  static async getReminderStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  }> {
    const reminders = await this.getReminders();
    
    const total = reminders.length;
    const active = reminders.filter(r => r.is_active).length;
    const inactive = total - active;

    // Agrupar por tipo
    const byType: Record<string, number> = {};
    reminders.forEach(reminder => {
      byType[reminder.type] = (byType[reminder.type] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      byType
    };
  }

  // Converter dias da semana para nomes
  static getDayNames(daysOfWeek: number[]): string[] {
    const dayNames = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    return daysOfWeek.map(day => dayNames[day]).filter(Boolean);
  }

  // Formatar horário para exibição
  static formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
} 