# Guia Completo: Como Construir um App Financeiro Moderno (Makro Financeiro)

Este documento detalha a arquitetura, as tecnologias, a estrutura de dados e as decisões de design envolvidas na criação do **Makro Financeiro**, uma aplicação web de gestão financeira voltada para autônomos e pequenas empresas, com foco em design moderno, alta performance e usabilidade em Desktop e Mobile.

---

## 1. Visão Geral do Projeto

O Makro Financeiro não é apenas um CRUD (Create, Read, Update, Delete). Ele incorpora inteligência financeira básica, como:
- Cálculo automático de parcelamentos e taxas de maquininha.
- Previsão de recebíveis (fluxo de caixa futuro).
- Rastreamento automático de inadimplência (parcelas vencidas e não pagas).
- Cálculo de margem de lucro de produtos.

### Ojetivos Principais
- **Fricção Zero:** Inserção de dados rápida e intuitiva.
- **Visual Premium:** Fugir do aspecto de "planilha de Excel" tradicional, usando temas escuros (Dark Mode), glassmorphism e tipografia arrojada.
- **Mobile-First:** Acesso rápido no celular para registrar vendas na rua, sem perder a visão ampla no Desktop para análises profundas.

---

## 2. Stack Tecnológico (O Que Usar e Por Quê)

A escolha das tecnologias foca em ecossistema rico, tipagem forte e deploy facilitado.

### Frontend
- **Next.js 14+ (App Router):** Framework React. Oferece rotas baseadas em pastas, renderização híbrida (Server/Client Components) e otimização automática.
- **React (com TypeScript):** O TypeScript é inegociável para aplicações financeiras. Previne erros de cálculo e garante a integridade dos objetos (ex: uma Venda sempre terá um Array de Parcelas).
- **Tailwind CSS:** Para estilização ágil e responsiva. Permite criar Design Systems customizados usando variáveis CSS (ex: `bg-surface`, `text-accent`).
- **Framer Motion:** Para animações fluidas. Transições de página, modais aparecendo e números crescendo geram a sensação de um app nativo.
- **Lucide React:** Biblioteca de ícones moderna, leve e de traço consistente.
- **Zustand:** Gerenciamento de estado global (usado para controlar a Sidebar e o Tema de forma leve, sem o boilerplate do Redux).
- **Recharts:** Biblioteca para criação de gráficos (ex: Timeline de Fluxo de Caixa) otimizada para React.

### Backend / Banco de Dados (BaaS)
- **Supabase (PostgreSQL):** Plataforma Backend-as-a-Service. Fornece um banco relacional robusto (Postgres) com uma API gerada automaticamente, autenticação e Realtime. Ideal para MVP e escala rápida.

---

## 3. Modelagem de Dados (Banco de Dados)

Um app financeiro precisa de uma estrutura relacional forte. Aqui está o schema simplificado do PostgreSQL:

### Tabelas Principais

1. **`customers` (Clientes)**
   - `id` (UUID, Primary Key)
   - `name` (String)
   - `email` (String, nullable)
   - `phone` (String, nullable)
   - `created_at` (Timestamp)

2. **`products` (Produtos)**
   - `id` (UUID, Primary Key)
   - `name` (String)
   - `cost_price` (Decimal) - Custo de aquisição.
   - `sale_price` (Decimal) - Preço de venda.

3. **`payment_methods` (Formas de Pagamento)**
   - `id` (UUID, Primary Key)
   - `name` (String) - Ex: "Cartão de Crédito", "Pix".
   - `tax` (Decimal) - Taxa percentual descontada pelo meio de pagamento.

4. **`sales` (Vendas)**
   - `id` (UUID, Primary Key)
   - `customer_id` (UUID, Foreign Key -> `customers`)
   - `customer_name` (String) - Desnormalização útil para buscas rápidas.
   - `total_value` (Decimal) - Valor total bruto da venda.
   - `payment_method_id` (UUID, Foreign Key -> `payment_methods`)
   - `installments_count` (Int) - Número de parcelas.
   - `sale_date` (Timestamp)

