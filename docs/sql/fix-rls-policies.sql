-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS - IkigaiHub
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Primeiro, vamos remover as políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;

DROP POLICY IF EXISTS "Users can view their own meal preferences" ON meal_preferences;
DROP POLICY IF EXISTS "Users can insert their own meal preferences" ON meal_preferences;
DROP POLICY IF EXISTS "Users can update their own meal preferences" ON meal_preferences;
DROP POLICY IF EXISTS "Users can delete their own meal preferences" ON meal_preferences;

DROP POLICY IF EXISTS "Users can view their own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert their own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update their own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete their own exercises" ON exercises;

DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_logs;

-- Garantir que RLS está habilitado
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS CORRIGIDAS PARA RECEITAS
-- =====================================================

-- Política para visualizar receitas próprias
CREATE POLICY "Users can view their own recipes" ON recipes
    FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir receitas (corrigida)
CREATE POLICY "Users can insert their own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualizar receitas próprias
CREATE POLICY "Users can update their own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para deletar receitas próprias
CREATE POLICY "Users can delete their own recipes" ON recipes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA PREFERÊNCIAS DE REFEIÇÕES
-- =====================================================

-- Política para visualizar preferências próprias
CREATE POLICY "Users can view their own meal preferences" ON meal_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir preferências próprias
CREATE POLICY "Users can insert their own meal preferences" ON meal_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualizar preferências próprias
CREATE POLICY "Users can update their own meal preferences" ON meal_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para deletar preferências próprias
CREATE POLICY "Users can delete their own meal preferences" ON meal_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA EXERCÍCIOS
-- =====================================================

-- Política para visualizar exercícios próprios
CREATE POLICY "Users can view their own exercises" ON exercises
    FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir exercícios próprios
CREATE POLICY "Users can insert their own exercises" ON exercises
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualizar exercícios próprios
CREATE POLICY "Users can update their own exercises" ON exercises
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para deletar exercícios próprios
CREATE POLICY "Users can delete their own exercises" ON exercises
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA LOGS DE ATIVIDADE
-- =====================================================

-- Política para visualizar logs próprios
CREATE POLICY "Users can view their own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir logs próprios
CREATE POLICY "Users can insert their own activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- =====================================================

-- Verificar se as políticas foram criadas corretamente
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
WHERE tablename IN ('recipes', 'meal_preferences', 'exercises', 'activity_logs')
ORDER BY tablename, policyname;

-- =====================================================
-- TESTE DAS POLÍTICAS (OPCIONAL)
-- =====================================================

-- Para testar se as políticas estão funcionando, você pode executar:
-- SELECT * FROM recipes WHERE user_id = auth.uid();
-- (Isso deve retornar apenas as receitas do usuário logado)

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 