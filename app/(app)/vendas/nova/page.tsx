'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { generateInstallments, Parcela } from '@/lib/finance-utils';

export default function NovaVendaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([
    { id: '1', name: 'Dinheiro', tax: 0 },
    { id: '2', name: 'Pix', tax: 0 },
    { id: '3', name: 'Cartão de Crédito (Taxa 3%)', tax: 3 },
    { id: '4', name: 'Cartão de Débito (Taxa 1.5%)', tax: 1.5 },
  ]);

  // Form State
  const [cliente, setCliente] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0].id);
  const [numParcelas, setNumParcelas] = useState(1);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [installments, setInstallments] = useState<Parcela[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('name');
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  // Recalcular parcelas sempre que os dados mudarem
  useEffect(() => {
    const total = selectedProducts.reduce((acc, p) => acc + (p.sale_price * (p.quantity || 1)), 0);
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethodId);
    const tax = selectedMethod ? selectedMethod.tax : 0;
    
    if (total > 0) {
      const generated = generateInstallments(total, numParcelas, tax, new Date(dataInicio));
      setInstallments(generated);
    } else {
      setInstallments([]);
    }
  }, [selectedProducts, numParcelas, paymentMethodId, dataInicio]);

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const existing = selectedProducts.find(p => p.id === productId);
      if (existing) {
        setSelectedProducts(selectedProducts.map(p => 
          p.id === productId ? { ...p, quantity: (p.quantity || 1) + 1 } : p
        ));
      } else {
        setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
      }
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeProduct(productId);
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || selectedProducts.length === 0) return;

    setLoading(true);
    try {
      const total = selectedProducts.reduce((acc, p) => acc + (p.sale_price * (p.quantity || 1)), 0);
      
      // 1. Criar a Venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          customer_name: cliente,
          total_value: total,
          payment_method_id: paymentMethodId,
          installments_count: numParcelas,
          sale_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Criar as Parcelas
      const installmentsToInsert = installments.map((inst, index) => ({
        sale_id: sale.id,
        due_date: inst.vencimento.toISOString(),
        gross_value: inst.valor_bruto,
        net_value: inst.valor_liquido,
        status: 'pendente',
        installment_number: index + 1
      }));

      const { error: instError } = await supabase
        .from('installments')
        .insert(installmentsToInsert);

      if (instError) throw instError;

      router.push('/vendas');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda. Verifique as tabelas do banco.');
    } finally {
      setLoading(false);
    }
  };

  const totalBruto = selectedProducts.reduce((acc, p) => acc + (p.sale_price * (p.quantity || 1)), 0);
  const selectedMethod = paymentMethods.find(m => m.id === paymentMethodId);
  const taxaTotal = (selectedMethod?.tax || 0);
  const totalLiquido = installments.reduce((acc, inst) => acc + inst.valor_liquido, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">Nova Venda</h1>
          <p className="text-text-secondary text-sm">Registre uma nova venda e gere as parcelas automaticamente.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Dados da Venda */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" />
              Informações Gerais
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">Meio de Pagamento</label>
                  <select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  >
                    {paymentMethods.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">Nº de Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Data do Primeiro Vencimento</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent" />
                Produtos Selecionados
              </h2>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) addProduct(e.target.value);
                    e.target.value = '';
                  }}
                  className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text hover:border-accent/30 transition-colors outline-none"
                >
                  <option value="">+ Adicionar Produto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.sale_price)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {selectedProducts.length === 0 ? (
                  <div className="py-8 text-center text-text-tertiary">
                    <p className="text-sm italic">Nenhum produto adicionado à venda.</p>
                  </div>
                ) : (
                  selectedProducts.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-3 rounded-md bg-surface-elevated/50 group"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-text-tertiary">{formatCurrency(p.sale_price)} cada</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(p.id, (p.quantity || 1) - 1)}
                            className="h-6 w-6 rounded border border-border flex items-center justify-center text-text-secondary hover:border-accent transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-display min-w-[20px] text-center">{p.quantity || 1}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(p.id, (p.quantity || 1) + 1)}
                            className="h-6 w-6 rounded border border-border flex items-center justify-center text-text-secondary hover:border-accent transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-bold font-display w-24 text-right">
                          {formatCurrency(p.sale_price * (p.quantity || 1))}
                        </p>
                        <button 
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          className="p-1.5 text-text-tertiary hover:text-expense opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Resumo e Parcelas */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-accent/5 blur-3xl" />
            <div className="relative">
              <h2 className="text-lg font-bold font-display mb-4">Resumo</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal Bruto</span>
                  <span className="font-display">{formatCurrency(totalBruto)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Taxas ({taxaTotal}%)</span>
                  <span className="text-expense font-display">-{formatCurrency(totalBruto - totalLiquido)}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Total Líquido</span>
                  <span className="text-2xl font-bold font-display text-accent">{formatCurrency(totalLiquido)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || selectedProducts.length === 0 || !cliente}
                className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Finalizar Venda
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Prévia das Parcelas
            </h2>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {installments.length === 0 ? (
                <p className="text-xs text-text-tertiary italic text-center py-4">Insira produtos para ver a prévia.</p>
              ) : (
                installments.map((inst, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded border border-border/50 bg-surface-elevated/30">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">Parcela {idx + 1}</p>
                      <p className="text-xs font-medium">{inst.vencimento.toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold font-display">{formatCurrency(inst.valor_bruto)}</p>
                      <p className="text-[10px] text-income font-display">Líq: {formatCurrency(inst.valor_liquido)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
