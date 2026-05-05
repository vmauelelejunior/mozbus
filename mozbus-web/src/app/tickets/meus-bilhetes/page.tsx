"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, QrCode, MapPin, Calendar, Bus, CheckCircle, XCircle, Clock, CreditCard, WifiOff, Navigation } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import EliteLoader from '@/components/EliteLoader';
import EliteSkeleton from '@/components/EliteSkeleton';
import { useToast } from '@/components/EliteToast';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

interface Ticket {
  id: string;
  qrCode: string;
  seatNumber: number;
  isBoarded: boolean;
  status: string;
  trip: {
    id: string;
    departureTime: string;
    price: number;
    route: {
      origin: string;
      destination: string;
    };
    bus: {
      plate: string;
      model: string;
    };
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING_PAYMENT: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  PAID: { label: 'Pago', color: 'bg-green-500/20 text-green-500', icon: CheckCircle },
  USED: { label: 'Utilizado', color: 'bg-blue-500/20 text-blue-500', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/20 text-red-500', icon: XCircle },
  REFUNDED: { label: 'Reembolsado', color: 'bg-purple-500/20 text-purple-500', icon: XCircle },
};

export default function MeusBilhetesPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const sortedTickets = React.useMemo(() => {
    return [...tickets].sort((a, b) => 
      new Date(b.trip.departureTime).getTime() - new Date(a.trip.departureTime).getTime()
    );
  }, [tickets]);

  useEffect(() => {
    setIsMounted(true);
    
    // Detecção de Offline
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    
    setIsOffline(!navigator.onLine);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mozbus_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          fetchTickets(parsed.id);
        } catch {
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [router]);

  const fetchTickets = async (userId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/tickets/user/${userId}`);
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (ticketId: string) => {
    setActionLoading(ticketId);
    try {
      await api.post(`/tickets/${ticketId}/pay`);
      toast('Pagamento simulado com sucesso!', 'success');
      if (user) fetchTickets(user.id);
    } catch (e: any) {
      toast(e.response?.data?.message || 'Erro ao processar pagamento.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (ticketId: string) => {
    if (!confirm('Tem a certeza que deseja cancelar esta reserva?')) return;
    setActionLoading(ticketId);
    try {
      await api.post(`/tickets/${ticketId}/cancel`);
      toast('Reserva cancelada com sucesso!', 'success');
      if (user) fetchTickets(user.id);
    } catch (e: any) {
      toast(e.response?.data?.message || 'Erro ao cancelar reserva.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSeat = async (ticketId: string) => {
    const newSeat = prompt('Introduza o novo número do assento:');
    if (!newSeat) return;
    
    setActionLoading(ticketId);
    try {
      await api.post(`/tickets/${ticketId}/edit-seat`, { newSeatNumber: parseInt(newSeat) });
      toast('Assento atualizado com sucesso!', 'success');
      if (user) fetchTickets(user.id);
    } catch (e: any) {
      toast(e.response?.data?.message || 'Erro ao atualizar assento.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isMounted || !user) return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <EliteLoader size={120} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white relative overflow-hidden notranslate" translate="no">
      <div className="aura-bg-main" />
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 py-12 space-y-10 relative z-10">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white">
              Os Meus <br/>
              <span className="text-sky-500">Bilhetes.</span>
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em]">
                Cofre de Expedições
              </p>
              {isOffline && (
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full">
                  <WifiOff size={10} />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">Offline</span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => user && fetchTickets(user.id)}
            className="p-4 glass-aura hover:bg-sky-500 hover:text-black rounded-2xl transition-all border border-white/10 group shadow-2xl"
            disabled={isOffline}
          >
            <Clock size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <EliteSkeleton className="w-32 h-8 rounded-full" />
                    <EliteSkeleton className="w-24 h-8 rounded-full" />
                 </div>
                 <div className="flex items-center gap-6 mb-6">
                    <EliteSkeleton className="flex-1 h-14" />
                    <EliteSkeleton className="flex-1 h-14" />
                 </div>
                 <EliteSkeleton className="h-10 w-full rounded-xl" />
               </div>
             ))}
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="text-center py-20 opacity-20 space-y-4">
            <Ticket size={64} className="mx-auto" />
            <p className="font-black uppercase tracking-widest">Nenhum bilhete encontrado.</p>
            <p className="text-sm">Faça uma reserva para ver os seus bilhetes aqui.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedTickets.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.PAID;
              const StatusIcon = status.icon;
              const isPending = ticket.status === 'PENDING_PAYMENT';

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={ticket.id}
                  onClick={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)}
                  className={`glass-aura rounded-3xl overflow-hidden border transition-all duration-700 group cursor-pointer ${isPending ? 'border-yellow-500/30' : 'border-white/5 hover:border-sky-500/30'}`}
                >
                  <div className="p-4 md:p-5 relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 blur-[80px] -mr-24 -mt-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl border border-white/10 ${isPending ? 'bg-yellow-500/20 text-yellow-500' : 'bg-black/60 text-sky-500'}`}>
                          <Ticket size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-white">
                            {ticket.trip.route.origin} <span className="text-white/20 not-italic">→</span> {ticket.trip.route.destination}
                          </h4>
                          <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                            <QrCode size={12} className="text-sky-500/50" /> ID #{ticket.qrCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/5 ${status.color}`}>
                          <StatusIcon size={12} strokeWidth={3} /> {status.label}
                        </span>
                        {isPending && (
                           <div className="flex gap-2 mt-2">
                             <button 
                               onClick={() => handleEditSeat(ticket.id)}
                               className="p-2 bg-white/5 hover:bg-sky-500/20 rounded-xl transition-all text-[10px] font-black uppercase border border-white/5"
                               disabled={!!actionLoading}
                             >
                               Editar
                             </button>
                             <button 
                               onClick={() => handleCancel(ticket.id)}
                               className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all text-[10px] font-black uppercase border border-red-500/20"
                               disabled={!!actionLoading}
                             >
                               Cancelar
                             </button>
                           </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.4em] mb-1">Data</p>
                        <p className="text-sm font-black italic flex items-center gap-2 text-white">
                          <Calendar size={12} className="text-sky-500" />
                          {new Date(ticket.trip.departureTime).toLocaleDateString('pt-MZ')}
                        </p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.4em] mb-1">Partida</p>
                        <p className="text-sm font-black italic flex items-center gap-2 text-white">
                          <Clock size={12} className="text-sky-500" />
                          {new Date(ticket.trip.departureTime).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
                        <p className="text-[8px] font-black uppercase text-sky-500/40 tracking-[0.4em] mb-1">Lugar</p>
                        <p className="text-lg font-black text-sky-500 italic tracking-tighter">#{ticket.seatNumber < 10 ? `0${ticket.seatNumber}` : ticket.seatNumber}</p>
                      </div>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ height: expandedTicketId === ticket.id ? 'auto' : 0, opacity: expandedTicketId === ticket.id ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 border-t border-white/5 mt-6 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-black/60 p-2.5 rounded-lg border border-white/10">
                              <Bus size={18} className="text-sky-500/50" />
                            </div>
                            <div>
                              <p className="text-base font-black uppercase italic tracking-tighter text-white">{ticket.trip.bus.plate}</p>
                              <p className="text-[8px] text-white/30 uppercase font-black tracking-[0.3em] mt-0.5">{ticket.trip.bus.model}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-sky-500 italic tracking-tighter drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">{ticket.trip.price}<span className="text-[8px] not-italic text-white/40 ml-1.5">MT</span></p>
                          </div>
                        </div>
                      </div>

                      {!isPending && (
                        <div className="mt-6 relative z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/tracking/${ticket.trip.id}`); }}
                            className="w-full py-4 bg-white/[0.03] border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 group"
                          >
                            <Navigation size={16} className="group-hover:animate-bounce" />
                            Rastrear Expedição (GPS Live)
                          </button>
                        </div>
                      )}

                      {isPending ? (
                        <div className="mt-8 relative z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePay(ticket.id); }}
                            disabled={!!actionLoading || isOffline}
                            className={`w-full h-16 font-black uppercase tracking-[0.4em] rounded-xl transition-all flex items-center justify-center gap-5 shadow-[0_20px_50px_rgba(14,165,233,0.4)] relative overflow-hidden group/btn ${isOffline ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-sky-500 text-black hover:scale-[1.02]'}`}
                          >
                            {actionLoading === ticket.id ? (
                              <EliteLoader size={30} />
                            ) : (
                              <>
                                <CreditCard size={20} className="relative z-10" />
                                <span className="relative z-10 text-sm">{isOffline ? 'Rede Necessária' : 'Efetuar Pagamento'}</span>
                              </>
                            )}
                            <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                          </button>
                        </div>
                      ) : (
                        <div className="mt-8 flex flex-col items-center gap-6 p-6 bg-black/40 rounded-2xl border border-white/5 relative z-10">
                          <div className="bg-white p-5 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-4 border-sky-500/20 group-hover:scale-105 transition-transform duration-700">
                            <QRCodeCanvas 
                              value={ticket.qrCode} 
                              size={160}
                              level="H"
                              includeMargin={false}
                              imageSettings={{
                                  src: "/favicon.ico",
                                  x: undefined,
                                  y: undefined,
                                  height: 30,
                                  width: 30,
                                  excavate: true,
                              }}
                            />
                          </div>
                          <div className="text-center space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500 italic">Pronto para Embarque</p>
                              <div className="bg-white/5 px-4 py-1 rounded-full border border-white/5">
                                 <p className="text-[8px] font-mono text-white/30">{ticket.qrCode}</p>
                              </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}