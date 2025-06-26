// =====================================================
// Tipos Principais - IkigaiHub
// =====================================================

import { ReactNode } from 'react';

// Tipos de refeição
export type MealType = 
  | 'breakfast'      // Café da manhã (7h)
  | 'morning_snack'  // Lanche da manhã (10h)
  | 'lunch'          // Almoço (12h)
  | 'afternoon_snack' // Lanche da tarde (15h)
  | 'dinner'         // Jantar (19h)
  | 'night_snack'    // Ceia (21h)
  | 'additional';    // Receitas adicionais (sem limite)

// Tipo de atividade para logs
export type ActivityType = 
  | 'recipe_viewed'
  | 'exercise_completed'
  | 'preference_changed';

// Interface da Receita
export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  ingredients?: string;
  instructions?: string;
  prep_time?: number; // em minutos
  calories?: number;
  meal_type: MealType;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
}

// Interface da Preferência de Refeição
export interface MealPreference {
  id: string;
  user_id: string;
  meal_type: MealType;
  recipe_id: string;
  created_at: string;
  updated_at: string;
}

// Interface do Exercício
export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sets: number;
  reps: number;
  duration?: number; // em segundos
  weight?: number; // em kg
  day_of_week: number; // 0=domingo, 6=sábado
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Interface do Log de Atividade
export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  activity_data?: Record<string, unknown>;
  created_at: string;
}

// Interface do Usuário (extensão do Supabase Auth)
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Interface para criação de receita (sem ID e timestamps)
export interface CreateRecipeData {
  name: string;
  ingredients?: string;
  instructions?: string;
  prep_time?: number;
  calories?: number;
  meal_type: MealType;
}

// Interface para atualização de receita
export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  is_preferred?: boolean;
}

// Interface para criação de exercício
export interface CreateExerciseData {
  name: string;
  description?: string;
  sets: number;
  reps: number;
  duration?: number;
  weight?: number;
  day_of_week: number;
  order_index?: number;
}

// Interface para atualização de exercício
export type UpdateExerciseData = Partial<CreateExerciseData>;

// Interface para criação de preferência
export interface CreateMealPreferenceData {
  meal_type: MealType;
  recipe_id: string;
}

// Interface para resposta da API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Interface para estado de carregamento
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Interface para paginação
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: string | null;
}

// Interface para filtros de receitas
export interface RecipeFilters {
  meal_type?: MealType;
  is_preferred?: boolean;
  search?: string;
}

// Interface para filtros de exercícios
export interface ExerciseFilters {
  day_of_week?: number;
  search?: string;
}

// Interface para filtros de progresso
export interface ProgressFilters {
  period: 'weekly' | 'monthly' | 'yearly';
  start_date?: string;
  end_date?: string;
  meal_type?: MealType;
}

// Interface para configurações do usuário
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: 'pt-BR' | 'en';
}

// Interface para estatísticas do dashboard
export interface DashboardStats {
  totalRecipes: number;
  totalExercises: number;
  preferredRecipes: number;
  exercisesThisWeek: number;
}

// Interface para dados do dashboard home
export interface DashboardData {
  currentMeal: MealType | null;
  currentRecipe: Recipe | null;
  todayExercises: Exercise[];
  stats: DashboardStats;
}

// Interface para contexto de autenticação
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
}

// Interface para contexto de dados
export interface DataContextType {
  recipes: Recipe[];
  exercises: Exercise[];
  preferences: MealPreference[];
  loading: LoadingState;
  refreshData: () => Promise<void>;
  createRecipe: (data: CreateRecipeData) => Promise<{ error: string | null }>;
  updateRecipe: (id: string, data: UpdateRecipeData) => Promise<{ error: string | null }>;
  deleteRecipe: (id: string) => Promise<{ error: string | null }>;
  createExercise: (data: CreateExerciseData) => Promise<{ error: string | null }>;
  updateExercise: (id: string, data: UpdateExerciseData) => Promise<{ error: string | null }>;
  deleteExercise: (id: string) => Promise<{ error: string | null }>;
  setPreference: (data: CreateMealPreferenceData) => Promise<{ error: string | null }>;
}

// Interface para navegação
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  active?: boolean;
}

// Interface para notificações
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Interface para formulários
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: unknown; // Zod schema
}