5. **`installments` (Parcelas - O Coração do App)**
   - `id` (UUID, Primary Key)
   - `sale_id` (UUID, Foreign Key -> `sales`)
   - `installment_number` (Int) - Ex: 1, 2, 3.
   - `gross_value` (Decimal) - Valor bruto da parcela.
   - `net_value` (Decimal) - Valor líquido (após descontar a `tax` do meio de pagamento).
   - `due_date` (Timestamp) - Data de Vencimento.
   - `status` (String) - 'pendente' | 'pago' | 'cancelado'.
   - `paid_at` (Timestamp, nullable) - Quando foi pago.

6. **`expenses` (Despesas)**
   - `id` (UUID, Primary Key)
   - `description` (String)
   - `value` (Decimal)
   - `due_date` (Timestamp)
   - `status` (String) - 'pendente' | 'pago'.

---

## 4. Arquitetura e Estrutura de Pastas (Next.js)

A estrutura segue o padrão do Next.js App Router, separando claramente UI, Lógica de Negócio e Componentes reutilizáveis.

```text
/
├── app/
│   ├── globals.css         # Variáveis CSS (Cores, Fontes) e Tailwind base
│   ├── layout.tsx          # Root Layout (Fontes, Meta tags)
│   └── (app)/              # Grupo de Rotas Autenticadas/Internas
│       ├── layout.tsx      # Layout com a Sidebar e Header responsivo
│       ├── page.tsx        # Dashboard (Resumo, Gráficos)
│       ├── vendas/         # Listagem de Vendas
│       │   └── nova/       # Formulário Complexo de Criação de Venda
│       ├── despesas/       # Listagem e Gestão de Despesas
│       ├── clientes/       # Gestão de Clientes e Inadimplência
│       └── produtos/       # Catálogo e Cálculo de Margens
├── components/             # Componentes Reutilizáveis
│   ├── Sidebar.tsx         # Navegação Lateral (Desktop/Mobile)
│   ├── SummaryCards.tsx    # Cards do Dashboard
│   ├── CustomSelect.tsx    # Select com Busca e Animação
│   ├── CustomDatePicker.tsx# Calendário customizado
│   └── ...
├── lib/                    # Lógica de Negócio e Clientes API
│   ├── supabase.ts         # Cliente de conexão com o BD
│   ├── utils.ts            # Funções utilitárias (cn, formatCurrency)
│   └── finance-utils.ts    # Lógica de cálculo de parcelas e taxas
└── store/                  # Gerenciamento de Estado Global
    └── sidebar-store.ts    # Estado da Sidebar (Zustand)
```

---

## 5. Implementando as Funcionalidades Core

### 5.1. Lógica de Parcelamento Automático
O maior diferencial de usabilidade é não obrigar o usuário a calcular parcelas manualmente.

**Fluxo:**
1. Usuário seleciona o Produto (Preço Venda: R$ 100).
2. Seleciona "Cartão de Crédito" (Taxa: 5%).
3. Escolhe "3 Parcelas".
4. O app gera automaticamente 3 registros de `installments`:
   - Vencimentos calculados para +30, +60 e +90 dias.
   - Valor bruto de cada parcela: R$ 33,33.
   - Valor líquido calculado: `Bruto - (Bruto * 0.05)`.

**Dica de Implementação (`lib/finance-utils.ts`):** Use funções puras que recebem o `total`, `parcelas`, `taxa` e retornam um array de objetos de parcela.

### 5.2. Dashboard e Indicadores
Para gerar os cards do Dashboard ("Saldo Atual", "Total a Receber", "Inadimplência"), não confie em somas complexas no frontend.

**Estratégia:**
- Faça requisições filtradas no Supabase.
- **Saldo Atual:** Soma de `installments` (status='pago') - Soma de `expenses` (status='pago').
- **A Receber:** Soma de `installments` (status='pendente').
- **Inadimplência:** Soma de `installments` (status='pendente' E `due_date` < Hoje).

