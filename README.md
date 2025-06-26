# 🎯 IkigaiHub

> **Hub de Ferramentas de Saúde - PWA mobile-first para gestão de plano alimentar e exercícios**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.5-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.2-green.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)

## 📋 Visão Geral

O **IkigaiHub** é uma aplicação web progressiva (PWA) mobile-first desenvolvida para facilitar a gestão completa de saúde pessoal. O projeto oferece uma interface intuitiva para gerenciar plano alimentar e exercícios físicos, com sincronização entre dispositivos.

### 🎯 Proposta de Valor
- **Simplicidade**: Interface intuitiva e fácil de usar
- **Personalização**: Planos adaptados às necessidades individuais
- **Acessibilidade**: Disponível em qualquer dispositivo via PWA
- **Sincronização**: Dados persistentes e sincronizados entre dispositivos
- **Inteligência**: Dashboard que mostra informações relevantes baseadas no horário

## 🚀 Status do Projeto

### **Progresso Geral**: 85% Concluído
### **Versão Atual**: v0.9.0
### **Fase Atual**: Fase 7 - Sistema de Lembretes (Planejada)

### **Fases Concluídas** ✅
- **Fase 1**: Base do Projeto (v0.3.0) ✅
- **Fase 2**: Sistema de Autenticação (v0.4.0) ✅
- **Fase 3**: CRUD Básico (v0.5.0 - v0.6.0) ✅
- **Fase 4**: Dashboard Inteligente (v0.7.0) ✅
- **Fase 5**: Melhorias nas Estatísticas (v0.8.0) ✅
- **Fase 6**: Sistema de Metas (v0.9.0) ✅

## 🏗️ Stack Tecnológica

### **Frontend**
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS com design system customizado
- **Estado**: React Context API + Custom Hooks
- **Roteamento**: React Router v6
- **Formulários**: React Hook Form + Zod
- **Notificações**: React Hot Toast
- **Ícones**: Lucide React
- **Gráficos**: Chart.js + React-Chartjs-2

### **Backend**
- **Plataforma**: Supabase (Auth + PostgreSQL + RLS)
- **Autenticação**: Supabase Auth com JWT
- **Banco de Dados**: PostgreSQL com Row Level Security
- **Storage**: Supabase Storage (quando necessário)

### **PWA** 📱
- **Service Worker**: Workbox configurado
- **Manifest**: Gerado automaticamente pelo VitePWA
- **Cache Strategy**: Implementado para fontes e assets
- **Instalação**: Pronto para instalar na tela inicial
- **Status**: Parcialmente funcional (80% completo)

## 📱 Funcionalidades

### ✅ **Implementadas**
- **🔐 Autenticação**: Login/logout seguro com Supabase Auth
- **🍽️ Gestão de Receitas**: CRUD completo com 6 tipos de refeição
- **🏃‍♂️ Gestão de Exercícios**: CRUD completo organizado por dia da semana
- **📊 Dashboard Inteligente**: Informações baseadas no horário atual
- **📈 Estatísticas**: Componentes especializados para nutrição e exercícios
- **🎯 Sistema de Metas**: Completo com progresso, conquistas e notificações
- **📊 Gráficos Interativos**: Pizza e barras para visualização de dados
- **✅ Marcadores de Conclusão**: Persistentes no Supabase
- **🏆 Sistema de Conquistas**: Badges e notificações automáticas
- **📱 PWA Básico**: Manifest, Service Worker e cache configurados

### 🔄 **Em Desenvolvimento**
- **⏰ Sistema de Lembretes**: Notificações personalizadas (Fase 7)

### 📋 **Planejadas**
- **🏆 Gamificação Avançada**: Streaks, rankings e desafios
- **📱 PWA Completo**: Funcionalidades offline avançadas
- **🔗 Integrações**: APIs de nutrição e wearables
- **📈 Histórico Detalhado**: Relatórios avançados de progresso

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js >= 18.0.0
- npm >= 8.0.0
- Conta no Supabase

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/ikgaihub.git
cd ikgaihub
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure as variáveis de ambiente**
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **4. Configure o Supabase**
1. Crie um projeto no Supabase
2. Execute os scripts SQL na ordem:
   - `docs/sql/database-schema.sql`
   - `docs/sql/goals-system.sql`
   - `docs/sql/progress-tables.sql`
