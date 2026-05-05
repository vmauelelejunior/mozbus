"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import EliteLoader from '@/components/EliteLoader';

import SeatSelectionGrid from '@/components/SeatSelectionGrid';
import { savePendingReservation } from '@/lib/offline-store';

export default function SeatSelectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchTrip = async () => {
        try {
            const res = await api.get(`/trips/${id}`);
            const tripData = res.data;
            setTrip(tripData);
            
            if (tripData.seatsMapping) {
                let parsed = typeof tripData.seatsMapping === 'string' ? JSON.parse(tripData.seatsMapping) : tripData.seatsMapping;
                if (typeof parsed === 'string') parsed = JSON.parse(parsed); // lidar com double stringify
                setSeats(parsed);
            } else {
                setSeats([]);
            }
        } catch (e) {
            console.error('Erro ao carregar mapa do autocarro:', e);
        }
    };
    fetchTrip();
  }, [id]);

  const handleSeatClick = (index: number) => {
    const isOccupied = seats[index] === true || seats[index] === 'true';
    if (!isOccupied) {
      setSelectedSeat(index + 1);
    }
  };

  const handleConfirm = async () => {
      if (selectedSeat) {
          setIsLoading(true);
          try {
            const token = localStorage.getItem('mozbus_token');
            if (!token) {
              alert('Por favor, inicie sessão para reservar o seu lugar.');
              router.push(`/auth/login?redirect=/trips/seats/${id}`);
              setIsLoading(false);
              return;
            }

            const userStr = localStorage.getItem('mozbus_user');
            if (!userStr) {
               alert('Sessão inválida. Por favor, entre novamente.');
               router.push('/auth/login');
               setIsLoading(false);
               return;
            }
            
            const user = JSON.parse(userStr);
            const bookingData = {
                tripId: id as string,
                seatNumber: selectedSeat,
                passengerId: user.id
            };

            // Verificar Conectividade Real
            if (!navigator.onLine) {
                await queueOfflineReservation(bookingData);
                return;
            }

            try {
                const res = await api.post('/tickets/book', bookingData);
                router.push(`/tickets/success/${res.data.id}`);
            } catch (e: any) {
                // Se não houver resposta do servidor (timeout ou DNS), é rede
                if (!e.response) {
                    await queueOfflineReservation(bookingData);
                } else {
                    // Se houver resposta (ex: 400, 500), é um erro de lógica
                    setIsLoading(false);
                    if (e.response?.status === 401) {
                        localStorage.removeItem('mozbus_token');
                        localStorage.removeItem('mozbus_user');
                        alert('Sessão expirada. Por favor, inicie sessão novamente.');
                        router.push(`/auth/login?redirect=/trips/seats/${id}`);
                        return;
                    }
                    const errorMsg = e.response?.data?.message || 'Erro ao reservar assento.';
                    alert(errorMsg);
                }
            }
          } catch (e: any) {
              setIsLoading(false);
              alert('Erro inesperado no sistema. Tente novamente.');
          }
      }
  };

  const queueOfflineReservation = async (data: any) => {
    try {
        await savePendingReservation({
            ...data,
            timestamp: Date.now()
        });

        // Tentar registar Background Sync se disponível
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            try {
                // @ts-ignore
                await registration.sync.register('sync-reservations');
            } catch (err) {
                console.warn('Background Sync falhou ao registar, mas dados estão salvos localmente.', err);
            }
        }

        alert('Estás Offline! Guardámos a tua reserva. Ela será enviada automaticamente assim que tiveres sinal. Podes fechar a app à vontade.');
        router.push('/tickets/meus-bilhetes');
    } catch (err) {
        alert('Erro crítico ao salvar reserva offline. Por favor, tenta encontrar sinal.');
    } finally {
        setIsLoading(false);
    }
  };

  if (!isMounted || !trip) return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <EliteLoader size={120} />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white selection:bg-sky-500/30 relative overflow-hidden notranslate" translate="no">
      <div className="aura-bg-main" />
      <Navbar />
      {/* Conteúdo Principal */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-8">
        {/* Header da Página: Título e Info do Ônibus */}
        <div className="space-y-6">
           <Link href="/trips/results" className="inline-flex items-center gap-3 text-white/30 hover:text-sky-500 transition-all font-black text-[9px] uppercase tracking-[0.4em]">
            <ArrowLeft size={14} /> Voltar às Expedições
           </Link>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-2">
                   <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.85] italic text-white uppercase">
                      Escolha o seu <br/> 
                      <span className="text-sky-500">Lugar.</span>
                   </h1>
                   <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] ml-1">Digital Reserve • v2.0</p>
               </div>
               
               <div className="flex items-center gap-4 p-1 border-l-4 border-sky-500 pl-5 bg-white/5 pr-6 py-3 rounded-r-xl backdrop-blur-md">
                  <div className="bg-black/60 border border-white/10 p-3 rounded-xl shadow-2xl">
                    <Bus size={24} className="text-sky-500" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter text-white italic">{trip.bus.company.name}</h3>
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-0.5">{trip.bus.model} • Corporate Class</p>
                  </div>
               </div>
           </div>
        </div>

        {/* Grid de Conteúdo: Mapa e Resumo Lado a Lado */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
          {/* Lado Esquerdo: Mapa */}
          <div className="flex justify-center lg:justify-start">
             <SeatSelectionGrid 
               capacity={trip.bus.capacity || 40}
               layout={trip.bus.layout || '2-2'}
               seatsData={seats}
               selectedSeat={selectedSeat}
               onSeatSelect={setSelectedSeat}
             />
          </div>

          {/* Lado Direito: "Boarding Pass" Resumo */}
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="relative group">
                <div className="glass-aura rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-700 group-hover:border-sky-500/30">
                   {/* Parte Superior do Bilhete */}
                   <div className="p-6 space-y-6 bg-white/[0.02]">
                      <div className="flex justify-between items-start text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
                         <span>Cartão de Embarque</span>
                         <span className="text-sky-500 italic">Elite Class</span>
                      </div>
                      
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">{trip.route.origin}</h2>
                            <div className="flex-1 flex items-center px-3">
                               <div className="h-[1.5px] bg-sky-500/20 flex-1 relative overflow-hidden rounded-full">
                                  <motion.div 
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="absolute inset-0 bg-sky-500/60"
                                  />
                               </div>
                               <Bus size={14} className="mx-2 text-sky-500/40" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">{trip.route.destination}</h2>
                         </div>
                         <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic text-center">Rota Absolute Exclusive</p>
                      </div>
                   </div>

                   {/* Divisor "Picotado" */}
                   <div className="relative flex items-center px-3 h-10 bg-white/[0.01]">
                      <div className="absolute left-[-20px] w-10 h-10 rounded-full bg-[#0B0B0F] border-r border-white/10"></div>
                      <div className="flex-1 h-px border-t-2 border-dotted border-white/10 mx-8"></div>
                      <div className="absolute right-[-20px] w-10 h-10 rounded-full bg-[#0B0B0F] border-l border-white/10"></div>
                   </div>

                   {/* Parte Inferior do Bilhete */}
                   <div className="p-6 bg-white/[0.03] space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em]">Assento</p>
                            <p className={`text-3xl font-black tracking-tighter italic ${selectedSeat ? 'text-sky-500 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'text-white/10'}`}>
                               {selectedSeat ? (selectedSeat < 10 ? `0${selectedSeat}` : selectedSeat) : '--'}
                            </p>
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.3em]">Preço Total</p>
                            <p className="text-3xl font-black text-white tracking-tighter italic">{trip.price}<span className="text-[9px] text-sky-500 ml-1 font-black">MT</span></p>
                         </div>
                      </div>

                       <div className="space-y-4 pt-1">
                        <button 
                          onClick={handleConfirm}
                          disabled={!selectedSeat || isLoading}
                          className="w-full bg-sky-500 text-black h-14 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_30px_rgba(14,165,233,0.2)] disabled:opacity-20 group flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                          <span className="relative z-10">
                            {isLoading ? 'A PROCESSAR...' : 'Confirmar Reserva'}
                          </span>
                          {!isLoading && (
                            <motion.div
                              animate={{ x: selectedSeat ? [0, 4, 0] : 0 }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="relative z-10"
                            >
                               <Check size={16} strokeWidth={4} />
                            </motion.div>
                          )}
                          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        </button>
                        
                        <div className="flex items-center justify-center gap-3 text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">
                           <ShieldCheck size={14} className="text-sky-500/50" /> 
                           Sincronização Ativa
                        </div>
                      </div>
                   </div>
                </div>

                {/* Sombra Decorativa */}
                <div className="absolute -bottom-10 left-10 right-10 h-20 bg-sky-500/10 blur-[100px] -z-10"></div>
            </div>
        </div>
      </div>
    </div>
  </main>
);
}
