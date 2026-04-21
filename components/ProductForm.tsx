'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calculator } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any; // Para edição
}

export default function ProductForm({ isOpen, onClose, onSuccess, product }: ProductFormProps) {
  const [name, setName] = useState('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCostPrice(product.cost_price);
      setSalePrice(product.sale_price);
    } else {
      setName('');
      setCostPrice('');
      setSalePrice('');
    }
  }, [product, isOpen]);

  const calculateMargin = () => {
    if (!costPrice || !salePrice || salePrice === 0) return 0;
    return ((salePrice - costPrice) / salePrice) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      name,
      cost_price: Number(costPrice),
      sale_price: Number(salePrice),
    };

    let error;
    if (product?.id) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData]);
      error = insertError;
    }

    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Verifique o console.');
    }
  };

  const margin = calculateMargin();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-display tracking-tight text-text">
                {product ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-tertiary hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Consultoria Mensal"
                  className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0,00"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0,00"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
              </div>

              {salePrice && costPrice ? (
                <div className="rounded-lg bg-surface-elevated p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Calculator className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider font-medium">Margem Estimada</span>
                  </div>
                  <span className={cn(
                    "text-lg font-bold font-display",
                    margin > 0 ? "text-accent" : "text-expense"
                  )}>
                    {formatPercent(margin)}
                  </span>
                </div>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-text hover:border-border-hover transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {product ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