3. Configure as políticas RLS se necessário

### **5. Execute o projeto**
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📱 PWA - Status e Funcionalidades

### **✅ Funcionalidades PWA Implementadas**
- **Manifest**: Configurado com VitePWA plugin
- **Service Worker**: Workbox com cache strategy
- **Ícones**: Múltiplos tamanhos (192x192, 512x512)
- **Meta Tags**: PWA meta tags completas
- **Cache**: Fontes Google e assets estáticos
- **Instalação**: Pronto para instalar na tela inicial

### **📋 PWA - Próximas Implementações**
- **Offline Mode**: Funcionalidades offline completas
- **Push Notifications**: Notificações push
- **Background Sync**: Sincronização em background
- **App Shell**: Interface offline-first

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── dashboard/       # Componentes do dashboard
│   ├── goals/          # Componentes de metas
│   └── ...             # Outros componentes
├── contexts/           # Contextos React (AuthContext)
├── controllers/        # Controladores (lógica de negócio)
├── hooks/             # Custom hooks
├── pages/             # Páginas da aplicação
├── services/          # Serviços (acesso a dados)
├── types/             # Tipos TypeScript
├── utils/             # Utilitários
├── styles/            # Estilos globais
└── constants/         # Constantes da aplicação
```

## 🗄️ Banco de Dados

### **Tabelas Principais**
- `users` - Usuários autenticados (Supabase Auth)
- `exercises` - Exercícios disponíveis
- `recipes` - Receitas e refeições
- `goals` - Metas do usuário
- `goal_progress` - Rastreamento de progresso
- `achievements` - Conquistas e badges
- `exercise_completions` - Conclusões de exercícios
- `recipe_completions` - Conclusões de receitas
- `daily_stats` - Estatísticas diárias
- `reminders` - Sistema de lembretes (planejado)

### **Scripts SQL Disponíveis**
- 📁 [docs/sql/database-schema.sql](./docs/sql/database-schema.sql) - Schema completo
- 📁 [docs/sql/goals-system.sql](./docs/sql/goals-system.sql) - Sistema de metas
- 📁 [docs/sql/progress-tables.sql](./docs/sql/progress-tables.sql) - Tabelas de progresso
- 📁 [docs/sql/fix-rls-policies.sql](./docs/sql/fix-rls-policies.sql) - Políticas de segurança

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com UI
npm run test:ui

# Cobertura de testes
npm run test:coverage
```

## 🔧 Desenvolvimento

### **Scripts Disponíveis**
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Verificação de lint
npm run lint:fix     # Correção automática de lint
npm run test         # Execução de testes
npm run type-check   # Verificação de tipos TypeScript
```

### **Padrões de Código**
- TypeScript strict mode
- ESLint + Prettier
- Componentes funcionais com hooks
- Serviços para lógica de negócio
- Custom hooks para reutilização

## 📚 Documentação

### **Documentação do Projeto**
- 📁 [docs/projeto/PRD.md](./docs/projeto/PRD.md) - Product Requirements Document
- 📁 [docs/projeto/ARQUITETURA.md](./docs/projeto/ARQUITETURA.md) - Arquitetura técnica
- 📁 [docs/projeto/ROADMAP.md](./docs/projeto/ROADMAP.md) - Roadmap e cronograma
- 📁 [docs/projeto/RESUMO-EXECUTIVO.md](./docs/projeto/RESUMO-EXECUTIVO.md) - Resumo executivo

### **Instruções de Manutenção**
- 📁 [docs/instrucoes/INSTRUCOES-MANUTENCAO-METAS.md](./docs/instrucoes/INSTRUCOES-MANUTENCAO-METAS.md) - Manutenção do sistema de metas
- 📁 [docs/instrucoes/PWA-ASSETS-INSTRUCTIONS.md](./docs/instrucoes/PWA-ASSETS-INSTRUCTIONS.md) - Instruções para assets PWA

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Gabriel** - Desenvolvedor Full Stack

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-linkedin](https://linkedin.com/in/seu-linkedin)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com/) - Backend as a Service
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [React](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type Safety

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!** 