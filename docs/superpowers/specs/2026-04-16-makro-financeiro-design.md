# Makro Financeiro — Especificação de Design

> **Status:** Para Revisão do Usuário
> **Data:** 16 de Abril de 2026
> **Autor:** Gemini CLI
> **Referência Visual:** `@DESIGN_SYSTEM.md`

## 1. Objetivo do Projeto
Criar um aplicativo web para profissionais autônomos gerenciarem seu fluxo de caixa, vendas parceladas, inadimplência e margem de lucro por produto. O sistema deve priorizar a **previsibilidade financeira** através de uma linha do tempo clara de recebimentos e despesas.

## 2. Arquitetura do Sistema
O sistema será uma Single Page Application (SPA) moderna, focada em performance e UX "dark-first".

- **Framework:** Next.js 16 (App Router) + TypeScript.
- **Banco de Dados:** Supabase (PostgreSQL) para persistência e autenticação.
- **Estado Global:** Zustand com persistência local para filtros e UI.
- **Estilização:** Tailwind CSS v4 seguindo rigorosamente o `DESIGN_SYSTEM.md`.
- **Gráficos:** Recharts para visualização de tendências e projeções.

## 3. Modelo de Dados (Supabase)

### Tabelas Principais
1. **`produtos`**: Nome, custo base, preço de venda sugerido.
2. **`clientes`**: Nome, contato (WhatsApp/Email), histórico de status.
3. **`meios_pagamento`**: Nome (ex: Crédito 1x), taxa percentual (ex: 2.99%).
4. **`vendas`**: Cliente vinculado, data da venda, valor total, meio de pagamento usado.
5. **`parcelas` (Recebimentos)**: Venda vinculada, data de vencimento, valor bruto, valor líquido (pós-taxa), status (pendente, pago, atrasado).
6. **`despesas` (Saídas)**: Descrição, valor, data de vencimento, status.

## 4. Regras de Negócio e Automação

### Geração de Parcelas
Ao registrar uma venda de R$ X em N parcelas:
- O sistema divide o valor bruto por N.
- Aplica a taxa do meio de pagamento para calcular o `valor_liquido` de cada parcela.
- Gera N registros na tabela `parcelas`, incrementando 1 mês na data de vencimento de cada uma.

### Inadimplência Automática
- Lógica no frontend (ou Edge Function): Se `hoje > data_vencimento` e `status == 'pendente'`, a parcela é marcada visualmente como `atrasado`.
- Central de Inadimplência: Filtra apenas clientes com pelo menos uma parcela no status `atrasado`.

### Fluxo de Caixa e Previsão
- **Saldo Atual:** Recebimentos Pagos - Despesas Pagas.
- **Total a Receber:** Soma de todas as parcelas `pendentes` (futuras).
- **Projeção de Saúde:** Gráfico comparativo entre entradas confirmadas vs despesas previstas para os próximos 6 meses.

## 5. Interface e UX (Makro Style)

### Dashboard (Página Inicial)
- **KPIs de Destaque:** 4 cards com glow sutil (Saldo, A Receber, Inadimplência, Previsão Mensal).
- **Gráfico de Projeção:** Linha do tempo mostrando entradas e saídas previstas.

### Linha do Tempo (Fluxo de Caixa)
- Lista densa e vertical de todos os eventos financeiros (entradas e saídas).
- Ícones Lucide (`ArrowUpCircle` para entradas, `ArrowDownCircle` para saídas).
- Filtros rápidos por status (Tudo, Recebidos, Pendentes, Atrasados).

### Aba de Gestão
- **Produtos:** Tabela com cálculo automático de margem (Venda - Custo).
- **Nova Venda:** Formulário inteligente que sugere parcelas e calcula taxas em tempo real.

### Central de Inadimplência
- Lista de "Devedores" com valor total em atraso e dias desde o vencimento.
- Acesso rápido para notificação via contato cadastrado.

## 6. Checklist de Sucesso (DoR)
- [ ] Autenticação funcional via Supabase.
- [ ] Cadastro de produtos com cálculo de margem.
- [ ] Venda parcelada gerando recebimentos automáticos.
- [ ] Dashboards refletindo o "Total a Receber" corretamente.
- [ ] Interface seguindo 100% o guia de design (cores, fontes, animações).

---
