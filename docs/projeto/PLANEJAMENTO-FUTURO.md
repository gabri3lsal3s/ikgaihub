# 🎯 **Planejamento Futuro - IkigaiHub**

## 📋 **Visão Geral**

Este documento detalha o planejamento para as próximas funcionalidades do IkigaiHub, incluindo drag and drop nas receitas, aprimoramento de animações, sistema de temas e revisão de responsividade.

**Versão**: v1.2.0  
**Data**: Janeiro 2025  
**Status**: 📋 Planejado

---

## 🎯 **1. PLANO: Drag and Drop nas Receitas**

### **📊 Análise Atual**
- **Estrutura**: Receitas organizadas por tipo de refeição (breakfast, lunch, etc.)
- **Componentes**: `MealPlanPage`, `RecipeCard`, `RecipeForm`
- **Dados**: Tabela `recipes` com campo `meal_type`
- **Limitações**: Sem funcionalidade de drag and drop

### **🎯 Objetivos**
- Permitir arrastar receitas entre refeições
- Reorganizar receitas dentro da mesma refeição
- Atualizar automaticamente o banco de dados
- Feedback visual durante o drag

### **🔧 Implementação**

#### **Fase 1: Dependências e Setup**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### **Fase 2: Componentes de Drag and Drop**
```typescript
// src/components/drag-drop/DraggableRecipeCard.tsx
// src/components/drag-drop/DroppableMealSection.tsx
// src/components/drag-drop/DragOverlay.tsx
```

#### **Fase 3: Hook Customizado**
```typescript
// src/hooks/useRecipeDragDrop.ts
interface DragDropState {
  activeId: string | null;
  overId: string | null;
  isDragging: boolean;
}

const useRecipeDragDrop = () => {
  // Lógica de drag and drop
  // Atualização do banco de dados
  // Feedback visual
}
```

#### **Fase 4: Integração com MealPlanPage**
```typescript
// Modificar MealPlanPage para usar drag and drop
// Adicionar context providers
// Implementar callbacks de atualização
```

#### **Fase 5: Serviço de Atualização**
```typescript
// src/services/RecipeService.ts - adicionar métodos
async updateRecipeMealType(recipeId: string, newMealType: MealType)
async reorderRecipesInMeal(mealType: MealType, recipeIds: string[])
```

### **📱 Responsividade**
- **Mobile**: Drag com touch gestures
- **Desktop**: Drag com mouse
- **Tablet**: Suporte híbrido

### **🎨 Feedback Visual**
- **Durante drag**: Opacidade reduzida, sombra
- **Drop zones**: Highlight quando hover
- **Sucesso**: Toast notification
- **Erro**: Feedback visual e sonoro

---

## 🎨 **2. PLANO: Aprimoramento de Animações**

### **📊 Análise Atual**
- **Animações existentes**: fadeIn, slideUp, slideDown, scaleIn
- **Tailwind**: Configurado com keyframes básicos
- **Componentes**: Algumas transições CSS
- **Limitações**: Animações limitadas e não padronizadas

### **🎯 Objetivos**
- Sistema de animações consistente
- Performance otimizada
- Animações contextuais
- Micro-interações

### **🔧 Implementação**

#### **Fase 1: Sistema de Animações**
```typescript
// src/utils/animations.ts
export const animationVariants = {
  // Entrada de componentes
  fadeInUp: { initial: {...}, animate: {...}, exit: {...} },
  slideInLeft: { initial: {...}, animate: {...}, exit: {...} },
  scaleIn: { initial: {...}, animate: {...}, exit: {...} },
  
  // Interações
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
  
  // Estados
  loading: { rotate: 360, transition: { duration: 1, repeat: Infinity } },
  success: { scale: [1, 1.1, 1], transition: { duration: 0.3 } }
}
```

#### **Fase 2: Componentes Animados**
```typescript
// src/components/ui/AnimatedCard.tsx
// src/components/ui/AnimatedButton.tsx
// src/components/ui/AnimatedModal.tsx
// src/components/ui/AnimatedList.tsx
```

#### **Fase 3: Hooks de Animações**
```typescript
// src/hooks/useAnimation.ts
const useAnimation = (variant: string, delay?: number) => {
  // Lógica de animação
  // Controle de timing
  // Performance optimization
}

// src/hooks/useIntersectionObserver.ts
const useIntersectionObserver = (threshold = 0.1) => {
  // Animações baseadas em scroll
  // Lazy loading de animações
}
```

#### **Fase 4: Integração Global**
```typescript
// src/components/AnimatedProvider.tsx
// Wrapper para toda a aplicação
// Controle centralizado de animações
```

#### **Fase 5: Micro-interações**
```typescript
// Animações específicas para:
// - Botões de ação
// - Cards de receitas/exercícios
// - Formulários
// - Notificações
// - Loading states
```

### **🎭 Tipos de Animações**
- **Entrada**: fadeIn, slideIn, scaleIn
- **Saída**: fadeOut, slideOut, scaleOut
- **Hover**: scale, glow, shadow
- **Click**: ripple, bounce
- **Loading**: spinner, skeleton
- **Success/Error**: shake, pulse

