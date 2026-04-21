# 📗 Documentação Oficial — Makro Financeiro

**Status:** Versão 1.0 (Produção)  
**Conceito:** ERP Minimalista de Alta Performance para Autônomos.  
**Identidade Visual:** *Atmospheric Dark/Light Design* com foco em verde pastel (`#a3e635`).

---

## 1. Stack Tecnológica (The Modern Edge)
O projeto foi construído utilizando o que há de mais moderno no ecossistema web para garantir velocidade de carregamento e manutenibilidade.

*   **Frontend:** [Next.js 16 (App Router)](https://nextjs.org/) — Performance otimizada com Turbopack.
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/) — Tipagem estrita para evitar erros financeiros.
*   **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) — Utilizando o novo motor de processamento via PostCSS.
*   **Animações:** [Framer Motion](https://www.framer.com/motion/) — Responsável pelo *feel* premium e transições de página.
*   **Banco de Dados & Backend:** [Supabase](https://supabase.com/) (PostgreSQL) — Persistência em tempo real e infraestrutura *serverless*.
*   **Gráficos:** [Recharts](https://recharts.org/) — Visualização de dados vetorial e interativa.

---

## 2. Arquitetura de Dados (Database Schema)
O banco de dados foi projetado para garantir integridade referencial e histórico imutável.

*   **`customers`**: Mini-CRM. Armazena dados de contato, localização (Maringá/Sarandi) e estatísticas automáticas de LTV (*Lifetime Value*).
*   **`products`**: Catálogo com controle de preço de custo e venda para cálculo de margem.
*   **`sales`**: Registro mestre de transações. Armazena o vínculo com cliente e o valor total bruto.
*   **`installments`**: O motor financeiro. Cada venda gera N parcelas. Controla status (pago/pendente/atrasado) e valores líquidos (pós-taxa).
*   **`expenses`**: Controle de saídas (custos fixos e variáveis) para cálculo de lucro real.
*   **`payment_methods`**: Configuração de taxas de maquininha e prazos.

---

## 3. Funcionalidades de Core (Módulos)

### 3.1 Dashboard Preditivo
Diferente de dashboards comuns, o Makro foca no futuro.
*   **Saldo Atual:** Dinheiro real em conta (Entradas Pagas - Saídas Pagas).
*   **Previsão do Mês:** Inteligência que soma o saldo de hoje + recebíveis do mês - despesas do mês.
*   **Timeline:** Gráfico de projeção para os próximos 6 meses baseado em contratos reais.

### 3.2 Gestão de Vendas Inteligente
*   **Numeração Sequencial:** Interface amigável com `#Venda 1`, `#Venda 2`, ocultando a complexidade do banco de dados.
*   **Fluxo de Edição Seguro:** Permite alterar metadados (cliente/data) sem corromper o valor financeiro já acordado.
*   **Split de Pagamento Parcial:** Lógica matemática de regra de três que permite dar baixa em apenas parte de uma parcela, gerando automaticamente um resíduo para o futuro com a taxa proporcional corrigida.

### 3.3 Relatórios de BI (Business Intelligence)
*   **Desempenho Geográfico:** Filtro por cidades para identificar onde o negócio cresce mais.
*   **Ranking de LTV:** Identificação automática dos melhores clientes.
*   **Ticket Médio:** Cálculo de valor por transação para medir eficiência de vendas.

---

## 4. Rotinas de Negócio (Lógica Interna)

### A Rotina de "Recebimento Parcial"
Quando o usuário executa um pagamento parcial:
1.  O sistema identifica o `%` pago em relação ao total da parcela.
2.  A parcela atual é marcada como `paga`, mas seu valor é reduzido para a quantia recebida.
3.  Uma nova parcela é inserida no banco com o valor restante (`gross` e `net` proporcionais).
4.  O sistema valida se a data do resto não é anterior a pagamentos já realizados.

### A Rotina de Projeção de Caixa
Calculada dinamicamente via query:
`PROJEÇÃO = (Σ Entradas_Mês_Atual[Pagas]) - (Σ Saídas_Mês_Atual[Pagas]) + (Σ Entradas_Mês_Atual[Pendentes]) - (Σ Saídas_Mês_Atual[Pendentes])`

---

## 5. UI/UX Standards (O Estilo Makro)

*   **Custom Inputs:** Substituímos todos os elementos nativos (Select, DatePicker) por componentes autorais para garantir que o "modo escuro" seja consistente.
*   **Searchable Select:** Busca em tempo real em todas as listas de seleção (Clientes/Produtos).
*   **Theme Switcher:** Alternância entre temas claro e escuro com persistência em localStorage e animações suaves.
*   **Atmospheric Elements:**
    *   *Noise Overlay:* Grão sutil no fundo para textura premium.
    *   *Gradient Orbs:* Orbes de luz que se movem ou brilham em cards de destaque.
    *   *Glassmorphism:* Headers e Modais com desfoque de fundo (`backdrop-blur`).

---

## 6. Como Manter e Evoluir
1.  **Novos Campos:** Sempre adicione colunas no Supabase e atualize as máscaras no `CustomerForm`.
2.  **Novos Gráficos:** Utilize o componente `CustomTooltip` já criado para manter o padrão visual.
3.  **Segurança:** As políticas de RLS no Supabase devem ser ativadas antes de expor o app a múltiplos usuários.

---
Documentação gerada por Gemini CLI.
