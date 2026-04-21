'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package,
  Calendar,
  MapPin,
  Filter,
  FileText,
  DollarSign,
  PieChart,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';

// Tooltip Customizado "Makro Style"
const CustomTooltip = ({ active, payload, label, prefix = "R$ " }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-[10px] uppercase font-bold text-text-tertiary mb-1 tracking-widest">{label}</p>
        <p className="text-sm font-bold font-display text-accent">
          {prefix}{payload[0].value.toLocaleString('pt-BR')}
        </p>
      </div>
    );
  }
  return null;
};

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    faturamentoBruto: 0,
    despesasTotais: 0,
    lucroLiquido: 0,
    ticketMedio: 0,
    vendasCount: 0,
    vendasSemana: 0,
    faturamentoSemana: 0
  });

  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [cityData, setCityData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCity, setSelectedCity] = useState('Todas');

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, selectedCity]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data: sales } = await supabase
        .from('sales')
        .select('*, customers(city)')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .eq('status', 'pago');

      const { data: allCustomers } = await supabase
        .from('customers')
        .select('name, total_spent, city')
        .order('total_spent', { ascending: false })
        .limit(5);

      const salesList = sales || [];
      const filteredSales = selectedCity === 'Todas' 
        ? salesList 
        : salesList.filter((s: any) => s.customers?.city === selectedCity);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const salesSemana = filteredSales.filter(s => new Date(s.sale_date) >= oneWeekAgo);
      const fatSemana = salesSemana.reduce((acc, s) => acc + Number(s.total_value), 0);

      // Gráfico Mensal
      const monthsMap: any = {};
      filteredSales.forEach(s => {
        const month = new Date(s.sale_date).toLocaleString('pt-BR', { month: 'short' });
        monthsMap[month] = (monthsMap[month] || 0) + Number(s.total_value);
      });
      const chartMonthly = Object.keys(monthsMap).map(m => ({ name: m, faturamento: monthsMap[m] }));

      // Gráfico Cidades
      const cityMap: any = {};
      salesList.forEach(s => {
        const city = s.customers?.city || 'Não Informado';
        cityMap[city] = (cityMap[city] || 0) + 1;
      });
      const chartCity = Object.keys(cityMap)
        .map(c => ({ name: c, vendas: cityMap[c] }))
        .sort((a, b) => b.vendas - a.vendas);

      const faturamento = filteredSales.reduce((acc, s) => acc + Number(s.total_value), 0);
      const totalDespesas = (expenses || []).reduce((acc, e) => acc + Number(e.value), 0);

      setStats({
        faturamentoBruto: faturamento,
        despesasTotais: totalDespesas,
        lucroLiquido: faturamento - totalDespesas,
        vendasCount: filteredSales.length,
        ticketMedio: filteredSales.length > 0 ? faturamento / filteredSales.length : 0,
        vendasSemana: salesSemana.length,
        faturamentoSemana: fatSemana
      });

      setTopCustomers(allCustomers || []);
      setMonthlyData(chartMonthly);
      setCityData(chartCity);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">Inteligência de Negócio</h1>
          <p className="text-text-secondary text-sm mt-1">Análise estratégica baseada no seu histórico real.</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-accent transition-all">
          <Download className="h-4 w-4" /> Exportar PDF
        </button>
      </header>

      {/* Filtros */}
      <section className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CustomDatePicker label="Desde" value={startDate} onChange={setStartDate} />
          <CustomDatePicker label="Até" value={endDate} onChange={setEndDate} />
          <CustomSelect 
            label="Cidade" value={selectedCity} onChange={setSelectedCity} searchable={false}
            options={[{ id: 'Todas', name: 'Todas as Cidades' }, { id: 'Maringá', name: 'Maringá' }, { id: 'Sarandi', name: 'Sarandi' }]}
          />
          <div className="flex flex-col justify-end">
             <button onClick={fetchReportData} className="w-full h-[42px] bg-accent text-background rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-all">
                Atualizar Dados
             </button>
          </div>
        </div>
      </section>

      {/* Stats Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Lucro Líquido Real', value: stats.lucroLiquido, color: 'text-accent', icon: DollarSign },
          { label: 'Faturamento Bruto', value: stats.faturamentoBruto, color: 'text-text', icon: TrendingUp },
          { label: 'Vendas (Últ. 7 dias)', value: stats.vendasSemana, color: 'text-text', icon: Calendar, isCurrency: false },
          { label: 'Faturamento Semana', value: stats.faturamentoSemana, color: 'text-income', icon: ArrowUpRight },
        ].map((card, i) => (
          <motion.div key={i} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="bg-surface border border-border p-6 rounded-2xl relative overflow-hidden group">
             <p className="text-[10px] uppercase font-bold text-text-tertiary mb-1 tracking-widest relative z-10">{card.label}</p>
             <h3 className={cn("text-2xl font-bold font-display relative z-10", card.color)}>
               {card.isCurrency === false ? card.value : formatCurrency(Number(card.value))}
             </h3>
             <card.icon className="absolute -bottom-2 -right-2 h-12 w-12 opacity-[0.03] group-hover:opacity-10 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico Mensal */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-tertiary mb-8 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-accent" /> Desempenho Mensal
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="faturamento" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorFat)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vendas por Cidade - REFORMULADO */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-tertiary mb-8 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-accent" /> Volume por Cidade
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} layout="vertical" margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--color-text)" fontSize={11} width={100} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip prefix="" />} cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.4 }} />
                <Bar dataKey="vendas" radius={[0, 6, 6, 0]} barSize={24}>
                  {cityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "var(--color-accent)" : "var(--color-surface-elevated)"} 
                      stroke="var(--color-border)"
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clientes */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="bg-surface border border-border rounded-2xl overflow-hidden">
          <header className="p-6 border-b border-border bg-surface-elevated/30 flex items-center justify-between">
             <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-text-secondary">
               <Users className="h-3.5 w-3.5 text-accent" /> Maiores LTV
             </h2>
             <span className="text-[10px] text-text-tertiary uppercase">Top 5 Clientes</span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-border">
                {topCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-text">{c.name}</td>
                    <td className="px-6 py-4 text-text-tertiary">{c.city}</td>
                    <td className="px-6 py-4 text-right font-bold text-accent group-hover:pr-8 transition-all">{formatCurrency(c.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Resumo Complementar */}
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="bg-surface border border-border rounded-2xl p-8 flex flex-col justify-center text-center space-y-6">
           <div className="h-14 w-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto rotate-3 group-hover:rotate-0 transition-transform">
              <Activity className="h-7 w-7 text-accent" />
           </div>
           <div>
              <h3 className="text-lg font-bold font-display">Resumo de Eficiência</h3>
              <p className="text-xs text-text-secondary mt-2 max-w-[280px] mx-auto">Sua operação está saudável. Abaixo o resumo das métricas de rentabilidade do período.</p>
           </div>
           <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-xl bg-surface-elevated border border-border text-left">
                 <p className="text-[9px] uppercase font-bold text-text-tertiary tracking-widest mb-1">Ticket Médio</p>
                 <p className="text-lg font-bold font-display text-text">{formatCurrency(stats.ticketMedio)}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-elevated border border-border text-left">
                 <p className="text-[9px] uppercase font-bold text-text-tertiary tracking-widest mb-1">Total Despesas</p>
                 <p className="text-lg font-bold font-display text-expense">{formatCurrency(stats.despesasTotais)}</p>
              </div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
