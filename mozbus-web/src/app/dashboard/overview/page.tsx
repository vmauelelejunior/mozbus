"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, Bus, CreditCard, ChevronRight, 
  MapPin, Loader2, Activity, Zap, Crown, ArrowUpRight, Hexagon, Globe, 
  ShieldCheck, AlertTriangle, Cpu, Radio
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import api from '@/lib/api';
import NotificationPrompt from '@/components/NotificationPrompt';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EliteLoader from '@/components/EliteLoader';

const chartData = [
  { day: '06:00', sales: 1200, value: 1200 },
  { day: '09:00', sales: 4500, value: 4500 },
  { day: '12:00', sales: 3200, value: 3200 },
  { day: '15:00', sales: 5800, value: 5800 },
  { day: '18:00', sales: 7400, value: 7400 },
  { day: '21:00', sales: 4100, value: 4100 },
  { day: '00:00', sales: 1800, value: 1800 },
];

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const storedUserStr = localStorage.getItem('mozbus_user');
        if (!storedUserStr) return;
        
        const storedUser = JSON.parse(storedUserStr);
        setUser(storedUser);
        const isCEO = storedUser.role === 'SUPER_ADMIN';

        if (isCEO) {
          const [companiesRes, ticketsRes] = await Promise.all([
            api.get('/companies'),
            api.get('/tickets'),
          ]);

          const companies = companiesRes.data;
          const allTickets = ticketsRes.data;
          const totalRevenue = allTickets.filter((t:any) => t.status === 'PAID').reduce((acc:number, t:any) => acc + (t.trip?.price || 0), 0);

          setStats([
            { label: 'GLOBAL MARKET CAP', value: `${totalRevenue.toLocaleString()} MT`, icon: Globe, color: 'text-emerald-500', trend: '+12.5%' },
            { label: 'NETWORK NODES', value: `${companies.length} UNIDADES`, icon: Hexagon, color: 'text-sky-500', trend: 'ACTIVE' },
            { label: 'TRANSACTION VOLUME', value: allTickets.length.toLocaleString(), icon: Activity, color: 'text-purple-500', trend: '+5.2%' },
            { label: 'SYSTEM STABILITY', value: '99.9%', icon: ShieldCheck, color: 'text-emerald-400', trend: 'SECURE' },
          ]);

          setTopCompanies(companies.slice(0, 4));
        } else {
          const companyId = storedUser.companyId;
          const [tripsRes, ticketsRes, busesRes] = await Promise.all([
            api.get('/trips'),
            api.get('/tickets'),
            api.get(`/buses/company/${companyId}`),
          ]);

          const allTickets = ticketsRes.data;
          const revenue = allTickets.filter((tk: any) => tk.status === 'PAID').reduce((acc: number, tk: any) => acc + (tk.trip?.price || 0), 0);

          setStats([
            { label: 'RECEITA OPERACIONAL', value: `${revenue.toLocaleString()} MT`, icon: TrendingUp, color: 'text-emerald-500', trend: '+8.4%' },
            { label: 'CONVERSÃO DE VENDAS', value: allTickets.filter((t:any)=>t.status==='PAID').length.toLocaleString(), icon: CreditCard, color: 'text-sky-500', trend: 'OPTIMIZED' },
            { label: 'FROTA ACTIVA', value: `${busesRes.data.length} UNIDADES`, icon: Bus, color: 'text-purple-500', trend: 'NOMINAL' },
            { label: 'TAXA DE OCUPAÇÃO', value: '74.8%', icon: Activity, color: 'text-rose-500', trend: 'HIGH' },
          ]);

          setUpcomingTrips(tripsRes.data.slice(0, 4));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isMounted || loading) return <EliteLoader />;

  const isCEO = user?.role === 'SUPER_ADMIN';

  return (
    <div className="relative min-h-screen space-y-6 lg:space-y-12 pb-16 lg:pb-24 p-4 lg:p-6 overflow-hidden notranslate" translate="no">
      {/* Background Ultra Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-white/[0.02]" />
        <div className="absolute top-0 left-2/4 w-[1px] h-full bg-white/[0.02]" />
        <div className="absolute top-0 left-3/4 w-[1px] h-full bg-white/[0.02]" />
      </div>

      <NotificationPrompt />
      
      {/* Header Operational HUD */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <Radio size={14} className="text-sky-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-sky-500 italic">
                {isCEO ? 'Market Sovereignty' : 'Fleet Operations'} • Terminal #001
            </span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none text-white">
            {isCEO ? 'Global' : 'Operational'} <span className="text-sky-500 glow-text">Core</span>
          </h2>
          <p className="text-white/20 text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.3em] lg:tracking-[0.4em] mt-3 ml-1">Telemetria em Tempo Real • MozBus Core</p>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          {!isCEO && (
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(14, 165, 233, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/terminal/fiscal')}
                className="flex items-center gap-3 lg:gap-4 bg-white/5 border border-white/5 text-white/50 px-5 lg:px-8 py-4 lg:py-5 rounded-[20px] lg:rounded-[24px] font-black text-[9px] lg:text-[10px] uppercase tracking-[0.2em] lg:tracking-[0.3em] hover:border-sky-500/50 hover:text-white transition-all group backdrop-blur-xl"
              >
                <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-emerald-500 animate-pulse" /> FISCAL TERMINAL
              </motion.button>
          )}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 lg:gap-4 bg-white/5 border border-white/5 text-white/50 px-5 lg:px-8 py-4 lg:py-5 rounded-[20px] lg:rounded-[24px] font-black text-[9px] lg:text-[10px] uppercase tracking-[0.2em] lg:tracking-[0.3em] hover:border-sky-500/50 hover:text-white transition-all backdrop-blur-xl"
          >
            <Activity size={14} /> {isCEO ? 'NETWORK AUDIT' : 'REPORTS'}
          </motion.button>
          {!isCEO && (
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 lg:gap-4 bg-sky-500 text-[#0B0B0F] px-6 lg:px-10 py-4 lg:py-5 rounded-[20px] lg:rounded-[24px] font-black text-[10px] lg:text-[11px] uppercase tracking-[0.3em] lg:tracking-[0.5em] shadow-[0_20px_60px_rgba(14,165,233,0.3)] transition-all"
              >
                <Zap size={16} fill="currentColor" /> NOVA VIAGEM
              </motion.button>
          )}
        </div>
      </div>

      {/* Stats Grid HUD Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-aura p-5 lg:p-8 space-y-5 lg:space-y-8 group overflow-hidden border border-white/5 relative bg-gradient-to-br from-white/[0.03] to-transparent hover:from-white/[0.05] transition-all rounded-[32px]"
          >
            <div className="absolute top-0 right-0 p-5 lg:p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <stat.icon className="w-12 h-12 lg:w-16 lg:h-16" strokeWidth={1} />
            </div>
            
            <div className="flex justify-between items-start">
                <div className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-black/60 border border-white/5 ${stat.trend === 'HIGH' || stat.trend.includes('+') ? 'text-emerald-400' : 'text-sky-400'}`}>
                  <stat.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <span className={`text-[9px] font-black tracking-widest px-3 py-1 rounded-full border ${stat.trend === 'HIGH' || stat.trend.includes('+') ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-sky-500/20 text-sky-500 bg-sky-500/5'}`}>
                    {stat.trend}
                </span>
            </div>
            
            <div>
               <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.4em] lg:tracking-[0.5em] text-white/20 mb-2 leading-none">{stat.label}</p>
               <h3 className="text-xl lg:text-3xl font-black tracking-tighter text-white group-hover:text-sky-500 transition-colors duration-500">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 relative z-10">
        {/* Advanced Telemetry Chart */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-aura p-8 lg:p-10 h-full min-h-[450px] flex flex-col border border-white/5 rounded-[40px] bg-black/40 backdrop-blur-3xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-12 lg:mb-16 relative z-10">
              <div className="space-y-2 lg:space-y-3">
                <h4 className="text-xl lg:text-2xl font-black uppercase tracking-tight italic text-white flex items-center gap-3 lg:gap-4">
                    {isCEO ? 'Network Load Visualizer' : 'Operational Revenue Flow'}
                    <span className="text-sky-500/30 text-[10px] lg:text-sm font-light">PRO-MODE ON</span>
                </h4>
                <p className="text-[9px] lg:text-[10px] font-black text-white/20 uppercase tracking-[0.4em] lg:tracking-[0.6em]">Análise Preditiva de Fluxo • Satélite Link Active</p>
              </div>
              <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded-2xl border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">LIVE FEED</span>
              </div>
            </div>
            
            <div className="flex-1 -ml-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(11, 11, 15, 0.98)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '32px',
                        backdropBlur: '24px',
                        padding: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} 
                    itemStyle={{ color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0EA5E9" 
                    strokeWidth={8} 
                    fill="url(#colorValue)" 
                    animationDuration={3000}
                    strokeLinecap="round"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 flex justify-center gap-12 border-t border-white/5 pt-8">
                <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Peak Time</p>
                    <p className="text-lg font-black text-white italic">18:42:00</p>
                </div>
                <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Stability</p>
                    <p className="text-lg font-black text-emerald-500 italic">NOMINAL</p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] text-white/20 mb-1">Packet Loss</p>
                    <p className="text-sm lg:text-lg font-black text-white italic">0.002%</p>
                </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Contextual Radar */}
        <div className="lg:col-span-4 space-y-8 flex flex-col h-full">
          <div className="flex items-center justify-between px-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30">
                 {isCEO ? 'High Performance Nodes' : 'Operational Radar'}
              </h4>
              <Link href="#" className="text-[9px] font-black uppercase text-sky-500 hover:tracking-widest transition-all">Ver Todos</Link>
          </div>
          
          <div className="flex-1 space-y-4">
            {isCEO ? (
                topCompanies.map((c, i) => (
                    <motion.div 
                        key={c.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                        className="glass-aura p-6 flex items-center justify-between group border border-white/5 cursor-pointer rounded-[32px] transition-colors"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-[#0B0B0F] transition-all duration-500 relative">
                                <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Hexagon size={20} className="relative z-10" />
                            </div>
                            <div>
                                <p className="font-black text-lg uppercase italic tracking-tight text-white">{c.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">{c.status}</p>
                                </div>
                            </div>
                        </div>
                        <ArrowUpRight size={24} className="text-white/10 group-hover:text-sky-500 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </motion.div>
                ))
            ) : (
                upcomingTrips.map((trip, i) => (
                    <motion.div 
                        key={trip.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="glass-aura p-8 space-y-6 group border border-white/5 rounded-[32px] bg-black/40 backdrop-blur-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
                            <Bus size={60} strokeWidth={1} />
                        </div>
                        
                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_15px_#0EA5E9]" />
                                <span className="text-[12px] font-black text-white italic tracking-widest">{new Date(trip.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase italic tracking-tighter text-sky-500 bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20">
                                {trip.route.origin} <ChevronRight size={10} className="inline mx-1" /> {trip.route.destination}
                            </span>
                        </div>
                        
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
                                <span>Ocupação de Frota</span>
                                <span className="text-sky-500">45%</span>
                            </div>
                            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
                               <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '45%' }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + i * 0.1 }}
                                className="h-full bg-gradient-to-r from-sky-600 via-sky-400 to-emerald-400 rounded-full" 
                               />
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
          </div>
          
          <div className="glass-aura p-8 rounded-[32px] bg-sky-500/5 border border-sky-500/10 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-[#0B0B0F]">
                    <Crown size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-500">PREMIUM ANALYTICS</p>
                    <p className="text-[11px] font-bold text-white/60">Upgrade para Visão Global 360º</p>
                </div>
             </div>
             <ChevronRight size={20} className="text-sky-500/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
