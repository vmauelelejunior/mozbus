'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Search, ShieldCheck, Loader2, DollarSign, Briefcase, PlusCircle, Trash2, 
  Printer, CheckCircle2, AlertCircle, RefreshCw, Smartphone, 
  CreditCard as CardIcon, Clock, UserPlus, Info, Luggage, ChevronRight, X,
  MapPin, User, Phone, Plus
} from 'lucide-react';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';
import EliteSkeleton from '@/components/EliteSkeleton';
import TicketPrinter from '@/components/TicketPrinter';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/EliteToast';

interface Trip {
  id: string;
  departureTime: string;
  price: number;
  status: string;
  bus: { plate: string; model: string; capacity: number; company: { name: string } };
  route: { origin: string; destination: string };
  seatsMapping?: string;
}

export default function TerminalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState({ origin: '', destination: '' });
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  
  // Booking State
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [luggages, setLuggages] = useState<{ type: string; weight: number; price: number }[]>([]);
  const [isNewPassenger, setIsNewPassenger] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [lastTicketData, setLastTicketData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA' | 'EMOLA' | null>(null);
  const [activeTab, setActiveTab] = useState<'SALES' | 'HISTORY'>('SALES');
  const [soldTickets, setSoldTickets] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryTicket, setSelectedHistoryTicket] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const parsedSeats = React.useMemo(() => {
    if (!selectedTrip?.seatsMapping) return [];
    try {
      const p = typeof selectedTrip.seatsMapping === 'string' 
        ? JSON.parse(selectedTrip.seatsMapping) 
        : selectedTrip.seatsMapping;
      return typeof p === 'string' ? JSON.parse(p) : p;
    } catch (e) {
      return [];
    }
  }, [selectedTrip?.seatsMapping]);

  useEffect(() => {
    fetchTrips();
    
    // Polling global para novas viagens e mudanças de status (15s)
    const tripsInterval = setInterval(() => {
      fetchTrips(true);
    }, 15000);

    return () => clearInterval(tripsInterval);
  }, []);

  useEffect(() => {
    if (showBooking && selectedTrip) {
      // Polling intensivo de assentos quando o modal está aberto (5s)
      const seatInterval = setInterval(() => {
        refreshSelectedTrip();
      }, 5000);
      return () => clearInterval(seatInterval);
    }
  }, [showBooking, selectedTrip?.id]);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/tickets'); // Assuming /tickets returns company tickets based on token
      setSoldTickets(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (bookingSuccess && lastTicketData) {
        handlePrint();
    }
  }, [bookingSuccess, lastTicketData]);

  const fetchTrips = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsSyncing(true);
      const res = await api.get(`/trips/search?origin=${searchQuery.origin}&destination=${searchQuery.destination}`);
      setTrips(res.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      if (!silent) setLoading(false);
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const refreshSelectedTrip = async () => {
    if (!selectedTrip) return;
    try {
      setIsSyncing(true);
      const res = await api.get(`/trips/${selectedTrip.id}`);
      setSelectedTrip(res.data);
    } catch (error) {
      console.error('Error refreshing trip:', error);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const selectTripForBooking = async (trip: Trip) => {
    // Optimistic UI: Set trip immediately and show modal
    setSelectedTrip(trip);
    setShowBooking(true);
    setPaymentMethod(null);
    setBookingLoading(true);
    
    try {
      const res = await api.get(`/trips/${trip.id}`);
      setSelectedTrip(res.data);
    } catch (error) {
      console.error('Error fetching trip details:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const findPassenger = async (phone: string) => {
    if (phone.length < 9) return;
    try {
      const res = await api.get(`/users/phone/${phone}`);
      if (res.data) {
        setPassengerName(res.data.name);
        setIsNewPassenger(false);
      } else {
        setIsNewPassenger(true);
      }
    } catch (error) {
      setIsNewPassenger(true);
    }
  };

  const addLuggage = () => {
    // Luggage pricing logic for the operational elite
    // Using 'EXTRA' as the type to match backend Prisma enum (HAND, CHECKED, EXTRA)
    const weights = [10, 15, 20, 25];
    const prices = [100, 150, 200, 300];
    const randomIdx = Math.floor(Math.random() * weights.length);
    setLuggages([...luggages, { 
      type: 'EXTRA', 
      label: 'Volume Adicional',
      weight: weights[randomIdx], 
      price: prices[randomIdx] 
    }]);
  };

  const handlePrint = () => {
    setTimeout(() => {
        window.print();
    }, 200);
  };

  const handleBook = async () => {
    if (!selectedSeat || !passengerPhone || !passengerName || !selectedTrip || !paymentMethod) return;

    try {
        setBookingLoading(true); // Internal modal loading
        let passengerId = '';

        // Resilient user resolution strategy
        const checkUser = await api.get(`/users/phone/${passengerPhone}`).catch(() => ({ data: null }));
        
        if (checkUser.data && checkUser.data.id) {
            passengerId = checkUser.data.id;
            // Optionally update name if it changed
            if (passengerName !== checkUser.data.name) {
                await api.patch(`/users/${passengerId}`, { name: passengerName }).catch(() => {});
            }
        } else {
            // Create new passenger profile on-the-fly
            const userRes = await api.post('/users', {
                name: passengerName,
                phone: passengerPhone,
                email: `${passengerPhone}@mozbus.local`,
                password: 'mozbus123',
                role: 'PASSENGER'
            });
            passengerId = userRes.data.id;
        }

        const bookRes = await api.post('/tickets/book', {
            tripId: selectedTrip.id,
            seatNumber: selectedSeat,
            passengerId: passengerId,
            paymentMethod: paymentMethod,
            luggages: luggages.map(l => ({
                type: l.type,
                weight: l.weight,
                price: l.price,
                description: 'Terminal POS Sale'
            }))
        });

        const ticket = bookRes.data;
        
        // Simular pagamento automático no POS
        await api.post(`/tickets/${ticket.id}/pay`);

        // Buscar detalhe completo para impressão (com relações)
        const fullTicketRes = await api.get(`/tickets/${ticket.id}`);
        
        setLastTicketData(fullTicketRes.data);
        setBookingSuccess(true);
        // Clear state after success for the next operation
        setTimeout(() => {
            setSelectedSeat(null);
            setPassengerPhone('');
            setPassengerName('');
            setLuggages([]);
            setPaymentMethod(null);
        }, 1000);
    } catch (e: any) {
        toast('Erro Crítico: ' + (e.response?.data?.message || e.message), 'error');
    } finally {
        setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white p-4 md:p-6 font-sans selection:bg-sky-500/30 relative overflow-hidden notranslate" translate="no">
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0B0B0F]/90 backdrop-blur-2xl"
          >
            <EliteLoader size={80} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="aura-bg-main"></div>
      
      <header className="mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center glass-aura p-4 md:p-5 rounded-xl relative overflow-hidden group border border-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[150px] -mr-64 -mt-64 rounded-full group-hover:bg-sky-500/10 transition-all duration-1000"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-2 h-8 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-br from-white via-white to-white/30 bg-clip-text text-transparent tracking-tighter leading-none italic">
                TERMINAL <span className="text-sky-500">POS</span>
              </h1>
              <p className="text-white/40 text-[8px] font-black tracking-[0.4em] uppercase mt-0.5 ml-1">Elite Operational Hub v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 ml-1">
             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isSyncing ? 'bg-sky-500 shadow-[0_0_10px_#0EA5E9] scale-125' : 'bg-sky-950 shadow-none scale-100'}`}></div>
             <p className={`font-bold uppercase text-[9px] tracking-[0.2em] transition-opacity duration-500 ${isSyncing ? 'text-sky-400' : 'text-white/20'}`}>
               {isSyncing ? 'Sincronização em Tempo Real Ativa' : 'Sistema de Rede Estável'}
             </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 lg:mt-0 relative z-10">
          <div className="bg-black/60 px-5 py-3 rounded-xl border border-white/10 flex items-center gap-5 backdrop-blur-xl shadow-2xl">
            <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
              <Clock className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-left group/stat">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Vendas Hoje</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-black text-white leading-none tracking-tighter">128</p>
                <div className="w-1 h-1 rounded-full bg-sky-500 animate-pulse"></div>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-white/10"></div>
            <div className="text-left group/stat">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5 group-hover/stat:text-green-500/50 transition-colors">Fluxo de Caixa</p>
              <p className="text-2xl font-black text-green-400 leading-none tracking-tighter">84.250<span className="text-[10px] ml-1 opacity-40">MT</span></p>
            </div>
          </div>
          
          <div className="bg-sky-500 text-black px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-[0_15px_40px_rgba(14,165,233,0.3)] hover:scale-105 transition-transform cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center">
              <User size={16} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-[8px] font-black uppercase leading-none opacity-60">Agente Master</p>
              <p className="text-sm font-black uppercase tracking-tight">João Mandlate</p>
            </div>
          </div>
        </div>
      </header>

      {/* Terminal Tab Navigation */}
      <div className="flex gap-4 mb-8 relative z-10">
        <button 
          onClick={() => setActiveTab('SALES')}
          className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${activeTab === 'SALES' ? 'bg-sky-500 text-black border-sky-400 shadow-[0_10px_30px_rgba(14,165,233,0.3)]' : 'bg-black/40 text-white/40 border-white/5 hover:border-white/20 hover:text-white/60'}`}
        >
          <PlusCircle className="w-4 h-4" />
          Vender Bilhetes
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${activeTab === 'HISTORY' ? 'bg-sky-500 text-black border-sky-400 shadow-[0_10px_30px_rgba(14,165,233,0.3)]' : 'bg-black/40 text-white/40 border-white/5 hover:border-white/20 hover:text-white/60'}`}
        >
          <Clock className="w-4 h-4" />
          Bilhetes Vendidos
          {soldTickets.length > 0 && <span className="ml-2 bg-black/20 px-2 py-0.5 rounded-full text-[10px]">{soldTickets.length}</span>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 h-full">
        {activeTab === 'SALES' ? (
          <>
            <div className="lg:col-span-3 space-y-4">
              <div className="glass-aura p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[80px] -mr-32 -mt-32 group-hover:bg-sky-500/10 transition-all duration-700"></div>
                <h2 className="text-lg font-black mb-6 flex items-center gap-3 tracking-tighter italic text-white/80">
                  <Search className="w-4 h-4 text-sky-500" />
                  EXPEDIÇÃO
                </h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {['Beira', 'Nampula', 'Tete', 'Quelimane'].map(city => (
                      <button 
                        key={city}
                        onClick={() => setSearchQuery({...searchQuery, destination: city})}
                        className="bg-white/5 hover:bg-sky-500/20 border border-white/5 hover:border-sky-500/40 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-white/30 ml-3 mb-2 block uppercase tracking-[0.4em]">Origem</label>
                    <div className="relative group/input">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/input:text-sky-500 transition-all" />
                      <input 
                        type="text" 
                        placeholder="PONTO DE PARTIDA" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-6 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all outline-none text-[11px] font-black text-white tracking-tight uppercase placeholder:text-white/5"
                        value={searchQuery.origin}
                        onChange={(e) => setSearchQuery({...searchQuery, origin: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/30 ml-3 mb-2 block uppercase tracking-[0.4em]">Destino</label>
                    <div className="relative group/input">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/input:text-sky-500 transition-all" />
                      <input 
                        type="text" 
                        placeholder="DESTINO FINAL" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-6 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all outline-none text-[11px] font-black text-white tracking-tight uppercase placeholder:text-white/5"
                        value={searchQuery.destination}
                        onChange={(e) => setSearchQuery({...searchQuery, destination: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={fetchTrips}
                    className="w-full bg-white text-black hover:bg-sky-400 font-black py-4 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all active:scale-[0.97] uppercase tracking-widest text-[9px] italic"
                  >
                    PROCURAR ROTAS ACTIVAS
                  </button>
                </div>
              </div>

              <div className="bg-sky-500/5 p-6 rounded-2xl border border-sky-500/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-sky-400">Protocolo de Segurança</h3>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-tight">Obrigatório validar BI/Passaporte para todos os passageiros em rotas inter-provinciais.</p>
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="glass-aura p-6 rounded-xl border border-white/10 backdrop-blur-3xl min-h-[500px] relative overflow-hidden">
                <div className="flex justify-between items-end mb-6 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter">PRÓXIMAS PARTIDAS</h2>
                    <p className="text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">Monitorização em Tempo Real</p>
                  </div>
                  <div className="text-right">
                      <span className="text-[8px] font-black text-sky-500 block mb-1 tracking-[0.3em] uppercase">Status de Rede</span>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest font-black">Sync: ON</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      </div>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-xl relative overflow-hidden h-[180px]">
                        <div className="flex justify-between mb-4">
                          <EliteSkeleton className="w-24 h-6 rounded-full" />
                          <EliteSkeleton className="w-20 h-6" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <EliteSkeleton className="flex-1 h-10" />
                          <div className="w-4 h-[1px] bg-white/10" />
                          <EliteSkeleton className="flex-1 h-10" />
                        </div>
                        <EliteSkeleton className="h-8 w-full mt-2" />
                      </div>
                    ))}
                  </div>
                ) : trips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {trips.map(trip => (
                      <motion.div 
                        key={trip.id}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => selectTripForBooking(trip)}
                        className="bg-black/60 border border-white/5 hover:border-sky-500/40 p-4 rounded-xl cursor-pointer transition-all group relative overflow-hidden shadow-2xl"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[40px] -mr-16 -mt-16 rounded-full group-hover:bg-sky-500/10 transition-colors"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            <Bus className="w-3.5 h-3.5 text-sky-500" />
                            <span className="text-[9px] font-black tracking-widest uppercase opacity-80">{trip.bus.plate}</span>
                          </div>
                          <div className="text-2xl font-black text-sky-400 italic tracking-tighter">
                            {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(trip.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1">
                            <h3 className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] leading-none mb-1">Origem</h3>
                            <p className="text-base font-black truncate tracking-tight">{trip.route.origin}</p>
                          </div>
                          <div className="w-8 h-[1px] bg-white/10 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-sky-500/50"></div>
                          </div>
                          <div className="flex-1 text-right">
                            <h3 className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] leading-none mb-1">Destino</h3>
                            <p className="text-base font-black truncate tracking-tight">{trip.route.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2.5 text-white/40">
                            <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-black font-mono">
                              {new Date(trip.departureTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-[9px] font-black bg-sky-500/10 text-sky-500 px-3 py-1.5 rounded-lg border border-sky-500/20 uppercase tracking-widest">
                            {trip.bus.company.name}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-white/10">
                    <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                        <AlertCircle className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] italic">Rede de Viagens Vazia</p>
                    <p className="text-[10px] font-bold opacity-30 mt-2">Altere os critérios de busca para novos resultados</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12">
            <div className="glass-aura rounded-xl border border-white/10 backdrop-blur-3xl min-h-[600px] relative overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase">Registo de Vendas</h2>
                  <p className="text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase mt-1">Histórico Operacional Completo</p>
                </div>
                <button 
                  onClick={fetchHistory}
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all active:scale-90"
                >
                  <RefreshCw className={`w-4 h-4 text-sky-500 ${historyLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Lista de Bilhetes */}
                <div className="w-[40%] border-r border-white/5 overflow-y-auto custom-scrollbar p-6 space-y-3">
                  {historyLoading ? (
                    [1,2,3,4,5].map(i => <EliteSkeleton key={i} className="h-20 w-full rounded-xl" />)
                  ) : soldTickets.length > 0 ? (
                    soldTickets.map(ticket => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedHistoryTicket(ticket)}
                        className={`w-full p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${selectedHistoryTicket?.id === ticket.id ? 'bg-sky-500/10 border-sky-500/50' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono font-black text-sky-500 uppercase tracking-widest">#{ticket.qrCode.split('-')[1]}</span>
                          <span className="text-[10px] font-black text-white italic">{ticket.amountPaid} MT</span>
                        </div>
                        <p className="text-sm font-black text-white/80 uppercase truncate mb-1">{ticket.passenger.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] font-bold text-white/30 uppercase tracking-tighter italic">{ticket.trip.route.origin} → {ticket.trip.route.destination}</p>
                          <span className="text-[8px] font-mono text-white/20">{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                      <Clock className="w-12 h-12 mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">Nenhuma venda registada</p>
                    </div>
                  )}
                </div>

                {/* Detalhes do Bilhete Selecionado */}
                <div className="flex-1 bg-black/40 p-8 overflow-y-auto custom-scrollbar relative">
                   {selectedHistoryTicket ? (
                     <div className="max-w-md mx-auto">
                        <div className="flex justify-between items-center mb-8">
                          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Detalhes do Bilhete</h3>
                          <button 
                            onClick={() => {
                              setLastTicketData(selectedHistoryTicket);
                              setTimeout(() => window.print(), 100);
                            }}
                            className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all flex items-center gap-2 shadow-2xl"
                          >
                            <Printer size={16} strokeWidth={2.5} /> Re-Imprimir
                          </button>
                        </div>
                        
                        <div className="scale-[0.85] origin-top transform-gpu shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                          <TicketPrinter ticket={selectedHistoryTicket} />
                        </div>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-white/5">
                        <Printer className="w-20 h-20 mb-6 opacity-5" />
                        <p className="text-sm font-black uppercase tracking-[0.5em] italic">Selecione um bilhete para visualizar</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showBooking && selectedTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowBooking(false)}
               className="absolute inset-0 bg-[#0B0B0F]/98 backdrop-blur-3xl"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 50 }}
              className="bg-[#0B0B0F] border border-white/10 w-full max-w-[1000px] rounded-xl overflow-hidden shadow-[0_0_150px_rgba(14,165,233,0.1)] relative z-10 flex flex-col lg:flex-row max-h-[90vh]"
            >
              <div className="lg:w-[45%] p-8 border-r border-white/10 overflow-y-auto custom-scrollbar bg-black/40">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-5 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
                  <h3 className="text-lg font-black italic tracking-tighter text-white uppercase">
                    {bookingSuccess ? 'PREVISUALIZAÇÃO DO BILHETE' : 'MAPA DE CABINE'}
                  </h3>
                </div>
                
                {bookingLoading ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <EliteLoader size={40} color="#0EA5E9" />
                  </div>
                ) : bookingSuccess && lastTicketData ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="origin-top transform scale-[0.8] -mt-10"
                  >
                    <div className="shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
                      <TicketPrinter ticket={lastTicketData} />
                    </div>
                  </motion.div>
                ) : (
                <div className="bg-black/60 p-6 md:p-8 rounded-xl border border-white/10 relative shadow-2xl">
                  <div className="absolute inset-0 bg-sky-500/[0.02] blur-[100px] rounded-full"></div>
                  
                  {/* Bus Cockpit Area */}
                  <div className="relative mb-8">
                    <div className="w-32 h-1.5 bg-sky-500/20 mx-auto rounded-full mb-1.5"></div>
                    <div className="w-48 h-8 bg-gradient-to-b from-white/10 to-transparent mx-auto rounded-t-2xl border-t border-x border-white/10 flex items-center justify-center">
                       <div className="w-10 h-0.5 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2.5 max-w-[280px] mx-auto relative z-10">
                    {Array.from({ length: selectedTrip.bus.capacity || 40 }).map((_, i) => {
                      const seatNum = i + 1;
                      const isOccupied = parsedSeats[i] === true || parsedSeats[i] === 'true';
                      const isSelected = selectedSeat === seatNum;
                      
                      return (
                        <motion.button
                          key={seatNum}
                          whileHover={!isOccupied ? { scale: 1.05, y: -1 } : {}}
                          whileTap={!isOccupied ? { scale: 0.98 } : {}}
                          disabled={isOccupied}
                          onClick={() => setSelectedSeat(seatNum)}
                          className={`
                            h-10 rounded-lg text-xs font-black transition-all flex flex-col items-center justify-center border
                            ${isOccupied ? 'bg-white/5 border-white/5 text-white/5 cursor-not-allowed opacity-20' : 
                              isSelected ? 'bg-sky-500 border-sky-300 text-black shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 
                              'bg-[#0F0F13] border-white/10 text-white/20 hover:border-sky-500/50 hover:text-white'}
                          `}
                        >
                          <span className={`text-[7px] mb-0.5 uppercase tracking-tighter ${isSelected ? 'text-black/60' : 'opacity-40'}`}>Seat</span>
                          {seatNum}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-5 mt-8 pt-5 border-t border-white/5 text-[7px] font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2 text-white/20">
                      <div className="w-3 h-3 rounded-md bg-white/5 border border-white/10"></div> Reservado
                    </div>
                    <div className="flex items-center gap-2 text-sky-500">
                      <div className="w-3 h-3 rounded-md bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div> Selecionado
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                      <div className="w-3 h-3 rounded-md bg-[#0F0F13] border border-white/20"></div> Disponível
                    </div>
                  </div>
                </div>
                )}
              </div>

              <div className="lg:w-[55%] p-6 md:p-8 flex flex-col bg-gradient-to-br from-white/[0.03] to-transparent overflow-y-auto custom-scrollbar">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <span className="text-[8px] font-black text-sky-500 tracking-[0.4em] uppercase block mb-1">Protocolo de Venda Rápida</span>
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">PARA {selectedTrip.route.destination}</h2>
                    </div>
                    <button onClick={() => setShowBooking(false)} className="bg-white/5 hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-all border border-white/10 active:scale-90">
                      <X className="w-4 h-4 text-white/40" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] ml-2 mb-3 block">Identificador Telefónico</label>
                      <div className="relative group">
                         <div className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 group-focus-within:bg-sky-500 group-focus-within:text-black transition-all">
                            <Phone className="w-3.5 h-3.5" />
                         </div>
                         <input 
                           type="text" 
                           placeholder="84 000 0000"
                           className="w-full bg-black/60 border border-white/10 rounded-xl py-4 pl-16 pr-6 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 outline-none font-black text-lg tracking-[0.1em] text-white transition-all placeholder:text-white/5"
                           value={passengerPhone}
                           onChange={(e) => {
                             setPassengerPhone(e.target.value);
                             if (e.target.value.length >= 9) findPassenger(e.target.value);
                           }}
                         />
                      </div>
                    </div>

                    <div className="bg-black/40 p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-sky-500/[0.01] group-focus-within:bg-sky-500/[0.05] transition-colors pointer-events-none"></div>
                       <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 block ml-2">Assinatura do Passageiro</label>
                       <div className="flex items-center gap-5 relative z-10">
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                            <User className="w-4 h-4" />
                         </div>
                         <input 
                           type="text" 
                           className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black placeholder:text-white/5 uppercase tracking-tighter text-white italic"
                           placeholder="NOME COMPLETO..."
                           value={passengerName}
                           onChange={(e) => setPassengerName(e.target.value)}
                         />
                       </div>
                       {isNewPassenger && passengerPhone.length >= 9 && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2.5 text-sky-400 bg-sky-500/10 w-fit px-3 py-1.5 rounded-lg border border-sky-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></div>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em]">Criação de Perfil Inteligente</span>
                         </motion.div>
                       )}
                    </div>

                    <div className="glass-aura p-6 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-center mb-6">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Gestão de Bagagem</label>
                        <button onClick={addLuggage} className="bg-sky-500 text-black px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] active:scale-95 flex items-center gap-2">
                          <Plus className="w-3 h-3" /> Adicionar Carga
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10"><Briefcase className="w-4 h-4 text-white/20" /></div>
                            <div>
                               <p className="text-sm font-black uppercase tracking-tight">Bagagem de Cabine</p>
                               <p className="text-[9px] text-green-500/60 font-black uppercase tracking-widest mt-0.5">Franquia Incluída</p>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>
                        </div>

                        {luggages.map((lug, idx) => (
                           <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={idx} className="bg-sky-500/5 p-4 rounded-xl border border-sky-500/20 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center border border-sky-500/30"><Plus className="w-4 h-4 text-sky-500" /></div>
                              <div>
                                <select className="bg-transparent border-none text-sm font-black focus:ring-0 p-0 text-sky-400 cursor-pointer uppercase italic">
                                   <option className="bg-[#0B0B0F]">Mala de Porão (Extra)</option>
                                   <option className="bg-[#0B0B0F]">Fardo Comercial</option>
                                   <option className="bg-[#0B0B0F]">Carga Indivisível</option>
                                </select>
                                <p className="text-[9px] text-sky-500/40 font-black uppercase tracking-widest mt-1">Estimativa: {lug.weight}KG | Verificação POS</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="font-black text-lg text-sky-400 tracking-tighter">+{lug.price} MT</span>
                               <button onClick={() => setLuggages(luggages.filter((_, i) => i !== idx))} className="w-8 h-8 rounded-full bg-red-500/5 flex items-center justify-center hover:bg-red-500/20 transition-all">
                                  <Trash2 className="w-4 h-4 text-red-500/40 group-hover:text-red-500" />
                               </button>
                            </div>
                           </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/10">
                   <div className="mb-8">
                     <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] ml-2 mb-4 block">Meio de Liquidação Autorizado</label>
                     <div className="grid grid-cols-3 gap-3">
                       {[
                         { id: 'CASH', label: 'Dinheiro', color: 'bg-green-500', sub: 'CONTANTE POS' },
                         { id: 'MPESA', label: 'M-Pesa', color: 'bg-red-600', sub: 'PUSH *150#' },
                         { id: 'EMOLA', label: 'E-Mola', color: 'bg-orange-500', sub: 'PUSH *155#' }
                       ].map(method => (
                         <button
                           key={method.id}
                           onClick={() => setPaymentMethod(method.id as any)}
                           className={`
                             py-3 rounded-lg border transition-all flex flex-col items-center gap-1 relative overflow-hidden group
                             ${paymentMethod === method.id 
                               ? `border-sky-500 bg-sky-500/10 text-white shadow-[0_0_30px_rgba(14,165,233,0.1)]` 
                               : 'border-white/5 bg-white/5 text-white/20 hover:border-white/10 hover:text-white/40'}
                           `}
                         >
                           <div className={`w-1.5 h-1.5 rounded-full ${method.color} mb-1 ${paymentMethod === method.id ? 'animate-ping scale-150 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'opacity-20'}`}></div>
                           <span className="text-[11px] font-black uppercase tracking-widest italic">{method.label}</span>
                           <span className="text-[8px] font-bold opacity-30 mt-0.5 uppercase tracking-widest">{method.sub}</span>
                         </button>
                       ))}
                     </div>
                   </div>
                   </div>

                    <div className="flex justify-between items-center mb-8 bg-black/60 p-6 rounded-xl border border-white/10 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/[0.03] blur-[80px] -mr-24 -mt-24"></div>
                      <div className="space-y-1 relative z-10">
                         <span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase ml-1">Total Consolidado</span>
                         <h2 className="text-3xl font-black text-white tracking-tighter italic">
                           {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(Number(selectedTrip.price) + luggages.reduce((a,b) => a+b.price, 0))}
                         </h2>
                      </div>
                      <div className="text-right relative z-10">
                         <span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase block mb-2">Lugar</span>
                         <div className="w-14 h-14 bg-sky-500 rounded-lg flex items-center justify-center shadow-[0_15px_40px_rgba(14,165,233,0.3)]">
                           <span className="text-2xl font-black text-black italic">{selectedSeat || '--'}</span>
                         </div>
                      </div>
                   </div>

                    <button 
                      disabled={!selectedSeat || !passengerPhone || !passengerName || !paymentMethod || loading}
                      onClick={handleBook}
                      className={`
                        w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-sm transition-all relative overflow-hidden
                        ${(!selectedSeat || !passengerPhone || !passengerName || !paymentMethod || loading) 
                           ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5' 
                           : 'bg-white text-black hover:bg-sky-400 hover:shadow-[0_20px_50px_rgba(14,165,233,0.4)] active:scale-[0.98]'}
                      `}
                    >
                      {loading ? (
                        <EliteLoader size={20} color="#000" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                          <Printer className="w-4 h-4" />
                          <span className="tracking-tighter italic uppercase text-xs">CONFIRMAR E EMITIR BILHETE</span>
                        </>
                      )}
                    </button>
                </div>
                <AnimatePresence>
                  {bookingSuccess && lastTicketData && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#0B0B0F]/90 backdrop-blur-[40px] z-50 flex flex-col items-center justify-center p-10 no-print"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 40 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-black/80 border border-sky-500/30 p-8 md:p-10 rounded-2xl max-w-xl w-full relative z-10 text-center shadow-[0_0_200px_rgba(14,165,233,0.15)]"
                      >
                        <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(14,165,233,0.5)]">
                          <CheckCircle2 className="w-8 h-8 text-black animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter italic">VENDA CONCLUÍDA!</h2>
                        
                        <div className="text-right relative z-10">
                          <p className="text-white/20 text-[9px] uppercase font-black tracking-[0.3em] mb-1.5">Montante Final</p>
                          <p className="text-3xl font-black text-sky-400 tracking-tighter italic">{lastTicketData.amountPaid} MT</p>
                        </div>

                        <div className="flex gap-4">
                          <button onClick={() => window.print()} className="flex-1 bg-white/5 hover:bg-white/10 text-white/40 font-black py-4 rounded-xl transition-all border border-white/10 uppercase text-[9px] tracking-widest active:scale-95">
                            Re-imprimir
                          </button>
                          <button 
                            onClick={() => {
                              setBookingSuccess(false);
                              setShowBooking(false);
                              setSelectedTrip(null);
                              setSelectedSeat(null);
                              setLuggages([]);
                              setPassengerPhone('');
                              setPassengerName('');
                              setPaymentMethod(null);
                            }}
                            className="flex-1 bg-sky-500 hover:bg-sky-400 text-black font-black py-4 rounded-xl transition-all shadow-[0_15px_40px_rgba(14,165,233,0.3)] uppercase text-[9px] tracking-widest active:scale-95 italic"
                          >
                            Próxima Venda
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(14, 165, 233, 0.2); }
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {lastTicketData && (
        <div id="printable-ticket" className="hidden print:block">
          <TicketPrinter ticket={lastTicketData} />
        </div>
      )}
    </div>
  );
}
