-- =====================================================
-- Script para criar tabelas de progresso no Supabase
-- =====================================================

-- Habilitar extensão uuid-ossp se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELAS DE PROGRESSO
-- =====================================================

-- Tabela de conclusões de exercícios
CREATE TABLE IF NOT EXISTS exercise_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sets_completed INTEGER NOT NULL,
  reps_completed INTEGER NOT NULL,
  weight_used DECIMAL(5,2), -- em kg
  duration_completed INTEGER, -- em segundos
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conclusões de receitas
CREATE TABLE IF NOT EXISTS recipe_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  meal_type VARCHAR(50) NOT NULL CHECK (
    meal_type IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'night_snack', 'additional')
  ),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- avaliação de 1 a 5
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estatísticas diárias (cache para performance)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercises_completed INTEGER DEFAULT 0,
  recipes_completed INTEGER DEFAULT 0,
  total_calories INTEGER DEFAULT 0,
  total_exercise_time INTEGER DEFAULT 0, -- em segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para conclusões de exercícios
CREATE INDEX IF NOT EXISTS idx_exercise_completions_user_id ON exercise_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_exercise_id ON exercise_completions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_completed_at ON exercise_completions(completed_at);

-- Índices para conclusões de receitas
CREATE INDEX IF NOT EXISTS idx_recipe_completions_user_id ON recipe_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_completions_recipe_id ON recipe_completions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_completions_completed_at ON recipe_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_recipe_completions_meal_type ON recipe_completions(meal_type);

-- Índices para estatísticas
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at em daily_stats
CREATE TRIGGER update_daily_stats_updated_at 
  BEFORE UPDATE ON daily_stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estatísticas diárias
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas quando um exercício for completado
  IF TG_TABLE_NAME = 'exercise_completions' THEN
    INSERT INTO daily_stats (user_id, date, exercises_completed)
    VALUES (NEW.user_id, DATE(NEW.completed_at), 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET 
      exercises_completed = daily_stats.exercises_completed + 1,
      updated_at = NOW();
  END IF;

  -- Atualizar estatísticas quando uma receita for completada
  IF TG_TABLE_NAME = 'recipe_completions' THEN
    INSERT INTO daily_stats (user_id, date, recipes_completed)
    VALUES (NEW.user_id, DATE(NEW.completed_at), 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET 
      recipes_completed = daily_stats.recipes_completed + 1,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar estatísticas
CREATE TRIGGER update_stats_on_exercise_completion 
  AFTER INSERT ON exercise_completions
  FOR EACH ROW EXECUTE FUNCTION update_daily_stats();

CREATE TRIGGER update_stats_on_recipe_completion 
  AFTER INSERT ON recipe_completions
  FOR EACH ROW EXECUTE FUNCTION update_daily_stats();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para conclusões de exercícios
CREATE POLICY "Users can view their own exercise completions" ON exercise_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise completions" ON exercise_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise completions" ON exercise_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise completions" ON exercise_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para conclusões de receitas
CREATE POLICY "Users can view their own recipe completions" ON recipe_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipe completions" ON recipe_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipe completions" ON recipe_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe completions" ON recipe_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para estatísticas diárias
CREATE POLICY "Users can view their own daily stats" ON daily_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats" ON daily_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily stats" ON daily_stats
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE exercise_completions IS 'Registro de conclusões de exercícios';
COMMENT ON TABLE recipe_completions IS 'Registro de conclusões de receitas';
COMMENT ON TABLE daily_stats IS 'Estatísticas diárias de progresso (cache)';

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 