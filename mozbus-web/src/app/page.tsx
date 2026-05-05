"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Bus, ShieldCheck, CreditCard, Smartphone, ChevronRight, Globe, ArrowRight, Zap, Star, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({ origin: '', destination: '', date: '' });
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/trips/results?origin=${searchData.origin}&destination=${searchData.destination}&date=${searchData.date}`);
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white selection:bg-sky-500/30 overflow-x-hidden relative font-sans notranslate" translate="no">
      {/* Immersive Background Auras */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-sky-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Navbar />

      {/* Hero Section - Elite Standard Scaling */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-24 md:pt-40 md:pb-32 grid lg:grid-cols-2 gap-12 md:gap-24 items-center relative z-10">
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-12"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-sky-400 text-[10px] font-black uppercase tracking-[0.5em] backdrop-blur-xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
            Nova Rota Elite: Maputo <ChevronRight size={10} className="inline mx-1" /> Pemba
          </div>
          
          <div className="relative">
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black leading-[0.85] tracking-tighter uppercase italic relative z-10">
              O FUTURO <br/>
              DA <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-sky-500 to-sky-800 drop-shadow-[0_0_20px_rgba(14,165,233,0.3)]">VIAGEM</span>
            </h1>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-sky-500/20 blur-[60px] rounded-full opacity-50" />
          </div>
          
          <p className="text-xl text-white/40 max-w-lg leading-relaxed font-bold tracking-tight border-l-2 border-sky-500/20 pl-8">
             O ecossistema definitivo de mobilidade em Moçambique. Experiência de elite, segurança absoluta e tecnologia de comando em cada quilómetro.
          </p>

          <div className="flex items-center gap-12 pt-6">
             <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-5xl font-black italic tracking-tighter text-white">50K</span>
                    <Zap size={24} className="text-emerald-500" fill="currentColor" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-[0.5em] text-white/20 mt-2">Viagens / Mês</span>
             </div>
             <div className="w-[1px] h-16 bg-white/10" />
             <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-5xl font-black italic tracking-tighter text-white">120+</span>
                    <Star size={24} className="text-sky-500" fill="currentColor" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-[0.5em] text-white/20 mt-2">Operadores Elite</span>
             </div>
          </div>
        </motion.div>

        {/* Quantum Booking Console */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-br from-sky-500/15 to-transparent blur-2xl opacity-40"></div>
          <div className="glass-aura p-8 md:p-10 space-y-8 relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0D0D12]/85 backdrop-blur-3xl shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                <Navigation size={150} strokeWidth={1} />
            </div>
            
            <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse shadow-[0_0_10px_#0EA5E9]"></div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-sky-500/80">Protocolo de Reserva v4.0</h2>
                </div>
                <p className="text-4xl font-black uppercase tracking-tighter text-white italic">INICIE A SUA MISSÃO</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2">Ponto de Partida</label>
                  <div className="relative group/field">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-sky-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      value={searchData.origin}
                      onFocus={() => setIsFocused('origin')}
                      onBlur={() => setIsFocused(null)}
                      onChange={(e) => setSearchData({...searchData, origin: e.target.value})}
                      placeholder="CIDADE ORIGEM" 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-sky-500/50 focus:bg-black/60 transition-all font-black text-xs md:text-sm uppercase tracking-wider text-white placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2">Destino Final</label>
                  <div className="relative group/field">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-sky-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      value={searchData.destination}
                      onFocus={() => setIsFocused('destination')}
                      onBlur={() => setIsFocused(null)}
                      onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                      placeholder="CIDADE DESTINO" 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-sky-500/50 focus:bg-black/60 transition-all font-black text-xs md:text-sm uppercase tracking-wider text-white placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-sky-500/60 ml-2">Data da Operação</label>
                <div className="relative group/field">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-sky-500 transition-colors" size={20} />
                  <input 
                    type="date" 
                    required
                    value={searchData.date}
                    onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-8 outline-none focus:border-sky-500/50 focus:bg-black/60 transition-all font-black text-xs md:text-sm uppercase tracking-[0.2em] cursor-pointer text-white [color-scheme:dark]"
                  />
                </div>
              </div>

              <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-5 bg-sky-500 text-[#0B0B0F] rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] hover:bg-sky-400 transition-all flex items-center justify-center gap-4 shadow-[0_15px_30px_rgba(14,165,233,0.15)] relative overflow-hidden group/btn mt-2"
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  PESQUISAR DISPONIBILIDADE
                  <ArrowRight size={18} />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* Featured Routes - Premium Assets */}
      <section className="max-w-7xl mx-auto px-8 pb-40 relative z-10">
        <div className="flex items-center gap-8 mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 whitespace-nowrap italic">Rotas de Elite Recomendadas</h2>
          <div className="h-[1px] bg-gradient-to-r from-white/10 to-transparent flex-1"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            { from: 'Maputo', to: 'Beira', price: '1,200', tag: 'MAIS RÁPIDA' },
            { from: 'Maputo', to: 'Inhambane', price: '650', tag: 'LITORAL' },
            { from: 'Beira', to: 'Quelimane', price: '900', tag: 'POPULAR' }
          ].map((route, i) => (
            <motion.button 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setSearchData({ ...searchData, origin: route.from, destination: route.to })}
              className="group/card relative overflow-hidden rounded-[24px] bg-black/40 border border-white/5 p-8 hover:border-sky-500/40 transition-all text-left backdrop-blur-xl shadow-lg"
            >
              <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/5 transition-colors duration-500" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="w-16 h-16 rounded-[20px] bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-[#0B0B0F] transition-all duration-500">
                  <MapPin size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase opacity-20 tracking-widest mb-1">Passagem</p>
                  <p className="text-2xl font-black text-white italic">{route.price} <span className="text-sky-500 text-sm">MT</span></p>
                </div>
              </div>
              
              <div className="relative z-10 space-y-2 mb-10">
                <p className="text-xl font-black uppercase tracking-tight italic text-white">{route.from} <ChevronRight size={14} className="inline mx-2 text-sky-500/50" /> {route.to}</p>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black tracking-widest text-sky-500/60 uppercase">{route.tag}</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[9px] font-black tracking-widest text-white/20 uppercase italic">Frota G7</span>
                </div>
              </div>
              
              <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-30">
                      <span>Disponibilidade Hoje</span>
                      <span className="group-hover:text-sky-500 transition-colors">85%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div className="w-1/3 h-full bg-sky-500 group-hover:w-[85%] transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                  </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
