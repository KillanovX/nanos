'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MessageSquare, User, Mail, FileText, MapPin, Building } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CustomSelect from './CustomSelect';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCustomerId?: string) => void;
  customer?: any;
}

export default function CustomerForm({ isOpen, onClose, onSuccess, customer }: CustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setDocument(customer.document || '');
      setCity(customer.city || '');
      setAddress(customer.address || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setDocument('');
      setCity('');
      setAddress('');
    }
  }, [customer, isOpen]);

  // Máscara de Telefone: (00) 00000-0000
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2}).*/, '($1');
    }
    setPhone(value);
  };

  // Máscara de CPF: 000.000.000-00
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setDocument(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      email,
      phone,
      document,
      city,
      address,
    };

    try {
      let newId = customer?.id;
      if (customer) {
        const { error } = await supabase.from('customers').update(payload).eq('id', customer.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('customers').insert([payload]).select('id').single();
        if (error) throw error;
        newId = data.id;
      }
      onSuccess(newId);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente no banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative">
            <header className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-display tracking-tight text-text">
                {customer ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover text-text-tertiary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" /> Nome Completo
                </label>
                <input
                  type="text" required placeholder="Nome do cliente"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </label>
                  <input
                    type="tel" placeholder="(00) 00000-0000"
                    value={phone} onChange={handlePhoneChange}
                    className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> CPF (Opcional)
                  </label>
                  <input
                    type="text" placeholder="000.000.000-00"
                    value={document} onChange={handleDocumentChange}
                    className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Cidade (Opcional)"
                  value={city}
                  onChange={setCity}
                  placeholder="Selecione a cidade..."
                  searchable={false}
                  options={[
                    { id: 'Maringá', name: 'Maringá' },
                    { id: 'Sarandi', name: 'Sarandi' },
                  ]}
                />
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> E-mail (Opcional)
                  </label>
                  <input
                    type="email" placeholder="exemplo@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> Endereço (Opcional)
                </label>
                <input
                  type="text" placeholder="Rua, número, bairro..."
                  value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {customer ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
