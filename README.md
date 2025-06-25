# 🎯 IkigaiHub

> **Hub de Ferramentas de Saúde - PWA mobile-first para gestão de plano alimentar e exercícios**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.5-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.2-green.svg)](https://supabase.com/)

## 📋 Visão Geral

O **IkigaiHub** é uma aplicação web progressiva (PWA) mobile-first desenvolvida para facilitar a gestão completa de saúde pessoal. O projeto oferece uma interface intuitiva para gerenciar plano alimentar e exercícios físicos, com sincronização entre dispositivos.

### 🎯 Proposta de Valor
- **Simplicidade**: Interface intuitiva e fácil de usar
- **Personalização**: Planos adaptados às necessidades individuais
- **Acessibilidade**: Disponível em qualquer dispositivo via PWA
- **Sincronização**: Dados persistentes e sincronizados entre dispositivos
- **Inteligência**: Dashboard que mostra informações relevantes baseadas no horário

## 🚀 Status do Projeto

### **Progresso Geral**: 75% Concluído
### **Versão Atual**: 1.0.0
### **Fase Atual**: Fase 6 - Sistema de Metas (60% concluído)

### **Fases Concluídas** ✅
- **Fase 1**: Base do Projeto (v0.3.0)
- **Fase 2**: Sistema de Autenticação (v0.4.0)
- **Fase 3**: CRUD Básico (v0.5.0 - v0.6.0)
- **Fase 4**: Dashboard Inteligente (v0.7.0)
- **Fase 5**: Melhorias nas Estatísticas (v0.8.0)

## 🏗️ Stack Tecnológica

### **Frontend**
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS com design system customizado
- **Estado**: React Context API + Custom Hooks
- **Roteamento**: React Router v6
- **Formulários**: React Hook Form + Zod
- **Notificações**: React Hot Toast
- **Ícones**: Lucide React

### **Backend**
- **Plataforma**: Supabase (Auth + PostgreSQL + RLS)
- **Autenticação**: Supabase Auth com JWT
- **Banco de Dados**: PostgreSQL com Row Level Security
- **Storage**: Supabase Storage (quando necessário)

### **PWA**
- **Service Worker**: Workbox
- **Manifest**: Configuração completa
- **Offline**: Funcionalidades básicas
- **Instalação**: Adicionar à tela inicial

## 📱 Funcionalidades

### ✅ **Implementadas**
- **🔐 Autenticação**: Login/logout seguro com Supabase Auth
- **🍽️ Gestão de Receitas**: CRUD completo com 6 tipos de refeição
- **🏃‍♂️ Gestão de Exercícios**: CRUD completo organizado por dia da semana
- **📊 Dashboard Inteligente**: Informações baseadas no horário atual
- **📈 Estatísticas**: Componentes especializados para nutrição e exercícios

### 🔄 **Em Desenvolvimento**
- **🎯 Sistema de Metas**: Definição e acompanhamento de objetivos (60%)

### 📋 **Planejadas**
- **⏰ Sistema de Lembretes**: Notificações personalizadas
- **🏆 Gamificação**: Badges, conquistas e desafios
- **📱 PWA Completo**: Funcionalidades offline avançadas
- **🔗 Integrações**: APIs de nutrição e wearables

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

### **4. Execute o projeto**
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

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

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com UI
npm run test:ui

# Cobertura de testes
npm run test:coverage
```

## 📚 Documentação

- **[📋 PRD](./docs/projeto/PRD.md)** - Documento de Requisitos do Produto
- **[🏗️ Arquitetura](./docs/projeto/ARQUITETURA.md)** - Documentação técnica completa
- **[🗺️ Roadmap](./docs/projeto/ROADMAP.md)** - Cronograma de desenvolvimento
- **[📊 Resumo Executivo](./docs/projeto/RESUMO-EXECUTIVO.md)** - Status atual
- **[📝 Changelog](./CHANGELOG.md)** - Histórico de versões
- **[📚 Índice](./docs/INDICE.md)** - Organização da documentação

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Commit**
Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Gabriel** - Estudante de Programação

- **GitHub**: [@seu-usuario](https://github.com/seu-usuario)
- **LinkedIn**: [seu-linkedin](https://linkedin.com/in/seu-linkedin)

## 🙏 Agradecimentos

- [React](https://react.dev/) - Framework JavaScript
- [TypeScript](https://www.typescriptlang.org/) - Linguagem tipada
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Supabase](https://supabase.com/) - Backend como serviço
- [Vite](https://vitejs.dev/) - Build tool

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

</div> 