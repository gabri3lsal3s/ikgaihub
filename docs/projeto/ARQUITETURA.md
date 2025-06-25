# Arquitetura - IkigaiHub

## 📋 Visão Geral

O **IkigaiHub** é um PWA mobile-first desenvolvido com React 18, TypeScript e Supabase, seguindo uma arquitetura MVC (Model-View-Controller) com padrões modernos de desenvolvimento web.

> **📊 Para status atual detalhado, consulte [RESUMO-EXECUTIVO.md](./RESUMO-EXECUTIVO.md)**

---

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

### **Desenvolvimento**
- **Linting**: ESLint + TypeScript ESLint
- **Formatação**: Prettier
- **Testes**: Vitest + Testing Library
- **Build**: Vite
- **Deploy**: Vercel/Netlify (planejado)

---

## 🏛️ Padrão Arquitetural

### **MVC (Model-View-Controller)**

#### **Model (Modelo)**
- **Services**: Camada de acesso a dados
  - `RecipeService.ts` - Gerenciamento de receitas
  - `ExerciseService.ts` - Gerenciamento de exercícios
  - `GoalService.ts` - Gerenciamento de metas
  - `AchievementService.ts` - Sistema de conquistas
  - `ProgressService.ts` - Acompanhamento de progresso
  - `ReminderService.ts` - Sistema de lembretes

#### **View (Visualização)**
- **Pages**: Páginas principais da aplicação
  - `HomePage.tsx` - Dashboard principal
  - `LoginPage.tsx` - Autenticação
  - `ExercisePage.tsx` - Gestão de exercícios
  - `GoalsPage.tsx` - Sistema de metas
  - `MealPlanPage.tsx` - Plano alimentar

- **Components**: Componentes reutilizáveis
  - `dashboard/` - Componentes do dashboard
  - `goals/` - Componentes de metas
  - `Layout.tsx` - Layout principal
  - `Header.tsx` - Cabeçalho
  - `Sidebar.tsx` - Navegação lateral

#### **Controller (Controlador)**
- **Controllers**: Lógica de negócio
  - `ExerciseController.ts` - Controle de exercícios
  - `RecipeController.ts` - Controle de receitas

- **Custom Hooks**: Gerenciamento de estado
  - `useAuth.ts` - Autenticação
  - `useDashboard.ts` - Dashboard
  - `useExercises.ts` - Exercícios
  - `useRecipes.ts` - Receitas
  - `useGoals.ts` - Metas
  - `useProgress.ts` - Progresso
  - `useAchievements.ts` - Conquistas
  - `useReminders.ts` - Lembretes

---

## 📁 Estrutura de Pastas

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

---

## 🔐 Sistema de Autenticação

### **Arquitetura**
- **Supabase Auth**: Autenticação JWT
- **AuthContext**: Contexto global de autenticação
- **ProtectedRoute**: Proteção de rotas
- **useAuth Hook**: Gerenciamento de estado de autenticação

### **Fluxo**
1. Usuário acessa aplicação
2. Verificação de token JWT
3. Redirecionamento para login se não autenticado
4. Proteção de rotas privadas
5. Logout com limpeza de sessão

---

## 🗄️ Banco de Dados

### **Tabelas Principais**

#### **users** (Supabase Auth)
- `id`: UUID (chave primária)
- `email`: String
- `created_at`: Timestamp

#### **recipes**
- `id`: UUID (chave primária)
- `user_id`: UUID (chave estrangeira)
- `name`: String
- `ingredients`: Text[]
- `instructions`: Text
- `prep_time`: Integer
- `calories`: Integer (opcional)
- `meal_type`: Enum (café, lanche_manhã, almoço, lanche_tarde, jantar, ceia)
- `is_preferred`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### **exercises**
- `id`: UUID (chave primária)
- `user_id`: UUID (chave estrangeira)
- `name`: String
- `description`: Text
- `sets`: Integer
- `reps`: Integer
- `duration`: Integer (segundos)
- `day_of_week`: Integer (0-6)
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### **goals**
- `id`: UUID (chave primária)
- `user_id`: UUID (chave estrangeira)
- `title`: String
- `description`: Text
- `type`: Enum (exercise, nutrition, weight, frequency)
- `target_value`: Numeric
- `current_value`: Numeric
- `start_date`: Date
- `end_date`: Date
- `status`: Enum (active, completed, abandoned)
- `created_at`: Timestamp

