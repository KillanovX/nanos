'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  User, 
  ArrowRight,
  MoreVertical,
  Trash2,
  FileText,
  X,
  Hash,
  Pencil
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import SaleDetailsModal from '@/components/SaleDetailsModal';

function VendasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerFilter = searchParams.get('customer');
  
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    let query = supabase
      .from('sales')
      .select('*, payment_methods(name)')
      .order('sale_date', { ascending: true });

    const { data, error } = await query;

    if (!error && data) {
      const numberedSales = data.map((sale, index) => ({
        ...sale,
        displayId: index + 1
      }));

      const sortedSales = numberedSales.reverse();

      const finalSales = customerFilter 
        ? sortedSales.filter(s => s.customer_id === customerFilter)
        : sortedSales;

      setSales(finalSales);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, [customerFilter]);

  const handleDeleteSale = async (id: string) => {
    if (confirm('Ao excluir uma venda, todas as suas parcelas também serão excluídas. Continuar?')) {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (!error) {
        setSales(sales.filter(s => s.id !== id));
      }
    }
  };

  const clearFilter = () => {
    router.push('/vendas');
  };

  const filteredSales = sales.filter(sale =>
    sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
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
          <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-text">Vendas</h1>
          <p className="text-text-secondary text-xs lg:text-sm mt-1">
            {customerFilter 
              ? `Mostrando histórico do cliente selecionado.` 
              : 'Histórico completo de transações e parcelamentos.'}
          </p>
        </div>

        <Link
          href="/vendas/nova"
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nova Venda
        </Link>
      </header>

      <section className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-10 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            {customerFilter && (
              <button 
                onClick={clearFilter}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg border border-expense/30 bg-expense/5 px-4 py-2.5 text-sm font-medium text-expense hover:bg-expense/10 transition-colors"
              >
                <X className="h-4 w-4" />
                Limpar
              </button>
            )}

            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text hover:border-border-hover transition-colors">
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-full">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans w-16 text-center">Ref</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans">Data</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans">Pagamento</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Valor Total</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        <span className="text-sm">Carregando histórico...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 opacity-20 mb-2" />
                        <p className="text-sm">Nenhuma venda registrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <motion.tr
                      key={sale.id}
                      variants={itemVariants}
                      whileHover={{ backgroundColor: 'var(--color-surface-hover)' }}
                      className="group transition-colors"
                    >
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-bold font-display text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          #{sale.displayId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary font-display">
                          {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-surface-elevated flex items-center justify-center text-text-tertiary">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium text-text">{sale.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-text-secondary">
                          {sale.payment_methods?.name || 'Não informado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold font-display text-text">{formatCurrency(sale.total_value)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/vendas/nova?id=${sale.id}`}
                            className="p-1.5 rounded-md text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
                            title="Editar Venda"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-1.5 rounded-md text-text-tertiary hover:text-expense hover:bg-expense/10 transition-colors"
                            title="Excluir Venda"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setSelectedSale(sale)}
                            className="p-1.5 rounded-md text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
                            title="Ver Detalhes"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SaleDetailsModal 
        sale={selectedSale} 
        onClose={() => setSelectedSale(null)} 
      />
    </motion.div>
  );
}

export default function VendasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-tertiary">Carregando...</div>}>
      <VendasContent />
    </Suspense>
  );
}
