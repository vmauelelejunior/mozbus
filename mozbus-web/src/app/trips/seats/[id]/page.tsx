"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function SeatSelectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [seats, setSeats] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchTrip = async () => {
        try {
            const res = await api.get(`/trips/${id}`);
            const tripData = res.data;
            setTrip(tripData);
            
            // Se o mapping estiver vazio, inicializar com base no número de assentos do autocarro
            if (tripData.seatsMapping) {
                setSeats(JSON.parse(tripData.seatsMapping));
            } else {
                setSeats(new Array(tripData.bus.seats).fill(false));
            }
        } catch (e) {
            console.error(e);
        }
    };
    fetchTrip();
  }, [id]);

  const handleSeatClick = (index: number) => {
    if (!seats[index]) {
      setSelectedSeat(index + 1);
    }
  };

  const handleConfirm = async () => {
      if (selectedSeat) {
          try {
            const user = JSON.parse(localStorage.getItem('mozbus_user') || '{"id": "test-user"}');
            const res = await api.post('/tickets/book', {
                tripId: id,
                seatNumber: selectedSeat,
                passengerId: user.id === "test-user" ? (await api.get('/auth/me').catch(() => ({data: {id: null}}))).data?.id || "seed-user-id" : user.id
            });
            router.push(`/tickets/success/${res.data.id}`);
          } catch (e: any) {
              alert(e.response?.data?.message || 'Erro ao reservar assento.');
          }
      }
  };

  if (!trip) return <div className="min-h-screen bg-black flex items-center justify-center font-black uppercase tracking-widest opacity-20 text-white">Carregando mapa do ônibus...</div>;

  return (
    <main className="min-h-screen bg-black hero-gradient text-white selection:bg-orange-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 md:p-12 grid lg:grid-cols-[1fr_450px] gap-12 lg:gap-24 items-start">
        
        {/* Lado Esquerdo: Experiência de Seleção */}
        <div className="space-y-12">
           <Link href="/trips/results" className="inline-flex items-center gap-2 opacity-40 hover:opacity-100 hover:text-orange-500 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
            <ArrowLeft size={14} /> Voltar aos Resultados
           </Link>
           
           <div className="space-y-6">
               <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                  ESCOLHA O SEU <br/> 
                  <span className="text-orange-500">LUGAR.</span>
               </motion.h1>
               
               <div className="flex items-center gap-6 p-1 border-l-2 border-orange-500/30 pl-6">
                  <div className="bg-orange-500 p-4 rounded-3xl shadow-2xl shadow-orange-500/40">
                    <Bus size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{trip.bus.company.name}</h3>
                    <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.2em]">{trip.bus.model} • {trip.bus.plate}</p>
                  </div>
               </div>
           </div>

           {/* Mapa Visual do Ônibus - Estilo Digital-Twin */}
           <div className="flex justify-center lg:justify-start pt-10">
              <div className="relative group">
                {/* Glow de Fundo do Ônibus */}
                <div className="absolute -inset-4 bg-orange-500/5 blur-3xl rounded-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="relative glass bg-zinc-900/40 p-10 md:p-16 rounded-[80px] border-[1px] border-white/5 shadow-2xl overflow-hidden">
                   {/* Linha de reflexo superior */}
                   <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                   
                   <div className="w-[280px] space-y-10">
                      {/* Cockpit Ultra-Realista */}
                      <div className="h-24 bg-gradient-to-b from-black/60 to-black/20 rounded-t-[50px] rounded-b-[15px] flex items-center justify-between px-10 border-b-2 border-orange-500/40 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(249,115,22,0.15),transparent_70%)]"></div>
                         <motion.div 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="w-10 h-10 rounded-full border-[3px] border-white/10 flex items-center justify-center relative z-10"
                         >
                            <div className="w-1 h-3 bg-white/20 rounded-full"></div>
                         </motion.div>
                         <div className="w-14 h-10 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center justify-center relative z-10">
                            <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                         </div>
                      </div>

                      {/* Grade de Assentos com Efeito de Profundidade */}
                      <div className="grid grid-cols-4 gap-4 relative">
                         {/* Corredor Central Visual */}
                         <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/5 -translate-x-1/2"></div>
                         
                         {seats.map((isOccupied, idx) => (
                             <div key={idx} className={`${(idx + 1) % 4 === 2 ? 'mr-12' : ''}`}>
                                 <motion.button 
                                     initial={{ opacity: 0, scale: 0.8 }}
                                     animate={{ opacity: 1, scale: 1 }}
                                     transition={{ delay: idx * 0.01 }}
                                     whileHover={{ scale: isOccupied ? 1 : 1.15, zIndex: 10 }}
                                     whileTap={{ scale: isOccupied ? 1 : 0.9 }}
                                     onClick={() => handleSeatClick(idx)}
                                     disabled={isOccupied}
                                     className={`w-11 h-11 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-300
                                         ${isOccupied ? 'bg-zinc-800/50 text-white/10 cursor-not-allowed border border-white/5' : 
                                           selectedSeat === idx + 1 ? 'bg-orange-500 text-white shadow-[0_0_25px_rgba(249,115,22,0.5)] scale-110 border-2 border-white/30 rotate-2' : 
                                           'glass hover:bg-white/10 border border-white/10 hover:border-orange-500/50'}`}
                                 >
                                     {idx + 1}
                                 </motion.button>
                             </div>
                         ))}
                      </div>
                   </div>

                   {/* Legenda Estilizada */}
                   <div className="mt-16 flex justify-between gap-4 px-2 border-t border-white/5 pt-8">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-sm bg-white/10 border border-white/10"></div>
                         <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">Livre</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-sm bg-zinc-800 border border-white/5"></div>
                         <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">Ocupado</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-sm bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                         <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">Sua Escolha</span>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* Lado Direito: "Boarding Pass" Resumo (Design do Stitch) */}
        <div className="sticky top-12">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative"
            >
                {/* Efeito de Bilhete Físico */}
                <div className="bg-[#111] rounded-[40px] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border border-white/5">
                   {/* Parte Superior do Bilhete */}
                   <div className="p-10 space-y-8 bg-gradient-to-br from-white/[0.02] to-transparent">
                      <div className="flex justify-between items-start text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                         <span>Cartão de Embarque</span>
                         <span>MozBus Premium</span>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between items-baseline">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">MAPUTO</h2>
                            <div className="flex-1 flex items-center px-4 opacity-20">
                               <div className="h-px bg-white flex-1 dashed-border"></div>
                               <Bus size={16} className="mx-2" />
                            </div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter">BEIRA</h2>
                         </div>
                         <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Operado por {trip.bus.company.name}</p>
                      </div>
                   </div>

                   {/* Divisor "Picotado" (Perforated Line) */}
                   <div className="relative flex items-center px-4">
                      <div className="absolute left-[-15px] w-8 h-8 rounded-full bg-black border-r border-white/5"></div>
                      <div className="flex-1 h-px border-t-2 border-dashed border-white/10 mx-6"></div>
                      <div className="absolute right-[-15px] w-8 h-8 rounded-full bg-black border-l border-white/5"></div>
                   </div>

                   {/* Parte Inferior do Bilhete */}
                   <div className="p-10 bg-white/[0.01] space-y-10">
                      <div className="grid grid-cols-2 gap-10">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">Assento</p>
                            <p className={`text-3xl font-black ${selectedSeat ? 'text-orange-500' : 'text-white/20'}`}>
                               {selectedSeat ? (selectedSeat < 10 ? `0${selectedSeat}` : selectedSeat) : '--'}
                            </p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">Preço</p>
                            <p className="text-3xl font-black text-white">{trip.price} <span className="text-sm opacity-40">MT</span></p>
                         </div>
                      </div>

                      <div className="space-y-6 pt-4">
                        <button 
                          onClick={handleConfirm}
                          disabled={!selectedSeat}
                          className="w-full bg-white text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl disabled:opacity-10 group flex items-center justify-center gap-4"
                        >
                          Confirmar Reserva
                          <motion.div
                            animate={{ x: selectedSeat ? [0, 5, 0] : 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                             <Check size={20} strokeWidth={3} />
                          </motion.div>
                        </button>
                        
                        <div className="flex items-center justify-center gap-3 opacity-20 text-[9px] font-black uppercase tracking-widest">
                           <ShieldCheck size={14} /> 
                           Pagamento Seguro via M-Pesa
                        </div>
                      </div>
                   </div>
                </div>

                {/* Sombra Decorativa */}
                <div className="absolute -bottom-10 left-10 right-10 h-20 bg-orange-500/10 blur-[100px] -z-10"></div>
            </motion.div>
        </div>
      </div>
    </main>
  );
}
