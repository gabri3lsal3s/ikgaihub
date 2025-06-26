import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  className = '' 
}) => {
  const { isOnline, checkForUpdates } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">
          Você está offline. Algumas funcionalidades podem não estar disponíveis.
        </span>
        <button
          onClick={checkForUpdates}
          className="ml-2 p-1 hover:bg-red-600 rounded transition-colors"
          title="Verificar conexão"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}; 