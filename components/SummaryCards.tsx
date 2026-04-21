'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import AnimatedNumber from './AnimatedNumber';

interface SummaryData {
  saldoAtual: number;
  totalReceber: number;
  inadimplencia: number;
  previsaoMes: number; // Saldo estimado ao fim do mês
}

export default function SummaryCards() {
  const [data, setData] = useState<SummaryData>({
    saldoAtual: 0,
    totalReceber: 0,
    inadimplencia: 0,
    previsaoMes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // 1. Saldo Atual (Recebimentos Pagos - Despesas Pagas)
      const { data: recPago } = await supabase.from('installments').select('net_value').eq('status', 'pago');
      const { data: expPagas } = await supabase.from('expenses').select('value').eq('status', 'pago');
      
      const totalRecPago = recPago?.reduce((acc, cur) => acc + Number(cur.net_value), 0) || 0;
      const totalExpPagas = expPagas?.reduce((acc, cur) => acc + Number(cur.value), 0) || 0;
      const saldoAtual = totalRecPago - totalExpPagas;

      // 2. Total a Receber (Tudo o que não está pago)
      const { data: recPendente } = await supabase.from('installments').select('net_value').neq('status', 'pago');
      const totalReceber = recPendente?.reduce((acc, cur) => acc + Number(cur.net_value), 0) || 0;

      // 3. Inadimplência (Pendente e com data menor que hoje)
      const { data: recAtrasado } = await supabase
        .from('installments')
        .select('net_value')
        .eq('status', 'pendente')
        .lt('due_date', now.toISOString());
      const inadimplencia = recAtrasado?.reduce((acc, cur) => acc + Number(cur.net_value), 0) || 0;

      // 4. Projeção Mensal (Saldo Atual + Pendentes do Mês - Despesas do Mês)
      const { data: pendentesMes } = await supabase
        .from('installments')
        .select('net_value')
        .eq('status', 'pendente')
        .gte('due_date', startOfMonth)
        .lte('due_date', endOfMonth);
      
      const { data: despesasMes } = await supabase
        .from('expenses')
        .select('value')
        .eq('status', 'pendente')
        .gte('due_date', startOfMonth)
        .lte('due_date', endOfMonth);

      const totalPendentesMes = pendentesMes?.reduce((acc, cur) => acc + Number(cur.net_value), 0) || 0;
      const totalDespesasMes = despesasMes?.reduce((acc, cur) => acc + Number(cur.value), 0) || 0;
      
      setData({
        saldoAtual,
        totalReceber,
        inadimplencia,
        previsaoMes: saldoAtual + totalPendentesMes - totalDespesasMes
      });
    } catch (error) {
      console.error('Erro ao buscar sumário:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const cards = [
    {
      label: 'Saldo Atual',
      value: data.saldoAtual,
      icon: Wallet,
      description: 'Disponível em caixa hoje',
      color: 'text-text',
      trend: 'income'
    },
    {
      label: 'Total a Receber',
      value: data.totalReceber,
      icon: ArrowUpRight,
      description: 'Volume total de parcelas pendentes',
      color: 'text-text',
      trend: 'neutral'
    },
    {
      label: 'Previsão do Mês',
      value: data.previsaoMes,
      icon: TrendingUp,
      description: 'Saldo estimado para o fim do mês',
      color: 'text-accent',
      trend: 'accent'
    },
    {
      label: 'Inadimplência',
      value: data.inadimplencia,
      icon: AlertCircle,
      description: 'Parcelas vencidas não pagas',
      color: 'text-expense',
      trend: 'expense'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group bg-surface border border-border p-6 rounded-2xl overflow-hidden hover:border-border-hover transition-all"
        >
          {/* Glow Effect para o card de destaque */}
          {card.trend === 'accent' && (
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          )}

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-2 rounded-lg bg-surface-elevated border border-border group-hover:border-border-hover transition-colors",
                card.trend === 'accent' && "text-accent border-accent/20 bg-accent/5"
              )}>
                <card.icon size={18} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-1">
                {card.label}
              </p>
              {loading ? (
                <div className="h-8 w-32 bg-surface-elevated animate-pulse rounded" />
              ) : (
                <h3 className={cn("text-2xl font-bold font-display tracking-tight", card.color)}>
                  <AnimatedNumber 
                    value={card.value} 
                    format={(val) => formatCurrency(val)} 
                  />
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
