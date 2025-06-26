export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          ingredients: string | null
          instructions: string | null
          prep_time: number | null
          calories: number | null
          meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional'
          is_preferred: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          ingredients?: string | null
          instructions?: string | null
          prep_time?: number | null
          calories?: number | null
          meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional'
          is_preferred?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          ingredients?: string | null
          instructions?: string | null
          prep_time?: number | null
          calories?: number | null
          meal_type?: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional'
          is_preferred?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meal_preferences: {
        Row: {
          id: string
          user_id: string
          meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack'
          recipe_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack'
          recipe_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_type?: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack'
          recipe_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          sets: number
          reps: number
          duration: number | null
          weight: number | null
          day_of_week: number
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          sets?: number
          reps?: number
          duration?: number | null
          weight?: number | null
          day_of_week: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          sets?: number
          reps?: number
          duration?: number | null
          weight?: number | null
          day_of_week?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      exercise_completions: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          completed_at: string
          sets_completed: number
          reps_completed: number
          weight_used: number | null
          duration_completed: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          completed_at?: string
          sets_completed: number
          reps_completed: number
          weight_used?: number | null
          duration_completed?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          completed_at?: string
          sets_completed?: number
          reps_completed?: number
          weight_used?: number | null
          duration_completed?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      recipe_completions: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          completed_at: string
          meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional'
          rating: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          completed_at?: string
          meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional'
          rating?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          completed_at?: string
          meal_type?: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack' | 'additional'
          rating?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      daily_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          exercises_completed: number
          recipes_completed: number
          total_calories: number
          total_exercise_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          exercises_completed?: number
          recipes_completed?: number
          total_calories?: number
          total_exercise_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          exercises_completed?: number
          recipes_completed?: number
          total_calories?: number
          total_exercise_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          activity_type: 'recipe_viewed' | 'exercise_completed' | 'preference_changed'
          activity_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: 'recipe_viewed' | 'exercise_completed' | 'preference_changed'
          activity_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: 'recipe_viewed' | 'exercise_completed' | 'preference_changed'
          activity_data?: Json | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          type: 'exercise' | 'nutrition' | 'general'
          target_value: number
          current_value: number
          unit: string
          period: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date: string | null
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          type: 'exercise' | 'nutrition' | 'general'
          target_value: number
          current_value?: number
          unit: string
          period: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date?: string
          end_date?: string | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          type?: 'exercise' | 'nutrition' | 'general'
          target_value?: number
          current_value?: number
          unit?: string
          period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date?: string
          end_date?: string | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      goal_progress: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          date: string
          value: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          date: string
          value?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          date?: string
          value?: number
          notes?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          type: string
          title: string
          description: string | null
          icon: string | null
          points: number
          unlocked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          type: string
          title: string
          description?: string | null
          icon?: string | null
          points?: number
          unlocked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          type?: string
          title?: string
          description?: string | null
          icon?: string | null
          points?: number
          unlocked_at?: string
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          reminder_type: 'meal' | 'exercise' | 'goal' | 'custom'
          target_date: string
          target_time: string | null
          is_recurring: boolean
          recurrence_pattern: string | null
          recurrence_days: number[] | null
          is_active: boolean
          notification_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          reminder_type: 'meal' | 'exercise' | 'goal' | 'custom'
          target_date: string
          target_time?: string | null
          is_recurring?: boolean
          recurrence_pattern?: string | null
          recurrence_days?: number[] | null
          is_active?: boolean
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          reminder_type?: 'meal' | 'exercise' | 'goal' | 'custom'
          target_date?: string
          target_time?: string | null
          is_recurring?: boolean
          recurrence_pattern?: string | null
          recurrence_days?: number[] | null
          is_active?: boolean
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reminder_schedules: {
        Row: {
          id: string
          reminder_id: string
          scheduled_time: string
          is_sent: boolean
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reminder_id: string
          scheduled_time: string
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reminder_id?: string
          scheduled_time?: string
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          push_enabled: boolean
          email_enabled: boolean
          reminder_advance_minutes: number
          quiet_hours_start: string
          quiet_hours_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          push_enabled?: boolean
          email_enabled?: boolean
          reminder_advance_minutes?: number
          quiet_hours_start?: string
          quiet_hours_end?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          push_enabled?: boolean
          email_enabled?: boolean
          reminder_advance_minutes?: number
          quiet_hours_start?: string
          quiet_hours_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      notification_history: {
        Row: {
          id: string
          user_id: string
          reminder_id: string | null
          notification_type: string
          title: string
          body: string | null
          is_read: boolean
          read_at: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reminder_id?: string | null
          notification_type: string
          title: string
          body?: string | null
          is_read?: boolean
          read_at?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reminder_id?: string | null
          notification_type?: string
          title?: string
          body?: string | null
          is_read?: boolean
          read_at?: string | null
          sent_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 