import React, { useState, useMemo } from 'react';
import { useGoals } from '../hooks/useGoals';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { GoalAchievements } from '../components/goals/GoalAchievements';
import { Goal, CreateGoalForm, UpdateGoalForm } from '../types';
import { 
  Plus, 
  Target, 
  Filter,
  Trophy
} from 'lucide-react';

const GoalsPage: React.FC = () => {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal, addProgress } = useGoals();
  
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'exercise' | 'nutrition' | 'general'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'paused' | 'cancelled'>('all');
  const [showAchievements, setShowAchievements] = useState(false);

  // Filtrar metas
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const typeMatch = filterType === 'all' || goal.type === filterType;
      const statusMatch = filterStatus === 'all' || goal.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }, [goals, filterType, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = goals.length;
    const active = goals.filter(g => g.status === 'active').length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const overdue = goals.filter(g => {
      if (!g.end_date || g.status !== 'active') return false;
      const endDate = new Date(g.end_date);
      return endDate < new Date();
    }).length;
    const nearDeadline = goals.filter(g => {
      if (!g.end_date || g.status !== 'active') return false;
      const endDate = new Date(g.end_date);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    return { total, active, completed, overdue, nearDeadline };
  }, [goals]);

  const handleCreateGoal = async (data: CreateGoalForm) => {
    try {
      await createGoal(data);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao criar meta:', error);
    }
  };

  const handleUpdateGoal = async (data: UpdateGoalForm) => {
    if (!editingGoal) return;
    
    try {
      await updateGoal(editingGoal.id, data);
      setEditingGoal(null);
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
    }
  };

  const handleAddProgress = async (goalId: string, value: number) => {
    try {
      await addProgress(goalId, value);
    } catch (error) {
      console.error('Erro ao adicionar progresso:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleSubmit = async (data: CreateGoalForm | UpdateGoalForm) => {
    if (editingGoal) {
      await handleUpdateGoal(data as UpdateGoalForm);
    } else {
      await handleCreateGoal(data as CreateGoalForm);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ikigai-green mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando metas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-6 border border-red-200 dark:border-red-800">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Erro ao carregar metas
            </p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Minhas Metas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Defina e acompanhe seus objetivos de saúde e bem-estar
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Trophy size={16} />
            {showAchievements ? 'Ocultar' : 'Ver'} Conquistas
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Meta
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-ikigai-green mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total de Metas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.active}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Ativas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Concluídas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.nearDeadline}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Próximas do Prazo</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">{stats.overdue}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Atrasadas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Filtro por tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'exercise' | 'nutrition' | 'general')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os tipos</option>
              <option value="exercise">Exercício</option>
              <option value="nutrition">Nutrição</option>
              <option value="general">Geral</option>
            </select>

            {/* Filtro por status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed' | 'paused' | 'cancelled')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativas</option>
              <option value="completed">Concluídas</option>
              <option value="paused">Pausadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conquistas */}
      {showAchievements && (
        <div className="mb-8">
          <GoalAchievements />
        </div>
      )}

      {/* Lista de Metas */}
      {filteredGoals.length === 0 ? (
        <div className="card p-8 text-center">
          <Target size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {goals.length === 0 ? 'Nenhuma meta criada' : 'Nenhuma meta encontrada'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {goals.length === 0 
              ? 'Comece criando sua primeira meta para acompanhar seu progresso!'
              : 'Tente ajustar os filtros para encontrar suas metas.'
            }
          </p>
          {goals.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Criar Primeira Meta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={handleEditGoal}
              onDelete={handleDeleteGoal}
              onProgress={handleAddProgress}
            />
          ))}
        </div>
      )}

      {/* Formulário */}
      <GoalForm
        goal={editingGoal}
        isOpen={showForm || !!editingGoal}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default GoalsPage; 