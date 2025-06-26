# 🏗️ Arquitetura - IkigaiHub

## 📋 Visão Geral

O IkigaiHub é um PWA (Progressive Web App) desenvolvido com uma arquitetura moderna e escalável, seguindo as melhores práticas de desenvolvimento web. Este documento detalha a arquitetura técnica do projeto.

**Versão**: v1.1.0
**Última Atualização**: Janeiro 2025

---

## 🏛️ Arquitetura Geral

### **Padrão Arquitetural**
- **Frontend**: Single Page Application (SPA)
- **Backend**: Backend as a Service (BaaS) - Supabase
- **Banco de Dados**: PostgreSQL com Row Level Security
- **PWA**: Service Worker + Manifest

### **Stack Tecnológica**
```
Frontend:
├── React 18 (Framework)
├── TypeScript (Tipagem)
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── React Router v6 (Roteamento)
└── React Hot Toast (Notificações)

Backend:
├── Supabase (BaaS)
├── PostgreSQL (Banco de Dados)
├── Row Level Security (Segurança)
├── JWT (Autenticação)
└── Storage (Arquivos)

PWA:
├── VitePWA (Plugin)
├── Workbox (Service Worker)
├── Manifest (Configuração)
└── Offline (Funcionalidades)
```

---

## 📁 Estrutura de Pastas

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

## 🔧 Componentes Principais

### **1. Sistema de Autenticação**
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### **2. Dashboard Layout**
```typescript
// components/dashboard/DashboardLayout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}
```

### **3. Sistema de Metas**
```typescript
// services/GoalService.ts
interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'exercise' | 'nutrition' | 'general';
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
}
```

---

## 🗄️ Banco de Dados

### **Schema Principal**

#### **Tabela: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabela: goals**
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('exercise', 'nutrition', 'general')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabela: goal_progress**
```sql
CREATE TABLE goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Políticas RLS**
```sql
-- Política para goals
CREATE POLICY "Users can only access their own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

-- Política para goal_progress
CREATE POLICY "Users can only access their own goal progress" ON goal_progress
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🔐 Segurança

### **Row Level Security (RLS)**
- ✅ Todas as tabelas com RLS habilitado
- ✅ Políticas configuradas corretamente
- ✅ Usuários só acessam seus próprios dados
- ✅ Validação de autenticação em todas as operações

### **Autenticação**
- **JWT Tokens**: Gerenciados pelo Supabase
- **Refresh Tokens**: Renovação automática
- **Proteção de Rotas**: Componente ProtectedRoute
- **Contexto Global**: AuthContext para estado de autenticação

### **Validação de Dados**
```typescript
// Exemplo de validação no frontend
const validateGoal = (goal: Partial<Goal>): boolean => {
  return !!(goal.title && goal.type && goal.target_value && goal.unit);
};
```

---

## 🎨 Design System

### **Cores**
```css
:root {
  --primary: #10b981;      /* Verde Ikigai */
  --primary-dark: #059669;
  --secondary: #f59e0b;    /* Laranja */
  --accent: #3b82f6;       /* Azul */
  --success: #10b981;      /* Verde */
  --warning: #f59e0b;      /* Amarelo */
  --error: #ef4444;        /* Vermelho */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-900: #111827;
}
```

### **Tipografia**
```css
.font-display { font-family: 'Inter', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
```

### **Componentes Base**
- **Button**: Botões primários, secundários e terciários
- **Card**: Containers com sombra e bordas arredondadas
- **Input**: Campos de entrada com validação
- **Modal**: Diálogos modais responsivos
- **Badge**: Indicadores de status

---

## 📱 PWA (Progressive Web App)

### **Service Worker**
```typescript
// Configuração do VitePWA
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              }
            }
          }
        ]
      }
    })
  ]
});
```

### **Manifest**
```json
{
  "name": "IkigaiHub",
  "short_name": "IkigaiHub",
  "description": "Gestão completa de saúde",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

---

## 🔄 Estado da Aplicação

### **Gerenciamento de Estado**
- **React Context**: Para estado global (autenticação)
- **Custom Hooks**: Para lógica de negócio
- **Local State**: Para estado de componentes
- **Supabase**: Para persistência de dados

### **Fluxo de Dados**
```
User Action → Component → Hook → Service → Supabase → Database
     ↑                                                      ↓
     ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

### **Custom Hooks**
```typescript
// hooks/useGoals.ts
const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createGoal = async (goalData: CreateGoalData) => {
    // Lógica de criação
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    // Lógica de atualização
  };

  return { goals, loading, error, createGoal, updateGoal };
};
```

---

## 🚀 Performance

### **Otimizações Implementadas**
- **Code Splitting**: Lazy loading de componentes
- **Bundle Optimization**: Vite para build otimizado
- **Caching**: Service Worker para cache inteligente
- **Image Optimization**: Lazy loading de imagens
- **Tree Shaking**: Remoção de código não utilizado

### **Métricas de Performance**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

## 🧪 Testes

### **Estrutura de Testes**
```
tests/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
├── e2e/           # Testes end-to-end
└── setup.ts       # Configuração
```

### **Ferramentas**
- **Vitest**: Framework de testes
- **React Testing Library**: Testes de componentes
- **MSW**: Mock Service Worker para APIs
- **Playwright**: Testes E2E (planejado)

---

## 🔧 Configuração de Desenvolvimento

### **Variáveis de Ambiente**
```env
# .env.example
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_VERSION=1.1.0
VITE_APP_NAME=IkigaiHub
```

### **Scripts NPM**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

---

## 📊 Monitoramento

### **Logs e Erros**
- **Console Logs**: Reduzidos para produção
- **Error Boundaries**: Captura de erros React
- **Supabase Logs**: Monitoramento de queries
- **Performance Monitoring**: Métricas de performance

### **Analytics (Planejado)**
- **Google Analytics**: Tracking de usuários
- **Supabase Analytics**: Métricas de uso
- **Error Tracking**: Sentry ou similar

---

## 🔄 Deploy e CI/CD

### **Ambientes**
- **Development**: Local com Vite dev server
- **Staging**: Vercel/Netlify preview
- **Production**: Vercel/Netlify (planejado)

### **Pipeline (Planejado)**
```
Code Push → GitHub Actions → Build → Test → Deploy → Monitor
```

---

## 🎯 Próximas Melhorias

### **Curto Prazo**
- [ ] Otimizações de performance
- [ ] Testes automatizados
- [ ] Deploy em produção

### **Médio Prazo**
- [ ] Analytics e monitoramento
- [ ] PWA avançado
- [ ] Integrações externas

### **Longo Prazo**
- [ ] Microserviços
- [ ] Cache distribuído
- [ ] Escalabilidade horizontal

---

## 📚 Documentação Relacionada

- [Resumo Executivo](./RESUMO-EXECUTIVO.md)
- [Roadmap](./ROADMAP.md)
- [PRD](./PRD.md)
- [Instruções de Manutenção](../instrucoes/)

---

*Última atualização: Janeiro 2025 - v1.1.0*
