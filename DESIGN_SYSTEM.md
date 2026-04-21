# Guia de Design — App Financeiro "Makro"

> Documento de referência para replicar a identidade visual, UX e padrões de interação deste app.

---

## 1. Filosofia de Design

**Princípio:** Dark-first, minimalista, com informações densas mas respiráveis. O app é uma ferramenta financeira profissional — não decorativa. Cada pixel tem função.

- **Densidade informativa:** muitos dados em pouco espaço, sem poluição visual
- **Hierarquia por cor, não por tamanho:** accent = interativo, income = positivo, expense = negativo
- **Motion com propósito:** animações de entrada (stagger) e feedback micro (hover, tap) — nunca decorativas
- **Zero bordas desnecessárias:** separação por espaçamento e contraste de superfície, não por linhas

---

## 2. Tipografia

### Fontes

| Uso | Fonte | Pesos |
|-----|-------|-------|
| Corpo geral | **Manrope** | 300, 400, 500, 600, 700, 800 |
| Números e títulos | **Space Grotesk** | 400, 500, 600, 700 |

### Classes Tailwind

```html
<body>           font-sans  (Manrope)
<h1>-<h6>        font-display (Space Grotesk) + letter-spacing: -0.02em
.números grandes font-display tracking-tight
.labels pequenas uppercase tracking-wider
```

### Hierarquia Tipográfica

| Elemento | Tamanho | Peso | Fonte | Exemplo |
|----------|---------|------|-------|---------|
| Saldo principal | `text-5xl` (48px) | bold | display | `R$ 15.000,00` |
| Títulos de página | `text-3xl` (30px) | bold | display | "Dashboard" |
| Subtítulo de seção | `text-xl` (20px) | semibold | display | "Fatura Atual" |
| Valor em cards | `text-2xl` a `text-4xl` | bold | display | valores monetários |
| Label uppercase | `text-xs` | medium, uppercase, tracking-wider | sans | "TOTAL ORÇADO" |
| Corpo | `text-sm` (14px) | medium/normal | sans | textos descritivos |
| Texto secundário | `text-sm` + `text-text-secondary` | — | — | informações auxiliares |
| Texto terciário | `text-xs` + `text-text-tertiary` | — | — | datas, metadados |

---

## 3. Cores

### Tema Escuro (padrão)

```css
--color-background:     #050505   /* quase preto absoluto */
--color-surface:        #0d0d0d   /* cards, sidebar */
--color-surface-hover:  #151515   /* hover em cards */
--color-surface-elevated: #1a1a1a /* inputs, modais */
--color-border:         #1a1a1a   /* bordas sutis */
--color-border-hover:   #2a2a2a
--color-text:           #f5f5f5   /* branco suave */
--color-text-secondary: #a3a3a3   /* cinza médio */
--color-text-tertiary:  #666666   /* cinza escuro */
--color-accent:         #a3e635   /* lime — CTAs e ícones ativos */
--color-accent-hover:   #bef264
--color-income:         #22c55e   /* verde — receitas, saldo positivo */
--color-income-bg:      rgba(34,197,94,0.1)
--color-expense:        #ef4444   /* vermelho — despesas, faturas */
--color-expense-bg:     rgba(239,68,68,0.1)
--color-chart:          #f5f5f5   /* cor dos gráficos */
--color-card-glow:      rgba(163,230,53,0.06)  /* glow sutil nos cards */
```

### Tema Claro

```css
--color-background:     #ffffff   /* off-white */
--color-surface:        #f9f9f9   /* cinza quase branco */
--color-surface-hover:  #f0f0f0
--color-surface-elevated: #ffffff
--color-border:         #e5e5e5   /* cinza claro */
--color-border-hover:   #d4d4d4
--color-text:           #050505   /* quase preto */
--color-text-secondary: #525252
--color-text-tertiary:  #737373
--color-accent:         #84cc16   /* verde oliva mais forte */
--color-accent-hover:   #65a30d
--color-income:         #16a34a   /* verde mais escuro */
--color-income-bg:      rgba(22, 163, 74, 0.08)
--color-expense:        #dc2626   /* vermelho mais forte */
--color-expense-bg:     rgba(220, 38, 38, 0.08)
--color-chart:          #050505
--color-card-glow:      rgba(132, 204, 22, 0.04)
```

