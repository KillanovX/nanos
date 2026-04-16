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
--color-accent:         #f0c95a   /* ouro/dourado — CTAs e ícones ativos */
--color-accent-hover:   #f5d77a
--color-income:         #34d399   /* verde — receitas, saldo positivo */
--color-income-bg:      rgba(52,211,153,0.1)
--color-expense:        #f87171   /* vermelho — despesas, faturas */
--color-expense-bg:     rgba(248,113,113,0.1)
--color-chart:          #f5f5f5   /* cor dos gráficos */
--color-card-glow:      rgba(240,201,90,0.06)  /* glow sutil nos cards */
```

### Tema Claro

```css
--color-background:     #fafafa   /* off-white */
--color-surface:        #ffffff   /* branco puro */
--color-surface-hover:  #f5f5f5
--color-surface-elevated: #ffffff
--color-border:         #e5e5e5   /* cinza claro */
--color-border-hover:   #d4d4d4
--color-text:           #0a0a0a   /* quase preto */
--color-text-secondary: #666666
--color-text-tertiary:  #a3a3a3
--color-accent:         #b8860b   /* dark goldenrod — mais contraste no claro */
--color-accent-hover:   #d4a017
--color-income:         #059669   /* verde mais escuro */
--color-income-bg:      rgba(5,150,105,0.08)
--color-expense:        #dc2626   /* vermelho mais forte */
--color-expense-bg:     rgba(220,38,38,0.08)
--color-chart:          #0a0a0a
--color-card-glow:      rgba(184,134,11,0.04)
```

### Regras de Uso de Cores

| Cor | Uso Obrigatório | Nunca Usar Para |
|-----|-----------------|-----------------|
| `accent` (ouro) | CTAs primários, ícones de item ativo, links de navegação, progresso | Textos longos (cansa a vista) |
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
┌─────────────────────────────────────────────┐
│ Sidebar │ px-8 pt-6 pb-8 (main content)    │
│         │                                   │
│         │  mb-8 (header da página)          │
│         │  mb-8 (primeira seção)            │
│         │  mb-8 (segunda seção)             │
│         │  (última seção, sem margin-bottom)│
└─────────────────────────────────────────────┘
```

### Sidebar

| Estado | Largura | Comportamento |
|--------|---------|---------------|
| Expandida | `260px` | Ícone + label + cor de fundo no item ativo |
| Recolhida | `72px` | Apenas ícone centralizado, tooltip com label |
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

- **Resumo cards:** `grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`
- **Layout duplo:** `grid-cols-1 gap-6 lg:grid-cols-2`
- **Dashboard 2-col:** `grid-cols-1 gap-6 lg:grid-cols-2` (transações + datas)

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
- Label em `text-xs uppercase tracking-wider text-text-tertiary`
- Valor em `text-xl font-bold font-display tracking-tight`

### Inputs

```html
<input class="rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm
  focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30
  transition-colors" />
```

**Regras:**
- `rounded-lg` (16px) para inputs, `rounded-md` para botões secundários
- Fundo `bg-surface-elevated` (mais claro que o card)
- Focus: borda accent + ring accent/30
- Labels: `text-sm font-medium text-text-secondary mb-1.5`

### Botões Primários

```html
<button class="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background
  shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors">
```

**Regras:**
- Fundo accent, texto background (preto no dark, branco no light)
- Sombra: `shadow-lg shadow-accent/20`
- Hover: `bg-accent/90`
- Motion: `whileHover={{ scale: 1.02 }}` `whileTap={{ scale: 0.98 }}`

### Botões Secundários

```html
<button class="rounded-lg border border-border bg-surface-elevated px-3 py-2
  text-xs font-semibold text-text-secondary hover:text-text hover:border-accent/30
  transition-colors">
```

### Badges / Tags

