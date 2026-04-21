'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  className?: string;
}

export default function CustomDatePicker({ value, onChange, label, className }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Data atual para controle do calendário interno
  const [viewDate, setViewDate] = useState(value ? new Date(value + 'T12:00:00') : new Date());
  
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const generateDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    // Espaços vazios para o início do mês
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = (viewDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return y === viewDate.getFullYear() && m === viewDate.getMonth() + 1 && d === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === viewDate.getMonth() && 
           today.getFullYear() === viewDate.getFullYear();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = value ? new Date(value + 'T12:00:00').toLocaleDateString('pt-BR') : 'Selecione uma data';

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
          )}
        >
          <span className={cn(!value && "text-text-tertiary")}>{formattedDate}</span>
          <CalendarIcon className={cn("h-4 w-4 text-text-tertiary transition-colors", isOpen && "text-accent")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute z-[120] mt-2 w-[280px] rounded-2xl border border-border bg-surface-elevated p-4 shadow-2xl backdrop-blur-md"
            >
              {/* Header do Calendário */}
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-surface-hover rounded-md text-text-secondary transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <div className="text-sm font-bold font-display">
                  {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                </div>
                <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-surface-hover rounded-md text-text-secondary transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Grid de Dias da Semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-[10px] font-bold text-text-tertiary uppercase text-center py-1">
                    {day[0]}
                  </div>
                ))}
              </div>

              {/* Grid de Dias */}
              <div className="grid grid-cols-7 gap-1">
                {generateDays().map((day, idx) => (
                  <div key={idx} className="h-8 flex items-center justify-center">
                    {day ? (
                      <button
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={cn(
                          "h-8 w-8 rounded-full text-xs font-medium transition-all flex items-center justify-center",
                          isSelected(day) 
                            ? "bg-accent text-background font-bold shadow-lg shadow-accent/20" 
                            : isToday(day)
                              ? "bg-accent/10 text-accent border border-accent/20"
                              : "text-text-secondary hover:bg-surface-hover hover:text-text"
                        )}
                      >
                        {day}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <button 
                  type="button" 
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    onChange(today);
                    setIsOpen(false);
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider text-accent hover:underline"
                >
                  Hoje
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
