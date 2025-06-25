import React from 'react';
import { RefreshCw } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  loading = false,
  onRefresh,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bem-vindo ao seu hub de ferramentas de saúde
          </p>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn btn-outline btn-sm flex items-center gap-2"
          >
            <RefreshCw 
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
            />
            Atualizar
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-ikigai-green" />
            <span className="text-gray-600 dark:text-gray-400">
              Carregando dados...
            </span>
          </div>
        </div>
      )}

      {/* Conteúdo do Dashboard */}
      {!loading && (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}; 