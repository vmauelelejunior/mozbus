"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConnectivityListener() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 5000); // Esconde após 5s ao voltar online
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(!isOnline || showStatus) && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${
            isOnline 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
          }`}>
            <div className="relative">
                <div className={`absolute -inset-1 blur-sm rounded-full animate-ping opacity-20 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {isOnline ? 'Conexão Restaurada' : 'Modo Offline Activo'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
