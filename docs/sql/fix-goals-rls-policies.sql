-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS DA TABELA GOALS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR SE A TABELA GOALS EXISTE
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'goals'
) as goals_table_exists;

-- 2. SE A TABELA NÃO EXISTIR, CRIAR
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('exercise', 'nutrition', 'general')),
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR RLS NA TABELA GOALS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 4. REMOVER POLÍTICAS EXISTENTES (se houver)
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;
DROP POLICY IF EXISTS "Users can view their own goal stats" ON goals;

-- 5. CRIAR POLÍTICAS RLS CORRETAS
CREATE POLICY "Users can view their own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- 6. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
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
WHERE tablename = 'goals'
ORDER BY policyname;

-- 7. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'goals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. CRIAR ÍNDICES SE NECESSÁRIO
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);

-- 9. VERIFICAR SE O USUÁRIO ESTÁ AUTENTICADO
-- (Execute esta query para verificar se auth.uid() está funcionando)
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 10. TESTE DE INSERÇÃO (OPCIONAL - DESCOMENTE PARA TESTAR)
-- INSERT INTO goals (user_id, title, description, type, target_value, unit, period, start_date, priority)
-- VALUES (auth.uid(), 'Teste', 'Descrição teste', 'general', 1, 'teste', 'daily', CURRENT_DATE, 'medium');

-- 11. VERIFICAR DADOS EXISTENTES
SELECT COUNT(*) as total_goals FROM goals WHERE user_id = auth.uid();

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 