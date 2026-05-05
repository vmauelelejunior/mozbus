"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Bus, CreditCard, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompanyDashboardDetails() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  
  const [stats, setStats] = useState([
    { label: 'Receita Total', value: '0 MT', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Bilhetes Vendidos', value: '0', icon: CreditCard, color: 'text-sky-500' },
    { label: 'Frota Activa', value: '0', icon: Bus, color: 'text-blue-500' },
    { label: 'Passageiros', value: '0', icon: Users, color: 'text-purple-500' },
  ]);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('mozbus_user') || '{}');
        if (storedUser.role !== 'SUPER_ADMIN') {
            router.push('/dashboard/overview');
            return;
        }

        const [companyRes, tripsRes, ticketsRes, busesRes] = await Promise.all([
          api.get(`/companies/${id}`),
          api.get(`/trips?companyId=${id}`),
          api.get(`/tickets?companyId=${id}`),
          api.get(`/buses/company/${id}`),
        ]);

        setCompany(companyRes.data);
        
        const trips = tripsRes.data;
        const allTickets = ticketsRes.data;

        const revenue = allTickets
          .filter((tk: any) => tk.status === 'PAID')
          .reduce((acc: number, tk: any) => acc + tk.trip.price, 0);

        setStats([
          { label: 'Receita Total', value: `${revenue.toLocaleString()} MT`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Bilhetes Vendidos', value: allTickets.filter((tk: any) => tk.status === 'PAID').length.toString(), icon: CreditCard, color: 'text-sky-500' },
          { label: 'Frota Activa', value: busesRes.data.length.toString(), icon: Bus, color: 'text-blue-500' },
          { label: 'Passageiros Únicos', value: new Set(allTickets.map((tk: any) => tk.passengerId)).size.toString(), icon: Users, color: 'text-purple-500' },
        ]);

        setUpcomingTrips(trips.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-sky-500" />
        <p className="font-black uppercase tracking-widest opacity-20">Acessando Banco de Dados da Empresa...</p>
      </div>
    );
  }

  if (!company) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
           <p className="font-black text-2xl uppercase tracking-widest text-red-500">Empresa não encontrada</p>
           <Link href="/dashboard/companies" className="text-white/50 hover:text-white uppercase font-black text-xs tracking-widest flex items-center gap-2">
             <ArrowLeft size={16} /> Voltar à rede
           </Link>
        </div>
     );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header and Back Button */}
      <Link href="/dashboard/companies" className="inline-flex items-center gap-2 text-white/40 hover:text-sky-500 transition-colors uppercase font-black tracking-widest text-[10px]">
          <ArrowLeft size={14} /> Voltar
      </Link>

      {/* Welcome Section */}
      <div className="flex justify-between items-center bg-white/5 p-8 border border-white/5 rounded-[40px]">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic"><span className="text-sky-500">{company.name}</span></h2>
          <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Métricas de performance exclusivas deste tenant.</p>
        </div>
        <div className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest border ${company.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {company.status === 'ACTIVE' ? 'Operacional' : 'Supensa'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div 
            key={stat.label}
            className="glass p-8 rounded-[40px] space-y-6 hover:border-sky-500/30 transition-all group border border-white/5 bg-zinc-950/40"
          >
            <div className={`p-4 bg-white/5 rounded-2xl w-fit ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
               <h3 className="text-4xl font-black tracking-tighter mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-10">
            <div className="flex justify-between items-end">
              <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                 ÚLTIMAS PARTIDAS <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              </h4>
              <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Ver Mais</p>
            </div>
            
            <div className="space-y-4">
                {upcomingTrips.length === 0 ? (
                  <div className="glass p-20 rounded-[40px] text-center opacity-20 border border-white/5">
                    <Bus size={48} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest">Nenhuma viagem registada.</p>
                  </div>
                ) : upcomingTrips.map((trip, i) => (
                    <motion.div 
                      key={trip.id} 
                      whileHover={{ x: 10 }}
                      className="glass p-8 rounded-[35px] flex items-center justify-between group hover:bg-white/5 transition-all border border-white/5 bg-zinc-950/40"
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
                                    {trip.route.origin} <ChevronRight size={14} className="text-sky-500" /> {trip.route.destination}
                                </h5>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest font-black flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  Matrícula: {trip.bus.plate}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-12">
                            <div className="text-right">
                                <p className="text-lg font-black text-sky-500 tracking-tighter">
                                  {JSON.parse(trip.seatsMapping || '[]').filter((s: boolean) => s === true).length} / {trip.bus.capacity}
                                </p>
                                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Ocupação</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Sales Chart / Summary */}
        <div className="space-y-10">
            <h4 className="text-xl font-black uppercase tracking-tighter italic">PERFIL TÉCNICO</h4>
            <div className="glass p-10 rounded-[45px] h-[550px] flex flex-col justify-between border border-white/5 relative bg-zinc-950/40">
                <div className="space-y-6">
                   <div className="border-b border-white/5 text-center pb-6">
                       <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">NUIT Registado</p>
                       <p className="text-3xl font-black uppercase mt-1">{company.nuit}</p>
                   </div>
                   
                   <div className="pt-4 space-y-4">
                       <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Responsável Directo</p>
                           <p className="font-black uppercase">{company.admin?.name || '---'}</p>
                       </div>
                       <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Contacto</p>
                           <p className="font-black uppercase">{company.admin?.phone || '---'}</p>
                       </div>
                       <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Taxa de Plataforma</p>
                           <p className="font-black uppercase text-sky-500">{(company.commission * 100).toFixed(0)}% Por bilhete</p>
                       </div>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
