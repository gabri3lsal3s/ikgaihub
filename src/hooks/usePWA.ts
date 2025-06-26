import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  deferredPrompt: PWAInstallPromptEvent | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    canInstall: false,
    deferredPrompt: null
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Verificar se o app está instalado
  useEffect(() => {
    const checkInstallation = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true,
        isInstallable: !window.matchMedia('(display-mode: standalone)').matches
      }));
    };

    checkInstallation();
    window.addEventListener('beforeinstallprompt', checkInstallation);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallation);
    };
  }, []);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
      toast.success('Conexão restaurada!');
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }));
      toast.error('Você está offline. Algumas funcionalidades podem não estar disponíveis.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Capturar prompt de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as PWAInstallPromptEvent;
      
      setPwaState(prev => ({
        ...prev,
        canInstall: true,
        deferredPrompt: promptEvent
      }));

      toast.success('IkigaiHub pode ser instalado!', {
        duration: 5000
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Registrar Service Worker (com verificação para evitar duplicação)
  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Verificar se já existe um Service Worker registrado
          const existingRegistration = await navigator.serviceWorker.getRegistration();
          
          if (existingRegistration) {
            setRegistration(existingRegistration);
            console.log('Service Worker já registrado:', existingRegistration);
            return;
          }

          // Registrar novo Service Worker apenas se não existir
          const reg = await navigator.serviceWorker.register('/sw.js');
          setRegistration(reg);
          console.log('Service Worker registrado:', reg);
        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error);
        }
      }
    };

    registerSW();
  }, []);

  // Função para instalar o app
  const installApp = useCallback(async () => {
    if (pwaState.deferredPrompt) {
      try {
        await pwaState.deferredPrompt.prompt();
        const { outcome } = await pwaState.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          toast.success('IkigaiHub instalado com sucesso!');
          setPwaState(prev => ({
            ...prev,
            isInstalled: true,
            canInstall: false,
            deferredPrompt: null
          }));
        } else {
          toast('Instalação cancelada');
        }
      } catch (error) {
        console.error('Erro ao instalar app:', error);
        toast.error('Erro ao instalar o app');
      }
    }
  }, [pwaState.deferredPrompt]);

  // Função para solicitar permissão de notificações
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Permissão de notificações negada. Habilite nas configurações do navegador.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notificações habilitadas!');
        return true;
      } else {
        toast('Permissão de notificações negada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão de notificações');
      return false;
    }
  }, []);

  // Função para enviar notificação
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    try {
      const notification = new Notification(title, {
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    }
  }, [requestNotificationPermission]);

  // Função para sincronizar dados em background
  const syncInBackground = useCallback(async () => {
    if (registration && 'sync' in registration) {
      try {
        // @ts-ignore - sync existe em ServiceWorkerRegistration
        await registration.sync.register('background-sync');
        console.log('Background sync registrado');
      } catch (error) {
        console.error('Erro ao registrar background sync:', error);
      }
    }
  }, [registration]);

  // Função para verificar atualizações
  const checkForUpdates = useCallback(async () => {
    if (registration) {
      try {
        await registration.update();
        console.log('Verificação de atualizações concluída');
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      }
    }
  }, [registration]);

  // Função para atualizar o app
  const updateApp = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return {
    ...pwaState,
    installApp,
    requestNotificationPermission,
    sendNotification,
    syncInBackground,
    checkForUpdates,
    updateApp,
    registration
  };
}; 