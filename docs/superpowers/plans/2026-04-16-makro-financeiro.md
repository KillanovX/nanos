# Makro Financeiro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um aplicativo web para profissionais autônomos gerenciarem fluxo de caixa, vendas parceladas e inadimplência, seguindo o `@DESIGN_SYSTEM.md`.

**Architecture:** Single Page Application (SPA) baseada em Next.js 16 (App Router), Supabase para backend/auth e Zustand para estado global. Foco em geração automática de parcelas e visibilidade de recebíveis futuros.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Supabase, Zustand, Recharts, Lucide React.

---

### Task 1: Setup do Projeto e Variáveis de Ambiente

**Files:**
- Create: `.env.local`
- Modify: `app/layout.tsx`
- Modify: `globals.css` (Implementar CSS variables do `@DESIGN_SYSTEM.md`)

- [ ] **Step 1: Definir variáveis globais de CSS**
Implementar todas as cores (`--color-background`, `--color-accent`, etc.) e fontes conforme o `@DESIGN_SYSTEM.md` na `globals.css`.

- [ ] **Step 2: Configurar Supabase Client**
Criar `lib/supabase.ts` com o cliente básico para autenticação e banco.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "chore: initial project setup and design variables"
```

### Task 2: Layout Principal e Sidebar (Makro Style)

**Files:**
- Create: `components/Sidebar.tsx`
- Modify: `app/(app)/layout.tsx`
- Create: `store/sidebar-store.ts`

- [ ] **Step 1: Criar Store da Sidebar (Zustand)**
Gerenciar o estado `collapsed` com persistência.

- [ ] **Step 2: Implementar Sidebar com CSS Transitions**
Seguir a regra: `260px` expandida, `72px` recolhida. Usar Lucide React para ícones.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: add responsive sidebar with zustand state"
```

### Task 3: Gestão de Produtos e Cálculo de Margem

**Files:**
- Create: `app/(app)/produtos/page.tsx`
- Create: `components/ProductForm.tsx`

- [ ] **Step 1: Criar tabela de produtos**
Tabela minimalista mostrando Nome, Custo, Preço e Margem (%) em Ouro (`accent`).

- [ ] **Step 2: Implementar Modal de Cadastro**
Input com `bg-surface-elevated` e focus ring `accent`.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: add product management with margin calculation"
```

### Task 4: Fluxo de Vendas e Gerador Automático de Parcelas

**Files:**
- Create: `app/(app)/vendas/nova/page.tsx`
- Create: `lib/finance-utils.ts` (Lógica de parcelamento)

- [ ] **Step 1: Implementar Lógica de Parcelamento**
Função que recebe `valor_total`, `num_parcelas` e `taxa_meio`, e retorna um array de objetos `Parcela`.

- [ ] **Step 2: Tela de Nova Venda**
Formulário dinâmico que permite selecionar Cliente, Produtos e Meio de Pagamento. Exibir prévia das parcelas.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: add sales flow with automatic installment generation"
```

### Task 5: Dashboard e Linha do Tempo (Previsibilidade)

**Files:**
- Create: `app/(app)/page.tsx` (Dashboard)
- Create: `components/SummaryCards.tsx`
- Create: `components/CashFlowTimeline.tsx`

- [ ] **Step 1: Criar Cards de Resumo**
4 cards com `shadow-accent/20` e animação `whileHover={{ y: -2 }}`. Indicadores de Saldo, A Receber e Inadimplência.

- [ ] **Step 2: Implementar Gráfico de Projeção**
Usar Recharts para mostrar a linha do tempo dos próximos 6 meses.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: implement dashboard with cashflow projection"
```

### Task 6: Central de Inadimplência

**Files:**
- Create: `app/(app)/inadimplencia/page.tsx`

- [ ] **Step 1: Filtrar Clientes Inadimplentes**
Query no Supabase ou filtro local que busca parcelas com `status == 'pendente'` e `vencimento < hoje`.

- [ ] **Step 2: UI de Cobrança**
Lista de devedores com badge vermelho `atrasado` e botão de contato rápido.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: add delinquency center and overdue tracking"
```

### Task 7: Polimento Visual e Animações (Frontend Design Final)

**Files:**
- Modify: Todas as views
- Create: `components/AnimatedNumber.tsx`

- [ ] **Step 1: Adicionar Noise Overlay e Orbs**
Implementar o `body::before` (noise) e `body::after` (gradient orb) conforme o `@DESIGN_SYSTEM.md`.

- [ ] **Step 2: Implementar Números Animados**
Usar Framer Motion para o efeito de "rolling numbers" nos saldos do dashboard.

- [ ] **Step 3: Validação Final**
Verificar contraste, tipografia (Manrope/Space Grotesk) e responsividade (mobile vs desktop).

- [ ] **Step 4: Commit Final**
```bash
git add .
git commit -m "style: final polish with atmospheric effects and animations"
```
