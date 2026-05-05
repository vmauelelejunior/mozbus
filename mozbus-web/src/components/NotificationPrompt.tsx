"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, ShieldCheck, Zap, ChevronRight } from 'lucide-react';

export default function NotificationPrompt() {
  const [status, setStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        setStatus('unsupported');
        return;
      }

      setStatus(Notification.permission);
      
      // Show prompt after 5 seconds if not yet decided
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => setIsVisible(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission);
      setIsVisible(false);
      
      if (permission === 'granted') {
        new Notification('MOZBUS: SISTEMA ATIVO', {
          body: 'Protocolo de notificações sincronizado com sucesso.',
          icon: '/favicon.ico'
        });
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
  };

  if (status === 'granted' || status === 'unsupported' || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: 100, opacity: 0, scale: 0.9 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 100, opacity: 0, scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[100] max-w-sm w-full"
      >
        <div className="glass-aura bg-[#0B0B0F]/90 border border-white/5 rounded-[32px] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden group">
          {/* Kinetic Energy Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50" />
          
          {/* Tactical Background Element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-500/5 rounded-full blur-[60px] group-hover:bg-sky-500/10 transition-all duration-700" />
          
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                  <Bell size={24} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[12px] font-black text-white uppercase tracking-[0.3em] italic">Protocolo de Alerta</h4>
                  <p className="text-[8px] font-black text-sky-500/60 uppercase tracking-widest mt-1">Status: Ready to Sync</p>
                </div>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-2 text-white/10 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] text-white/40 leading-relaxed uppercase font-black tracking-widest">
                Deseja autorizar a sincronização de dados em tempo real para confirmações de reserva e telemetria de frota?
              </p>
              
              <div className="flex flex-col gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={requestPermission}
                  className="w-full flex items-center justify-between bg-white text-[#0B0B0F] px-6 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-[0.3em] group/btn transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Zap size={14} fill="currentColor" />
                    AUTORIZAR ACESSO
                  </div>
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
                
                <button 
                  onClick={() => setIsVisible(false)}
                  className="w-full text-white/20 hover:text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.4em] transition-all"
                >
                  IGNORAR POR AGORA
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center gap-3">
              <ShieldCheck size={14} className="text-emerald-500/50" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Criptografia de ponta-a-ponta ativa</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
