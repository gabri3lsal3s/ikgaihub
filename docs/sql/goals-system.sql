-- Sistema de Metas e Objetivos - IkigaiHub
-- Script para criar tabelas e funcionalidades do sistema de metas

-- =====================================================
-- TABELA DE METAS
-- =====================================================
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('exercise', 'nutrition', 'general')),
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    unit VARCHAR(50) NOT NULL, -- 'exercises', 'recipes', 'days', 'calories', etc.
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA DE PROGRESSO DAS METAS
-- =====================================================
CREATE TABLE IF NOT EXISTS goal_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(goal_id, date)
);

-- =====================================================
-- TABELA DE CONQUISTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    points INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA DE LEMBRETES
-- =====================================================
CREATE TABLE IF NOT EXISTS reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('exercise', 'meal', 'goal', 'general')),
    time TIME NOT NULL,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Segunda, 7=Domingo
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_period ON goals(period);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_date ON goal_progress(date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(time);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para goals
CREATE POLICY "Users can view their own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para goal_progress
CREATE POLICY "Users can view their own goal progress" ON goal_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal progress" ON goal_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal progress" ON goal_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal progress" ON goal_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para achievements
CREATE POLICY "Users can view their own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON achievements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements" ON achievements
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para reminders
CREATE POLICY "Users can view their own reminders" ON reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" ON reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON reminders
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar e atualizar status das metas
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar current_value da meta
    UPDATE goals 
    SET current_value = (
        SELECT COALESCE(SUM(value), 0)
        FROM goal_progress 
        WHERE goal_id = NEW.goal_id
    )
    WHERE id = NEW.goal_id;
    
    -- Verificar se a meta foi completada
    UPDATE goals 
    SET status = 'completed'
    WHERE id = NEW.goal_id 
    AND current_value >= target_value 
    AND status = 'active';
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para verificar conclusão de metas
CREATE TRIGGER check_goal_completion_trigger 
    AFTER INSERT OR UPDATE ON goal_progress
    FOR EACH ROW EXECUTE FUNCTION check_goal_completion();

-- Função para criar conquista quando meta é completada
CREATE OR REPLACE FUNCTION create_goal_achievement()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO achievements (user_id, goal_id, type, title, description, icon, points)
        VALUES (
            NEW.user_id,
            NEW.id,
            'goal_completed',
            'Meta Concluída: ' || NEW.title,
            'Parabéns! Você completou sua meta de ' || NEW.title,
            'trophy',
            100
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar conquista
CREATE TRIGGER create_goal_achievement_trigger 
    AFTER UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION create_goal_achievement();

-- =====================================================
-- FUNÇÕES ÚTEIS PARA CONSULTAS
-- =====================================================

-- Função para obter progresso de uma meta em um período
CREATE OR REPLACE FUNCTION get_goal_progress(
    p_goal_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    date DATE,
    value INTEGER,
    cumulative_value INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gp.date,
        gp.value,
        SUM(gp.value) OVER (ORDER BY gp.date) as cumulative_value
    FROM goal_progress gp
    WHERE gp.goal_id = p_goal_id
    AND gp.date BETWEEN p_start_date AND p_end_date
    ORDER BY gp.date;
END;
$$ language 'plpgsql';

-- Função para obter estatísticas de metas do usuário
CREATE OR REPLACE FUNCTION get_user_goals_stats(p_user_id UUID)
RETURNS TABLE (
    total_goals INTEGER,
    active_goals INTEGER,
    completed_goals INTEGER,
    completion_rate NUMERIC,
    total_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_goals,
        COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active_goals,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_goals,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
        ) as completion_rate,
        COALESCE(SUM(points), 0)::INTEGER as total_points
    FROM goals g
    LEFT JOIN achievements a ON g.id = a.goal_id
    WHERE g.user_id = p_user_id;
END;
$$ language 'plpgsql';

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================
COMMENT ON TABLE goals IS 'Tabela principal de metas e objetivos dos usuários';
COMMENT ON TABLE goal_progress IS 'Registro diário do progresso das metas';
COMMENT ON TABLE achievements IS 'Conquistas e badges dos usuários';
COMMENT ON TABLE reminders IS 'Lembretes e notificações personalizadas';

COMMENT ON COLUMN goals.type IS 'Tipo da meta: exercise, nutrition, general';
COMMENT ON COLUMN goals.period IS 'Período da meta: daily, weekly, monthly, yearly';
COMMENT ON COLUMN goals.status IS 'Status da meta: active, completed, paused, cancelled';
COMMENT ON COLUMN goals.priority IS 'Prioridade da meta: low, medium, high';

COMMENT ON COLUMN goal_progress.value IS 'Valor do progresso registrado na data';
COMMENT ON COLUMN achievements.points IS 'Pontos ganhos pela conquista';
COMMENT ON COLUMN reminders.days_of_week IS 'Array com dias da semana (1=Segunda, 7=Domingo)'; 