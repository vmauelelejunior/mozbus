"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Bus, ShieldCheck, CreditCard, Smartphone, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Home() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({ origin: '', destination: '', date: '' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/trips/results?origin=${searchData.origin}&destination=${searchData.destination}&date=${searchData.date}`);
  };

  return (
    <main className="min-h-screen hero-gradient selection:bg-orange-500/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-40 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Novo: Rotas Maputo - Beira Disponíveis
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">
            SUA VIAGEM <br/>
            COMEÇA <span className="text-orange-500 underline decoration-white/10 underline-offset-8">AQUI</span>.
          </h1>
          
          <p className="text-xl opacity-60 max-w-lg leading-relaxed font-medium">
             A plataforma inteligente para conectar passageiros às melhores empresas de Moçambique. Rapidez, confiança e pagamento via M-Pesa.
          </p>
        </motion.div>

        {/* Caixa de Busca com Efeito Glassmorphism Elevado */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass p-10 rounded-[40px] shadow-3xl space-y-8 relative overflow-hidden"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Origem</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 text-orange-500 group-focus-within:scale-110 transition-transform" size={20} />
                  <input 
                    type="text" 
                    required
                    value={searchData.origin}
                    onChange={(e) => setSearchData({...searchData, origin: e.target.value})}
                    placeholder="De onde você sai?" 
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Destino</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 text-orange-500 group-focus-within:scale-110 transition-transform" size={20} />
                  <input 
                    type="text" 
                    required
                    value={searchData.destination}
                    onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                    placeholder="Para onde vai?" 
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Data de Partida</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-4 text-orange-500 group-focus-within:scale-110 transition-transform" size={20} />
                <input 
                  type="date" 
                  value={searchData.date}
                  onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all font-semibold cursor-pointer"
                />
              </div>
            </div>

            <motion.button 
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-400 transition-all flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(249,115,22,0.3)]"
            >
                Buscar Viagem agora
                <ChevronRight size={18} />
            </motion.button>
          </form>
        </motion.div>
      </section>

      <footer className="max-w-7xl mx-auto px-8 pb-10 flex flex-wrap items-center justify-between gap-6 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-widest">© 2026 MozBus S.A. Todos os direitos reservados.</p>
        <div className="flex items-center gap-6">
           <ShieldCheck size={16} />
           <CreditCard size={16} />
           <Smartphone size={16} />
        </div>
      </footer>
    </main>
  );
}
