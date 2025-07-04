-- =====================================================
-- SISTEMA DE LEMBRETES - IkigaiHub
-- =====================================================

-- Tabela de lembretes
CREATE TABLE IF NOT EXISTS reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('meal', 'exercise', 'goal', 'custom')),
    target_date DATE NOT NULL,
    target_time TIME,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly'
    recurrence_days INTEGER[], -- [1,2,3,4,5,6,7] para dias da semana
    is_active BOOLEAN DEFAULT true,
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos de lembretes
CREATE TABLE IF NOT EXISTS reminder_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de notificação
CREATE TABLE IF NOT EXISTS notification_settings (
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

-- Tabela de histórico de notificações
CREATE TABLE IF NOT EXISTS notification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'push', 'email', 'in_app'
    title VARCHAR(255) NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_target_date ON reminders(target_date);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);

CREATE INDEX IF NOT EXISTS idx_reminder_schedules_reminder_id ON reminder_schedules(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_schedules_scheduled_time ON reminder_schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_reminder_schedules_sent ON reminder_schedules(is_sent);

CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_read ON notification_history(is_read);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_reminders_updated_at 
    BEFORE UPDATE ON reminders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at 
    BEFORE UPDATE ON notification_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar agendamentos de lembretes recorrentes
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

-- Políticas RLS para reminders
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders" ON reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" ON reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para reminder_schedules
ALTER TABLE reminder_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminder schedules" ON reminder_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reminders 
            WHERE reminders.id = reminder_schedules.reminder_id 
            AND reminders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own reminder schedules" ON reminder_schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reminders 
            WHERE reminders.id = reminder_schedules.reminder_id 
            AND reminders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own reminder schedules" ON reminder_schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM reminders 
            WHERE reminders.id = reminder_schedules.reminder_id 
            AND reminders.user_id = auth.uid()
        )
    );

-- Políticas RLS para notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification settings" ON notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para notification_history
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification history" ON notification_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification history" ON notification_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification history" ON notification_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Inserir configurações padrão de notificação para usuários existentes
INSERT INTO notification_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_settings);

-- Comentários para documentação
COMMENT ON TABLE reminders IS 'Tabela principal de lembretes do usuário';
COMMENT ON TABLE reminder_schedules IS 'Agendamentos específicos de lembretes';
COMMENT ON TABLE notification_settings IS 'Configurações de notificação do usuário';
COMMENT ON TABLE notification_history IS 'Histórico de notificações enviadas';

COMMENT ON COLUMN reminders.reminder_type IS 'Tipo do lembrete: meal, exercise, goal, custom';
COMMENT ON COLUMN reminders.recurrence_pattern IS 'Padrão de recorrência: daily, weekly, monthly';
COMMENT ON COLUMN reminders.recurrence_days IS 'Array com dias da semana para recorrência semanal';

-- =====================================================
-- FIM DO SCRIPT - SISTEMA DE LEMBRETES
-- ===================================================== 