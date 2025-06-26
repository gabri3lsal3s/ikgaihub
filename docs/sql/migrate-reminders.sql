-- =====================================================
-- MIGRAÇÃO DO SISTEMA DE LEMBRETES - IkigaiHub
-- =====================================================

-- Este script atualiza a tabela reminders existente para a nova estrutura

-- 1. Fazer backup dos dados existentes (opcional)
-- CREATE TABLE reminders_backup AS SELECT * FROM reminders;

-- 2. Remover constraints e índices existentes
DROP INDEX IF EXISTS idx_reminders_user_id;
DROP INDEX IF EXISTS idx_reminders_type;
DROP INDEX IF EXISTS idx_reminders_active;

-- 3. Remover triggers existentes
DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;

-- 4. Adicionar novas colunas
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS reminder_type VARCHAR(50) DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS target_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS target_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(50),
ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[],
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true;

-- 5. Migrar dados existentes (se houver)
-- Converter coluna 'type' antiga para 'reminder_type'
UPDATE reminders 
SET reminder_type = CASE 
    WHEN type = 'exercise' THEN 'exercise'
    WHEN type = 'meal' THEN 'meal'
    WHEN type = 'goal' THEN 'goal'
    WHEN type = 'general' THEN 'custom'
    ELSE 'custom'
END
WHERE type IS NOT NULL;

-- Converter coluna 'time' antiga para 'target_time'
UPDATE reminders 
SET target_time = time::TIME
WHERE time IS NOT NULL;

-- Converter coluna 'days_of_week' antiga para 'recurrence_days'
UPDATE reminders 
SET recurrence_days = days_of_week,
    is_recurring = true,
    recurrence_pattern = 'weekly'
WHERE days_of_week IS NOT NULL AND array_length(days_of_week, 1) > 0;

-- 6. Remover colunas antigas
ALTER TABLE reminders 
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS time,
DROP COLUMN IF EXISTS days_of_week;

-- 7. Adicionar constraints
ALTER TABLE reminders 
ADD CONSTRAINT reminders_type_check 
CHECK (reminder_type IN ('meal', 'exercise', 'goal', 'custom'));

-- 8. Recriar índices
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_target_date ON reminders(target_date);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);

-- 9. Recriar trigger
CREATE TRIGGER update_reminders_updated_at 
    BEFORE UPDATE ON reminders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Verificar se a função existe, se não, criá-la
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Verificar estrutura final
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'reminders' 
-- ORDER BY ordinal_position;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- ===================================================== 