import React from 'react';
import { useReminders } from '../../hooks/useReminders';
import { ReminderService } from '../../services/ReminderService';
import { Bell, Clock, Calendar, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ReminderWidget: React.FC = () => {
  const { 
    getTodayReminders, 
    getUpcomingReminders, 
    getOverdueReminders,
    stats,
    loading,
    refresh
  } = useReminders();

  const todayReminders = getTodayReminders();
  const upcomingReminders = getUpcomingReminders();
  const overdueReminders = getOverdueReminders();

  const handleMarkAsCompleted = async (reminderId: string, scheduleId?: string) => {
    try {
      if (scheduleId) {
        await ReminderService.markScheduleAsSent(scheduleId);
        toast.success('Lembrete marcado como concluído!');
      } else {
        toast.error('Agendamento não encontrado');
        return;
      }
      // Aguardar um pouco antes de atualizar para dar tempo do banco processar
      setTimeout(() => {
        refresh();
      }, 500);
    } catch (error) {
      console.error('Erro ao marcar lembrete como concluído:', error);
      toast.error('Erro ao marcar lembrete como concluído');
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalReminders = (stats?.today_reminders || 0) + (stats?.upcoming_reminders || 0);
  const hasOverdue = overdueReminders.length > 0;

  const ReminderItem: React.FC<{
    reminder: any;
    showActions?: boolean;
  }> = ({ reminder, showActions = true }) => {
    const nextSchedule = reminder.next_schedule || reminder.schedules?.[0];
    
    return (
      <div className="flex items-start justify-between group w-full min-h-0">
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-sm flex-shrink-0 mt-0.5">{ReminderService.getReminderIcon(reminder.reminder_type)}</span>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm text-gray-700 dark:text-gray-300 font-medium break-words">
                {reminder.title}
              </h4>
            </div>
          </div>
          {reminder.description && (
            <div className="ml-6 mb-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 break-words leading-relaxed">
                {reminder.description}
              </p>
            </div>
          )}
          {nextSchedule && (
            <div className="ml-6">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {reminder.target_time || new Date(nextSchedule.scheduled_time).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          )}
        </div>
        {showActions && (
          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleMarkAsCompleted(reminder.id, nextSchedule?.id)}
              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
              title="Marcar como concluído"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-ikigai-green" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lembretes</h3>
        </div>
        <Link 
          to="/reminders"
          className="text-sm text-ikigai-green hover:text-ikigai-green-dark font-medium"
        >
          Ver todos
        </Link>
      </div>

      {/* Lista de lembretes */}
      <div className="space-y-3">
        {/* Lembretes atrasados */}
        {hasOverdue && (
          <div className="border-l-4 border-red-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Atrasados</span>
            </div>
            <div className="space-y-2">
              {overdueReminders.slice(0, 2).map((reminder) => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))}
            </div>
            {overdueReminders.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                +{overdueReminders.length - 2} mais
              </div>
            )}
          </div>
        )}

        {/* Lembretes de hoje */}
        {todayReminders.length > 0 && (
          <div className="border-l-4 border-ikigai-green pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-ikigai-green" />
              <span className="text-sm font-medium text-ikigai-green">Hoje</span>
            </div>
            <div className="space-y-2">
              {todayReminders.slice(0, 3).map((reminder) => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))}
            </div>
            {todayReminders.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                +{todayReminders.length - 3} mais
              </div>
            )}
          </div>
        )}

        {/* Próximos lembretes */}
        {upcomingReminders.length > 0 && !hasOverdue && todayReminders.length === 0 && (
          <div className="border-l-4 border-ikigai-black pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-ikigai-black" />
              <span className="text-sm font-medium text-ikigai-black">Próximos</span>
            </div>
            <div className="space-y-2">
              {upcomingReminders.slice(0, 3).map((reminder) => (
                <ReminderItem key={reminder.id} reminder={reminder} showActions={false} />
              ))}
            </div>
            {upcomingReminders.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                +{upcomingReminders.length - 3} mais
              </div>
            )}
          </div>
        )}

        {/* Estado vazio */}
        {totalReminders === 0 && (
          <div className="text-center py-4">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum lembrete agendado</p>
            <Link 
              to="/reminders"
              className="text-xs text-ikigai-green hover:text-ikigai-green-dark mt-1 inline-block"
            >
              Criar lembrete
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderWidget; 