-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO DO SISTEMA DE LEMBRETES
-- =====================================================

-- Este script verifica e corrige problemas no sistema de lembretes

-- 1. VERIFICAR SE AS TABELAS EXISTEM
-- =====================================================

DO $$
BEGIN
    -- Verificar se a tabela reminders existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reminders') THEN
        RAISE EXCEPTION 'Tabela reminders não existe! Execute o script setup-reminders-complete.sql primeiro.';
    END IF;
    
    -- Verificar se a tabela reminder_schedules existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reminder_schedules') THEN
        RAISE NOTICE 'Criando tabela reminder_schedules...';
        
        CREATE TABLE reminder_schedules (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,
            scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
            is_sent BOOLEAN DEFAULT false,
            sent_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_reminder_schedules_reminder_id ON reminder_schedules(reminder_id);
        CREATE INDEX IF NOT EXISTS idx_reminder_schedules_scheduled_time ON reminder_schedules(scheduled_time);
        CREATE INDEX IF NOT EXISTS idx_reminder_schedules_sent ON reminder_schedules(is_sent);
    END IF;
    
    -- Verificar se a tabela notification_settings existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notification_settings') THEN
        RAISE NOTICE 'Criando tabela notification_settings...';
        
        CREATE TABLE notification_settings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
            push_enabled BOOLEAN DEFAULT true,
            email_enabled BOOLEAN DEFAULT false,
            reminder_advance_minutes INTEGER DEFAULT 15,
            quiet_hours_start TIME DEFAULT '22:00',
            quiet_hours_end TIME DEFAULT '08:00',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Verificar se a tabela notification_history existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notification_history') THEN
        RAISE NOTICE 'Criando tabela notification_history...';
        
        CREATE TABLE notification_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
            notification_type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            body TEXT,
            is_read BOOLEAN DEFAULT false,
            read_at TIMESTAMP WITH TIME ZONE,
            sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_notification_history_read ON notification_history(is_read);
    END IF;
END $$;

-- 2. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA REMINDERS
-- =====================================================

-- Verificar se as colunas necessárias existem
DO $$
BEGIN
    -- Adicionar colunas que podem estar faltando
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'reminder_type') THEN
        ALTER TABLE reminders ADD COLUMN reminder_type VARCHAR(50) DEFAULT 'custom';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'target_date') THEN
        ALTER TABLE reminders ADD COLUMN target_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'target_time') THEN
        ALTER TABLE reminders ADD COLUMN target_time TIME DEFAULT '09:00:00';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'is_recurring') THEN
        ALTER TABLE reminders ADD COLUMN is_recurring BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'recurrence_pattern') THEN
        ALTER TABLE reminders ADD COLUMN recurrence_pattern VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'recurrence_days') THEN
        ALTER TABLE reminders ADD COLUMN recurrence_days INTEGER[];
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'notification_enabled') THEN
        ALTER TABLE reminders ADD COLUMN notification_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. VERIFICAR E CRIAR FUNÇÕES NECESSÁRIAS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para gerar agendamentos recorrentes
CREATE OR REPLACE FUNCTION generate_recurring_schedules()
RETURNS void AS $$
DECLARE
    reminder_record RECORD;
    base_date DATE;
    schedule_date DATE;
    days_ahead INTEGER;
BEGIN
    -- Processar lembretes recorrentes ativos
    FOR reminder_record IN 
        SELECT * FROM reminders 
        WHERE is_recurring = true 
        AND is_active = true 
        AND target_date <= CURRENT_DATE + INTERVAL '30 days'
    LOOP
        base_date := reminder_record.target_date;
        
        -- Gerar agendamentos para os próximos 30 dias
        FOR days_ahead IN 0..30 LOOP
            schedule_date := base_date + (days_ahead || ' days')::INTERVAL;
            
            -- Verificar se é um dia válido para o padrão de recorrência
            IF reminder_record.recurrence_pattern = 'daily' THEN
                -- Inserir agendamento diário
                INSERT INTO reminder_schedules (reminder_id, scheduled_time)
                VALUES (reminder_record.id, schedule_date + reminder_record.target_time)
                ON CONFLICT DO NOTHING;
                
            ELSIF reminder_record.recurrence_pattern = 'weekly' THEN
                -- Verificar se o dia da semana está na lista de dias permitidos
                IF EXTRACT(DOW FROM schedule_date) = ANY(reminder_record.recurrence_days) THEN
                    INSERT INTO reminder_schedules (reminder_id, scheduled_time)
                    VALUES (reminder_record.id, schedule_date + reminder_record.target_time)
                    ON CONFLICT DO NOTHING;
                END IF;
                
            ELSIF reminder_record.recurrence_pattern = 'monthly' THEN
                -- Verificar se é o mesmo dia do mês
                IF EXTRACT(DAY FROM schedule_date) = EXTRACT(DAY FROM reminder_record.target_date) THEN
                    INSERT INTO reminder_schedules (reminder_id, scheduled_time)
                    VALUES (reminder_record.id, schedule_date + reminder_record.target_time)
                    ON CONFLICT DO NOTHING;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas de metas (corrigir divisão por zero)
