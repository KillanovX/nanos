'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, User, MessageSquare, Mail, Trash2, Pencil, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import CustomerForm from '@/components/CustomerForm';
import Link from 'next/link';

export default function ClientesPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    // Buscamos clientes e o status de inadimplência (baseado na tabela de parcelas)
    const { data: custData } = await supabase.from('customers').select('*').order('name');
    
    // Simulação de verificação de inadimplência
    const { data: overdueData } = await supabase
      .from('installments')
      .select('sales(customer_name)')
      .eq('status', 'pendente')
      .lt('due_date', new Date().toISOString());

    const overdueNames = new Set(
      (overdueData as any[])?.map(d => d.sales?.customer_name).filter(Boolean) || []
    );

    if (custData) {
      const enriched = custData.map(c => ({
        ...c,
        isInadimplente: overdueNames.has(c.name)
      }));
      setCustomers(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este cliente? Histórico de vendas não será apagado.')) {
      await supabase.from('customers').delete().eq('id', id);
      fetchCustomers();
    }
  };

  const handleWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">Clientes</h1>
          <p className="text-text-secondary text-sm mt-1">Gerencie sua base de contatos e saúde financeira por cliente.</p>
        </div>
        <button
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
        >
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md rounded-lg border border-border bg-surface px-10 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-text-tertiary">Carregando clientes...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-tertiary">Nenhum cliente encontrado.</div>
        ) : (
          filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              whileHover={{ y: -2 }}
              className="rounded-lg border border-border bg-surface p-5 relative overflow-hidden group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-elevated flex items-center justify-center text-accent border border-border">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text truncate max-w-[150px]">{customer.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {customer.isInadimplente ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-expense bg-expense/10 px-1.5 py-0.5 rounded">
                          <AlertCircle className="h-2.5 w-2.5" /> Inadimplente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-income bg-income/10 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Em dia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }} className="p-1.5 text-text-tertiary hover:text-accent"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(customer.id)} className="p-1.5 text-text-tertiary hover:text-expense"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {customer.phone ? (
                  <button onClick={() => handleWhatsApp(customer.phone)} className="flex items-center gap-2 text-[11px] text-text-secondary hover:text-income transition-colors truncate">
                    <MessageSquare className="h-3 w-3 shrink-0" /> {customer.phone}
                  </button>
                ) : <div />}
                {customer.email && (
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary truncate" title={customer.email}>
                    <Mail className="h-3 w-3 shrink-0" /> {customer.email}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-tertiary">Total Comprado</p>
                  <p className="text-sm font-bold font-display text-text">{formatCurrency(customer.total_spent || 0)}</p>
                </div>
                <Link 
                  href={`/vendas?customer=${customer.id}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1"
                >
                  Ver Vendas <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <CustomerForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCustomers}
        customer={editingCustomer}
      />
    </motion.div>
  );
}
