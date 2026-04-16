'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  AlertCircle, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';

interface SummaryData {
  saldoAtual: number;
  totalReceber: number;
  inadimplencia: number;
  previsaoMensal: number;
}

export default function SummaryCards() {
  const [data, setData] = useState<SummaryData>({
    saldoAtual: 0,
    totalReceber: 0,
    inadimplencia: 0,
    previsaoMensal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      try {
        // 1. Buscar Parcelas (Recebimentos)
        const { data: installments, error: instError } = await supabase
          .from('installments')
          .select('net_value, status, due_date');

        if (instError) throw instError;

        // 2. Buscar Despesas
        const { data: expenses, error: expError } = await supabase
          .from('expenses')
          .select('value, status, due_date');
        
        // Se a tabela expenses não existir, tratamos como vazio
        const expensesData = expError ? [] : (expenses || []);

        let saldoAtual = 0;
        let totalReceber = 0;
        let inadimplencia = 0;
        let previsaoMensal = 0;

        const hojeStr = hoje.toISOString().split('T')[0];

        // Processar Parcelas
        installments?.forEach(inst => {
          const valor = inst.net_value || 0;
          const vencimento = new Date(inst.due_date);
          const vencimentoStr = inst.due_date.split('T')[0];

          if (inst.status === 'pago') {
            saldoAtual += valor;
          } else {
            if (vencimentoStr < hojeStr) {
              inadimplencia += valor;
            } else {
              totalReceber += valor;
            }
          }

          // Previsão Mensal (Entradas do mês atual, independente de estar pago ou não)
          if (vencimento >= inicioMes && vencimento <= fimMes) {
            previsaoMensal += valor;
          }
        });

        // Processar Despesas
        expensesData.forEach(exp => {
          const valor = exp.value || 0;
          const vencimento = new Date(exp.due_date);

          if (exp.status === 'pago') {
            saldoAtual -= valor;
          }

          // Previsão Mensal (Saídas do mês atual)
          if (vencimento >= inicioMes && vencimento <= fimMes) {
            previsaoMensal -= valor;
          }
        });

        setData({
          saldoAtual,
          totalReceber,
          inadimplencia,
          previsaoMensal
        });
      } catch (error) {
        console.error('Erro ao buscar resumo:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const cards = [
    {
      label: 'Saldo Atual',
      value: data.saldoAtual,
      icon: Wallet,
      color: 'text-income',
      bg: 'bg-income/10',
      description: 'Total em caixa hoje'
    },
    {
      label: 'Total a Receber',
      value: data.totalReceber,
      icon: ArrowUpRight,
      color: 'text-accent',
      bg: 'bg-accent/10',
      description: 'Parcelas futuras pendentes'
    },
    {
      label: 'Inadimplência',
      value: data.inadimplencia,
      icon: AlertCircle,
      color: 'text-expense',
      bg: 'bg-expense/10',
      description: 'Parcelas atrasadas'
    },
    {
      label: 'Previsão Mensal',
      value: data.previsaoMensal,
      icon: Calendar,
      color: 'text-text',
      bg: 'bg-surface-elevated',
      description: 'Saldo projetado do mês'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-sm group"
        >
          {/* Decorative Blur Orb */}
          <div className={cn(
            "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30",
            index === 0 ? "bg-income" : index === 1 ? "bg-accent" : index === 2 ? "bg-expense" : "bg-text-tertiary"
          )} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
              {index === 3 && (
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  <TrendingUp className="h-3 w-3" />
                  Projetado
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary mb-1">
                {card.label}
              </p>
              {loading ? (
                <div className="h-8 w-32 bg-surface-elevated animate-pulse rounded" />
              ) : (
                <h3 className="text-2xl font-bold font-display tracking-tight text-text">
                  {formatCurrency(card.value)}
                </h3>
              )}
              <p className="text-[10px] text-text-tertiary mt-2">
                {card.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
