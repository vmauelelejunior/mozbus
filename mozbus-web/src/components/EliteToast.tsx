"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Zap } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-md px-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                glass-aura bg-[#0B0B0F]/90 border rounded-[24px] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl flex items-center gap-4 relative overflow-hidden group
                ${t.type === 'success' ? 'border-emerald-500/20' : t.type === 'error' ? 'border-rose-500/20' : 'border-sky-500/20'}
              `}>
                {/* Kinetic Energy Line */}
                <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${t.type === 'success' ? 'text-emerald-500' : t.type === 'error' ? 'text-rose-500' : 'text-sky-500'}`} />
                
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                  ${t.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    t.type === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                    'bg-sky-500/10 text-sky-500 border-sky-500/20'}
                `}>
                  {t.type === 'success' && <CheckCircle2 size={18} />}
                  {t.type === 'error' && <AlertCircle size={18} />}
                  {t.type === 'info' && <Zap size={18} />}
                </div>

                <div className="flex-1">
                  <h4 className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 mb-1">
                    {t.type === 'success' ? 'Sincronização Concluída' : t.type === 'error' ? 'Falha no Protocolo' : 'Informação do Sistema'}
                  </h4>
                  <p className="text-[11px] font-black text-white/90 uppercase tracking-tight leading-tight italic">
                    {t.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(t.id)}
                  className="p-2 text-white/10 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
