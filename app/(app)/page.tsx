'use client';

import { motion } from 'framer-motion';
import { Plus, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SummaryCards from '@/components/SummaryCards';
import CashFlowTimeline from '@/components/CashFlowTimeline';

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">
            Visão geral da sua saúde financeira e recebíveis futuros.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vendas/nova"
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nova Venda
          </Link>
        </div>
      </header>

      {/* Indicadores de Topo */}
      <section className="mb-8">
        <SummaryCards />
      </section>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Projeção */}
        <motion.section 
          variants={itemVariants}
          className="lg:col-span-2 rounded-lg border border-border bg-surface p-6 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-accent/5 blur-3xl" />
          
          <div className="relative flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Projeção de Recebíveis
              </h2>
              <p className="text-xs text-text-tertiary">Entradas previstas para os próximos 6 meses</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-income" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Mês Atual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Próximos</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <CashFlowTimeline />
          </div>
        </motion.section>

        {/* Ações Rápidas / Atalhos */}
        <motion.section 
          variants={itemVariants}
          className="rounded-lg border border-border bg-surface p-6 flex flex-col"
        >
          <h2 className="text-lg font-bold font-display mb-6 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" />
            Atalhos
          </h2>

          <div className="flex flex-col gap-2 flex-1">
            <Link 
              href="/vendas" 
              className="flex items-center justify-between p-4 rounded-md border border-border hover:bg-surface-hover transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center text-accent">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ver Vendas</p>
                  <p className="text-[10px] text-text-tertiary">Histórico completo</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-accent transition-colors" />
            </Link>

            <Link 
              href="/inadimplencia" 
              className="flex items-center justify-between p-4 rounded-md border border-border hover:bg-surface-hover transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-expense/10 flex items-center justify-center text-expense">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Inadimplência</p>
                  <p className="text-[10px] text-text-tertiary">Cobranças pendentes</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-expense transition-colors" />
            </Link>

            <Link 
              href="/produtos" 
              className="flex items-center justify-between p-4 rounded-md border border-border hover:bg-surface-hover transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center text-accent">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Meus Produtos</p>
                  <p className="text-[10px] text-text-tertiary">Estoque e margens</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-accent transition-colors" />
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="bg-surface-elevated rounded-lg p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">Dica Financeira</p>
              <p className="text-[10px] leading-relaxed text-text-secondary">
                Vendas parceladas no crédito aumentam o seu "Total a Receber", mas lembre-se de considerar as taxas para o seu lucro líquido real.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
