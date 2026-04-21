"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Scan, UserCheck, XCircle, Bus, ArrowLeft, Wifi } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function FiscalScannerPage() {
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);

  const fetchTrips = useCallback(async () => {
    try {
      const res = await api.get('/trips/search?origin=&destination=');
      setAvailableTrips(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchPassengers = useCallback(async (trip: any) => {
    if (!trip) return;
    try {
      const res = await api.get(`/trips/${trip.id}`);
      setPassengers(res.data.tickets);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    if (!selectedTrip) return;
    fetchPassengers(selectedTrip);
    
    const pollInterval = setInterval(() => {
      setIsLive(true);
      fetchPassengers(selectedTrip);
      setTimeout(() => setIsLive(false), 500);
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
      // Atualizar lista se a viagem for a mesma
      if (selectedTrip && res.data.tripId === selectedTrip.id) {
          selectTrip(selectedTrip);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao validar bilhete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black hero-gradient text-white flex flex-col items-center">
      <Navbar />
      <div className="w-full max-w-lg space-y-12 p-8 pt-12">
        
{/* Header Estilo Mobile App */}
         <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-orange-500/10 p-4 rounded-[32px] text-orange-500">
                 <Bus size={48} />
              </div>
              <div>
                 <h1 className="text-3xl font-black tracking-tighter uppercase">Validador <span className="text-orange-500">FISCAL</span></h1>
                 <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">{selectedTrip ? `Embarcando: ${selectedTrip.route.origin} → ${selectedTrip.route.destination}` : 'Selecione uma Partida'}</p>
              </div>
              {selectedTrip && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`}></div>
                  <p className="text-[10px] font-black uppercase opacity-40">Ao Vivo</p>
                </div>
              )}
         </div>

        {!selectedTrip ? (
            <div className="space-y-6">
                 <h2 className="text-sm font-black uppercase tracking-widest opacity-40 text-center">Partidas Ativas</h2>
                 <div className="grid gap-4">
                    {availableTrips.map(trip => (
                        <button 
                            key={trip.id}
                            onClick={() => selectTrip(trip)}
                            className="glass p-6 rounded-[32px] border border-white/5 hover:border-orange-500/30 transition-all text-left flex justify-between items-center group"
                        >
                            <div>
                                <p className="font-bold">{trip.route.origin} → {trip.route.destination}</p>
                                <p className="text-[10px] opacity-40 uppercase font-black">{new Date(trip.departureTime).toLocaleString('pt-MZ')}</p>
                            </div>
                            <div className="bg-white/5 p-2 rounded-xl group-hover:bg-orange-500 transition-all">
                                <Scan size={20} />
                            </div>
                        </button>
                    ))}
                 </div>
            </div>
        ) : (
            <>
                {/* Info de Progresso de Embarque */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-6 rounded-[32px] text-center bg-white/5 border border-white/10">
                        <p className="opacity-40 text-[8px] font-black uppercase tracking-widest">A bordo</p>
                        <p className="text-3xl font-black text-orange-500">{passengers.filter(p => p.isBoarded).length}</p>
                    </div>
                    <div className="glass p-6 rounded-[32px] text-center bg-white/5 border border-white/10">
                        <p className="opacity-40 text-[8px] font-black uppercase tracking-widest">Restantes</p>
                        <p className="text-3xl font-black">{passengers.filter(p => !p.isBoarded).length}</p>
                    </div>
                </div>

                {/* Simulador de Scanner */}
                <div className="glass bg-white/5 p-8 rounded-[40px] border border-white/10 space-y-8">
                    <div className="relative aspect-video bg-black/40 rounded-[32px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-orange-500/5 animate-pulse"></div>
                        {!loading && !result && !error && (
                            <motion.div animate={{ y: [0, 100, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-0 left-0 right-0 h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,1)] z-10"></motion.div>
                        )}
                        <Scan size={48} className="opacity-10" />
                        <p className="absolute bottom-4 text-[10px] font-black uppercase opacity-20 tracking-widest">Aguardando QR Code...</p>
                    </div>

                    <form onSubmit={handleScan} className="space-y-4">
                        <input 
                            type="text" 
                            value={qrCode}
                            onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                            placeholder="Inserir Código Manualmente"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-orange-500/50 transition-all font-mono text-center tracking-widest uppercase"
                        />
                        <button 
                            type="submit"
                            disabled={loading || !qrCode}
                            className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-400 transition-all shadow-xl disabled:opacity-20"
                        >
                            {loading ? 'Validando...' : 'Validar Bilhete'}
                        </button>
                    </form>
                </div>

                {/* Resultados Rápidos */}
                <AnimatePresence mode='wait'>
                    {result && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="glass bg-green-500 p-6 rounded-[32px] text-center border border-white/20">
                            <h3 className="text-sm font-black">EMBARQUE PERMITIDO: {result.passenger.name}</h3>
                            <p className="text-[10px] font-bold opacity-80 uppercase">Assento {result.seatNumber}</p>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="glass bg-red-500 p-6 rounded-[32px] text-center border border-white/20">
                            <h3 className="text-sm font-black">ERRO: {error}</h3>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Manifesto de Passageiros */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Próximos Passageiros</h3>
                        <button onClick={() => setSelectedTrip(null)} className="text-[10px] font-black uppercase text-orange-500">Trocar Viagem</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {passengers.map((p, i) => (
                            <div key={i} className={`p-4 rounded-2xl flex items-center justify-between border ${p.isBoarded ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/10 border-white/10'}`}>
                                <div className="flex items-center gap-4">
                                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${p.isBoarded ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                        {p.seatNumber}
                                     </div>
                                     <p className="font-bold text-xs truncate max-w-[150px]">{p.passenger.name}</p>
                                </div>
                                {p.isBoarded ? (
                                    <UserCheck size={16} className="text-green-500" />
                                ) : (
                                    <button 
                                        onClick={() => { setQrCode(p.qrCode); }}
                                        className="text-[10px] font-black uppercase px-3 py-1 bg-white text-black rounded-lg"
                                    >
                                        Check
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}

        <div className="text-center pt-8">
             <Link href="/dashboard/overview" className="flex items-center justify-center gap-2 opacity-30 hover:opacity-100 font-black text-[10px] uppercase tracking-widest transition-all">
                <ArrowLeft size={14} /> Voltar ao Painel Corporativo
             </Link>
        </div>
      </div>
    </main>
  );
}