#### **goal_progress**
- `id`: UUID (chave primária)
- `goal_id`: UUID (chave estrangeira)
- `value`: Numeric
- `date`: Date
- `notes`: Text
- `created_at`: Timestamp

#### **achievements**
- `id`: UUID (chave primária)
- `user_id`: UUID (chave estrangeira)
- `title`: String
- `description`: Text
- `type`: String
- `earned_at`: Timestamp

### **Políticas RLS (Row Level Security)**
- Todas as tabelas têm RLS habilitado
- Usuários só acessam seus próprios dados
- Políticas baseadas em `user_id`

---

## 🎨 Design System

### **Cores**
```css
/* Cores principais */
--ikigai-green: #059669
--ikigai-black: #1F2937

/* Sistema de cinzas */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827
```

### **Tipografia**
- **Família**: Inter (padrão do Tailwind)
- **Tamanhos**: Sistema de escala do Tailwind
- **Pesos**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### **Componentes Padronizados**
- **Botões**: Primário, secundário, outline
- **Campos**: Input, textarea, select
- **Cards**: Com sombras e bordas consistentes
- **Modais**: Overlay com backdrop
- **Notificações**: Toast notifications

---

## 🔄 Fluxo de Dados

### **Padrão de Comunicação**
```
Component → Hook → Service → Supabase → Database
     ↑                                    ↓
     ←────────── Response ←───────────────←
```

### **Exemplo: Carregamento de Receitas**
1. `RecipePage` chama `useRecipes()`
2. `useRecipes` chama `RecipeService.getRecipes()`
3. `RecipeService` faz query no Supabase
4. Dados retornam pela mesma cadeia
5. Componente re-renderiza com novos dados

---

## 🧪 Testes

### **Estrutura de Testes**
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Cobertura**: Jest Coverage
- **Setup**: `src/test/setup.ts`

### **Tipos de Testes**
- **Unitários**: Funções isoladas
- **Integração**: Componentes + hooks
- **E2E**: Fluxos completos (planejado)

---

## 🚀 Performance

### **Otimizações Implementadas**
- **Code Splitting**: Lazy loading de páginas
- **Memoização**: React.memo e useMemo
- **Bundle Size**: Tree shaking automático
- **Images**: Otimização automática

### **Métricas Alvo**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

## 🔒 Segurança

### **Medidas Implementadas**
- **Row Level Security**: Todas as tabelas
- **JWT Tokens**: Autenticação segura
- **Input Validation**: Zod schemas
- **XSS Protection**: React sanitization
- **CSRF Protection**: Supabase built-in

### **Boas Práticas**
- Validação de entrada em todos os formulários
- Sanitização de dados antes de exibição
- Controle de acesso baseado em usuário
- Logs de auditoria (planejado)

---

## 📱 PWA (Progressive Web App)

### **Funcionalidades**
- **Service Worker**: Cache inteligente
- **Manifest**: Instalação na tela inicial
- **Offline**: Funcionalidades básicas
- **Push Notifications**: Planejado

### **Assets PWA**
- Ícones em múltiplos tamanhos
- Splash screens
- Theme colors
- Display modes

---

## 🔧 Configuração de Ambiente

### **Variáveis de Ambiente**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **Scripts Disponíveis**
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx",
  "lint:fix": "eslint . --ext ts,tsx --fix",
  "test": "vitest",
  "test:coverage": "vitest --coverage"
}
```

---

## 📈 Escalabilidade

### **Arquitetura Escalável**
- **Microservices Ready**: Separação clara de responsabilidades
- **Database Scaling**: Supabase auto-scaling
- **CDN**: Assets otimizados
- **Caching**: Service Worker + Supabase cache

### **Próximos Passos**
- **API Gateway**: Para múltiplos serviços
- **Load Balancing**: Distribuição de carga
- **Monitoring**: Logs e métricas
- **CI/CD**: Pipeline automatizado

---

## 🔗 Links Relacionados

- [PRD](./PRD.md) - Documento de Requisitos do Produto
- [Roadmap](./ROADMAP.md) - Cronograma de Desenvolvimento
- [Resumo Executivo](./RESUMO-EXECUTIVO.md) - Status Atual
- [CHANGELOG](../../CHANGELOG.md) - Histórico de Mudanças
