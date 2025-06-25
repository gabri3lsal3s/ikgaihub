# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-12-XX

### 🎉 Lançamento Inicial
Versão inicial do IkigaiHub com funcionalidades core implementadas.

### ✅ Adicionado
- **Sistema de Autenticação Completo**
  - Login/logout com Supabase Auth
  - Proteção de rotas com ProtectedRoute
  - Contexto global de autenticação (AuthContext)
  - Hook useAuth para gerenciamento de estado
  - Redirecionamento automático para usuários não autenticados

- **Gestão de Receitas**
  - CRUD completo de receitas
  - 6 tipos de refeição configuráveis (café, lanche manhã, almoço, lanche tarde, jantar, ceia)
  - Sistema de preferências (1 receita preferida por refeição)
  - Seção de receitas extras sem limite
  - Validação de limites (máximo 4 receitas por refeição)
  - Interface responsiva e mobile-first

- **Gestão de Exercícios**
  - CRUD completo de exercícios
  - Organização por dia da semana
  - Sistema de reordenação funcional
  - Campos: nome, descrição, séries, repetições, duração
  - Interface dark mode completa

- **Dashboard Inteligente**
  - Hook useDashboard para carregamento otimizado de dados
  - Componentes especializados:
    - TodayExercises: Exercícios do dia atual
    - NextMeal: Próxima refeição baseada no horário
    - QuickStats: Estatísticas rápidas
    - ProgressStats: Estatísticas de progresso
    - NutritionStats: Estatísticas de nutrição
    - ExerciseStats: Estatísticas de exercícios
  - Sistema de conclusão de atividades
  - Gráficos de pizza para visualização de dados
  - Interface em português

- **Arquitetura Base**
  - Estrutura MVC bem definida
  - Services especializados (RecipeService, ExerciseService)
  - Controllers para lógica de negócio
  - Custom hooks para gerenciamento de estado
  - Tipos TypeScript completos
  - Configuração de testes com Vitest

- **Configuração Técnica**
  - React 18 + TypeScript + Vite
  - Tailwind CSS com design system customizado
  - Supabase como backend (Auth + PostgreSQL + RLS)
  - React Router v6 para navegação
  - React Hot Toast para notificações
  - ESLint e Prettier configurados
  - PWA assets configurados

### 🔧 Melhorado
- **Performance**: Carregamento otimizado de dados
- **UX**: Interface mobile-first responsiva
- **Segurança**: Row Level Security (RLS) configurado
- **Código**: Arquitetura limpa e escalável

### 🐛 Corrigido
- Validações de formulários
- Tratamento de erros de autenticação
- Sincronização de dados entre dispositivos

---

## [0.9.0] - 2024-12-XX

### ✅ Adicionado
- **Sistema de Metas (60% implementado)**
  - Estrutura de banco de dados (tabelas: goals, goal_progress, achievements)
  - Tipos de metas: exercício, nutrição, peso, frequência
  - Políticas RLS configuradas
  - Componentes básicos: GoalCard, GoalForm, GoalsPage
  - Serviços: GoalService, AchievementService
  - Hooks: useGoals, useAchievements

### 🔧 Melhorado
- **Estatísticas**: Separação em componentes especializados
- **Interface**: Gráficos de pizza mais intuitivos
- **Localização**: Nomes em português

---

## [0.8.0] - 2024-12-XX

### ✅ Adicionado
- **Dashboard Avançado**
  - Componentes especializados para estatísticas
  - Sistema de conclusão de atividades
  - Gráficos de progresso

### 🔧 Melhorado
- **Layout**: Dashboard responsivo
- **Performance**: Carregamento otimizado

---

## [0.7.0] - 2024-12-XX

### ✅ Adicionado
- **Dashboard Inteligente**
  - Hook useDashboard
  - Componentes de estatísticas
  - Lógica baseada em horário

---

## [0.6.0] - 2024-12-XX

### ✅ Adicionado
- **Gestão de Exercícios**
  - CRUD completo
  - Organização por dia da semana
  - Interface responsiva

---

## [0.5.0] - 2024-12-XX

### ✅ Adicionado
- **Gestão de Receitas**
  - CRUD completo
  - Sistema de preferências
  - 6 tipos de refeição

---

## [0.4.0] - 2024-12-XX

### ✅ Adicionado
- **Sistema de Autenticação**
  - Login/logout
  - Proteção de rotas
  - Contexto de autenticação

---

## [0.3.0] - 2024-12-XX

### ✅ Adicionado
- **Configuração Base**
  - React + TypeScript + Vite
  - Tailwind CSS
  - Supabase
  - Estrutura de pastas

---

## [0.2.0] - 2024-12-XX

### ✅ Adicionado
- **Setup Inicial**
  - Configuração do projeto
  - Dependências básicas
  - Estrutura inicial

---

## [0.1.0] - 2024-12-XX

### ✅ Adicionado
- **Conceito Inicial**
  - Definição do projeto
  - Planejamento de arquitetura
  - Documentação inicial

---

## Tipos de Mudanças

- `✅ Adicionado` para novas funcionalidades
- `🔧 Melhorado` para mudanças em funcionalidades existentes
- `🐛 Corrigido` para correções de bugs
- `🚀 Performance` para melhorias de performance
- `🔒 Segurança` para mudanças relacionadas à segurança
- `📚 Documentação` para mudanças na documentação
- `🧪 Testes` para adição ou correção de testes
- `♻️ Refatoração` para mudanças que não corrigem bugs nem adicionam funcionalidades
- `⚡ Breaking` para mudanças que quebram compatibilidade

---

## Links

- [PRD](./docs/projeto/PRD.md) - Documento de Requisitos do Produto
- [Arquitetura](./docs/projeto/ARQUITETURA.md) - Documentação de Arquitetura
- [Roadmap](./docs/projeto/ROADMAP.md) - Cronograma de Desenvolvimento
- [Resumo Executivo](./docs/projeto/RESUMO-EXECUTIVO.md) - Status Atual do Projeto 