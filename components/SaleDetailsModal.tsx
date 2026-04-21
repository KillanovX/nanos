'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, User, CreditCard, CheckCircle2, 
  Clock, DollarSign, Pencil, Save, ArrowRight,
  Split
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import CustomDatePicker from './CustomDatePicker';

interface SaleDetailsModalProps {
  sale: any | null;
  onClose: () => void;
}

export default function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estados para edição/pagamento parcial
  const [editValue, setEditValue] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    if (sale?.id) {
      fetchDetails();
    }
  }, [sale?.id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const { data: instData } = await supabase
        .from('installments')
        .select('*')
        .eq('sale_id', sale.id)
        .order('installment_number');

      setInstallments(instData || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (inst: any) => {
    setEditingId(inst.id);
    setEditValue(inst.net_value.toString());
    setEditDate(inst.due_date.split('T')[0]);
  };

  const handleUpdate = async (inst: any, isPartial: boolean = false) => {
    const newValue = parseFloat(editValue);
    const newDateObj = new Date(editDate + 'T12:00:00');
    const newDateIso = newDateObj.toISOString();

    // Validação de Data: Não pode ser anterior a parcelas já pagas
    const latestPaidDate = installments
      .filter(i => i.status === 'pago' && i.id !== inst.id)
      .reduce((max, i) => {
        const d = new Date(i.due_date);
        return d > max ? d : max;
      }, new Date(0));

    if (newDateObj < latestPaidDate) {
      alert(`A nova data não pode ser anterior à última parcela paga (${latestPaidDate.toLocaleDateString('pt-BR')}).`);
      return;
    }

    if (isPartial) {
      const remainderNet = inst.net_value - newValue;
      
      if (remainderNet <= 0) {
        alert("Para pagamento integral, use o botão de marcar como pago.");
        return;
      }

      // Regra de três para descobrir o valor bruto proporcional
      const ratio = newValue / inst.net_value;
      const newGross = Number((inst.gross_value * ratio).toFixed(2));
      const remainderGross = Number((inst.gross_value - newGross).toFixed(2));

      // 1. Atualiza a parcela atual como paga com o valor parcial
      const { error: err1 } = await supabase
        .from('installments')
        .update({ 
          gross_value: newGross,
          net_value: newValue, 
          status: 'pago', 
          paid_at: new Date().toISOString() 
        })
        .eq('id', inst.id);

      // 2. Cria uma nova parcela com o resto
      const { error: err2 } = await supabase
        .from('installments')
        .insert([{
          sale_id: sale.id,
          due_date: newDateIso, 
          gross_value: remainderGross,
          net_value: remainderNet,
          status: 'pendente',
          installment_number: installments.length + 1
        }]);

      if (!err1 && !err2) fetchDetails();
    } else {
      const { error } = await supabase
        .from('installments')
        .update({ net_value: newValue, due_date: newDateIso })
        .eq('id', inst.id);
      
      if (!error) fetchDetails();
    }
    setEditingId(null);
  };

  const markAsPaid = async (instId: string) => {
    const { error } = await supabase
      .from('installments')
      .update({ status: 'pago', paid_at: new Date().toISOString() })
      .eq('id', instId);
    
    if (!error) fetchDetails();
  };

  if (!sale) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col h-full max-h-[95vh] md:max-h-[90vh]"
        >
          {/* Header */}
          <header className="p-4 lg:p-6 border-b border-border flex items-center justify-between bg-surface-elevated/50">
            <div>
              <h2 className="text-lg lg:text-xl font-bold font-display text-text">Venda #{sale.displayId}</h2>
              <p className="text-[10px] text-text-tertiary mt-1 uppercase tracking-widest font-mono">UUID: {sale.id.slice(0,8)}...</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover text-text-tertiary transition-colors">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8 scrollbar-thin">
            {loading ? (
              <div className="py-20 text-center text-text-tertiary">Carregando parcelas...</div>
            ) : (
              <>
                {/* Resumo Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-text-tertiary font-bold">Cliente</p>
                        <p className="text-sm font-semibold">{sale?.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-text-tertiary font-bold">Data da Venda</p>
                        <p className="text-sm font-semibold">{new Date(sale?.sale_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-text-tertiary font-bold">Pagamento</p>
                        <p className="text-sm font-semibold">{sale?.payment_methods?.name} ({sale?.installments_count}x)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-text-tertiary font-bold">Valor Total</p>
                        <p className="text-lg font-bold font-display text-accent">{formatCurrency(sale?.total_value)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parcelas */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Cronograma de Recebimento
                  </h3>
                  <div className="space-y-3">
                    {installments.map((inst) => (
                      <div key={inst.id} className={cn(
                        "rounded-lg border transition-all",
                        editingId === inst.id ? "border-accent bg-accent/5 p-4" : "border-border bg-surface-elevated/30 p-3"
                      )}>
                        {editingId === inst.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-text-tertiary">Novo Valor (R$)</label>
                                <input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-sm focus:border-accent outline-none"
                                />
                              </div>
                              <CustomDatePicker
                                label="Nova Data"
                                value={editDate}
                                onChange={setEditDate}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUpdate(inst)}
                                className="flex-1 flex items-center justify-center gap-2 bg-surface border border-border py-2 rounded-md text-xs font-bold hover:border-accent transition-colors"
                              >
                                <Save size={14} /> Apenas Adiar
                              </button>
                              <button 
                                onClick={() => handleUpdate(inst, true)}
                                className="flex-1 flex items-center justify-center gap-2 bg-accent text-background py-2 rounded-md text-xs font-bold hover:bg-accent/90 transition-colors"
                              >
                                <Split size={14} /> Pagar Parcial
                              </button>
                            </div>
                            <button onClick={() => setEditingId(null)} className="w-full text-[10px] text-text-tertiary hover:text-text uppercase font-bold">Cancelar</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className="text-center min-w-[40px]">
                                <p className="text-[10px] font-bold text-text-tertiary uppercase">Parc.</p>
                                <p className="text-xs font-bold">{inst.installment_number}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium">{new Date(inst.due_date).toLocaleDateString('pt-BR')}</p>
                                <p className="text-[10px] text-text-tertiary">Vencimento</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-xs font-bold">{formatCurrency(inst.net_value)}</p>
                                <p className="text-[10px] text-income">Líquido</p>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                                  inst.status === 'pago' ? "bg-income/10 text-income border-income/20" :
                                  new Date(inst.due_date) < new Date() ? "bg-expense/10 text-expense border-expense/20" :
                                  "bg-surface-elevated text-text-tertiary border-border"
                                )}>
                                  {inst.status === 'pago' ? 'Pago' : new Date(inst.due_date) < new Date() ? 'Atrasado' : 'Pendente'}
                                </span>

                                {inst.status !== 'pago' && (
                                  <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => startEdit(inst)}
                                      className="p-1.5 rounded-md hover:bg-accent/10 text-text-tertiary hover:text-accent transition-colors"
                                      title="Adiar ou Pagar Parcial"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={() => markAsPaid(inst.id)}
                                      className="p-1.5 rounded-md hover:bg-income/10 text-text-tertiary hover:text-income transition-colors"
                                      title="Marcar como Pago Integral"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
