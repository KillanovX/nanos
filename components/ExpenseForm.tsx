'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: any;
}

export default function ExpenseForm({ isOpen, onClose, onSuccess, expense }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pendente');

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setValue(expense.value.toString());
      setDueDate(expense.due_date.split('T')[0]);
      setStatus(expense.status);
    } else {
      setDescription('');
      setValue('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setStatus('pendente');
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        description,
        value: parseFloat(value),
        due_date: new Date(dueDate + 'T12:00:00').toISOString(),
        status,
      };

      if (expense) {
        const { error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', expense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([payload]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao salvar despesa. Verifique se a tabela "expenses" existe no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl"
        >
          {/* Glow effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

          <div className="relative">
            <header className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-display tracking-tight">
                {expense ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-hover text-text-tertiary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel, Internet..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
                <CustomSelect
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { id: 'pendente', name: 'Pendente' },
                    { id: 'pago', name: 'Pago' },
                    { id: 'atrasado', name: 'Atrasado' },
                  ]}
                />
              </div>

              <CustomDatePicker
                label="Vencimento"
                value={dueDate}
                onChange={setDueDate}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {expense ? 'Atualizar Despesa' : 'Salvar Despesa'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
