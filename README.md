# 🏥 IkigaiHub

> **PWA Mobile-First para Gestão Completa de Saúde**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)
[![Version](https://img.shields.io/badge/Version-1.1.0-brightgreen.svg)](https://github.com/your-username/ikgaihub)

## 📋 Visão Geral

O **IkigaiHub** é um PWA (Progressive Web App) mobile-first para gestão completa de saúde, desenvolvido com React 18, TypeScript, Tailwind CSS e Supabase. O projeto oferece uma solução integrada para gerenciar exercícios, nutrição, metas e lembretes de forma gamificada.

**Status Atual**: ✅ **MVP Completo e Funcional**
**Versão**: v1.1.0

---

## 🚀 Funcionalidades

### ✅ **Sistema de Autenticação**
- Login/registro com Supabase Auth
- Proteção de rotas
- Contexto de autenticação global
- Tratamento de erros

### ✅ **Gestão de Receitas**
- CRUD completo de receitas
- Categorização por tipo de refeição
- Informações nutricionais
- Tempo de preparo
- Marcação de receitas preferidas

### ✅ **Gestão de Exercícios**
- CRUD completo de exercícios
- Agendamento semanal
- Configuração de séries e repetições
- Duração e intensidade
- Categorização por grupos musculares

### ✅ **Dashboard Inteligente**
- Estatísticas em tempo real
- Componentes especializados
- Widgets interativos
- Layout responsivo
- Próxima refeição e exercícios do dia

### ✅ **Sistema de Metas**
- Criação e gerenciamento de metas
- Tipos: exercício, nutrição, geral
- Progresso visual
- Conquistas e gamificação
- Notificações de progresso

### ✅ **Sistema de Lembretes**
- Lembretes personalizados
- Agendamento de horários
- Notificações push
- Integração com metas

### ✅ **PWA Completo**
- Service Worker configurado
- Manifest.json completo
- Funcionalidades offline
- Instalação na tela inicial
- Cache inteligente

### ✅ **Gamificação**
- Badges e conquistas
- Streaks de consistência
- Pontuação por atividades
- Níveis de usuário
- Desafios semanais/mensais

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **React Router v6** - Roteamento
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones

### **Backend**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança
- **JWT** - Autenticação
- **Storage** - Armazenamento de arquivos

### **PWA**
- **VitePWA** - Plugin PWA
- **Workbox** - Service Worker
- **Manifest** - Configuração PWA
- **Offline** - Funcionalidades offline

---

## 📱 Screenshots

### Dashboard Principal
![Dashboard](docs/assets/dashboard.png)

### Sistema de Metas
![Metas](docs/assets/goals.png)

### Gestão de Receitas
![Receitas](docs/assets/recipes.png)

### Gestão de Exercícios
![Exercícios](docs/assets/exercises.png)

---

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### **1. Clone o repositório**
```bash
git clone https://github.com/your-username/ikgaihub.git
cd ikgaihub
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_VERSION=1.1.0
VITE_APP_NAME=IkigaiHub
```

### **4. Configure o banco de dados**
Execute os scripts SQL na ordem correta:

1. **Estrutura básica**:
   ```sql
   -- docs/sql/database-schema.sql
   ```

2. **Sistema de metas**:
   ```sql
   -- docs/sql/goals-system.sql
   ```

3. **Sistema de lembretes**:
   ```sql
   -- docs/sql/reminder-system.sql
   ```

4. **Correções (se necessário)**:
   ```sql
   -- docs/sql/fix-goals-rls-policies.sql
   ```

### **5. Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── dashboard/       # Componentes do Dashboard
│   ├── goals/          # Componentes de Metas
│   └── ...             # Outros componentes
├── contexts/           # Contextos React
├── hooks/              # Custom Hooks
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── types/              # Definições TypeScript
├── utils/              # Utilitários
└── styles/             # Estilos globais
```

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build

# Testes
npm run test             # Executa testes
npm run test:ui          # Interface de testes

# Linting
npm run lint             # Verifica código
npm run lint:fix         # Corrige problemas de linting
```

---

## 🗄️ Banco de Dados

### **Tabelas Principais**
- `users` - Usuários (Supabase Auth)
- `recipes` - Receitas e plano alimentar
- `exercises` - Exercícios e treinos
- `goals` - Metas e objetivos
- `goal_progress` - Progresso das metas
- `achievements` - Conquistas e badges
- `reminders` - Lembretes personalizados
- `reminder_schedules` - Agendamentos
- `notification_settings` - Configurações
- `notification_history` - Histórico
- `exercise_completions` - Conclusões de exercícios
- `recipe_completions` - Conclusões de receitas
- `daily_stats` - Estatísticas diárias

### **Políticas RLS**
Todas as tabelas possuem Row Level Security configurado, garantindo que usuários só acessem seus próprios dados.

---

## 🔐 Segurança

- **Row Level Security (RLS)** em todas as tabelas
- **JWT Tokens** para autenticação
- **Validação de entrada** em formulários
- **Proteção de rotas** para usuários autenticados
- **Criptografia** de dados sensíveis

---

## 📱 PWA (Progressive Web App)

### **Funcionalidades**
- ✅ Instalação na tela inicial
- ✅ Funcionalidades offline
- ✅ Service Worker configurado
- ✅ Manifest completo
- ✅ Cache inteligente
- ✅ Push notifications

### **Como Instalar**
1. Acesse o site no Chrome/Edge
2. Clique no ícone de instalação na barra de endereços
3. Ou use o menu "Adicionar à tela inicial"

---

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Executar testes com interface
npm run test:ui

# Executar testes com coverage
npm run test:coverage
```

### **Ferramentas de Teste**
- **Vitest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **MSW** - Mock Service Worker

---

## 📊 Performance

### **Métricas Alvo**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### **Otimizações Implementadas**
- Code splitting com lazy loading
- Bundle optimization com Vite
- Caching inteligente com Service Worker
- Image optimization
- Tree shaking automático

---

## 🔄 Correções Recentes (v1.1.0)

### **Bugs Corrigidos**
- ✅ **Erro RLS na criação de metas**: Adicionado `user_id` automaticamente
- ✅ **Múltiplos registros do Service Worker**: Corrigido hook usePWA
- ✅ **Console poluído**: Reduzidos logs excessivos
- ✅ **Interface de lembretes confusa**: Simplificada
- ✅ **Ícones PWA faltando**: Corrigidos
- ✅ **Warnings do React Router**: Adicionadas future flags

### **Melhorias**
- 🚀 Performance do PWA otimizada
- 🎨 Experiência do usuário melhorada
- 📚 Documentação atualizada
- 🔧 Código limpo e organizado

---

## 📚 Documentação

- [📊 Resumo Executivo](docs/projeto/RESUMO-EXECUTIVO.md)
- [🗺️ Roadmap](docs/projeto/ROADMAP.md)
- [🏗️ Arquitetura](docs/projeto/ARQUITETURA.md)
- [📋 PRD](docs/projeto/PRD.md)
- [📝 Changelog](CHANGELOG.md)
- [🔧 Instruções de Manutenção](docs/instrucoes/)

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Código**
- TypeScript para tipagem
- ESLint para linting
- Prettier para formatação
- Conventional Commits para commits

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🎯 Roadmap

### **v1.2.0 (Fevereiro 2025)**
- [ ] Deploy em produção
- [ ] Testes finais
- [ ] Otimizações de performance
- [ ] Analytics e monitoramento

### **v1.3.0 (Março 2025)**
- [ ] Integrações externas (wearables)
- [ ] IA para recomendações
- [ ] Social features
- [ ] Versão mobile nativa

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/your-username/ikgaihub/issues)
- **Documentação**: [docs/](docs/)
- **Email**: support@ikgaihub.com

---

## 🙏 Agradecimentos

- [React](https://reactjs.org/) - Framework JavaScript
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Vite](https://vitejs.dev/) - Build tool
- [VitePWA](https://vite-pwa-org.netlify.app/) - Plugin PWA

---

**Desenvolvido com ❤️ para melhorar a saúde e bem-estar das pessoas.**

*Última atualização: Janeiro 2025 - v1.1.0* 