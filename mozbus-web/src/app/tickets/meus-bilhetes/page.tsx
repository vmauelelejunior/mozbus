"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, QrCode, MapPin, Calendar, Bus, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

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
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black hero-gradient text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 py-16 space-y-10">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Os MEUS <span className="text-orange-500">BILHETES</span></h2>
          <p className="opacity-50 text-xs font-bold uppercase tracking-widest mt-2">
            Histórico de reservas e viagens.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 opacity-20 space-y-4">
            <Ticket size={64} className="mx-auto" />
            <p className="font-black uppercase tracking-widest">Nenhum bilhete encontrado.</p>
            <p className="text-sm">Faça uma reserva para ver os seus bilhetes aqui.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.PAID;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-[32px] p-8 border border-white/5 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-500/20 p-4 rounded-2xl">
                        <Ticket size={24} className="text-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold uppercase">
                          {ticket.trip.route.origin} → {ticket.trip.route.destination}
                        </h4>
                        <p className="text-xs opacity-50 font-bold uppercase tracking-widest flex items-center gap-2">
                          <MapPin size={12} /> Bilhete #{ticket.qrCode}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full flex items-center gap-2 ${status.color}`}>
                      <StatusIcon size={12} /> {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Data</p>
                      <p className="font-bold flex items-center gap-2">
                        <Calendar size={16} className="text-orange-500" />
                        {new Date(ticket.trip.departureTime).toLocaleDateString('pt-MZ')}
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Hora</p>
                      <p className="font-bold flex items-center gap-2">
                        <Calendar size={16} className="text-orange-500" />
                        {new Date(ticket.trip.departureTime).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Assento</p>
                      <p className="font-bold text-orange-500">#{ticket.seatNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/5 p-3 rounded-2xl">
                        <Bus size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{ticket.trip.bus.plate}</p>
                        <p className="text-xs opacity-40">{ticket.trip.bus.model}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-orange-500">{ticket.trip.price} MT</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <div className="bg-white p-4 rounded-2xl">
                      <QrCode size={120} className="text-black" />
                      <p className="text-center text-xs font-mono mt-2 text-black">{ticket.qrCode}</p>
                    </div>
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