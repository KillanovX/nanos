'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, ArrowDownRight, Search, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import ExpenseForm from '@/components/ExpenseForm';

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('due_date', { ascending: false });
    
    if (!error) {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const filteredExpenses = expenses.filter(exp =>
    exp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">Despesas</h1>
          <p className="text-text-secondary text-sm mt-1">
            Controle suas saídas, custos fixos e variáveis.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Despesa
        </button>
      </header>

      <section className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
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
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans">Vencimento</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans">Descrição</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Valor</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        <span className="text-sm">Carregando despesas...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 opacity-20 mb-2" />
                        <p className="text-sm">Nenhuma despesa registrada</p>
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="text-accent text-xs hover:underline">Limpar busca</button>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <motion.tr
                      key={expense.id}
                      variants={itemVariants}
                      whileHover={{ backgroundColor: 'var(--color-surface-hover)' }}
                      className="group transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary font-display">
                          {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-text">{expense.description}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-expense font-display font-bold">{formatCurrency(expense.value)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
                          expense.status === 'pago' ? "bg-income/10 text-income border-income/20" : 
                          expense.status === 'atrasado' ? "bg-expense/10 text-expense border-expense/20" : 
                          "bg-surface-elevated text-text-tertiary border-border"
                        )}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1.5 rounded-md text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1.5 rounded-md text-text-tertiary hover:text-expense hover:bg-expense/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
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

      <ExpenseForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExpenses}
        expense={editingExpense}
      />
    </motion.div>
  );
}
