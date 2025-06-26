-- =====================================================
-- Script para verificar e corrigir a função get_user_goals_stats
-- =====================================================

-- 1. Verificar se a função existe
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_user_goals_stats';

-- 2. Se a função não existir, criar uma nova
CREATE OR REPLACE FUNCTION get_user_goals_stats(p_user_id UUID)
RETURNS TABLE (
    total_goals BIGINT,
    active_goals BIGINT,
    completed_goals BIGINT,
    completion_rate NUMERIC,
    total_points BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_goals,
        COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active_goals,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_goals,
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
        END as completion_rate,
        COALESCE(SUM(
            CASE 
                WHEN status = 'completed' THEN 
                    CASE 
                        WHEN priority = 'high' THEN 100
                        WHEN priority = 'medium' THEN 50
                        WHEN priority = 'low' THEN 25
                        ELSE 0
                    END
                ELSE 0
            END
        ), 0)::BIGINT as total_points
    FROM goals 
    WHERE user_id = p_user_id;
END;
$$;

-- 3. Verificar se a função foi criada corretamente
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_user_goals_stats';

-- 4. Testar a função (substitua o UUID por um ID válido)
-- SELECT * FROM get_user_goals_stats('71396815-6029-4213-a618-b0ca76ae4b1a'::UUID);

-- 5. Verificar permissões RLS
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
WHERE tablename = 'goals';

-- 6. Se necessário, criar política RLS para a função
DROP POLICY IF EXISTS "Users can view their own goal stats" ON goals;
CREATE POLICY "Users can view their own goal stats" ON goals
    FOR SELECT USING (auth.uid() = user_id);

-- 7. Verificar se a tabela goals existe e tem a estrutura correta
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'goals' 
AND table_schema = 'public'
ORDER BY ordinal_position; 