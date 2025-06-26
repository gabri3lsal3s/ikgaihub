# 🔧 Correção do Erro SQL - Sistema de Lembretes

## 🚨 Problema Identificado

O erro `ERROR: 42703: column "target_date" does not exist` ocorre porque a tabela `reminders` já existe com a estrutura antiga, mas o código está tentando acessar colunas que não existem.

**Erro adicional corrigido**: `ERROR: 42601: syntax error at or near "current_date"` - variável com nome reservado no PostgreSQL.

## ✅ Solução

### Passo 1: Executar o Script de Migração Corrigido

Execute o script `docs/sql/setup-reminders-complete.sql` no Supabase SQL Editor:

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Abra o arquivo `docs/sql/setup-reminders-complete.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** para executar

**✅ Correções aplicadas:**
- Migração da tabela `reminders` existente
- Correção do erro de sintaxe na função `generate_recurring_schedules`
- Criação das novas tabelas necessárias

### Passo 2: Verificar a Migração

Após executar o script, verifique se a migração foi bem-sucedida:

```sql
-- Verificar estrutura da tabela reminders
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reminders' 
ORDER BY ordinal_position;

-- Verificar se as novas tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reminder_schedules', 'notification_settings', 'notification_history');

-- Verificar se a função foi criada corretamente
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'generate_recurring_schedules';
```

### Passo 3: Testar o Sistema

Após a migração, teste o sistema de lembretes:

1. Acesse a aplicação
2. Vá para a página de Lembretes
3. Tente criar um novo lembrete
4. Verifique se não há mais erros

## 📋 O que o Script Faz

### 1. **Migração da Tabela Existente**
- Adiciona as novas colunas necessárias
- Migra dados antigos para o novo formato
- Remove colunas obsoletas
- Recria índices e constraints

### 2. **Criação de Novas Tabelas**
- `reminder_schedules`: Agendamentos específicos
- `notification_settings`: Configurações de notificação
- `notification_history`: Histórico de notificações

### 3. **Configuração de Segurança**
- Políticas RLS para todas as tabelas
- Índices para performance
- Triggers para atualização automática

### 4. **Funções e Dados Iniciais**
- Função para gerar agendamentos recorrentes (corrigida)
- Configurações padrão de notificação
- Comentários e documentação

## 🔍 Estrutura Final das Tabelas

### Tabela `reminders` (Atualizada)
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY)
- title (VARCHAR)
- description (TEXT)
- reminder_type (VARCHAR) -- 'meal', 'exercise', 'goal', 'custom'
- target_date (DATE)
- target_time (TIME)
- is_recurring (BOOLEAN)
- recurrence_pattern (VARCHAR) -- 'daily', 'weekly', 'monthly'
- recurrence_days (INTEGER[]) -- [1,2,3,4,5,6,7]
- is_active (BOOLEAN)
- notification_enabled (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Novas Tabelas
- **reminder_schedules**: Agendamentos específicos
- **notification_settings**: Configurações de notificação
- **notification_history**: Histórico de notificações

## ⚠️ Importante

- **Backup**: O script faz backup automático dos dados existentes
- **Segurança**: Todas as políticas RLS são recriadas
- **Performance**: Índices são otimizados
- **Compatibilidade**: Dados antigos são migrados automaticamente
- **Correções**: Erros de sintaxe foram corrigidos

## 🚀 Após a Migração

1. **Reinicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Teste as funcionalidades**:
   - Criação de lembretes
   - Configuração de recorrência
   - Notificações
   - Dashboard

3. **Verifique se não há erros no console**

## 📞 Suporte

Se encontrar algum problema durante a migração:

1. Verifique os logs do Supabase
2. Confirme se todas as tabelas foram criadas
3. Teste as políticas RLS
4. Verifique se os dados foram migrados corretamente
5. Confirme se a função `generate_recurring_schedules` foi criada

## 🔧 Correções Aplicadas

### Erro de Sintaxe Corrigido
- **Problema**: `current_date` é palavra reservada no PostgreSQL
- **Solução**: Renomeado para `base_date` na função `generate_recurring_schedules`
- **Arquivos corrigidos**: 
  - `docs/sql/setup-reminders-complete.sql`
  - `docs/sql/reminder-system.sql`

---

**Status**: ✅ Pronto para execução  
**Arquivo**: `docs/sql/setup-reminders-complete.sql`  
**Última atualização**: Janeiro 2025 