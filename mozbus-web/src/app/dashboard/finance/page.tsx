"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, CreditCard, DollarSign, ArrowUpRight, 
  ArrowDownRight, Activity, Wallet, PieChart, 
  ArrowRight, ShieldCheck, Download, Filter, 
  Search, RefreshCw, BarChart3, Hexagon, Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  Cell, PieChart as RePieChart, Pie
} from 'recharts';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

export default function FinanceOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, transRes] = await Promise.all([
          api.get('/finance/stats'),
          api.get('/finance/transactions?limit=10')
        ]);
        setStats(statsRes.data);
        setTransactions(transRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <EliteLoader />;

  const mainKPIs = [
    { label: 'RECEITA BRUTA GLOBAL', value: `${stats?.totalRevenue.toLocaleString()} MT`, icon: Globe, trend: '+12.4%', color: 'text-sky-500' },
    { label: 'COMISSÃO MOZBUS', value: `${stats?.totalMozBusCommission.toLocaleString()} MT`, icon: ShieldCheck, trend: '+8.2%', color: 'text-emerald-400' },
    { label: 'LIQUIDEZ OPERADORES', value: `${stats?.netOperatorRevenue.toLocaleString()} MT`, icon: Wallet, trend: 'OPTIMIZED', color: 'text-amber-400' },
    { label: 'VOLUME TRANSACIONAL', value: stats?.transactionCount.toLocaleString(), icon: Activity, trend: 'NOMINAL', color: 'text-purple-400' },
  ];

  return (
    <div className="relative min-h-screen space-y-8 lg:space-y-12 pb-24 p-4 lg:p-6 notranslate" translate="no">
      <div className="aura-bg-main" />

      {/* Header Elite */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">Comando Global / Financeiro</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
            Aura <span className="text-sky-500 glow-text">Finance</span>
          </h2>
          <p className="text-white/20 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.3em] mt-3">Governança de Fluxo de Caixa e Liquidações</p>
        </motion.div>

        <div className="flex gap-4">
           <button className="flex items-center gap-3 bg-white/5 border border-white/5 text-white/40 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:text-white transition-all">
              <Download size={14} /> EXPORTAR RELATÓRIO
           </button>
           <button className="flex items-center gap-3 bg-sky-500 text-black px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all">
              <RefreshCw size={14} /> SINCRONIZAR
           </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
        {mainKPIs.map((kpi, idx) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-aura p-6 lg:p-8 space-y-6 group border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
               <kpi.icon size={60} strokeWidth={1} />
            </div>
            
            <div className="flex justify-between items-start">
               <div className={`p-3 rounded-xl bg-black/60 border border-white/5 ${kpi.color}`}>
                  <kpi.icon size={20} />
               </div>
               <span className="text-[9px] font-black tracking-widest px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">
                  {kpi.trend}
               </span>
            </div>
            
            <div>
               <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">{kpi.label}</p>
               <h3 className="text-xl lg:text-3xl font-black tracking-tighter text-white group-hover:text-sky-500 transition-all">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid xl:grid-cols-12 gap-8 relative z-10">
        {/* Main Chart */}
        <div className="xl:col-span-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass-aura p-8 lg:p-10 h-full min-h-[400px] flex flex-col border border-white/5 rounded-[40px] bg-black/40 backdrop-blur-3xl"
           >
              <div className="flex justify-between items-start mb-12">
                 <div>
                    <h4 className="text-xl font-black uppercase tracking-tight italic text-white flex items-center gap-3">
                       Fluxo de Receita Mensal
                       <span className="text-emerald-400 text-[10px] font-black tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">BULLISH</span>
                    </h4>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Comparativo Global vs Alvo Operacional</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-sky-500" />
                       <span className="text-[8px] font-black text-white/40 uppercase">Realizado</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-white/10" />
                       <span className="text-[8px] font-black text-white/40 uppercase">Projetado</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 -ml-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'JAN', value: 4000, target: 4500 },
                      { name: 'FEV', value: 3000, target: 4500 },
                      { name: 'MAR', value: 6000, target: 5000 },
                      { name: 'ABR', value: 8000, target: 5500 },
                      { name: 'MAI', value: 7500, target: 6000 },
                      { name: 'JUN', value: 9000, target: 6500 },
                    ]}>
                       <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                         itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}
                       />
                       <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={4} fill="url(#colorRevenue)" />
                       <Area type="monotone" dataKey="target" stroke="#FFFFFF" strokeWidth={2} strokeDasharray="5 5" fill="none" opacity={0.1} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </motion.div>
        </div>

        {/* Breakdown by Operator */}
        <div className="xl:col-span-4">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="glass-aura p-8 flex flex-col h-full border border-white/5 rounded-[40px] bg-black/40 backdrop-blur-3xl"
           >
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-8">Participação de Mercado</h4>
              
              <div className="flex-1 space-y-6">
                 {stats?.companyStats.slice(0, 5).map((comp: any, idx: number) => (
                    <div key={comp.companyId} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-white italic uppercase">{comp.name}</span>
                          <span className="text-[10px] font-black text-sky-500">{(comp.revenue / stats.totalRevenue * 100).toFixed(1)}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(comp.revenue / stats.totalRevenue * 100)}%` }}
                             className="h-full bg-sky-500"
                             transition={{ duration: 1, delay: idx * 0.1 }}
                          />
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                 <button className="w-full py-4 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/10 transition-all">
                    VER TODAS AS LIQUIDAÇÕES
                 </button>
              </div>
           </motion.div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="relative z-10">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-aura p-8 border border-white/5 rounded-[40px] bg-black/40"
         >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
               <div>
                  <h4 className="text-xl font-black uppercase tracking-tight italic text-white flex items-center gap-3">
                     Ledger de Transações
                     <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">Audit Active</span>
                  </h4>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-2">Monitoramento de Entradas Omnichannel</p>
               </div>
               <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="BUSCAR REFERÊNCIA..." 
                    className="bg-black/60 border border-white/5 rounded-xl py-3 pl-12 pr-6 outline-none focus:border-sky-500/50 transition-all text-[9px] font-black uppercase tracking-widest text-white"
                  />
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-white/5 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                        <th className="pb-6">Timestamp</th>
                        <th className="pb-6">Referência</th>
                        <th className="pb-6">Operadora</th>
                        <th className="pb-6">Método</th>
                        <th className="pb-6 text-right">Valor</th>
                        <th className="pb-6 text-right">Ação</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {transactions.map((tx: any) => (
                        <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="py-6">
                              <p className="text-[11px] font-black text-white/80">{new Date(tx.createdAt).toLocaleDateString()}</p>
                              <p className="text-[9px] font-bold text-white/20 uppercase">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                           </td>
                           <td className="py-6">
                              <span className="text-[10px] font-mono text-sky-500 font-bold">{tx.reference || tx.id.slice(0,8)}</span>
                           </td>
                           <td className="py-6">
                              <span className="text-[10px] font-black text-white uppercase italic">{tx.ticket?.trip?.bus?.company?.name}</span>
                           </td>
                           <td className="py-6">
                              <div className="flex items-center gap-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${tx.provider === 'MPESA' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                 <span className="text-[9px] font-black text-white/40 tracking-widest">{tx.provider}</span>
                              </div>
                           </td>
                           <td className="py-6 text-right font-black text-white text-xs italic">
                              {Number(tx.amount).toLocaleString()} MT
                           </td>
                           <td className="py-6 text-right">
                              <button className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-sky-500 transition-colors">
                                 <ArrowUpRight size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </motion.div>
      </div>
    </div>
  );
}
