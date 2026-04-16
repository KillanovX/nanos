'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function CashFlowTimeline() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: installments } = await supabase
          .from('installments')
          .select('net_value, due_date');

        // Agrupar por mês nos próximos 6 meses
        const meses = [];
        const hoje = new Date();
        
        for (let i = 0; i < 6; i++) {
          const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
          meses.push({
            mes: d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
            valor: 0,
            fullDate: d
          });
        }

        installments?.forEach(inst => {
          const vencimento = new Date(inst.due_date);
          const mesIndex = meses.findIndex(m => 
            m.fullDate.getMonth() === vencimento.getMonth() && 
            m.fullDate.getFullYear() === vencimento.getFullYear()
          );

          if (mesIndex !== -1) {
            meses[mesIndex].valor += inst.net_value || 0;
          }
        });

        setData(meses);
      } catch (error) {
        console.error('Erro ao buscar timeline:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-surface-elevated p-3 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">{label}</p>
          <p className="text-sm font-bold font-display text-accent">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full min-h-[300px] w-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
            <XAxis 
              dataKey="mes" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--color-text-tertiary)", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--color-text-tertiary)", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.4 }} />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? "var(--color-income)" : "var(--color-accent)"} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