```html
<span class="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider
  bg-income/10 text-income">pago</span>

<span class="rounded-full bg-surface-elevated border border-border px-3 py-1.5
  text-xs font-semibold font-display">3/12 parcelas</span>
```

### Pills (seletor de cartão)

```html
<button class="rounded-full px-4 py-2 text-xs font-semibold
  bg-accent text-background">     <!-- ativo -->
<button class="rounded-full px-4 py-2 text-xs font-semibold
  border border-border bg-surface text-text-secondary"> <!-- inativo -->
```

### Modal

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
  <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl">
    <!-- header com título + botão X -->
    <!-- form -->
  </div>
</div>
```

- `rounded-2xl` (24px) para modais
- `max-w-md` para forms, `max-w-sm` para ações simples
- Backdrop: `bg-black/60 backdrop-blur-sm`

### Barra de Progresso

- Fundo: `bg-surface-elevated` com `rounded-full h-2`
- Preenchimento: `bg-accent` (ou income/expense conforme contexto) `rounded-full h-2`
- Usar `style={{ width: `${pct}%` }}`

### Lista de Itens

```html
<div class="flex flex-col gap-1">
  <div class="flex items-center justify-between rounded-md px-3 py-3
    hover:bg-surface-hover transition-colors group">
    <!-- esquerda: ícone + texto -->
    <!-- direita: valor + botão de ação (opacity-0 group-hover:opacity-100) -->
  </div>
</div>
```

**Regras:**
- `gap-1` entre itens (4px — denso)
- Botões de ação: `opacity-0 group-hover:opacity-100` — só aparecem no hover
- `rounded-md` para itens de lista (menor que cards)

### Empty States

```html
<div class="py-12 text-center text-text-tertiary">
  <Icon className="h-8 w-8 mx-auto mb-3 opacity-50" />
  <p class="text-sm">Nenhum item registrado</p>
  <p class="text-xs mt-1">Clique em "Novo Item" para começar</p>
</div>
```

---

## 6. Animações

### Regras Gerais

- **Nunca** usar `layout` do framer-motion em containers grandes (sidebar, página inteira)
- Usar `motion.div` com `variants` para stagger
- CSS `transition` para propriedades simples (width, opacity, color)
- Framer Motion para: entrada de elementos, modais, exit com AnimatePresence

### Padrão de Entrada de Páginas

```tsx
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

return (
  <motion.div initial="hidden" animate="visible" variants={pageVariants}>
    <motion.div variants={cardVariants}>Card 1</motion.div>
    <motion.div variants={cardVariants}>Card 2</motion.div>
  </motion.div>
);
```

### Números Animados (Rolling)

```ts
function useAnimatedNumber(target: number, duration = 1000) {
  // requestAnimationFrame com easeOutExpo:
  const eased = t === 1 ? 1 : 1 - 2 ** (-10 * t);
  // duration: 1200ms para saldo, 1000ms para cards, 800ms para resumo
}
```

### Hover em Cards

```tsx
whileHover={{ y: -2 }}
```
— sutil, apenas 2px para cima

### Botões

```tsx
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

### Modais

```tsx
// backdrop
initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
// conteúdo
initial={{ opacity: 0, scale: 0.95, y: 16 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 16 }}
```

### List Items (AnimatePresence)

```tsx
initial={{ opacity: 0, y: -8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, x: 20 }}
transition={{ duration: 0.2 }}
```

### Sidebar Collapse

**NUNCA usar framer-motion `layout` na sidebar.** Usar CSS puro:

```css
width: collapsed ? 72 : 260;
transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
overflow: hidden;
```

Labels com text collapse:

```css
maxWidth: collapsed ? 0 : 150;
opacity: collapsed ? 0 : 1;
transition: max-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s;
overflow: hidden;
flex-shrink: 0;
```

Ícones: posição fixa, sem `justify-center`, com `flex-shrink: 0` — nunca se movem.

---

## 7. Ícones

### Biblioteca

