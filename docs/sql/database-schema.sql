-- =====================================================
-- Esquema de Banco de Dados - IkigaiHub
-- Supabase PostgreSQL
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Receitas
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    ingredients TEXT,
    instructions TEXT,
    prep_time INTEGER, -- em minutos
    calories INTEGER,
    meal_type VARCHAR(50) NOT NULL CHECK (
        meal_type IN (
            'breakfast',      -- Café da manhã (7h)
            'morning_snack',  -- Lanche da manhã (10h)
            'lunch',          -- Almoço (12h)
            'afternoon_snack', -- Lanche da tarde (15h)
            'dinner',         -- Jantar (19h)
            'night_snack',    -- Ceia (21h)
            'additional'      -- Receitas adicionais (sem limite)
        )
    ),
    is_preferred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Preferências de Refeições
CREATE TABLE IF NOT EXISTS meal_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_type VARCHAR(50) NOT NULL CHECK (
        meal_type IN (
            'breakfast',      -- Café da manhã
            'morning_snack',  -- Lanche da manhã
            'lunch',          -- Almoço
            'afternoon_snack', -- Lanche da tarde
            'dinner',         -- Jantar
            'night_snack'     -- Ceia
        )
    ),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, meal_type)
);

-- Tabela de Exercícios
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sets INTEGER DEFAULT 1,
    reps INTEGER DEFAULT 10,
    duration INTEGER, -- em segundos (para exercícios de tempo)
    weight DECIMAL(5,2), -- em kg (opcional)
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 6=sábado
    order_index INTEGER DEFAULT 0, -- para ordenar exercícios no dia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Logs de Atividade (opcional, para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (
        activity_type IN ('recipe_viewed', 'exercise_completed', 'preference_changed')
    ),
    activity_data JSONB, -- dados específicos da atividade
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOVAS TABELAS PARA RASTREAMENTO DE PROGRESSO
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

-- Índices para receitas
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_user_meal ON recipes(user_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_preferred ON recipes(user_id, is_preferred);

-- Índices para preferências
CREATE INDEX IF NOT EXISTS idx_meal_preferences_user_id ON meal_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_preferences_meal_type ON meal_preferences(meal_type);

-- Índices para exercícios
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_day_of_week ON exercises(day_of_week);
CREATE INDEX IF NOT EXISTS idx_exercises_user_day ON exercises(user_id, day_of_week);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Índices para conclusões
CREATE INDEX IF NOT EXISTS idx_exercise_completions_user_id ON exercise_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_exercise_id ON exercise_completions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_completed_at ON exercise_completions(completed_at);

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

-- Triggers para atualizar updated_at
CREATE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON recipes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_preferences_updated_at 
    BEFORE UPDATE ON meal_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at 
    BEFORE UPDATE ON exercises 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at 
    BEFORE UPDATE ON daily_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para garantir apenas uma receita preferida por refeição
CREATE OR REPLACE FUNCTION ensure_single_preference()
RETURNS TRIGGER AS $$
BEGIN
    -- Se está marcando como preferida, desmarca outras da mesma refeição
    IF NEW.is_preferred = TRUE THEN
        UPDATE recipes 
        SET is_preferred = FALSE 
        WHERE user_id = NEW.user_id 
        AND meal_type = NEW.meal_type 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para garantir preferência única
CREATE TRIGGER ensure_single_recipe_preference 
    BEFORE INSERT OR UPDATE ON recipes 
    FOR EACH ROW EXECUTE FUNCTION ensure_single_preference();

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
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para recipes
CREATE POLICY "Users can view their own recipes" ON recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para meal_preferences
CREATE POLICY "Users can view their own meal preferences" ON meal_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal preferences" ON meal_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal preferences" ON meal_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal preferences" ON meal_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para exercises
CREATE POLICY "Users can view their own exercises" ON exercises
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises" ON exercises
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" ON exercises
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" ON exercises
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para activity_logs
CREATE POLICY "Users can view their own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir dados de exemplo (apenas para desenvolvimento)
-- Comentar em produção

/*
-- Exemplo de receitas (substituir user_id pelo ID real do usuário)
INSERT INTO recipes (user_id, name, ingredients, instructions, prep_time, calories, meal_type) VALUES
('USER_ID_AQUI', 'Aveia com Banana', 'Aveia, banana, leite, mel', 'Misturar todos os ingredientes e aquecer por 2 minutos', 5, 250, 'breakfast'),
('USER_ID_AQUI', 'Salada de Frutas', 'Maçã, banana, laranja, uva', 'Cortar as frutas e misturar', 10, 150, 'morning_snack'),
('USER_ID_AQUI', 'Arroz com Frango', 'Arroz, frango, legumes', 'Cozinhar arroz, grelhar frango, refogar legumes', 30, 450, 'lunch');

-- Exemplo de exercícios (substituir user_id pelo ID real do usuário)
INSERT INTO exercises (user_id, name, description, sets, reps, day_of_week) VALUES
('USER_ID_AQUI', 'Flexões', 'Flexões de braço', 3, 15, 1),
('USER_ID_AQUI', 'Agachamentos', 'Agachamentos livres', 3, 20, 1),
('USER_ID_AQUI', 'Corrida', 'Corrida leve 30 minutos', 1, 1, 2);
*/

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE recipes IS 'Tabela principal de receitas do usuário';
COMMENT ON TABLE meal_preferences IS 'Preferências de refeições do usuário (uma por refeição)';
COMMENT ON TABLE exercises IS 'Exercícios organizados por dia da semana';
COMMENT ON TABLE activity_logs IS 'Logs de atividades do usuário para analytics';
COMMENT ON TABLE exercise_completions IS 'Registro de conclusões de exercícios';
COMMENT ON TABLE recipe_completions IS 'Registro de conclusões de receitas';
COMMENT ON TABLE daily_stats IS 'Estatísticas diárias de progresso (cache)';

COMMENT ON COLUMN recipes.meal_type IS 'Tipo de refeição: breakfast, morning_snack, lunch, afternoon_snack, dinner, night_snack, additional';
COMMENT ON COLUMN exercises.day_of_week IS 'Dia da semana: 0=domingo, 1=segunda, ..., 6=sábado';
COMMENT ON COLUMN exercises.order_index IS 'Índice para ordenar exercícios no mesmo dia';

-- =====================================================
-- FIM DO ESQUEMA
-- ===================================================== 