### 5.3. Tratamento de Inadimplência (Pagamentos Parciais/Atrasos)
No mundo real, clientes atrasam ou pagam parcialmente.
- O `SaleDetailsModal` deve permitir alterar a data de vencimento de uma parcela específica (Adiar).
- Deve permitir **Pagamento Parcial**: Se a parcela é de R$ 100 e o cliente pagou R$ 60, o sistema marca a parcela original como paga (R$ 60) e gera uma *nova* parcela pendente no valor do resto (R$ 40) vinculada à mesma venda.

---

## 6. Segredos de UI/UX e Responsividade

Para alcançar um visual de "aplicativo premium" ao invés de "sistema de intranet de 2010":

### Design System (CSS Variables)
Use variáveis CSS no Tailwind para criar um tema semântico.
```css
:root {
  --background: #09090b;
  --surface: #121214;
  --surface-elevated: #18181b;
  --surface-hover: #27272a;
  --border: #27272a;
  --text: #fafafa;
  --text-secondary: #a1a1aa;
  --accent: #6d28d9; /* Roxo principal */
  --income: #10b981; /* Verde esmeralda */
  --expense: #ef4444; /* Vermelho rubi */
}
```

### Responsividade Verdadeira (Mobile First Mindset)
O app será muito usado pelo celular.
1. **Ações Sempre Visíveis:** Em tabelas no desktop, você pode esconder botões de editar/excluir atrás de um hover (`opacity-0 group-hover:opacity-100`). No mobile, telas touch **não têm hover**. Use classes como `lg:opacity-0 lg:group-hover:opacity-100` para garantir que os botões sempre apareçam no celular.
2. **Listas vs Tabelas:** Tabelas gigantes quebram no celular. Se for manter tabela, use `overflow-x-auto` no container pai, mas limite a quantidade de colunas críticas no mobile. Em formulários (como a lista de produtos na venda), agrupe informações verticalmente em telas pequenas usando flexbox flex-col.
3. **Menu Hambúrguer:** A Sidebar no desktop fica ao lado do conteúdo. No mobile, ela se transforma em um menu "Off-Canvas" controlado por um botão hambúrguer, com um overlay de fundo escuro (`bg-black/60 backdrop-blur-sm`).

### Microinterações
- Use `framer-motion` nas listas (`AnimatePresence`) para que, quando um item for deletado, ele deslize e desapareça suavemente, em vez de sumir bruscamente piscando a tela.
- Coloque *Glow Effects* (borrões sutis e coloridos de fundo) atrás de cartões importantes usando `blur-3xl`.

---

## 7. Passo a Passo para o Setup Inicial

Se você quiser recriar o ambiente do zero:

1. **Criar Projeto:**
   ```bash
   npx create-next-app@latest makro-financeiro
   # Escolha TypeScript, Tailwind, App Router
   ```

2. **Instalar Dependências:**
   ```bash
   npm install @supabase/supabase-js zustand framer-motion lucide-react recharts
   ```

3. **Configurar Supabase:**
   - Crie um projeto no supabase.com
   - Vá no SQL Editor e crie as tabelas conforme o Schema acima.
   - Copie a `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para um arquivo `.env.local`.

4. **Criar Variáveis CSS:**
   - Configure o `globals.css` com as cores do tema.
   - Configure o `tailwind.config.js` para usar essas variáveis.

5. **Desenvolver Componentes Base:**
   - Comece pelo Layout e Sidebar.
   - Crie componentes de UI agnósticos: Input, Button, Modal, CustomSelect, CustomDatePicker.

6. **Telas e Integração:**
   - Crie o fluxo de Vendas (o mais complexo) primeiro.
   - Depois Despesas, Clientes e Produtos.
   - Por fim, o Dashboard, consolidando os dados.

---

## Resumo
Construir um app como o Makro Financeiro é um exercício de balancear cálculos exatos (backend) com uma interface extremamente fluida que não bloqueia o usuário (frontend). A chave do sucesso é a abstração: o usuário só deve se preocupar em "Fiz uma venda de X". O app cuida do resto (parcelar, descontar taxas, prever fluxo de caixa futuro e alertar atrasos).