**Lucide React** — todos os ícones da mesma família, peso consistente.

### Tamanhos

| Contexto | Tamanho | Classe |
|----------|---------|--------|
| Navegação sidebar | 16px | `h-4 w-4` |
| Ícones em cards de resumo | 16px | `h-4 w-4` |
| Ícones de seção | 16px | `h-4 w-4` |
| Ícones de ação (trash, close) | 14-16px | `h-3.5 w-3.5` ou `h-4 w-4` |
| Empty state | 32-48px | `h-8 w-8` ou `h-12 w-12` |
| Badge pequeno | 12-14px | `h-3 w-3` |

### Container de Ícone

```html
<div class="h-9 w-9 rounded-md bg-accent/10 flex items-center justify-center">
  <Icon class="h-4 w-4 text-accent" />
</div>
```

- Cores de fundo: `bg-{cor}/10` (10% opacidade)
- Cor do ícone: `text-{cor}`

---

## 8. Padrões de Navegação

### Sidebar

- Items: `rounded-md`, padding `10px 12px`, font `text-sm font-medium`
- Item ativo: barra vertical accent à esquerda (`w-1 h-5 rounded-full bg-accent`) + cor accent no ícone e label
- Hover: `hover:bg-surface-hover`
- Recolhido: tooltip com `title={label}` nativo do browser

### Fluxo entre Páginas

- Todas as páginas seguem o padrão: header (`mb-8`) → conteúdo em seções (`mb-8` entre elas)
- Breadcrumbs não existem — navegação é flat via sidebar
- Cards clicáveis levam à página correspondente

---

## 9. Gráficos

### Biblioteca

**Recharts** — charts leves que aceitam tema via CSS variables.

### Configurações

```tsx
<XAxis axisLine={false} tickLine={false}
  tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }} />
<YAxis axisLine={false} tickLine={false}
  tick={{ fill: "var(--color-text-tertiary)", fontSize: 10 }} />
<Tooltip contentStyle={{
  background: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
}} />
```

### Cores de Gráfico (categoria)

Sequência padrão para donut/bar/pie:

```
var(--color-accent), #a3a3a3, #666666, #404040,
#d97706, #0891b2, #7c3aed, #dc2626, #6b7280
```

### Barras

```tsx
<Bar dataKey="receitas" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
<Bar dataKey="despesas" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
```

### Heights Padrão

- Bar chart: `height={220}`
- Donut/pie: `height={160}`
- Line chart: componente customizado

---

## 10. Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| `sm:` | Grid de 1 para 2 colunas nos resumos |
| `lg:` | Grid completo (4 colunas), sidebar visível, gradient orb ativo |
| `< lg` | Sidebar colapsa, 2-col para 1-col |

### Regras

- Cards: sempre `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` para resumo
- Layouts lado a lado: `grid-cols-1 gap-6 lg:grid-cols-2`
- Textos: `text-5xl` no desktop, pode reduzir no mobile (mas o app não usa `text-4xl` mobile explicitamente — depende do container)

---

## 11. Efeitos Visuais Específicos

### Glow no Card Visual de Crédito

```tsx
<div class="absolute inset-0 rounded-2xl"
  style={{ boxShadow: `0 0 40px ${glowColor}` }}
/>
```

### Blur Orb Decorativo nos Cards

```html
<div class="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-{cor}/5 blur-3xl" />
```

Usar `cor` relevante ao contexto: `accent` para neutro, `income` para receita, `expense` para despesa.

### Gradiente nos Cards com Hover

```html
<div class="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0
  group-hover:from-accent/[0.03] group-hover:to-transparent
  transition-all duration-500" />
```