### Regras de Uso de Cores

| Cor | Uso Obrigatório | Nunca Usar Para |
|-----|-----------------|-----------------|
| `accent` (lime) | CTAs primários, ícones de item ativo, links de navegação, progresso | Textos longos (cansa a vista) |
| `income` (verde) | Receitas, saldo positivo, progresso de metas, itens "pago" | Despesas ou valores negativos |
| `expense` (vermelho) | Despesas, faturas pendentes, valores negativos, botões de remover | Itens positivos ou neutros |
| `text-tertiary` | Metadados, datas, placeholders, labels desativados | Conteúdo principal |
| `border` | Separar cards, inputs, listas | Elementos que precisam de destaque |

### Efeitos Atmosféricos

1. **Noise overlay:** pseudo-elemento `body::before` com SVG de fractal noise em 1.5% opacidade — dá textura sutil ao fundo
2. **Gradient orb:** `body::after` com radial gradient no canto superior direito, visível apenas em `lg:` — dá profundidade ao fundo

---

## 4. Espaçamento e Layout

### Estrutura de Página

```
┌───────────────────────────────────────────────────┐
│ Sidebar │ px-4 lg:px-8 pt-6 pb-10 (main content)  │
│         │                                         │
│         │  mb-8 (header da página)                │
│         │  mb-8 (primeira seção / indicadores)    │
│         │  mb-8 (segunda seção / conteúdo)        │
└───────────────────────────────────────────────────┘
```

### Sidebar

| Estado | Largura | Comportamento |
|--------|---------|---------------|
| Expandida | `260px` | Ícone + label + cor de fundo no item ativo |
| Recolhida | `72px` | Apenas ícone centralizado, tooltip com label |
| Mobile | `280px` | Overlay (backdrop-blur) + animação lateral |
| Transição | `width 0.3s cubic-bezier(0.4,0,0.2,1)` | CSS, nunca framer-motion |

### Espaçamento entre Elementos

| Contexto | Classe | Valor |
|----------|--------|-------|
| Entre seções de página | `mb-8` | 32px |
| Entre cards em grid | `gap-4` a `gap-6` | 16-24px |
| Dentro de cards | `p-5` a `p-6` | 20-24px |
| Entre itens de lista | `gap-1` | 4px |
| Entre ícone e texto | `gap-2` a `gap-3` | 8-12px |
| Logo/sidebar top | `mb-8` | 32px |

### Grid System

- **Resumo cards:** `grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4`
- **Layout duplo:** `grid-cols-1 gap-6 lg:grid-cols-3` (2/3 conteúdo, 1/3 resumo)
- **Dashboard Principal:** `grid-cols-1 lg:grid-cols-3 gap-6`

---

## 5. Componentes

### Cards

```html
<div class="rounded-lg border border-border bg-surface p-5/6 relative overflow-hidden">
  <!-- Efeito decorativo (opcional) -->
  <div class="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-accent/5 blur-3xl" />
  <div class="relative">
    <!-- conteúdo -->
  </div>
</div>
```

**Regras:**
- Sempre `rounded-lg` (12px), borda `border-border`, fundo `bg-surface`
- `relative overflow-hidden` quando tem efeito decorativo
- Efeito decorativo: blur orb posicionado fora do card (`-top-20 -right-20`)

### Cards de Resumo (Dashboard)

