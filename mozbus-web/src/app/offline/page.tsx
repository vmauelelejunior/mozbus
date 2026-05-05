"use client";

import React from 'react';
import { WifiOff, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="aura-bg-main" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center space-y-8 max-w-md"
      >
        <div className="relative inline-block">
            <div className="absolute -inset-4 bg-rose-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <WifiOff size={40} />
            </div>
        </div>

        <div className="space-y-3">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Conexão <span className="text-rose-500">Interrompida</span></h1>
            <p className="text-slate-400 font-medium leading-relaxed">
                Parece que entraste numa zona sem sinal. Mas não te preocupes, o MozBus continua contigo.
            </p>
        </div>

        <div className="grid gap-4">
            <Link 
                href="/tickets/meus-bilhetes"
                className="w-full py-4 bg-sky-500 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-sky-400 transition-all shadow-[0_0_30px_rgba(14,165,233,0.3)]"
            >
                Ver Meus Bilhetes Offline
            </Link>
            
            <div className="flex gap-4">
                <button 
                    onClick={() => window.location.reload()}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                    <RefreshCw size={18} /> Tentar Novamente
                </button>
                <Link 
                    href="/"
                    className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all"
                >
                    <Home size={20} />
                </Link>
            </div>
        </div>

        <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 italic">
                Protocolo de Resiliência Offline v2.0 Activo
            </p>
        </div>
      </motion.div>
    </main>
  );
}
