"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Scan, UserCheck, XCircle, Bus, ArrowLeft, Wifi, Zap, LayoutGrid, ShieldCheck, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import EliteLoader from '@/components/EliteLoader';

export default function FiscalScannerPage() {
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);

  const fetchTrips = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await api.get('/trips/search?origin=&destination=');
      setAvailableTrips(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, []);

  const fetchPassengers = useCallback(async (trip: any) => {
    if (!trip) return;
    try {
      setIsSyncing(true);
      const res = await api.get(`/trips/${trip.id}`);
      setPassengers(res.data.tickets);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    if (!selectedTrip) return;
    
    const pollInterval = setInterval(() => {
      fetchPassengers(selectedTrip);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [selectedTrip, fetchPassengers]);

  const selectTrip = async (trip: any) => {
      setSelectedTrip(trip);
      fetchPassengers(trip);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await api.post('/tickets/scan', { qrCode });
      setResult(res.data);
      setQrCode('');
      if (selectedTrip && res.data.tripId === selectedTrip.id) {
          selectTrip(selectedTrip);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Token Inválido');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <EliteLoader />;

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center overflow-x-hidden notranslate" translate="no">
      <div className="aura-bg-main" />
      
      <div className="w-full max-w-lg space-y-10 p-8 pt-10 z-10 relative">
        
        {/* Header Mobile Elite */}
        <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <div className="bg-sky-500/10 p-4 rounded-[24px] text-sky-500 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                   <Bus size={32} strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-4 border-[#0A0A0B]"></div>
              </div>
              
              <div className="space-y-1">
                 <h1 className="text-3xl font-black tracking-tighter uppercase italic">Operação <span className="text-sky-500 glow-text">Fiscal</span></h1>
                 <p className="opacity-40 text-[9px] font-black uppercase tracking-[0.4em]">
                   {selectedTrip ? `HUB: ${selectedTrip.route.origin}` : 'Protocolo de Embarque'}
                 </p>
              </div>

              {selectedTrip && (
                <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-2 rounded-full border border-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSyncing ? 'bg-sky-400 shadow-[0_0_8px_#0EA5E9] scale-125' : 'bg-zinc-600 scale-100'}`}></div>
                  <p className={`text-[8px] font-black uppercase tracking-widest transition-opacity duration-500 ${isSyncing ? 'text-sky-400' : 'opacity-40'}`}>Sincronização Ativa</p>
                </div>
              )}
        </div>

        {!selectedTrip ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center">Partidas em Terminal</h2>
                 <div className="grid gap-4">
                    {availableTrips.length === 0 ? (
                      <div className="card-aura p-20 text-center opacity-20 border-dashed">
                        <Wifi size={32} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Buscando sinal...</p>
                      </div>
                    ) : availableTrips.map(trip => (
                        <button 
                            key={trip.id}
                            onClick={() => selectTrip(trip)}
                            className="card-aura p-5 rounded-[24px] border border-white/5 hover:border-sky-500/30 transition-all text-left flex justify-between items-center group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <p className="font-black text-base italic tracking-tight uppercase">{trip.route.origin} → {trip.route.destination}</p>
                                <p className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">Horário: {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all relative z-10">
                                <Scan size={16} />
                            </div>
                        </button>
                    ))}
                 </div>
            </div>
        ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Indicadores de Fluxo */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="card-aura p-6 rounded-[24px] text-center border-emerald-500/10">
                        <p className="opacity-20 text-[8px] font-black uppercase tracking-[0.2em] mb-1">A Bordo</p>
                        <p className="text-3xl font-black text-emerald-400 italic">{passengers.filter(p => p.isBoarded).length}</p>
                    </div>
                    <div className="card-aura p-6 rounded-[24px] text-center border-sky-500/10">
                        <p className="opacity-20 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Restantes</p>
                        <p className="text-3xl font-black text-sky-400 italic">{passengers.filter(p => !p.isBoarded).length}</p>
                    </div>
                </div>

                {/* Área de Escaneamento Elite */}
                <div className="card-aura bg-sky-500/[0.02] p-6 rounded-[32px] border-sky-500/10 space-y-6 relative">
                    <div className="relative aspect-square bg-[#0D0D10] rounded-[24px] border border-white/5 flex flex-col items-center justify-center overflow-hidden group">
                        <div className="absolute inset-0 bg-sky-500/[0.03] animate-pulse"></div>
                        
                        {!loading && !result && !error && (
                            <motion.div 
                               animate={{ y: [0, 280, 0] }} 
                               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                               className="absolute top-0 left-0 right-0 h-[2px] bg-sky-400 shadow-[0_0_25px_#0EA5E9] z-10 opacity-50"
                            />
                        )}

                        <div className="relative z-10 opacity-20 group-hover:opacity-40 transition-opacity">
                          <QrCode size={100} strokeWidth={1} />
                        </div>
                        
                        <p className="absolute bottom-6 text-[9px] font-black uppercase opacity-20 tracking-[0.3em] z-10">Módulo de Visão Ativa</p>
                    </div>

                    <form onSubmit={handleScan} className="space-y-4">
                        <div className="relative">
                          <input 
                              type="text" 
                              value={qrCode}
                              onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                              placeholder="CÓDIGO DE ACESSO"
                              className="w-full bg-[#141416] border border-white/5 rounded-xl py-4 px-6 outline-none focus:border-sky-500/50 transition-all font-black text-center tracking-[0.3em] uppercase text-sky-400 text-xs"
                          />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading || !qrCode}
                            className="w-full h-14 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-sky-400 transition-all shadow-[0_10px_30px_rgba(14,165,233,0.2)] disabled:opacity-10 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={14} fill="currentColor" /> Validar Acesso</>}
                        </button>
                    </form>
                </div>

                {/* Feedback Intelligence */}
                <AnimatePresence mode='wait'>
                    {result && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="card-aura bg-emerald-500/10 p-5 rounded-[24px] text-center border-emerald-500/20">
                            <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest italic">{result.passenger.name}</h3>
                            <p className="text-[9px] font-bold text-emerald-500/60 uppercase mt-1 tracking-tighter">Assento {result.seatNumber} • AUTORIZADO</p>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="card-aura bg-rose-500/10 p-5 rounded-[24px] text-center border-rose-500/20">
                            <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-widest italic">TOKEN INVÁLIDO</h3>
                            <p className="text-[9px] font-bold text-rose-500/60 uppercase mt-1">Acesso Negado à Rede</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Manifesto Compacto */}
                <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 italic">Manifesto Digital</h3>
                        <button onClick={() => setSelectedTrip(null)} className="text-[9px] font-black uppercase text-sky-500 tracking-widest hover:glow-text transition-all">Alternar Rota</button>
                    </div>
                    <div className="space-y-3">
                        {passengers.length === 0 ? (
                          <div className="text-center py-10 opacity-20 italic text-[10px] font-black uppercase tracking-widest">Nenhum passageiro em lista.</div>
                        ) : passengers.slice(0, 10).map((p, i) => (
                            <div key={i} className={`card-aura p-4 rounded-2xl flex items-center justify-between border ${p.isBoarded ? 'bg-[#0D0D10] opacity-40' : 'bg-white/[0.02]'}`}>
                                <div className="flex items-center gap-4">
                                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] italic ${p.isBoarded ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-400'}`}>
                                        {p.seatNumber}
                                     </div>
                                     <div className="overflow-hidden">
                                       <p className="font-black text-[11px] truncate max-w-[140px] uppercase italic tracking-tight">{p.name || p.passenger.name}</p>
                                       <p className="text-[8px] opacity-20 font-bold tracking-widest uppercase">{p.isBoarded ? 'Concluído' : 'Aguardando'}</p>
                                     </div>
                                </div>
                                {p.isBoarded ? (
                                    <ShieldCheck size={18} className="text-emerald-500/50" />
                                ) : (
                                    <button 
                                        onClick={() => { setQrCode(p.qrCode); }}
                                        className="text-[9px] font-black uppercase px-4 py-2 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/20 active:scale-90 transition-all"
                                    >
                                        Check
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <div className="text-center pt-8">
             <Link href="/dashboard/overview" className="inline-flex items-center gap-3 opacity-30 hover:opacity-100 font-black text-[9px] uppercase tracking-[0.4em] transition-all hover:text-sky-400">
                <ArrowLeft size={14} /> Retornar ao Quadro
             </Link>
        </div>
      </div>
    </main>
  );
}
