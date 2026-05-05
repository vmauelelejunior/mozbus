"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Bus, Clock, MapPin, ChevronRight, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import EliteLoader from '@/components/EliteLoader';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin') || 'Maputo';
  const destination = searchParams.get('destination') || 'Beira';
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
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
  }, [isMounted, origin, destination]);

  if (!isMounted) return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <EliteLoader size={120} />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white/90 selection:bg-sky-500/30 relative overflow-hidden notranslate" translate="no">
      <div className="aura-bg-main" />
      <Navbar />
      <div className="max-w-6xl mx-auto space-y-8 p-6 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 text-white/30 hover:text-sky-500 transition-all text-[9px] font-black uppercase tracking-[0.4em]">
               <ArrowLeft size={14} /> Nova Pesquisa
            </Link>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none italic text-white uppercase">
                Expedições <br/>
                <span className="text-sky-500">Disponíveis.</span>
              </h1>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mt-4 bg-white/5 px-5 py-1.5 rounded-full w-fit border border-white/5">
                <span className="text-white">{origin}</span>
                <span className="w-8 h-px bg-sky-500/50"></span>
                <span className="text-white">{destination}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="glass-aura px-6 py-3 rounded-xl flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-sky-500 hover:text-black transition-all group shadow-xl border border-white/10">
              <Filter size={12} className="group-hover:rotate-180 transition-transform duration-700" /> 
              Refinar Busca
            </button>
          </div>
        </header>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-40 opacity-40">
                <EliteLoader size={100} />
                <p className="font-black uppercase tracking-[0.5em] text-[10px] mt-12 italic text-sky-500">Sincronizando rotas de elite...</p>
             </div>
        ) : (
          <div className="grid gap-6">
            {trips.length > 0 ? trips.map((trip: any, idx) => (
              <div 
                key={trip.id}
                className="relative group lg:grid lg:grid-cols-[1.1fr_1.2fr_0.7fr] items-center glass-aura rounded-2xl overflow-hidden border border-white/5 hover:border-sky-500/30 transition-all duration-700"
              >
                {/* Visual Aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/[0.03] to-sky-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 blur-[80px] -mr-24 -mt-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* 1. Brand & Info */}
                <div className="p-5 md:p-6 flex items-center gap-6 border-b lg:border-b-0 lg:border-r border-white/5 relative z-10">
                  <div className="relative">
                    <div className="bg-black/60 border border-white/10 p-4 rounded-xl group-hover:shadow-[0_0_30px_rgba(14,165,233,0.2)] transition-all duration-700 group-hover:scale-105">
                      <Bus size={24} className="text-sky-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter leading-tight text-white italic">{trip.bus.company.name}</h3>
                    <p className="text-[8px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">{trip.bus.model} • Corporate Class</p>
                    <div className="flex items-center gap-4 mt-4">
                       <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/80">Ativo</span>
                       </div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Wi-Fi • AC • Premium</span>
                    </div>
                  </div>
                </div>

                {/* 2. Timeline Experience */}
                <div className="p-5 md:p-6 space-y-4 relative z-10">
                   <div className="flex justify-between items-center px-2">
                      <div className="text-left">
                        <p className="text-xl font-black tracking-tighter text-white italic">{new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.2em] mt-0.5">{origin}</p>
                      </div>

                      <div className="flex-1 flex flex-col items-center px-8">
                         <div className="w-full h-[2px] bg-white/5 relative rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/60 to-transparent"
                            />
                         </div>
                         <p className="text-[7px] font-black uppercase tracking-[0.4em] text-sky-500/40 mt-3 italic">Expresso Absolute</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-black tracking-tighter text-white/10 italic">ETA</p>
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.2em] mt-0.5">{destination}</p>
                      </div>
                   </div>
                </div>

                {/* 3. Pricing & Call to Action */}
                <div className="p-5 md:p-6 bg-sky-500/[0.01] flex items-center justify-between lg:justify-end gap-6 relative z-10">
                    <div className="text-right">
                        <p className="text-2xl font-black text-white tracking-tighter italic">
                          {trip.price}<span className="text-[9px] font-black uppercase text-sky-500 ml-1">MT</span>
                        </p>
                        <p className="text-[7px] text-sky-500/50 uppercase font-black tracking-[0.3em] mt-0.5 italic">Garantido</p>
                    </div>
                    <Link 
                      href={`/trips/seats/${trip.id}`} 
                      className="bg-sky-500 text-black h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-[0_10px_30px_rgba(14,165,233,0.2)] flex items-center justify-center gap-2 overflow-hidden relative group/btn"
                    >
                       <span className="hidden lg:inline relative z-10">Escolher Cadeira</span>
                       <ChevronRight size={14} strokeWidth={3} className="relative z-10" />
                    </Link>
                </div>
              </div>
            )) : (
                <div className="glass bg-white/[0.01] p-16 md:p-24 text-center rounded-[2rem] border border-white/5 space-y-6">
                    <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                       <MapPin size={24} className="opacity-20" />
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
    <Suspense fallback={<div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center"><EliteLoader size={120} /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