CREATE OR REPLACE FUNCTION get_user_goals_stats(user_id_param UUID)
RETURNS TABLE (
    total_goals INTEGER,
    completed_goals INTEGER,
    active_goals INTEGER,
    completion_rate NUMERIC,
    total_progress NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH goal_stats AS (
        SELECT 
            COUNT(*) as total_goals,
            COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_goals,
            COUNT(CASE WHEN is_completed = false AND is_active = true THEN 1 END) as active_goals,
            COALESCE(AVG(CASE WHEN is_completed = false THEN progress_percentage END), 0) as avg_progress
        FROM goals 
        WHERE user_id = user_id_param
    )
    SELECT 
        gs.total_goals,
        gs.completed_goals,
        gs.active_goals,
        CASE 
            WHEN gs.total_goals > 0 THEN 
                ROUND((gs.completed_goals::NUMERIC / gs.total_goals::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        COALESCE(gs.avg_progress, 0) as total_progress
    FROM goal_stats gs;
END;
$$ LANGUAGE plpgsql;

-- 4. VERIFICAR E CRIAR TRIGGERS
-- =====================================================

-- Trigger para reminders
DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at 
    BEFORE UPDATE ON reminders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para notification_settings
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at 
    BEFORE UPDATE ON notification_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. VERIFICAR E CRIAR POLÍTICAS RLS
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Políticas para reminders
DROP POLICY IF EXISTS "Users can view own reminders" ON reminders;
CREATE POLICY "Users can view own reminders" ON reminders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reminders" ON reminders;
CREATE POLICY "Users can insert own reminders" ON reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reminders" ON reminders;
CREATE POLICY "Users can update own reminders" ON reminders
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reminders" ON reminders;
CREATE POLICY "Users can delete own reminders" ON reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para reminder_schedules
DROP POLICY IF EXISTS "Users can view own reminder schedules" ON reminder_schedules;
CREATE POLICY "Users can view own reminder schedules" ON reminder_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reminders 
            WHERE reminders.id = reminder_schedules.reminder_id 
            AND reminders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own reminder schedules" ON reminder_schedules;
CREATE POLICY "Users can insert own reminder schedules" ON reminder_schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reminders 
            WHERE reminders.id = reminder_schedules.reminder_id 
            AND reminders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own reminder schedules" ON reminder_schedules;
CREATE POLICY "Users can update own reminder schedules" ON reminder_schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM reminders 
            WHERE reminders.id = reminder_schedules.reminder_id 
            AND reminders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own reminder schedules" ON reminder_schedules;
CREATE POLICY "Users can delete own reminder schedules" ON reminder_schedules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM reminders 
            WHERE reminders.id = reminder_schedules.reminder_id 
            AND reminders.user_id = auth.uid()
        )
    );

-- Políticas para notification_settings
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
CREATE POLICY "Users can view own notification settings" ON notification_settings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
CREATE POLICY "Users can insert own notification settings" ON notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;
CREATE POLICY "Users can update own notification settings" ON notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para notification_history
DROP POLICY IF EXISTS "Users can view own notification history" ON notification_history;
CREATE POLICY "Users can view own notification history" ON notification_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification history" ON notification_history;
CREATE POLICY "Users can insert own notification history" ON notification_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification history" ON notification_history;
CREATE POLICY "Users can update own notification history" ON notification_history
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. VERIFICAR E CRIAR ÍNDICES
-- =====================================================

-- Índices para reminders
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_target_date ON reminders(target_date);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);

-- Índices para reminder_schedules
CREATE INDEX IF NOT EXISTS idx_reminder_schedules_reminder_id ON reminder_schedules(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_schedules_scheduled_time ON reminder_schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_reminder_schedules_sent ON reminder_schedules(is_sent);

-- Índices para notification_history
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_read ON notification_history(is_read);

-- 7. MENSAGEM DE CONCLUSÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Verificação e correção do sistema de lembretes concluída!';
    RAISE NOTICE 'Todas as tabelas, funções, triggers e políticas RLS foram verificadas e criadas.';
END $$; 