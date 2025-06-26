import React, { useState } from 'react';
import { useReminders } from '../hooks/useReminders';
import { useNotifications } from '../hooks/useNotifications';
import { ReminderType, RecurrencePattern } from '../types';
import { ReminderService } from '../services/ReminderService';
import { Bell, Plus, Clock, Calendar, Settings, Trash2, Edit, CheckCircle, XCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const RemindersPage: React.FC = () => {
  const {
    reminders,
    remindersWithSchedules,
    stats,
    notificationSettings,
    loading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminderActive,
    updateNotificationSettings,
    getTodayReminders,
    getUpcomingReminders,
    getOverdueReminders,
    refresh,
    clearError
  } = useReminders();

  const { requestPermission, isSubscribed } = useNotifications();

  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // =====================================================
  // ESTADOS DO FORMULÁRIO
  // =====================================================

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_type: 'custom' as ReminderType,
    target_date: new Date().toISOString().split('T')[0],
    target_time: '09:00',
    is_recurring: false,
    recurrence_pattern: 'daily' as RecurrencePattern,
    recurrence_days: [1, 2, 3, 4, 5] as number[],
    notification_enabled: true
  });

  // =====================================================
  // HANDLERS DO FORMULÁRIO
  // =====================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'recurrence_days') {
      const days = value.split(',').map(Number);
      setFormData(prev => ({ ...prev, [name]: days }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingReminder) {
        await updateReminder(editingReminder, formData);
        toast.success('Lembrete atualizado com sucesso!');
      } else {
        await createReminder(formData);
        toast.success('Lembrete criado com sucesso!');
      }
      
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminder_type: 'custom',
      target_date: new Date().toISOString().split('T')[0],
      target_time: '09:00',
      is_recurring: false,
      recurrence_pattern: 'daily',
      recurrence_days: [1, 2, 3, 4, 5],
      notification_enabled: true
    });
    setEditingReminder(null);
  };

  const handleEdit = (reminder: any) => {
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      reminder_type: reminder.reminder_type,
      target_date: reminder.target_date,
      target_time: reminder.target_time || '09:00',
      is_recurring: reminder.is_recurring,
      recurrence_pattern: reminder.recurrence_pattern || 'daily',
      recurrence_days: reminder.recurrence_days || [1, 2, 3, 4, 5],
      notification_enabled: reminder.notification_enabled
    });
    setEditingReminder(reminder.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
      try {
        await deleteReminder(id);
        toast.success('Lembrete excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir lembrete:', error);
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleReminderActive(id, isActive);
      toast.success(`Lembrete ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status do lembrete:', error);
    }
  };

  // =====================================================
  // RENDERIZAÇÃO DOS COMPONENTES
  // =====================================================

  const renderReminderCard = (reminder: any) => {
    const icon = ReminderService.getReminderIcon(reminder.reminder_type);
    const formattedDateTime = ReminderService.formatDateTime(reminder.target_date, reminder.target_time);
    const isOverdue = reminder.schedules?.some((s: any) => !s.is_sent && new Date(s.scheduled_time) < new Date());
    const nextSchedule = reminder.next_schedule || reminder.schedules?.[0];

    const handleMarkAsCompleted = async () => {
      try {
        if (nextSchedule?.id) {
          await ReminderService.markScheduleAsSent(nextSchedule.id);
          toast.success('Lembrete marcado como concluído!');
          setTimeout(() => {
            refresh();
          }, 500);
        } else {
          toast.error('Agendamento não encontrado');
        }
      } catch (error) {
        console.error('Erro ao marcar lembrete como concluído:', error);
        toast.error('Erro ao marcar lembrete como concluído');
      }
    };

    return (
      <div key={reminder.id} className={`card p-6 border-l-4 ${
        isOverdue ? 'border-red-500' : 'border-ikigai-green'
      }`}>
        <div className="flex items-start justify-between w-full min-h-0">
          <div className="flex-1 min-w-0 mr-6">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white break-words text-lg">{reminder.title}</h3>
              </div>
              {reminder.is_recurring && (
                <span className="px-3 py-1 text-xs bg-ikigai-green/10 text-ikigai-green rounded-full flex-shrink-0">
                  Recorrente
                </span>
              )}
            </div>
            
            {reminder.description && (
              <div className="ml-12 mb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm break-words leading-relaxed">
                  {reminder.description}
                </p>
              </div>
            )}
            
            <div className="ml-12 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="break-words font-medium">{formattedDateTime}</span>
              </div>
              
              {reminder.next_schedule && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">
                    Próximo: {new Date(reminder.next_schedule.scheduled_time).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Botão de conclusão para lembretes ativos */}
            {reminder.is_active && nextSchedule && !nextSchedule.is_sent && (
              <button
                onClick={handleMarkAsCompleted}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                title="Marcar como concluído"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => handleToggleActive(reminder.id, !reminder.is_active)}
              className={`p-2 rounded-full transition-colors ${
                reminder.is_active 
                  ? 'bg-ikigai-green/10 text-ikigai-green hover:bg-ikigai-green/20' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={reminder.is_active ? 'Desativar' : 'Ativar'}
            >
              {reminder.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => handleEdit(reminder)}
              className="p-2 text-ikigai-green hover:bg-ikigai-green/10 rounded-full transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDelete(reminder.id)}
              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="card p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>
          
          <div>
            <label className="label">
              Tipo
            </label>
            <select
              name="reminder_type"
              value={formData.reminder_type}
              onChange={handleInputChange}
              className="input"
            >
              <option value="custom">Personalizado</option>
              <option value="meal">Refeição</option>
              <option value="exercise">Exercício</option>
              <option value="goal">Meta</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="label">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="input"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              Data *
            </label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>
          
          <div>
            <label className="label">
              Horário
            </label>
            <input
              type="time"
              name="target_time"
              value={formData.target_time}
              onChange={handleInputChange}
              className="input"
            />
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="notification_enabled"
                checked={formData.notification_enabled}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Notificação</span>
            </label>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              name="is_recurring"
              checked={formData.is_recurring}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lembrete recorrente</span>
          </label>
          
          {formData.is_recurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Padrão de recorrência
                </label>
                <select
                  name="recurrence_pattern"
                  value={formData.recurrence_pattern}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              
              {formData.recurrence_pattern === 'weekly' && (
                <div>
                  <label className="label">
                    Dias da semana
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.recurrence_days.includes(index)}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...formData.recurrence_days, index]
                              : formData.recurrence_days.filter(d => d !== index);
                            setFormData(prev => ({ ...prev, recurrence_days: days }));
                          }}
                          className="mr-1"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {editingReminder ? 'Atualizar' : 'Criar'} Lembrete
          </button>
        </div>
      </form>
    </div>
  );

  // =====================================================
  // RENDERIZAÇÃO PRINCIPAL
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lembretes</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie seus lembretes e notificações</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Novo Lembrete
            </button>
          </div>
        </div>

        {/* Configurações de Notificação */}
        {showSettings && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Configurações de Notificação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={notificationSettings?.push_enabled ?? true}
                    onChange={(e) => updateNotificationSettings({ push_enabled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificações Push</span>
                </label>
                
                {!isSubscribed && (
                  <button
                    onClick={requestPermission}
                    className="btn btn-primary"
                  >
                    Ativar Notificações
                  </button>
                )}
              </div>
              
              <div>
                <label className="label">
                  Antecedência (minutos)
                </label>
                <input
                  type="number"
                  value={notificationSettings?.reminder_advance_minutes ?? 15}
                  onChange={(e) => updateNotificationSettings({ reminder_advance_minutes: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        {showForm && renderForm()}

        {/* Lista de Lembretes */}
        <div className="space-y-6">
          {/* Lembretes Atrasados */}
          {getOverdueReminders().length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Lembretes Atrasados
              </h2>
              <div className="space-y-4">
                {getOverdueReminders().map(renderReminderCard)}
              </div>
            </div>
          )}

          {/* Lembretes de Hoje */}
          {getTodayReminders().length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-ikigai-green mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lembretes de Hoje
              </h2>
              <div className="space-y-4">
                {getTodayReminders().map(renderReminderCard)}
              </div>
            </div>
          )}

          {/* Próximos Lembretes */}
          {getUpcomingReminders().length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-ikigai-black mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Próximos Lembretes
              </h2>
              <div className="space-y-4">
                {getUpcomingReminders().map(renderReminderCard)}
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {remindersWithSchedules.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhum lembrete encontrado</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Crie seu primeiro lembrete para começar</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Lembrete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindersPage; 