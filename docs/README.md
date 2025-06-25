# 🏥 IkigaiHub - Documentação

> **PWA de Saúde e Bem-estar** - Acompanhamento de exercícios, nutrição e metas pessoais

## 📊 Status do Projeto

### ✅ **Concluído**
- ✅ Autenticação com Supabase
- ✅ Dashboard principal com widgets
- ✅ Sistema de exercícios e receitas
- ✅ Marcadores de conclusão persistentes
- ✅ Estatísticas de progresso (nutrição e exercícios)
- ✅ Sistema de metas e conquistas
- ✅ Gráficos interativos (pizza e barras)
- ✅ Organização da documentação

### 🚧 **Em Desenvolvimento**
- 🔄 Sistema de lembretes
- 🔄 Histórico detalhado
- 🔄 Gamificação avançada

### 📋 **Próximos Passos**
- 📝 Implementar sistema de lembretes
- 📝 Criar histórico detalhado de atividades
- 📝 Adicionar gamificação com badges e níveis
- 📝 Implementar notificações push

---

## 🏗️ Arquitetura

### **Stack Tecnológica**
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Gráficos**: Chart.js + React-Chartjs-2
- **Notificações**: React Hot Toast
- **PWA**: Vite PWA Plugin

### **Estrutura do Projeto**
```
src/
├── components/          # Componentes React
│   ├── dashboard/      # Widgets do dashboard
│   └── goals/          # Sistema de metas
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── hooks/              # Custom hooks
├── contexts/           # Contextos React
├── types/              # Tipos TypeScript
└── utils/              # Utilitários
```

---

## 🗄️ Banco de Dados

### **Tabelas Principais**
- `users` - Usuários autenticados
- `exercises` - Exercícios disponíveis
- `recipes` - Receitas e refeições
- `goals` - Metas do usuário
- `progress` - Rastreamento de progresso
- `achievements` - Conquistas e badges
- `reminders` - Sistema de lembretes

### **Scripts SQL Disponíveis**
- 📁 [sql/database-schema.sql](./sql/database-schema.sql) - Schema completo
- 📁 [sql/goals-system.sql](./sql/goals-system.sql) - Sistema de metas
- 📁 [sql/progress-tables.sql](./sql/progress-tables.sql) - Tabelas de progresso
- 📁 [sql/fix-rls-policies.sql](./sql/fix-rls-policies.sql) - Políticas de segurança

---

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js 18+
- Conta Supabase
- Git

### **Instalação**
```bash
# Clone o repositório
git clone <repository-url>
cd ikgaihub

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env
# Edite o .env com suas credenciais do Supabase

# Execute o projeto
npm run dev
```

### **Configuração do Supabase**
1. Crie um projeto no Supabase
2. Execute os scripts SQL na ordem:
   - `database-schema.sql`
   - `goals-system.sql`
   - `progress-tables.sql`
3. Configure as políticas RLS se necessário

---

## 📚 Documentação

### **📁 [projeto/](./projeto/)**
- [ARQUITETURA.md](./projeto/ARQUITETURA.md) - Detalhes da arquitetura
- [PRD.md](./projeto/PRD.md) - Requisitos do produto
- [ROADMAP.md](./projeto/ROADMAP.md) - Cronograma de desenvolvimento
- [PRÓXIMOS-PASSOS.md](./projeto/PRÓXIMOS-PASSOS.md) - Tarefas imediatas
- [RESUMO-EXECUTIVO.md](./projeto/RESUMO-EXECUTIVO.md) - Status atual

### **📁 [instrucoes/](./instrucoes/)**
- [PWA-ASSETS-INSTRUCTIONS.md](./instrucoes/PWA-ASSETS-INSTRUCTIONS.md) - Configuração PWA
- [INSTRUCOES-CORRECAO-RLS.md](./instrucoes/INSTRUCOES-CORRECAO-RLS.md) - Políticas de segurança

### **📁 [sql/](./sql/)**
- Scripts SQL organizados por funcionalidade

---

## 🎯 Funcionalidades Principais

### **Dashboard Inteligente**
- Widgets de exercícios do dia
- Próxima refeição planejada
- Estatísticas rápidas de progresso
- Gráficos de nutrição e exercícios

### **Sistema de Metas**
- Criação e acompanhamento de metas
- Conquistas e badges
- Progresso visual
- Lembretes personalizados

### **Acompanhamento de Progresso**
- Marcadores de conclusão persistentes
- Estatísticas semanais, mensais e anuais
- Gráficos interativos
- Histórico detalhado

---

## 🔧 Desenvolvimento

### **Scripts Disponíveis**
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Verificação de lint
npm run lint:fix     # Correção automática de lint
npm run test         # Execução de testes
```

### **Padrões de Código**
- TypeScript strict mode
- ESLint + Prettier
- Componentes funcionais com hooks
- Serviços para lógica de negócio
- Custom hooks para reutilização

---

## 📱 PWA Features

- **Instalação**: Adicione à tela inicial
- **Offline**: Funcionalidades básicas offline
- **Notificações**: Push notifications (em desenvolvimento)
- **Responsivo**: Design adaptativo

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Siga os padrões de código
4. Teste suas mudanças
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

---

## 🔗 Links Úteis

- **[Supabase](https://supabase.com/docs)**
- **[React](https://react.dev/)**
- **[Tailwind CSS](https://tailwindcss.com/docs)**
- **[Vite](https://vitejs.dev/)**
- **[Chart.js](https://www.chartjs.org/)**

---

*Última atualização: Junho 2025*