import React, { useState } from 'react';
import { useReminders } from '../hooks/useReminders';
import { useNotifications } from '../hooks/useNotifications';
import { ReminderType, RecurrencePattern } from '../types';
import { ReminderService } from '../services/ReminderService';
import { Bell, Plus, Clock, Calendar, Settings, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
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

    return (
      <div key={reminder.id} className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
        isOverdue ? 'border-red-500' : 'border-blue-500'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{icon}</span>
              <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
              {reminder.is_recurring && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Recorrente
                </span>
              )}
            </div>
            
            {reminder.description && (
              <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formattedDateTime}
              </div>
              
              {reminder.next_schedule && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Próximo: {new Date(reminder.next_schedule.scheduled_time).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleActive(reminder.id, !reminder.is_active)}
              className={`p-2 rounded-full ${
                reminder.is_active 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {reminder.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => handleEdit(reminder)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDelete(reminder.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              name="reminder_type"
              value={formData.reminder_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Personalizado</option>
              <option value="meal">Refeição</option>
              <option value="exercise">Exercício</option>
              <option value="goal">Meta</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horário
            </label>
            <input
              type="time"
              name="target_time"
              value={formData.target_time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <span className="text-sm text-gray-700">Notificação</span>
            </label>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              name="is_recurring"
              checked={formData.is_recurring}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Lembrete recorrente</span>
          </label>
          
          {formData.is_recurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Padrão de recorrência
                </label>
                <select
                  name="recurrence_pattern"
                  value={formData.recurrence_pattern}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              
              {formData.recurrence_pattern === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editingReminder ? 'Atualizar' : 'Criar'} Lembrete
          </button>
        </div>
      </form>
    </div>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total_reminders}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active_reminders}</div>
          <div className="text-sm text-gray-600">Ativos</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.today_reminders}</div>
          <div className="text-sm text-gray-600">Hoje</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.upcoming_reminders}</div>
          <div className="text-sm text-gray-600">Próximos</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.completed_today}</div>
          <div className="text-sm text-gray-600">Concluídos</div>
        </div>
      </div>
    );
  };

  // =====================================================
  // RENDERIZAÇÃO PRINCIPAL
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lembretes</h1>
            <p className="text-gray-600">Gerencie seus lembretes e notificações</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Novo Lembrete
            </button>
          </div>
        </div>

        {/* Configurações de Notificação */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Configurações de Notificação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={notificationSettings?.push_enabled ?? true}
                    onChange={(e) => updateNotificationSettings({ push_enabled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Notificações Push</span>
                </label>
                
                {!isSubscribed && (
                  <button
                    onClick={requestPermission}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Ativar Notificações
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antecedência (minutos)
                </label>
                <input
                  type="number"
                  value={notificationSettings?.reminder_advance_minutes ?? 15}
                  onChange={(e) => updateNotificationSettings({ reminder_advance_minutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {renderStats()}

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getOverdueReminders().map(renderReminderCard)}
              </div>
            </div>
          )}

          {/* Lembretes de Hoje */}
          {getTodayReminders().length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lembretes de Hoje
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTodayReminders().map(renderReminderCard)}
              </div>
            </div>
          )}

          {/* Próximos Lembretes */}
          {getUpcomingReminders().length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Próximos Lembretes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getUpcomingReminders().map(renderReminderCard)}
              </div>
            </div>
          )}

          {/* Todos os Lembretes */}
          {reminders.length === 0 && !loading && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lembrete criado</h3>
              <p className="text-gray-600 mb-4">Crie seu primeiro lembrete para começar a organizar sua rotina</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Criar Primeiro Lembrete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindersPage; 