### Scrollbar Customizada

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-border-hover); }
```

---

## 12. Linguagem e Copy

### Idioma

Português brasileiro, sempre.

### Tom

Profissional, direto, sem jargão desnecessário.

### Padrões de Texto

| Contexto | Formato |
|----------|---------|
| Títulos de página | Substantivo no plural: "Cartões", "Faturas", "Despesas" |
| Botão de adicionar | "Novo {item}" / "Nova {item}": "Nova Receita", "Novo Investimento" |
| Empty state | "Nenhum {item} registrado" + "Clique em '{botão}' para {ação}" |
| Valores | Sempre com prefixo de moeda: `R$ 1.234,56` |
| Datas | Formato brasileiro: `DD/MM/AAAA` |
| Status | Minúsculas em badges: "pago", "pendente" |
| Progresso | "{atual}/{total} parcelas", "Faltam R$ X" |

### Formatação de Moeda

```ts
formatCurrency(value: number) // → "R$ 1.234,56"
```
- Separador de milhar: ponto
- Separador decimal: vírgula
- 2 casas decimais

---

## 13. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16+ |
| UI | React | 19+ |
| Estilização | Tailwind CSS v4 | — |
| Animações | Framer Motion | — |
| Estado | Zustand + persist | — |
| Auth | Supabase (Google OAuth) | — |
| Banco | Supabase (PostgreSQL) | — |
| Gráficos | Recharts | — |
| Ícones | Lucide React | — |
| Linguagem | TypeScript strict | — |

### Estrutura de Arquivos

```
app/
  layout.tsx              ← root layout, auth provider
  global-error.tsx        ← Next.js 16 error boundary
  error.tsx               ← route-level error boundary
  login/page.tsx          ← tela de login
  (app)/layout.tsx        ← protected layout (sidebar + content)
  (app)/page.tsx          ← dashboard
  (app)/cartao-credito/   ← cartões
  (app)/faturas/          ← faturas
  (app)/despesas/         ← despesas
  (app)/receitas/         ← receitas
  (app)/orcamento/        ← orçamento
  (app)/relatorios/       ← relatórios
  (app)/emprestimos/      ← empréstimos
  (app)/reservas/         ← reservas
  (app)/investimentos/    ← investimentos
components/
  sidebar.tsx
  balance-display.tsx
  summary-cards.tsx
  progress-bar.tsx
  donut-chart.tsx
  line-chart.tsx
  monthly-chart.tsx
  ...
store/
  finance-store.ts        ← Zustand store
  sidebar-store.ts        ← estado da sidebar
  ui-filters.ts           ← filtros de UI
lib/
  supabase/client.ts      ← Supabase client
  supabase/auth.ts        ← auth helpers
  utils.ts                ← formatCurrency, formatDate, etc.
  validation.ts           ← input validation
  mock-data.ts            ← dados iniciais (zerados em prod)
providers/
  auth-provider.tsx
  theme-provider.tsx
```

---

## 14. Checklist de Replicação

Ao criar um novo app seguindo este design system, verificar:

- [ ] Fontes Manrope + Space Grotesk importadas
- [ ] Todas as CSS variables definidas para dark e light
- [ ] `@theme inline` mapeando cores e fontes para Tailwind
- [ ] Noise overlay em `body::before`
- [ ] Gradient orb em `body::after` (desktop only)
- [ ] Scrollbar customizada
- [ ] Focus outlines removidos (`outline: none`)
- [ ] `-webkit-font-smoothing: antialiased`
- [ ] `letter-spacing: -0.02em` em headings
- [ ] Sidebar com CSS transition (nunca framer-motion layout)
- [ ] `pageVariants` + `cardVariants` em todas as páginas
- [ ] `useAnimatedNumber` para valores monetários no dashboard
- [ ] Empty states em todas as páginas
- [ ] Modais com backdrop blur + scale animation
- [ ] Inputs com focus ring accent
- [ ] Botões com whileHover/whileTap
- [ ] Ícones Lucide consistentes (h-4 w-4 padrão)
- [ ] Segurança: middleware, CSP, headers, validação de inputs
- [ ] Dados sensíveis não persistidos em localStorage
