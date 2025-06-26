import { useEffect } from 'react';
import { NotificationService } from '../services/NotificationService';

export const useNotifications = () => {
  useEffect(() => {
    // Configurar notificações periódicas quando o componente montar
    NotificationService.setupPeriodicNotifications();
    
    // Verificar notificações imediatamente
    NotificationService.checkDeadlineNotifications();
  }, []);
}; 