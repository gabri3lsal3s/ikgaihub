import React, { useState } from 'react';
import { Download, X, Wifi, WifiOff, Bell, BellOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  className = '' 
}) => {
  const {
    isInstalled,
    isOnline,
    canInstall,
    installApp,
    requestNotificationPermission,
    sendNotification
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  const handleInstall = async () => {
    await installApp();
    setShowInstallPrompt(false);
  };

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(Notification.permission);
    
    if (granted) {
      // Teste de notificação
      await sendNotification('IkigaiHub', {
        body: 'Notificações habilitadas com sucesso!',
        tag: 'test-notification'
      });
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  // Não mostrar se já está instalado
  if (isInstalled) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Status Online/Offline */}
      <div className="mb-2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Prompt de Instalação */}
      {showInstallPrompt && canInstall && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-ikigai-green" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Instalar IkigaiHub
              </h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Instale o IkigaiHub para uma melhor experiência! Acesse rapidamente da tela inicial.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="btn btn-primary btn-sm flex-1"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="btn btn-outline btn-sm"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* Botão de Notificações */}
      <div className="mt-2">
        <button
          onClick={handleNotificationPermission}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            notificationPermission === 'granted'
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {notificationPermission === 'granted' ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          <span>
            {notificationPermission === 'granted' ? 'Notificações Ativas' : 'Habilitar Notificações'}
          </span>
        </button>
      </div>
    </div>
  );
}; 