- `rounded-lg` com hover: `whileHover={{ y: -2 }}` (framer-motion)
- Hover revela gradiente sutil: `group-hover:from-accent/[0.03]`
- Ícone em container `h-8 w-8 rounded-md bg-surface-elevated`
- Label em `text-[10px] uppercase font-bold text-text-tertiary tracking-widest`
- Valor em `text-2xl font-bold font-display tracking-tight`

### Inputs

```html
<input class="rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm
  focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30
  transition-colors" />
```

**Regras:**
- `rounded-lg` para inputs, `rounded-md` para botões secundários
- Fundo `bg-surface-elevated` (mais claro que o card no dark)
- Focus: borda accent + ring accent/30
- Labels: `text-sm font-medium text-text-secondary mb-1.5`

### Botões Primários

```html
<button class="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background
  shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all">
```

**Regras:**
- Fundo accent, texto background (preto no dark, branco no light)
- Sombra: `shadow-lg shadow-accent/20`
- Hover: `bg-accent/90` e `scale-[1.02]`
- Motion: `whileHover={{ scale: 1.02 }}` `whileTap={{ scale: 0.98 }}`

### Badges / Tags

```html
<span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
  bg-income/10 text-income border border-income/20">pago</span>
```

### Lista de Itens (Tabelas e Grids)

```html
<div class="flex flex-col gap-1">
  <div class="flex items-center justify-between rounded-md px-3 py-3
    hover:bg-surface-hover transition-colors group">
    <!-- esquerda: ícone + texto -->
    <!-- direita: valor + ações -->
    <div class="flex gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
       <!-- botões de ação -->
    </div>
  </div>
</div>
```

**Regras:**
- `gap-1` entre itens (4px — denso)
- **Ações Mobile-First:** Botões de ação devem estar sempre visíveis em dispositivos touch. Use `lg:opacity-0 lg:group-hover:opacity-100` para esconder apenas em telas com mouse.
- No Mobile, prefira layouts flex-col para listas de itens complexos.

### Empty States

```html
<div class="py-12 text-center text-text-tertiary">
  <Icon className="h-8 w-8 mx-auto mb-3 opacity-20" />
  <p class="text-sm">Nenhum item registrado</p>
</div>
```

---

## 10. Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| `sm:` | Grids adaptativos, tabelas com scroll horizontal |
| `md:` | Resumos em 2 colunas |
| `lg:` | Sidebar fixa, Resumos em 4 colunas, Ações ocultas (hover) |

---

## 13. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 14+ |
| UI | React | 18+ |
| Estilização | Tailwind CSS | — |
| Animações | Framer Motion | — |
| Banco | Supabase (PostgreSQL) | — |
| Gráficos | Recharts | — |
| Ícones | Lucide React | — |
| Linguagem | TypeScript strict | — |

### Estrutura de Arquivos Real

```
app/
  layout.tsx              ← root layout
  (app)/layout.tsx        ← shell do app (sidebar + header)
  (app)/page.tsx          ← dashboard principal
  (app)/vendas/           ← histórico de vendas
  (app)/vendas/nova/      ← criação/edição de vendas
  (app)/despesas/         ← gestão de custos
  (app)/clientes/         ← base de contatos
  (app)/produtos/         ← catálogo de serviços/produtos
  (app)/inadimplencia/    ← monitor de cobranças atrasadas
  (app)/relatorios/       ← análises consolidadas
components/
  Sidebar.tsx
  SummaryCards.tsx
  CashFlowTimeline.tsx
  SaleDetailsModal.tsx
  ...
```

---

## 14. Checklist de Replicação

- [x] Cores Lime (#a3e635) e Background (#050505) configuradas
- [x] Fontes Manrope e Space Grotesk ativas
- [x] Noise overlay no `body::before`
- [x] Botões de ação visíveis no Mobile (`lg:opacity-0`)
- [x] Tabelas com `overflow-x-auto` e `min-w` adequados
- [x] Sidebar com suporte a Mobile (Overlay)
- [x] Layouts de formulário usando `grid-cols-1 sm:grid-cols-2`
