import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ReminderService } from '../services/ReminderService';
import { NotificationService } from '../services/NotificationService';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // VERIFICAÇÃO DE SUPORTE
  // =====================================================

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // =====================================================
  // SOLICITAÇÃO DE PERMISSÃO
  // =====================================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      setLoading(true);
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Permissão para notificações concedida!');
        return true;
      } else {
        toast.error('Permissão para notificações negada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão para notificações');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  // =====================================================
  // INSCRIÇÃO PARA PUSH NOTIFICATIONS
  // =====================================================

  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      toast.error('Permissão para notificações necessária');
      return false;
    }

    try {
      setLoading(true);

      // Registrar service worker se necessário
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Verificar se já está inscrito
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        toast.success('Já inscrito para notificações push');
        return true;
      }

      // Criar nova inscrição
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY // Configurar no .env
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);

      // Enviar inscrição para o servidor (implementar quando tiver backend)
      // await sendSubscriptionToServer(newSubscription);

      toast.success('Inscrito para notificações push com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao inscrever para push notifications:', error);
      toast.error('Erro ao configurar notificações push');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      toast.error('Nenhuma inscrição ativa');
      return false;
    }

    try {
      setLoading(true);
      await subscription.unsubscribe();
      
      setSubscription(null);
      setIsSubscribed(false);

      // Remover inscrição do servidor (implementar quando tiver backend)
      // await removeSubscriptionFromServer(subscription);

      toast.success('Inscrição removida com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao remover inscrição:', error);
      toast.error('Erro ao remover inscrição');
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  // =====================================================
  // ENVIO DE NOTIFICAÇÕES
  // =====================================================

  const sendNotification = useCallback(async (
    title: string,
    options?: NotificationOptions & { reminderId?: string }
  ): Promise<void> => {
    if (!user) return;

    try {
      // Verificar permissão
      if (permission !== 'granted') {
        toast.error('Permissão para notificações necessária');
        return;
      }

      // Verificar configurações do usuário
      const settings = await ReminderService.getNotificationSettings(user.id);
      if (settings && !settings.push_enabled) {
        console.log('Notificações push desabilitadas pelo usuário');
        return;
      }

      // Verificar horário silencioso
      if (settings && ReminderService.isQuietHours(settings)) {
        console.log('Em horário silencioso, notificação não enviada');
        return;
      }

      // Enviar notificação
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: options?.reminderId || 'general',
        requireInteraction: false,
        silent: false,
        ...options
      });

      // Registrar no histórico
      await ReminderService.logNotification(user.id, {
        reminder_id: options?.reminderId,
        notification_type: 'push',
        title,
        body: options?.body
      });

      // Eventos da notificação
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navegar para a página relevante se for um lembrete
        if (options?.reminderId) {
          // Implementar navegação para página de lembretes
          window.location.href = '/reminders';
        }
      };

      notification.onclose = () => {
        console.log('Notificação fechada');
      };

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }, [user, permission]);

  // =====================================================
  // NOTIFICAÇÕES DE LEMBRETES
  // =====================================================

  const sendReminderNotification = useCallback(async (
    reminderId: string,
    title: string,
    body?: string
  ): Promise<void> => {
    await sendNotification(title, {
      body,
      reminderId,
      tag: `reminder-${reminderId}`,
      requireInteraction: true
    });
  }, [sendNotification]);

  // =====================================================
  // NOTIFICAÇÕES DE CONQUISTAS
  // =====================================================

  const sendAchievementNotification = useCallback(async (
    title: string,
    body: string
  ): Promise<void> => {
    await sendNotification(title, {
      body,
      tag: 'achievement',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      requireInteraction: false,
      silent: false
    });
  }, [sendNotification]);

  // =====================================================
  // NOTIFICAÇÕES DE SISTEMA
  // =====================================================

  const sendSystemNotification = useCallback(async (
    title: string,
    body: string
  ): Promise<void> => {
    await sendNotification(title, {
      body,
      tag: 'system',
      requireInteraction: false,
      silent: true
    });
  }, [sendNotification]);

  // =====================================================
  // GERENCIAMENTO DE NOTIFICAÇÕES
  // =====================================================

  const clearAllNotifications = useCallback((): void => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        });
      });
    }
  }, []);

  const getNotificationCount = useCallback((): number => {
    if ('serviceWorker' in navigator) {
      let count = 0;
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.getNotifications().then(notifications => {
            count += notifications.length;
          });
        });
      });
      return count;
    }
    return 0;
  }, []);

  // =====================================================
  // CONFIGURAÇÃO AUTOMÁTICA
  // =====================================================

  useEffect(() => {
    const setupNotifications = async () => {
      if (isSupported && permission === 'granted' && user) {
        await subscribeToPush();
      }
    };

    setupNotifications();
  }, [isSupported, permission, user, subscribeToPush]);

  return {
    // Estados
    permission,
    isSupported,
    isSubscribed,
    subscription,
    loading,

    // Ações
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendNotification,
    sendReminderNotification,
    sendAchievementNotification,
    sendSystemNotification,
    clearAllNotifications,
    getNotificationCount
  };
}; 