# PRD - IkigaiHub: Hub de Ferramentas de Saúde

## 📋 Informações do Projeto

- **Nome**: IkigaiHub
- **Versão**: 1.0.0
- **Tipo**: PWA (Progressive Web App)
- **Data de Criação**: Dezembro 2024
- **Status**: Em Desenvolvimento

## 🎯 Visão Geral do Produto

O IkigaiHub é uma aplicação web progressiva mobile-first que serve como hub central para ferramentas de saúde pessoal. O objetivo é fornecer uma interface simples e eficiente para gerenciar plano alimentar e exercícios físicos, com sincronização entre dispositivos.

### Proposta de Valor
- **Simplicidade**: Interface intuitiva e fácil de usar
- **Personalização**: Planos adaptados às necessidades individuais
- **Acessibilidade**: Disponível em qualquer dispositivo via PWA
- **Sincronização**: Dados persistentes e sincronizados entre dispositivos
- **Inteligência**: Dashboard que mostra informações relevantes baseadas no horário

## 👥 Público-Alvo

- **Usuários Primários**: 2 usuários específicos (estudante de programação e possível familiar)
- **Perfil**: Pessoas interessadas em saúde e bem-estar
- **Necessidades**: Gestão de alimentação e exercícios de forma organizada
- **Comportamento**: Uso frequente de dispositivos móveis

## 🎯 Objetivos de Negócio

### Objetivos Primários
1. **Facilitar a gestão de saúde pessoal** através de interface intuitiva
2. **Promover consistência** no plano alimentar e exercícios
3. **Fornecer acesso multi-dispositivo** via PWA
4. **Criar experiência mobile-first** otimizada para uso em smartphones

### Objetivos Secundários
1. **Servir como projeto de aprendizado** para desenvolvimento web
2. **Demonstrar boas práticas** de arquitetura MVC
3. **Implementar PWA** com funcionalidades offline
4. **Integrar com Supabase** para backend robusto

## 📱 Funcionalidades Principais

### 1. Sistema de Autenticação ✅ CONCLUÍDO
**Descrição**: Login seguro e restrito a usuários específicos

**Requisitos Funcionais**:
- Login via email/senha usando Supabase Auth
- Acesso restrito a apenas 2 usuários pré-definidos
- Bloqueio de cadastro de novos usuários
- Proteção automática de rotas
- Logout funcional
- Redirecionamento automático para login se não autenticado

**Critérios de Aceite**:
- ✅ Login funciona com credenciais válidas
- ✅ Tentativas de login com credenciais inválidas são rejeitadas
- ✅ Usuários não autenticados são redirecionados para login
- ✅ Logout limpa a sessão e redireciona para login
- ✅ Cadastro de novos usuários é bloqueado

**Status**: Implementado e testado com sucesso

### 2. Gestão de Plano Alimentar ✅ CONCLUÍDO
**Descrição**: Sistema completo para gerenciar 6 refeições diárias com receitas e preferências

**Requisitos Funcionais**:
- 6 refeições diárias configuráveis:
  - Café da manhã (7h)
  - Lanche da manhã (10h)
  - Almoço (12h)
  - Lanche da tarde (15h)
  - Jantar (19h)
  - Ceia (21h)
- 4 opções de receitas editáveis por refeição
- Sistema de preferência (marcar 1 receita preferida por refeição)
- Seção adicional com receitas extras (sem limite de quantidade)
- CRUD completo de receitas (Criar, Ler, Atualizar, Deletar)
- Persistência no Supabase para sincronização entre dispositivos

**Estrutura de Dados das Receitas**:
- Nome da receita
- Lista de ingredientes
- Modo de preparo
- Tempo de preparo (em minutos)
- Calorias (opcional)
- Tipo de refeição
- Data de criação/atualização

**Critérios de Aceite**:
- ✅ Usuário pode criar até 4 receitas por refeição
- ✅ Usuário pode marcar 1 receita como preferida por refeição
- ✅ Receitas são salvas e sincronizadas entre dispositivos
- ✅ Usuário pode editar e deletar receitas
- ✅ Seção adicional permite receitas extras sem limite
- ✅ Interface mobile-first e responsiva

**Status**: Implementado e testado com sucesso

### 3. Gestão de Exercícios ✅ CONCLUÍDO
**Descrição**: Sistema para gerenciar planos de exercícios por dia da semana

**Requisitos Funcionais**:
- Planos de exercícios organizados por dia da semana
- Lista de exercícios editável para cada dia
- CRUD completo de exercícios
- Persistência no Supabase

**Estrutura de Dados dos Exercícios**:
- Nome do exercício
- Descrição/detalhes
- Número de séries
- Número de repetições
- Duração (em segundos, se aplicável)
- Dia da semana (0-6, domingo-sábado)
- Data de criação/atualização

**Critérios de Aceite**:
- ✅ Usuário pode criar exercícios para cada dia da semana
- ✅ Exercícios são organizados por dia
- ✅ Usuário pode editar e deletar exercícios
- ✅ Dados são persistidos e sincronizados
- ✅ Interface mobile-first e responsiva

**Status**: Implementado e testado com sucesso

### 4. Dashboard Home ✅ CONCLUÍDO
**Descrição**: Página principal que exibe informações relevantes baseadas no horário atual

**Requisitos Funcionais**:
- Exibição da receita preferida baseada no horário atual
- Exibição do exercício do dia atual
- Interface mobile-first otimizada
- Navegação rápida para outras seções

**Lógica de Exibição**:
- **Receitas**: Mostra a receita preferida da refeição atual baseada no horário
- **Exercícios**: Mostra os exercícios do dia da semana atual

