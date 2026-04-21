"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Bus, CreditCard, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Receita Total', value: '0 MT', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Bilhetes Vendidos', value: '0', icon: CreditCard, color: 'text-orange-500' },
    { label: 'Frota Activa', value: '0', icon: Bus, color: 'text-blue-500' },
    { label: 'Passageiros', value: '0', icon: Users, color: 'text-purple-500' },
  ]);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('mozbus_user') || '{}');
        setUserName(storedUser.name?.split(' ')[0] || 'Admin');
        const companyId = storedUser.companyId || storedUser.companiesManaged?.[0]?.id;

        const [tripsRes, ticketsRes, busesRes] = await Promise.all([
          api.get('/trips'),
          api.get('/tickets'),
          companyId ? api.get(`/buses/company/${companyId}`) : api.get('/buses'),
        ]);

        const trips = tripsRes.data;
        const allTickets = ticketsRes.data;
        
        // Filtrar por empresa se necessário
        const companyTrips = companyId ? trips.filter((t: any) => t.bus.companyId === companyId) : trips;
        const companyTickets = companyId ? allTickets.filter((tk: any) => tk.trip.bus.companyId === companyId) : allTickets;

        const revenue = companyTickets
          .filter((tk: any) => tk.status === 'PAID')
          .reduce((acc: number, tk: any) => acc + tk.trip.price, 0);

        setStats([
          { label: 'Receita Total', value: `${revenue.toLocaleString()} MT`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Bilhetes Vendidos', value: companyTickets.filter((tk: any) => tk.status === 'PAID').length.toString(), icon: CreditCard, color: 'text-orange-500' },
          { label: 'Frota Activa', value: busesRes.data.length.toString(), icon: Bus, color: 'text-blue-500' },
          { label: 'Passageiros Únicos', value: new Set(companyTickets.map((tk: any) => tk.passengerId)).size.toString(), icon: Users, color: 'text-purple-500' },
        ]);

        setUpcomingTrips(companyTrips.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-orange-500" />
        <p className="font-black uppercase tracking-widest opacity-20">Calculando Métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">BONS DIAS, <span className="text-orange-500">{userName.toUpperCase()}</span></h2>
          <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Métricas de performance em tempo real da sua transportadora.</p>
        </div>
        <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:border-orange-500 transition-all shadow-xl">
            Exportar Dashboard
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-8 rounded-[40px] space-y-6 hover:border-orange-500/30 transition-all group border border-white/5"
          >
            <div className={`p-4 bg-white/5 rounded-2xl w-fit ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
               <h3 className="text-4xl font-black tracking-tighter mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-10">
            <div className="flex justify-between items-end">
              <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                 PRÓXIMAS PARTIDAS <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              </h4>
              <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Ver Todas as Viagens</p>
            </div>
            
            <div className="space-y-4">
                {upcomingTrips.length === 0 ? (
                  <div className="glass p-20 rounded-[40px] text-center opacity-20">
                    <Bus size={48} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest">Nenhuma viagem agendada.</p>
                  </div>
                ) : upcomingTrips.map((trip, i) => (
                    <motion.div 
                      key={trip.id} 
                      whileHover={{ x: 10 }}
                      className="glass p-8 rounded-[35px] flex items-center justify-between group hover:bg-white/5 transition-all border border-white/5"
                    >
                        <div className="flex items-center gap-10">
                            <div className="text-center bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
                                <p className="text-2xl font-black italic">
                                  {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                                <p className="text-[8px] font-black uppercase opacity-40">Horário</p>
                            </div>
                            <div className="space-y-1">
                                <h5 className="font-black text-lg flex items-center gap-3 uppercase">
                                    {trip.route.origin} <ChevronRight size={14} className="text-orange-500" /> {trip.route.destination}
                                </h5>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest font-black flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  Matrícula: {trip.bus.plate} • {trip.bus.model}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-12">
                            <div className="text-right">
                                <p className="text-lg font-black text-orange-500 tracking-tighter">
                                  {JSON.parse(trip.seatsMapping || '[]').filter((s: boolean) => s === true).length} / {trip.bus.seats}
                                </p>
                                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Ocupação</p>
                            </div>
                            <button className="bg-white/5 p-4 rounded-full group-hover:bg-orange-500 transition-all">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Sales Chart / Summary */}
        <div className="space-y-10">
            <h4 className="text-xl font-black uppercase tracking-tighter italic">VOLUME DE VENDAS</h4>
            <div className="glass p-10 rounded-[45px] h-[550px] flex flex-col justify-between border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <TrendingUp size={120} />
                </div>

                <div className="space-y-2 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Tendência Semanal</p>
                    <p className="text-3xl font-black italic">+24% <span className="text-lg font-bold opacity-30 not-italic">vs ontem</span></p>
                </div>
                
                {/* Visual Chart Placeholder */}
                <div className="flex items-end gap-4 h-48 relative z-10">
                    {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-2xl relative group h-full">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-600 to-orange-400 rounded-2xl group-hover:from-white group-hover:to-zinc-300 transition-all"
                            />
                        </div>
                    ))}
                </div>

                <div className="pt-10 border-t border-white/5 space-y-6 relative z-10">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Principal Canal</p>
                          <p className="font-black text-sm uppercase">M-Pesa Checkout</p>
                        </div>
                        <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase">82%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Canal Secundário</p>
                          <p className="font-black text-sm uppercase">Venda Presencial</p>
                        </div>
                        <span className="bg-white/5 text-white/40 px-3 py-1 rounded-lg text-[10px] font-black uppercase">18%</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