---

## 🌙 **3. PLANO: Sistema de Temas (Dark/Light/White)**

### **📊 Análise Atual**
- **Dark mode**: Implementado com Tailwind
- **Cores**: Paleta ikigai-green definida
- **Limitações**: Apenas dark/light automático
- **Falta**: Controle manual e tema branco

### **🎯 Objetivos**
- 3 temas: Dark (atual), Light (atual), White (novo)
- Controle manual via botão
- Persistência no localStorage
- Transições suaves entre temas

### **🔧 Implementação**

#### **Fase 1: Contexto de Tema**
```typescript
// src/contexts/ThemeContext.tsx
type Theme = 'dark' | 'light' | 'white';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lógica do contexto
  // Persistência no localStorage
  // Aplicação de classes CSS
}
```

#### **Fase 2: Configuração de Cores**
```typescript
// tailwind.config.js - adicionar tema white
theme: {
  extend: {
    colors: {
      // Tema White
      'white-theme': {
        primary: '#059669',
        secondary: '#1F2937',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        border: '#E5E7EB'
      }
    }
  }
}
```

#### **Fase 3: Componente de Controle**
```typescript
// src/components/ThemeToggle.tsx
const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setTheme('dark')}>
        <Moon className="h-5 w-5" />
      </button>
      <button onClick={() => setTheme('light')}>
        <Sun className="h-5 w-5" />
      </button>
      <button onClick={() => setTheme('white')}>
        <Circle className="h-5 w-5" />
      </button>
    </div>
  );
};
```

#### **Fase 4: Hook de Tema**
```typescript
// src/hooks/useTheme.ts
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

#### **Fase 5: Integração Global**
```typescript
// src/App.tsx - adicionar ThemeProvider
// src/components/Header.tsx - adicionar ThemeToggle
// Atualizar todos os componentes para suportar tema white
```

### **🎨 Paletas de Cores**

#### **Tema Dark (Atual)**
- Background: `#111827`
- Surface: `#1F2937`
- Text: `#F9FAFB`
- Primary: `#059669`

#### **Tema Light (Atual)**
- Background: `#F9FAFB`
- Surface: `#FFFFFF`
- Text: `#111827`
- Primary: `#059669`

#### **Tema White (Novo)**
- Background: `#FFFFFF`
- Surface: `#F9FAFB`
- Text: `#111827`
- Primary: `#059669`
- Accent: `#F3F4F6`

---

## 📱 **4. PLANO: Revisão de Responsividade**

### **📊 Análise Atual**
- **Breakpoints**: xs (475px), md (768px), lg (1024px), 3xl (1600px)
- **Layout**: Mobile-first implementado
- **Componentes**: Alguns problemas de responsividade
- **Limitações**: Inconsistências em alguns componentes

### **🎯 Objetivos**
- Responsividade perfeita em todos os dispositivos
- Otimização para diferentes tamanhos de tela
- Melhor experiência mobile
- Performance otimizada

### **🔧 Implementação**

#### **Fase 1: Auditoria de Responsividade**
```typescript
// Análise de todos os componentes:
// - Header e Sidebar
// - Dashboard components
// - Formulários
// - Cards e grids
// - Modais e overlays
```

#### **Fase 2: Breakpoints Otimizados**
```typescript
// tailwind.config.js - ajustar breakpoints
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1600px',
}
```

#### **Fase 3: Componentes Responsivos**
```typescript
// src/components/responsive/ResponsiveGrid.tsx
// src/components/responsive/ResponsiveCard.tsx
// src/components/responsive/ResponsiveForm.tsx
// src/components/responsive/ResponsiveModal.tsx
```

#### **Fase 4: Layout Adaptativo**
```typescript
// src/components/layout/AdaptiveLayout.tsx
const AdaptiveLayout: React.FC = ({ children }) => {
  const { width } = useWindowSize();
  
  if (width < 768) {
    return <MobileLayout>{children}</MobileLayout>;
  } else if (width < 1024) {
    return <TabletLayout>{children}</TabletLayout>;
  } else {
    return <DesktopLayout>{children}</DesktopLayout>;
  }
};
```

#### **Fase 5: Otimizações Específicas**

##### **Mobile (< 768px)**
- Sidebar colapsável
- Cards empilhados
- Botões maiores
- Touch-friendly interactions
- Swipe gestures

##### **Tablet (768px - 1024px)**
- Grid 2x2 para cards
- Sidebar compacta
- Formulários otimizados
- Modais responsivos

##### **Desktop (> 1024px)**
- Grid 3x3 para cards
- Sidebar completa
- Hover effects
- Keyboard shortcuts

### **📱 Componentes Específicos**

#### **Dashboard**
```typescript
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
```

#### **Formulários**
```typescript
// Layout responsivo
<div className="space-y-4 md:space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

#### **Cards**
```typescript
// Tamanhos adaptativos
<div className="p-4 md:p-6 lg:p-8">
  <h3 className="text-lg md:text-xl lg:text-2xl">
