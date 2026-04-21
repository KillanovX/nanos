'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Save
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { generateInstallments, Parcela } from '@/lib/finance-utils';
import CustomerForm from '@/components/CustomerForm';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';

function VendaFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [products, setProducts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [numParcelas, setNumParcelas] = useState(1);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [installments, setInstallments] = useState<Parcela[]>([]);
  const [originalTotal, setOriginalTotal] = useState(0);

  const fetchInitialData = async () => {
    const { data: pData } = await supabase.from('products').select('*').order('name');
    if (pData) setProducts(pData);

    const { data: mData } = await supabase.from('payment_methods').select('*').order('name');
    if (mData && mData.length > 0) {
      setPaymentMethods(mData);
      if (!editId) setPaymentMethodId(mData[0].id);
    }

    const { data: cData } = await supabase.from('customers').select('*').order('name');
    if (cData) setAvailableCustomers(cData);

    if (editId) {
      const { data: sale } = await supabase.from('sales').select('*').eq('id', editId).single();
      if (sale) {
        setCustomerId(sale.customer_id);
        setPaymentMethodId(sale.payment_method_id);
        setNumParcelas(sale.installments_count);
        setDataInicio(new Date(sale.sale_date).toISOString().split('T')[0]);
        setOriginalTotal(sale.total_value);
      }
      
      const { data: instData } = await supabase.from('installments').select('*').eq('sale_id', editId).order('installment_number');
      if (instData) {
        setInstallments(instData.map(i => ({
          vencimento: new Date(i.due_date),
          valor_bruto: i.gross_value,
          valor_liquido: i.net_value
        })));
      }

      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [editId]);

  useEffect(() => {
    const total = selectedProducts.length > 0 
      ? selectedProducts.reduce((acc, p) => acc + (p.sale_price * (p.quantity || 1)), 0)
      : installments.reduce((acc, inst) => acc + inst.valor_bruto, 0); // fallback para edição se produtos não carregarem

    const selectedMethod = paymentMethods.find(m => m.id === paymentMethodId);
    const tax = selectedMethod ? selectedMethod.tax : 0;
    
    // Só gera automaticamente se for venda NOVA ou se o usuário estiver mexendo nos produtos/parcelas
    if (!editId && total > 0) {
      const generated = generateInstallments(total, numParcelas, tax, new Date(dataInicio + 'T12:00:00'));
      setInstallments(generated);
    }
  }, [selectedProducts, numParcelas, paymentMethodId, dataInicio, editId]);

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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    setLoading(true);
    try {
      const total = editId ? originalTotal : selectedProducts.reduce((acc, p) => acc + (p.sale_price * (p.quantity || 1)), 0);

      const selectedCustomer = availableCustomers.find(c => c.id === customerId);

      const saleData = {
        customer_id: customerId,
        customer_name: selectedCustomer?.name || 'Cliente Avulso',
        total_value: total,
        payment_method_id: paymentMethodId,
        installments_count: numParcelas,
        sale_date: new Date(dataInicio + 'T12:00:00').toISOString()
      };

      if (editId) {
        // Atualizar Venda
        const { error: saleError } = await supabase.from('sales').update(saleData).eq('id', editId);
        if (saleError) throw saleError;
        
        // Se mudou o valor ou parcelas numa edição, o ideal é alertar 
        // mas aqui vamos apenas atualizar os dados da venda.
      } else {
        // Criar Nova Venda
        const { data: sale, error: saleError } = await supabase
          .from('sales')
          .insert([saleData])
          .select()
          .single();

        if (saleError) throw saleError;

        const installmentsToInsert = installments.map((inst, index) => ({
          sale_id: sale.id,
          due_date: inst.vencimento.toISOString(),
          gross_value: inst.valor_bruto,
          net_value: inst.valor_liquido,
          status: 'pendente',
          installment_number: index + 1
        }));

        const { error: instError } = await supabase.from('installments').insert(installmentsToInsert);
        if (instError) throw instError;
      }

      router.push('/vendas');
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerCreated = async (newId?: string) => {
    const { data } = await supabase.from('customers').select('*').order('name');
    if (data) {
      setAvailableCustomers(data);
      if (newId) setCustomerId(newId);
    }
    setIsCustomerModalOpen(false);
  };

  if (initialLoading) return <div className="p-20 text-center text-text-tertiary">Carregando dados da venda...</div>;

  const totalBruto = selectedProducts.reduce((acc, p) => acc + (p.sale_price * (p.quantity || 1)), 0);
  const selectedMethod = paymentMethods.find(m => m.id === paymentMethodId);
  const taxaTotal = (selectedMethod?.tax || 0);
  const totalLiquido = installments.reduce((acc, inst) => acc + inst.valor_liquido, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary"><ArrowLeft className="h-5 w-5" /></button>
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">{editId ? 'Editar Venda' : 'Nova Venda'}</h1>
          <p className="text-text-secondary text-sm">{editId ? 'Ajuste os dados da transação realizada.' : 'Vincule um cliente, produtos e gere parcelas automaticamente.'}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2"><Plus className="h-4 w-4 text-accent" /> Informações Gerais</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-secondary">Selecione o Cliente</label>
                  <button type="button" onClick={() => setIsCustomerModalOpen(true)} className="text-[10px] font-bold uppercase text-accent hover:underline flex items-center gap-1"><UserPlus className="h-3 w-3" /> Novo Cliente</button>
                </div>
                <CustomSelect options={availableCustomers} value={customerId} onChange={setCustomerId} placeholder="Selecione um cliente..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect label="Meio de Pagamento" options={paymentMethods} value={paymentMethodId} onChange={setPaymentMethodId} />
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">Nº de Parcelas</label>
                  <input type="number" min="1" max="60" value={numParcelas} onChange={(e) => setNumParcelas(parseInt(e.target.value) || 1)} className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent" disabled={!!editId} />
                </div>
              </div>
              <CustomDatePicker label="Data da Venda" value={dataInicio} onChange={setDataInicio} />
            </div>
          </div>

          {!editId && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-display flex items-center gap-2"><CreditCard className="h-4 w-4 text-accent" /> Produtos Selecionados</h2>
                <div className="w-64">
                  <CustomSelect options={products.map(p => ({ id: p.id, name: `${p.name} - ${formatCurrency(p.sale_price)}` }))} value="" onChange={(id) => id && addProduct(id)} placeholder="+ Adicionar Produto" />
                </div>
              </div>
              <div className="space-y-2">
                {selectedProducts.length === 0 ? (
                  <div className="py-8 text-center text-text-tertiary italic text-sm">Nenhum produto adicionado.</div>
                ) : (
                  selectedProducts.map((p) => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 rounded-md bg-surface-elevated/50 group">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-text-tertiary">{formatCurrency(p.sale_price)} cada</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => updateQuantity(p.id, (p.quantity || 1) - 1)} className="h-8 w-8 sm:h-6 sm:w-6 rounded border border-border flex items-center justify-center">-</button>
                          <span className="text-sm font-display min-w-[20px] text-center">{p.quantity || 1}</span>
                          <button type="button" onClick={() => updateQuantity(p.id, (p.quantity || 1) + 1)} className="h-8 w-8 sm:h-6 sm:w-6 rounded border border-border flex items-center justify-center">+</button>
                        </div>
                        <p className="text-sm font-bold font-display min-w-[80px] text-right">{formatCurrency(p.sale_price * (p.quantity || 1))}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6 relative overflow-hidden">
            <div className="relative">
              <h2 className="text-lg font-bold font-display mb-4">Resumo</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-text-secondary">Subtotal Bruto</span><span className="font-display">{formatCurrency(totalBruto)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-secondary">Taxas ({taxaTotal}%)</span><span className="text-expense font-display">-{formatCurrency(totalBruto - totalLiquido)}</span></div>
                <div className="pt-3 border-t border-border flex justify-between items-end"><span className="text-xs font-bold uppercase text-text-tertiary">Total Líquido</span><span className="text-2xl font-bold font-display text-accent">{formatCurrency(totalLiquido)}</span></div>
              </div>
              <button type="submit" disabled={loading || (!editId && selectedProducts.length === 0) || !customerId} className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background shadow-lg hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : (editId ? <Save size={18}/> : <CheckCircle2 size={18} />)}
                {editId ? 'Salvar Alterações' : 'Finalizar Venda'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <CustomerForm isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onSuccess={handleCustomerCreated} />
    </motion.div>
  );
}

export default function NovaVendaPage() {
  return <Suspense fallback={<div>Carregando...</div>}><VendaFormContent /></Suspense>;
}