**Critérios de Aceite**:
- ✅ Receita correta é exibida baseada no horário
- ✅ Exercícios do dia são exibidos corretamente
- ✅ Interface é responsiva e mobile-first
- ✅ Navegação é intuitiva e rápida

**Status**: Implementado e testado com sucesso

### 5. Sistema de Metas 🔄 EM DESENVOLVIMENTO
**Descrição**: Sistema para definir, acompanhar e conquistar metas de saúde

**Requisitos Funcionais**:
- Criação de metas personalizadas (exercício, nutrição, peso, frequência)
- Acompanhamento de progresso em tempo real
- Sistema de conquistas e badges
- Notificações de progresso
- Histórico de metas concluídas

**Tipos de Metas**:
- **Exercício**: Metas de frequência, duração ou intensidade
- **Nutrição**: Metas de calorias, macronutrientes ou hábitos
- **Peso**: Metas de ganho, perda ou manutenção
- **Frequência**: Metas de consistência (dias consecutivos)

**Critérios de Aceite**:
- 🔄 Usuário pode criar metas personalizadas
- 🔄 Progresso é atualizado em tempo real
- 🔄 Sistema de conquistas funciona
- 🔄 Notificações são exibidas corretamente
- 🔄 Interface é intuitiva e responsiva

**Status**: 60% implementado

### 6. Sistema de Lembretes 📋 PLANEJADO
**Descrição**: Sistema de notificações e lembretes personalizados

**Requisitos Funcionais**:
- Lembretes de refeições baseados no horário
- Lembretes de exercícios por dia da semana
- Configuração de horários personalizados
- Notificações push (quando suportado)
- Integração com metas

**Critérios de Aceite**:
- 📋 Lembretes são exibidos no horário correto
- 📋 Configuração é intuitiva
- 📋 Notificações funcionam em diferentes dispositivos
- 📋 Integração com outras funcionalidades

**Status**: Planejado para Janeiro 2025

### 7. Gamificação 📋 PLANEJADO
**Descrição**: Sistema de recompensas e motivação

**Requisitos Funcionais**:
- Sistema de badges e conquistas
- Streaks de consistência
- Pontuação baseada em atividades
- Desafios semanais/mensais
- Níveis de usuário

**Critérios de Aceite**:
- 📋 Badges são desbloqueados corretamente
- 📋 Streaks são calculados e exibidos
- 📋 Sistema de pontuação é justo
- 📋 Desafios são motivadores

**Status**: Planejado para Janeiro 2025

## 🎨 Design e UX

### Paleta de Cores
- **Primária**: Verde (#10B981, #059669, #047857)
- **Secundária**: Preto (#111827, #1F2937, #374151)
- **Acentos**: Verde claro (#D1FAE5, #A7F3D0)
- **Texto**: Branco (#FFFFFF), Cinza claro (#F9FAFB)

### Base de Design
- **Framework**: TailAdmin (mobile-first)
- **Princípios**: Simplicidade, clareza, eficiência
- **Acessibilidade**: Seguindo padrões WCAG 2.1

### Responsividade
- **Mobile-First**: Design otimizado para smartphones
- **Breakpoints**: 320px, 768px, 1024px, 1280px
- **Touch-Friendly**: Elementos com tamanho mínimo de 44px

## 🔧 Requisitos Técnicos

### Frontend
- **Framework**: React 18
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **Estado**: React Context API + useReducer
- **Roteamento**: React Router v6
- **PWA**: Workbox + Service Workers

### Backend
- **Plataforma**: Supabase
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (se necessário)
- **APIs**: Supabase Client

### Deploy
- **Plataforma**: Vercel
- **Domínio**: Custom (se necessário)
- **HTTPS**: Obrigatório

### Performance
- **Lighthouse Score**: >90 em todas as categorias
- **Carregamento**: <3 segundos em 3G
- **PWA**: Funcionalidade offline básica

## 🔒 Segurança

### Autenticação
- Supabase Auth com JWT
- Tokens de acesso seguros
- Refresh tokens automáticos

### Autorização
- Row Level Security (RLS) no Supabase
- Políticas de acesso por usuário
- Validação de entrada em frontend e backend

## 📊 Critérios de Sucesso

### Métricas de Engajamento
- **Retenção**: 70% dos usuários ativos após 30 dias
- **Frequência**: Média de 5 sessões por semana
- **Tempo de Sessão**: Média de 10 minutos por sessão

### Métricas Técnicas
- **Performance**: Lighthouse Score >90
- **Disponibilidade**: 99.9% uptime
- **Tempo de Carregamento**: <3 segundos
- **Taxa de Erro**: <1%

### Métricas de Negócio
- **Adoção**: 2 usuários ativos (meta inicial)
- **Satisfação**: Score de satisfação >4.5/5
- **Recomendação**: NPS >50

## 🚀 Roadmap de Lançamento

### Fase 1: MVP (Dezembro 2024) ✅
- Autenticação básica
- CRUD de receitas e exercícios
- Dashboard funcional

### Fase 2: Funcionalidades Avançadas (Janeiro 2025)
- Sistema de metas completo
- Lembretes e notificações
- Gamificação básica

### Fase 3: PWA Completo (Fevereiro 2025)
- Service Worker
- Funcionalidades offline
- Instalação na tela inicial

### Fase 4: Lançamento (Março 2025)
- Testes finais
- Deploy em produção
- Monitoramento contínuo

---

> **🗺️ Para cronograma detalhado, consulte [ROADMAP.md](./ROADMAP.md)**

---

*Última atualização: Junho 2025* 