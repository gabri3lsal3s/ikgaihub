# 🔧 Instruções para Corrigir Políticas RLS

## Problema Identificado
O erro "new row violates row-level security policy for table 'recipes'" indica que as políticas RLS do Supabase não estão configuradas corretamente.

## Solução

### Passo 1: Acessar o Supabase Dashboard
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto IkigaiHub

### Passo 2: Executar o Script SQL
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**
3. Copie e cole todo o conteúdo do arquivo `docs/fix-rls-policies.sql`
4. Clique em **"Run"** para executar o script

### Passo 3: Verificar se Funcionou
1. Após executar o script, você deve ver uma tabela com as políticas criadas
2. Teste criando uma nova receita no aplicativo
3. Se ainda houver erro, verifique os logs no console do navegador

## O que o Script Faz

1. **Remove políticas conflitantes** que podem estar causando problemas
2. **Habilita RLS** em todas as tabelas
3. **Cria políticas corretas** para:
   - Visualizar apenas receitas próprias
   - Inserir receitas com user_id correto
   - Atualizar apenas receitas próprias
   - Deletar apenas receitas próprias

## Verificação Manual

Se quiser verificar manualmente se as políticas estão corretas:

```sql
-- Verificar políticas da tabela recipes
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'recipes';
```

## Possíveis Problemas

### 1. Políticas Duplicadas
Se aparecer erro de política duplicada, execute primeiro:
```sql
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
```

### 2. Usuário Não Autenticado
Se o erro persistir, verifique se:
- O usuário está logado no aplicativo
- O token de autenticação está válido
- As variáveis de ambiente estão corretas

### 3. Tabela Não Existe
Se a tabela `recipes` não existir, execute primeiro o script completo do banco:
```sql
-- Execute o conteúdo de docs/database-schema.sql
```

## Logs de Debug

Para debug adicional, adicione este código temporariamente no `RecipeService.ts`:

```typescript
static async createRecipe(recipeData: CreateRecipeData): Promise<ApiResponse<Recipe>> {
  try {
    // Debug: verificar usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Usuário atual:', user)
    console.log('Erro de usuário:', userError)
    
    if (userError || !user) {
      return { data: null, error: 'Usuário não autenticado' }
    }

    const recipeWithUserId = {
      ...recipeData,
      user_id: user.id
    }
    
    console.log('Dados da receita:', recipeWithUserId)

    const { data, error } = await supabase
      .from('recipes')
      .insert([recipeWithUserId])
      .select()
      .single()

    console.log('Resposta do Supabase:', { data, error })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Erro completo:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}
```

## Contato

Se o problema persistir após seguir estas instruções, verifique:
1. Se o script SQL foi executado com sucesso
2. Se não há erros no console do navegador
3. Se o usuário está autenticado corretamente 