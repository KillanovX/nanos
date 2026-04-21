'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, MessageSquare, Search, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';

interface OverdueCustomer {
  customer_name: string;
  customer_phone?: string;
  total_overdue: number;
  oldest_due_date: string;
  days_overdue: number;
  count: number;
}

export default function InadimplenciaPage() {
  const [overdueCustomers, setOverdueCustomers] = useState<OverdueCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverdueInstallments = async () => {
    setLoading(true);
    const today = new Date().toISOString();

    // Buscar parcelas e dados da venda
    const { data: installmentsData, error: instError } = await supabase
      .from('installments')
      .select('*, sales(customer_name)')
      .eq('status', 'pendente')
      .lt('due_date', today);

    if (instError) {
      console.error('Erro ao buscar inadimplência:', instError);
      setLoading(false);
      return;
    }

    // Buscar todos os clientes para mapear os telefones pelo nome
    const { data: customersData } = await supabase
      .from('customers')
      .select('name, phone');

    const phoneMap: Record<string, string> = {};
    customersData?.forEach(c => {
      if (c.name && c.phone) phoneMap[c.name] = c.phone;
    });

    // Agrupar por cliente
    const groups: Record<string, any> = {};
    
    installmentsData?.forEach((inst: any) => {
      const customerName = inst.sales?.customer_name || 'Desconhecido';
      const customerPhone = phoneMap[customerName] || '';
      
      if (!groups[customerName]) {
        groups[customerName] = {
          customer_name: customerName,
          customer_phone: customerPhone,
          total_overdue: 0,
          oldest_due_date: inst.due_date,
          count: 0
        };
      }
      
      groups[customerName].total_overdue += inst.gross_value;
      groups[customerName].count += 1;
      
      if (new Date(inst.due_date) < new Date(groups[customerName].oldest_due_date)) {
        groups[customerName].oldest_due_date = inst.due_date;
      }
    });

    const now = new Date();
    const result: OverdueCustomer[] = Object.values(groups).map((group: any) => {
      const oldestDate = new Date(group.oldest_due_date);
      const diffTime = Math.abs(now.getTime() - oldestDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...group,
        days_overdue: diffDays
      };
    }).sort((a, b) => b.days_overdue - a.days_overdue);

    setOverdueCustomers(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchOverdueInstallments();
  }, []);

  const filteredCustomers = overdueCustomers.filter(c =>
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNotify = (customer: OverdueCustomer) => {
    if (!customer.customer_phone) {
      alert(`O cliente ${customer.customer_name} não possui telefone cadastrado.`);
      return;
    }
    
    const cleanPhone = customer.customer_phone.replace(/\D/g, '');
    const message = `Olá ${customer.customer_name}, notamos que você possui ${customer.count} ${customer.count === 1 ? 'parcela' : 'parcelas'} em atraso no valor total de ${formatCurrency(customer.total_overdue)}. Gostaria de negociar?`;
    const encodedMessage = encodeURIComponent(message);
    
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
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
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">Inadimplência</h1>
          <p className="text-text-secondary text-sm mt-1">
            Clientes com parcelas em atraso e ações de cobrança.
          </p>
        </div>
      </header>

      <section className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-lg border border-border bg-surface px-10 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </div>

        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Total em Atraso</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-center">Parcela Mais Antiga</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        <span className="text-sm">Carregando dados...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 opacity-20 mb-2" />
                        <p className="text-sm">Nenhuma inadimplência encontrada</p>
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="text-accent text-xs hover:underline">Limpar busca</button>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <motion.tr
                      key={customer.customer_name}
                      variants={itemVariants}
                      whileHover={{ backgroundColor: 'var(--color-surface-hover)' }}
                      className="group transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-surface-elevated flex items-center justify-center text-text-tertiary group-hover:text-accent transition-colors">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-text">{customer.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-display font-bold text-expense">{formatCurrency(customer.total_overdue)}</span>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-tighter">{customer.count} {customer.count === 1 ? 'parcela' : 'parcelas'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-text-secondary font-display">
                          {customer.days_overdue} {customer.days_overdue === 1 ? 'dia' : 'dias'} de atraso
                        </span>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-tighter">
                          Vencido em {new Date(customer.oldest_due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-expense/10 text-expense border border-expense/20">
                          atrasado
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleNotify(customer)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text hover:border-accent/30 transition-colors group/btn"
                        >
                          <MessageSquare className="h-3.5 w-3.5 group-hover/btn:text-accent" />
                          Notificar
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
