import React from 'react';
import { useReminders } from '../../hooks/useReminders';
import { ReminderService } from '../../services/ReminderService';
import { Bell, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReminderWidget: React.FC = () => {
  const { 
    getTodayReminders, 
    getUpcomingReminders, 
    getOverdueReminders,
    stats,
    loading 
  } = useReminders();

  const todayReminders = getTodayReminders();
  const upcomingReminders = getUpcomingReminders();
  const overdueReminders = getOverdueReminders();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Lembretes</h3>
        </div>
        <Link 
          to="/reminders"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos
        </Link>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${hasOverdue ? 'text-red-600' : 'text-blue-600'}`}>
            {totalReminders}
          </div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats?.today_reminders || 0}
          </div>
          <div className="text-xs text-gray-600">Hoje</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats?.upcoming_reminders || 0}
          </div>
          <div className="text-xs text-gray-600">Próximos</div>
        </div>
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
            {overdueReminders.slice(0, 2).map((reminder) => (
              <div key={reminder.id} className="text-sm text-gray-700 mb-1">
                {ReminderService.getReminderIcon(reminder.reminder_type)} {reminder.title}
              </div>
            ))}
            {overdueReminders.length > 2 && (
              <div className="text-xs text-gray-500">
                +{overdueReminders.length - 2} mais
              </div>
            )}
          </div>
        )}

        {/* Lembretes de hoje */}
        {todayReminders.length > 0 && (
          <div className="border-l-4 border-blue-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">Hoje</span>
            </div>
            {todayReminders.slice(0, 3).map((reminder) => (
              <div key={reminder.id} className="text-sm text-gray-700 mb-1">
                {ReminderService.getReminderIcon(reminder.reminder_type)} {reminder.title}
                {reminder.target_time && (
                  <span className="text-xs text-gray-500 ml-2">
                    {reminder.target_time}
                  </span>
                )}
              </div>
            ))}
            {todayReminders.length > 3 && (
              <div className="text-xs text-gray-500">
                +{todayReminders.length - 3} mais
              </div>
            )}
          </div>
        )}

        {/* Próximos lembretes */}
        {upcomingReminders.length > 0 && !hasOverdue && todayReminders.length === 0 && (
          <div className="border-l-4 border-purple-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">Próximos</span>
            </div>
            {upcomingReminders.slice(0, 3).map((reminder) => (
              <div key={reminder.id} className="text-sm text-gray-700 mb-1">
                {ReminderService.getReminderIcon(reminder.reminder_type)} {reminder.title}
                {reminder.next_schedule && (
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(reminder.next_schedule.scheduled_time).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            ))}
            {upcomingReminders.length > 3 && (
              <div className="text-xs text-gray-500">
                +{upcomingReminders.length - 3} mais
              </div>
            )}
          </div>
        )}

        {/* Estado vazio */}
        {totalReminders === 0 && (
          <div className="text-center py-4">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhum lembrete agendado</p>
            <Link 
              to="/reminders"
              className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
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