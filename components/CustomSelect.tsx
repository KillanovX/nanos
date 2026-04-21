'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  searchable?: boolean;
}

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Selecione...", 
  label,
  className,
  searchable = true
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  // Filtrar opções com base na busca (se ativado)
  const filteredOptions = searchable 
    ? options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focar o input ao abrir (se ativado)
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    } else if (!isOpen) {
      setSearchTerm(''); // Limpa busca ao fechar
    }
  }, [isOpen, searchable]);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm transition-all text-left outline-none",
            isOpen ? "border-accent ring-1 ring-accent/30" : "hover:border-border-hover",
            !selectedOption && "text-text-tertiary"
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronDown className={cn("h-4 w-4 text-text-tertiary transition-transform duration-200", isOpen && "rotate-180 text-accent")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-[110] mt-2 w-full rounded-xl border border-border bg-surface-elevated p-1.5 shadow-2xl backdrop-blur-md"
            >
              {/* Campo de Busca Interno (Opcional) */}
              {searchable && (
                <div className="relative mb-1 p-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-8 py-2 text-xs focus:border-accent/50 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div className="max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-text-tertiary italic">
                    Nenhum resultado encontrado
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onChange(option.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors text-left group",
                        value === option.id 
                          ? "bg-accent/10 text-accent font-semibold" 
                          : "text-text-secondary hover:bg-surface-hover hover:text-text"
                      )}
                    >
                      <span className="truncate">{option.name}</span>
                      {value === option.id && <Check className="h-4 w-4 text-accent" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