// Interface para componentes de UI
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'soft' | 'medium' | 'large';
}

// Interface para horários das refeições
export interface MealSchedule {
  type: MealType;
  name: string;
  time: string;
  hour: number;
}

// Constantes
export const MEAL_SCHEDULE: MealSchedule[] = [
  { type: 'breakfast', name: 'Café da Manhã', time: '07:00', hour: 7 },
  { type: 'morning_snack', name: 'Lanche da Manhã', time: '10:00', hour: 10 },
  { type: 'lunch', name: 'Almoço', time: '12:00', hour: 12 },
  { type: 'afternoon_snack', name: 'Lanche da Tarde', time: '15:00', hour: 15 },
  { type: 'dinner', name: 'Jantar', time: '19:00', hour: 19 },
  { type: 'night_snack', name: 'Ceia', time: '21:00', hour: 21 },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

// =====================================================
// FIM DOS TIPOS
// =====================================================

// Tipos para o sistema de metas
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: 'exercise' | 'nutrition' | 'general';
  target_value: number;
  current_value: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  user_id: string;
  date: string;
  value: number;
  notes: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  goal_id: string | null;
  type: string;
  title: string;
  description: string | null;
  icon: string | null;
  points: number;
  unlocked_at: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: 'exercise' | 'meal' | 'goal' | 'general';
  time: string;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para formulários
export interface CreateGoalForm {
  title: string;
  description?: string;
  type: 'exercise' | 'nutrition' | 'general';
  target_value: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UpdateGoalForm {
  title?: string;
  description?: string;
  target_value?: number;
  unit?: string;
  end_date?: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateReminderForm {
  title: string;
  description?: string;
  type: 'exercise' | 'meal' | 'goal' | 'general';
  time: string;
  days_of_week: number[];
}

// Tipos para estatísticas de metas
export interface GoalStats {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  completion_rate: number;
  total_points: number;
}

export interface GoalProgressData {
  date: string;
  value: number;
  cumulative_value: number;
}

// Tipos para componentes
export interface GoalCardProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onProgress: (goalId: string, value: number) => void;
}

export interface AchievementCardProps {
  achievement: Achievement;
}

export interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

// Tipos para hooks
export interface UseGoalsReturn {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  createGoal: (data: CreateGoalForm) => Promise<void>;
  updateGoal: (id: string, data: UpdateGoalForm) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addProgress: (goalId: string, value: number, date?: string) => Promise<void>;
  refresh: () => void;
}

export interface UseAchievementsReturn {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  totalPoints: number;
  refresh: () => void;
}

export interface UseRemindersReturn {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  createReminder: (data: CreateReminderForm) => Promise<void>;
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string, isActive: boolean) => Promise<void>;
  refresh: () => void;
}

// =====================================================
// TIPOS DO SISTEMA DE LEMBRETES
// =====================================================

export type ReminderType = 'meal' | 'exercise' | 'goal' | 'custom';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';
export type NotificationType = 'push' | 'email' | 'in_app';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_type: ReminderType;
  target_date: string;
  target_time: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  recurrence_days: number[] | null;
  is_active: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderSchedule {
  id: string;
  reminder_id: string;
  scheduled_time: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  reminder_advance_minutes: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationHistory {
  id: string;
  user_id: string;
  reminder_id: string | null;
  notification_type: NotificationType;
  title: string;
  body: string | null;
  is_read: boolean;
  read_at: string | null;
  sent_at: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_type: ReminderType;
  target_date: string;
  target_time?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_days?: number[];
  notification_enabled?: boolean;
}

export interface UpdateReminderData {
  title?: string;
  description?: string;
  reminder_type?: ReminderType;
  target_date?: string;
  target_time?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_days?: number[];
  is_active?: boolean;
  notification_enabled?: boolean;
}

export interface ReminderWithSchedule extends Reminder {
  schedules?: ReminderSchedule[];
  next_schedule?: ReminderSchedule;
}

export interface ReminderStats {
  total_reminders: number;
  active_reminders: number;
  today_reminders: number;
  upcoming_reminders: number;
  completed_today: number;
}

// =====================================================
// FIM DOS TIPOS DO SISTEMA DE LEMBRETES
// ===================================================== 