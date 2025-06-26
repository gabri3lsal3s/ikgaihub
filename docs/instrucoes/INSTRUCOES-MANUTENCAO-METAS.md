# 🛠️ Instruções de Manutenção: Sistema de Metas

## 1. Visão Geral
O sistema de metas do IkigaiHub permite que usuários criem, acompanhem e concluam objetivos de saúde, com gamificação e notificações automáticas.

## 2. Fluxo de Funcionamento
- Usuário cria/edita meta via `GoalForm`.
- Hook `useGoals` gerencia estado e integra com `GoalService`.
- Progresso é registrado e triggers SQL atualizam status/conquistas.
- Notificações são disparadas via `NotificationService`.
- Conquistas são exibidas via `GoalAchievements`.

## 3. Pontos de Extensão
- **Adicionar novo tipo de meta:**
  - Atualize enums/types em `/types`, banco e formulários.
- **Novas conquistas:**
  - Adicione lógica no `AchievementService` e triggers SQL.
- **Novos alertas/notificações:**
  - Expanda o `NotificationService` e, se necessário, crie novos hooks.
- **Novos campos de meta:**
  - Atualize tipos, formulários, serviços e triggers.

## 4. Debugging e Testes
- Use logs no `GoalService` e hooks para rastrear problemas.
- Teste triggers SQL diretamente no Supabase Studio.
- Valide notificações usando o hook `useNotifications`.
- Teste edge cases: meta sem prazo, meta já concluída, progresso negativo.

## 5. Boas Práticas
- Sempre mantenha enums/types sincronizados entre frontend e banco.
- Prefira hooks para lógica de estado e side effects.
- Use componentes pequenos e reutilizáveis.
- Documente triggers e funções SQL customizadas.
- Garanta que RLS esteja ativo para todas as tabelas sensíveis.

## 6. Exemplos de Uso
### Adicionar Progresso
```typescript
const { addProgress } = useGoals();
addProgress(goalId, 5); // Adiciona 5 unidades de progresso
```

### Adicionar novo campo à meta
1. Adicione o campo na tabela `goals` (SQL).
2. Atualize o tipo `Goal` em `/types`.
3. Atualize o formulário em `GoalForm.tsx`.
4. Ajuste métodos do `GoalService`.

### Adicionar nova conquista
1. Crie lógica no `AchievementService`.
2. Adicione trigger/função SQL se necessário.
3. Atualize o componente `GoalAchievements` para exibir.

## 7. Onde buscar ajuda
- Consulte `ARQUITETURA.md` para visão geral.
- Veja exemplos em `GoalCard.tsx`, `GoalForm.tsx`, `GoalProgress.tsx`.
- Dúvidas sobre SQL/triggers: consulte `docs/sql/goals-system.sql`.

---

Mantenha este arquivo atualizado sempre que houver mudanças relevantes no sistema de metas! 