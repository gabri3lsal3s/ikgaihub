import React, { useState } from 'react';
import { GoalCardProps } from '../../types';
import { GoalService } from '../../services/GoalService';
import { GoalProgress } from './GoalProgress';
import { 
  Target, 
  Calendar, 
  Edit, 
  Trash2, 
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  onUpdate, 
  onDelete, 
  onProgress 
}) => {
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(1);
  const [showProgressInput, setShowProgressInput] = useState(false);
  const [showDetailedProgress, setShowDetailedProgress] = useState(false);

  const progressPercentage = GoalService.calculateProgressPercentage(goal);
  const isNearDeadline = GoalService.isGoalNearDeadline(goal);
  const isOverdue = GoalService.isGoalOverdue(goal);

  const getStatusColor = () => {
    if (goal.status === 'completed') return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
    if (goal.status === 'paused') return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
    if (goal.status === 'cancelled') return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
    return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
  };

  const getPriorityColor = () => {
    switch (goal.priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = () => {
    switch (goal.type) {
      case 'exercise': return '💪';
      case 'nutrition': return '🥗';
      case 'general': return '🎯';
      default: return '📋';
    }
  };

  const handleAddProgress = async () => {
    if (progressValue <= 0) {
      toast.error('O valor do progresso deve ser maior que zero');
      return;
    }

    try {
      setIsAddingProgress(true);
      await onProgress(goal.id, progressValue);
      setProgressValue(1);
      setShowProgressInput(false);
    } catch (error) {
      console.error('Erro ao adicionar progresso:', error);
    } finally {
      setIsAddingProgress(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja remover esta meta?')) {
      try {
        await onDelete(goal.id);
      } catch (error) {
        console.error('Erro ao deletar meta:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon()}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {goal.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {goal.status === 'active' ? 'Ativa' : 
                 goal.status === 'completed' ? 'Concluída' :
                 goal.status === 'paused' ? 'Pausada' : 'Cancelada'}
              </span>
              <span className={`font-medium ${getPriorityColor()}`}>
                {goal.priority === 'high' ? 'Alta' :
                 goal.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowProgressInput(!showProgressInput)}
            className="p-1 text-gray-500 hover:text-ikigai-green transition-colors"
            title="Adicionar progresso"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onUpdate(goal)}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            title="Editar meta"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            title="Remover meta"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {goal.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            Progresso: {goal.current_value} / {goal.target_value} {goal.unit}
          </span>
          <div className="flex items-center gap-2">
          <span className="font-medium text-ikigai-green">
            {progressPercentage.toFixed(1)}%
          </span>
            <button
              onClick={() => setShowDetailedProgress(!showDetailedProgress)}
              className="p-1 text-gray-500 hover:text-ikigai-green transition-colors"
              title={showDetailedProgress ? "Ocultar detalhes" : "Ver detalhes"}
            >
              {showDetailedProgress ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-ikigai-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Progresso Detalhado */}
      {showDetailedProgress && (
        <div className="mb-3">
          <GoalProgress goal={goal} />
        </div>
      )}

      {/* Progress Input */}
      {showProgressInput && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={progressValue}
              onChange={(e) => setProgressValue(parseInt(e.target.value) || 1)}
              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
              placeholder="Valor do progresso"
            />
            <button
              onClick={handleAddProgress}
              disabled={isAddingProgress}
              className="btn btn-primary btn-sm"
            >
              {isAddingProgress ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{goal.period === 'daily' ? 'Diária' :
                   goal.period === 'weekly' ? 'Semanal' :
                   goal.period === 'monthly' ? 'Mensal' : 'Anual'}</span>
          </div>
          {goal.end_date && (
            <div className="flex items-center gap-1">
              <Target size={12} />
              <span>Até {formatDate(goal.end_date)}</span>
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-1">
          {goal.status === 'completed' && (
            <CheckCircle size={12} className="text-green-600" />
          )}
          {isNearDeadline && goal.status === 'active' && (
            <Clock size={12} className="text-yellow-600" />
          )}
          {isOverdue && (
            <AlertTriangle size={12} className="text-red-600" />
          )}
        </div>
      </div>

      {/* Warning messages */}
      {isOverdue && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
          ⚠️ Esta meta está atrasada!
        </div>
      )}
      
      {isNearDeadline && goal.status === 'active' && !isOverdue && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-600 dark:text-yellow-400">
          ⏰ Prazo se aproximando!
        </div>
      )}
    </div>
  );
}; 