"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Bus, Clock, MapPin, ChevronRight, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin') || 'Maputo';
  const destination = searchParams.get('destination') || 'Beira';
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
        try {
            const res = await api.get(`/trips/search?origin=${origin}&destination=${destination}`);
            setTrips(res.data);
        } catch (e) {
            console.error('Erro ao buscar viagens', e);
        } finally {
            setLoading(false);
        }
    };
    fetchTrips();
  }, [origin, destination]);

  return (
    <main className="min-h-screen bg-black hero-gradient text-white/90 selection:bg-orange-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto space-y-12 p-6 md:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 opacity-40 hover:opacity-100 hover:text-orange-500 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
               <ArrowLeft size={14} /> Voltar à Busca
            </Link>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                EXPEDIÇÕES <br/>
                <span className="text-orange-500">DISPONÍVEIS.</span>
              </h1>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-4">
                <span>{origin}</span>
                <span className="w-8 h-px bg-white/20"></span>
                <span>{destination}</span>
              </div>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="glass bg-white/[0.03] px-8 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all group shadow-2xl">
              <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
              Refinar Busca
            </button>
          </div>
        </header>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-32 opacity-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="mb-6"
                >
                  <Bus size={64} strokeWidth={1} />
                </motion.div>
                <p className="font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando rotas de elite...</p>
             </div>
        ) : (
          <div className="grid gap-8">
            {trips.length > 0 ? trips.map((trip: any, idx) => (
              <motion.div 
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group lg:grid lg:grid-cols-[1.2fr_1fr_0.8fr] items-center bg-[#111]/40 rounded-[40px] overflow-hidden border border-white/5 hover:border-orange-500/20 transition-all duration-500"
              >
                {/* Background Shadow Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/[0.02] to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                {/* 1. Brand & Info */}
                <div className="p-10 flex items-center gap-8 border-b lg:border-b-0 lg:border-r border-white/5 relative z-10">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 rounded-3xl group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] transition-all duration-500">
                      <Bus size={36} className="text-orange-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">{trip.bus.company.name}</h3>
                    <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.2em] mt-1">{trip.bus.model} • Executivo Plus</p>
                    <div className="flex gap-3 mt-4">
                       <span className="w-2 h-2 rounded-full bg-orange-500/50 flex items-center justify-center animate-pulse">
                         <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                       </span>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Wi-Fi • AC • 180º Leito</span>
                    </div>
                  </div>
                </div>

                {/* 2. Timeline Experience */}
                <div className="p-10 space-y-6 relative z-10">
                   <div className="flex justify-between items-center px-4">
                      <div className="text-left">
                        <p className="text-3xl font-black tracking-tighter">{new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p className="text-[9px] font-black uppercase opacity-20 tracking-widest">{origin}</p>
                      </div>

                      <div className="flex-1 flex flex-col items-center px-8">
                         <div className="w-full h-[2px] bg-white/5 relative rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ x: "-100%" }}
                              animate={{ x: "0%" }}
                              transition={{ duration: 2, delay: 1 }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/50 to-orange-500"
                            ></motion.div>
                         </div>
                         <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-20 mt-3">Expresso Direto</p>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-black tracking-tighter opacity-20">--:--</p>
                        <p className="text-[9px] font-black uppercase opacity-20 tracking-widest">{destination}</p>
                      </div>
                   </div>
                </div>

                {/* 3. Pricing & Call to Action */}
                <div className="p-10 bg-white/[0.02] flex items-center justify-between lg:justify-end gap-10 relative z-10">
                    <div className="text-right">
                        <p className="text-4xl font-black text-white leading-none">
                          {trip.price} <span className="text-xs font-black uppercase opacity-30 tracking-tight">MT</span>
                        </p>
                        <p className="text-[9px] opacity-20 uppercase font-black tracking-widest mt-1 italic">Vagas Limitadas</p>
                    </div>
                    <Link 
                      href={`/trips/seats/${trip.id}`} 
                      className="bg-white text-black h-16 w-16 lg:w-48 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 overflow-hidden relative group/btn"
                    >
                       <span className="hidden lg:inline">Escolher Lugar</span>
                       <ChevronRight size={18} strokeWidth={3} />
                       <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 -z-10"></div>
                    </Link>
                </div>
              </motion.div>
            )) : (
                <div className="glass bg-white/[0.01] p-32 text-center rounded-[60px] border border-white/5 space-y-8">
                    <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                       <MapPin size={32} className="opacity-20" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-2xl font-black uppercase tracking-tighter">Horizonte Vazio.</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 max-w-sm mx-auto leading-relaxed">
                        Nenhuma expedição disponível para esta rota hoje. Tente alterar as datas ou destinos.
                      </p>
                    </div>
                    <Link href="/" className="inline-block border border-white/10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                       Nova Pesquisa
                    </Link>
                </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center font-black uppercase tracking-widest opacity-20 text-white">Carregando Resultados...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
