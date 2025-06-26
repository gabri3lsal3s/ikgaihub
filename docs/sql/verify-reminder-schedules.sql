-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO DA TABELA REMINDER_SCHEDULES
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'reminder_schedules'
) as table_exists;

-- 2. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reminder_schedules'
ORDER BY ordinal_position;

-- 3. Verificar se as colunas necessárias existem
DO $$
BEGIN
  -- Verificar se a coluna is_sent existe
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reminder_schedules' 
    AND column_name = 'is_sent'
  ) THEN
    ALTER TABLE reminder_schedules ADD COLUMN is_sent BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Coluna is_sent adicionada';
  END IF;

  -- Verificar se a coluna sent_at existe
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reminder_schedules' 
    AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE reminder_schedules ADD COLUMN sent_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna sent_at adicionada';
  END IF;
END $$;

-- 4. Verificar dados existentes
SELECT 
  id,
  reminder_id,
  scheduled_time,
  is_sent,
  sent_at,
  created_at
FROM reminder_schedules 
LIMIT 10;

-- 5. Verificar se há agendamentos pendentes
SELECT 
  rs.id,
  rs.reminder_id,
  rs.scheduled_time,
  rs.is_sent,
  r.title,
  r.user_id
FROM reminder_schedules rs
JOIN reminders r ON rs.reminder_id = r.id
WHERE rs.is_sent = FALSE
ORDER BY rs.scheduled_time
LIMIT 10;

-- 6. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'reminder_schedules';

-- 7. Criar política RLS se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'reminder_schedules' 
    AND policyname = 'Users can manage their own reminder schedules'
  ) THEN
    CREATE POLICY "Users can manage their own reminder schedules" ON reminder_schedules
    FOR ALL USING (
      reminder_id IN (
        SELECT id FROM reminders WHERE user_id = auth.uid()
      )
    );
    RAISE NOTICE 'Política RLS criada para reminder_schedules';
  END IF;
END $$;

-- 8. Habilitar RLS se não estiver habilitado
ALTER TABLE reminder_schedules ENABLE ROW LEVEL SECURITY;

-- 9. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'reminder_schedules';

-- 10. Criar índices se necessário
DO $$
BEGIN
  -- Índice para agendamentos pendentes
  IF NOT EXISTS (
    SELECT FROM pg_indexes 
    WHERE tablename = 'reminder_schedules' 
    AND indexname = 'idx_reminder_schedules_pending'
  ) THEN
    CREATE INDEX idx_reminder_schedules_pending 
    ON reminder_schedules (reminder_id, scheduled_time, is_sent);
    RAISE NOTICE 'Índice para agendamentos pendentes criado';
  END IF;

  -- Índice para agendamentos por data
  IF NOT EXISTS (
    SELECT FROM pg_indexes 
    WHERE tablename = 'reminder_schedules' 
    AND indexname = 'idx_reminder_schedules_date'
  ) THEN
    CREATE INDEX idx_reminder_schedules_date 
    ON reminder_schedules (scheduled_time);
    RAISE NOTICE 'Índice para agendamentos por data criado';
  END IF;
END $$;

-- 11. Verificar função de atualização
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname = 'mark_schedule_as_sent';

-- 12. Criar função se não existir
CREATE OR REPLACE FUNCTION mark_schedule_as_sent(schedule_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reminder_schedules 
  SET 
    is_sent = TRUE,
    sent_at = NOW()
  WHERE id = schedule_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agendamento não encontrado: %', schedule_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Verificar se a função foi criada
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname = 'mark_schedule_as_sent';

-- 14. Testar a função com um agendamento existente
-- (Descomente e ajuste o ID se quiser testar)
/*
SELECT mark_schedule_as_sent('ID_DO_AGENDAMENTO_AQUI');
*/

-- 15. Verificar resultado final
SELECT 
  'Verificação concluída' as status,
  COUNT(*) as total_schedules,
  COUNT(*) FILTER (WHERE is_sent = FALSE) as pending_schedules,
  COUNT(*) FILTER (WHERE is_sent = TRUE) as sent_schedules
FROM reminder_schedules; 