```

### **🎯 Métricas de Performance**
- **Mobile**: < 3s carregamento
- **Tablet**: < 2s carregamento  
- **Desktop**: < 1s carregamento
- **Lighthouse Score**: > 90

---

## 📅 **Cronograma de Implementação**

### **Semana 1-2: Drag and Drop**
- Setup de dependências
- Componentes básicos
- Integração com MealPlanPage

### **Semana 3-4: Animações**
- Sistema de animações
- Componentes animados
- Micro-interações

### **Semana 5-6: Sistema de Temas**
- Contexto de tema
- Tema white
- Integração global

### **Semana 7-8: Responsividade**
- Auditoria completa
- Otimizações específicas
- Testes em diferentes dispositivos

### **Semana 9-10: Testes e Refinamentos**
- Testes de usabilidade
- Otimizações de performance
- Correções de bugs

---

## 🎯 **Estrutura de Arquivos Proposta**

```
src/
├── components/
│   ├── drag-drop/
│   │   ├── DraggableRecipeCard.tsx
│   │   ├── DroppableMealSection.tsx
│   │   └── DragOverlay.tsx
│   ├── ui/
│   │   ├── AnimatedCard.tsx
│   │   ├── AnimatedButton.tsx
│   │   ├── AnimatedModal.tsx
│   │   └── AnimatedList.tsx
│   ├── responsive/
│   │   ├── ResponsiveGrid.tsx
│   │   ├── ResponsiveCard.tsx
│   │   ├── ResponsiveForm.tsx
│   │   └── ResponsiveModal.tsx
│   ├── layout/
│   │   ├── AdaptiveLayout.tsx
│   │   ├── MobileLayout.tsx
│   │   ├── TabletLayout.tsx
│   │   └── DesktopLayout.tsx
│   └── ThemeToggle.tsx
├── contexts/
│   └── ThemeContext.tsx
├── hooks/
│   ├── useRecipeDragDrop.ts
│   ├── useAnimation.ts
│   ├── useIntersectionObserver.ts
│   ├── useTheme.ts
│   └── useWindowSize.ts
├── utils/
│   └── animations.ts
└── services/
    └── RecipeService.ts (atualizado)
```

---

## 🎯 **Critérios de Sucesso**

### **Drag and Drop**
- [ ] Receitas podem ser arrastadas entre refeições
- [ ] Reordenação funciona dentro da mesma refeição
- [ ] Feedback visual durante o drag
- [ ] Persistência no banco de dados
- [ ] Funciona em mobile e desktop

### **Animações**
- [ ] Sistema consistente implementado
- [ ] Performance otimizada (60fps)
- [ ] Micro-interações funcionais
- [ ] Animações contextuais
- [ ] Redução de motion para acessibilidade

### **Sistema de Temas**
- [ ] 3 temas funcionais (Dark, Light, White)
- [ ] Controle manual via botão
- [ ] Persistência no localStorage
- [ ] Transições suaves
- [ ] Todos os componentes suportam os temas

### **Responsividade**
- [ ] Funciona perfeitamente em mobile (< 768px)
- [ ] Funciona perfeitamente em tablet (768px - 1024px)
- [ ] Funciona perfeitamente em desktop (> 1024px)
- [ ] Performance otimizada em todos os dispositivos
- [ ] Lighthouse Score > 90

---

## 🚀 **Próximos Passos**

1. **Definir prioridades**: Qual funcionalidade implementar primeiro?
2. **Setup inicial**: Instalar dependências necessárias
3. **Prototipagem**: Criar protótipos para validação
4. **Implementação incremental**: Uma funcionalidade por vez
5. **Testes contínuos**: Validar em diferentes dispositivos

---

## 📊 **Impacto Esperado**

### **UX/UI**
- **Drag and Drop**: +40% facilidade de organização
- **Animações**: +30% percepção de qualidade
- **Temas**: +25% satisfação do usuário
- **Responsividade**: +50% usabilidade mobile

### **Performance**
- **Animações**: 60fps consistentes
- **Responsividade**: < 3s carregamento mobile
- **Drag and Drop**: < 100ms resposta
- **Temas**: < 50ms transição

### **Métricas Técnicas**
- **Lighthouse Score**: > 90
- **Core Web Vitals**: Otimizados
- **Accessibility**: WCAG 2.1 AA
- **SEO**: Melhorado

---

## 🔧 **Dependências Necessárias**

### **Drag and Drop**
```json
{
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@dnd-kit/utilities": "^3.2.0"
}
```

### **Animações**
```json
{
  "framer-motion": "^10.0.0"
}
```

### **Responsividade**
```json
{
  "react-use": "^17.0.0"
}
```

---

## 📝 **Notas de Implementação**

### **Considerações Técnicas**
- Manter compatibilidade com PWA
- Otimizar para performance mobile
- Seguir padrões de acessibilidade
- Manter consistência com design system

### **Riscos e Mitigações**
- **Performance**: Monitorar métricas durante implementação
- **Compatibilidade**: Testar em diferentes navegadores
- **Acessibilidade**: Validar com screen readers
- **UX**: Testes de usabilidade com usuários reais

---

*Última atualização: Janeiro 2025 - v1.2.0* 