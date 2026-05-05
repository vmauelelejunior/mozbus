"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Navigation2, X, Loader2, Trash2, ArrowRight, Zap, Globe, Hexagon, ShieldCheck, Search, ArrowUpRight, Power, Ban } from 'lucide-react';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';

interface Company {
  id: string;
  name: string;
  nuit: string;
  email: string;
  logo?: string;
  status: string;
  plan: 'BASIC' | 'PREMIUM' | 'ELITE';
  commission: number;
  stats: {
    revenue: number;
    dailyTrips: number;
    fleetSize: number;
    hardwareCount: number;
  };
  hardware: Array<{
    id: string;
    type: string;
    serialNumber: string;
  }>;
  _count?: {
    users: number;
    buses: number;
    routes: number;
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    nuit: '',
    email: '',
    phone: '',
    username: '',
    password: Math.random().toString(36).slice(-8)
  });
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/companies/${id}/status`, { status: newStatus });
      fetchCompanies();
    } catch (e) {
      alert('Falha crítica na alteração de estatuto.');
    }
  };

  const handleUpdatePlan = async (id: string, newPlan: string) => {
    try {
      await api.patch(`/companies/${id}/plan`, { plan: newPlan });
      fetchCompanies();
    } catch (e) {
      alert('Erro ao atualizar plano da operadora.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/companies', formData);
      setCreatedCredentials({
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email
      });
      setShowCreateModal(false);
      setFormData({ name: '', nuit: '', email: '', username: '', password: Math.random().toString(36).slice(-8), phone: '' });
      fetchCompanies();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao registar operadora');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText || !selectedCompany) return;
    setIsSendingMessage(true);
    try {
      // Assuming we have an endpoint for this or using WhatsApp
      await api.post('/whatsapp/send', { 
        to: selectedCompany.email, // Or phone if available
        message: messageText 
      });
      alert('Mensagem enviada com sucesso para o canal da operadora.');
      setMessageText('');
    } catch (e) {
      alert('Falha ao enviar mensagem estratégica.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="relative min-h-screen space-y-6 lg:space-y-12 pb-20 lg:pb-24 p-4 lg:p-6 notranslate" translate="no">
      <div className="aura-bg-main" />

      {/* Header Elite */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-sky-500/50"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500">Comando Global / CEO</span>
          </div>
          <h2 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter italic text-white leading-none">
            Operadoras <span className="text-sky-500 glow-text">Vigilantes</span>
          </h2>
          <p className="opacity-30 text-[9px] lg:text-[10px] font-bold mt-2 max-w-sm tracking-tight uppercase">
            Supervisão do ecossistema MozBus • <span className="text-white font-black">{companies.length}</span> unidades ativas.
          </p>
        </motion.div>

        <div className="flex gap-4">
          <div className="hidden xl:flex items-center gap-8 mr-8 border-r border-white/5 pr-8">
            <div className="text-right">
              <p className="text-[8px] font-black uppercase opacity-20 tracking-widest">Aura Revenue (30d)</p>
              <p className="font-black text-xl italic text-white">$14,200.00</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black uppercase opacity-20 tracking-widest">Market Index</p>
              <p className="font-black text-xl italic text-sky-500">8.4/10</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-5 lg:px-6 py-3 lg:py-4 rounded-xl font-black text-[8px] lg:text-[9px] uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-xl active:scale-95"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" strokeWidth={3} /> Integrar Operadora
          </button>
        </div>
      </div>

      {loading ? <EliteLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 relative z-10">
            {companies.map((company) => (
                <motion.div 
                    key={company.id}
                    layoutId={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className="card-aura p-5 lg:p-8 space-y-5 lg:space-y-6 group hover:border-sky-500/30 transition-all relative overflow-hidden cursor-pointer"
                >
                    <div className="flex justify-between items-start">
                        <div className="bg-white/5 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-sky-500 group-hover:scale-110 transition-transform">
                            <Hexagon className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-3">
                           <div className="flex gap-2">
                             <div className={`px-4 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border ${
                                company.plan === 'ELITE' ? 'bg-sky-500 border-sky-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 
                                company.plan === 'PREMIUM' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/40'
                             }`}>
                                  {company.plan || 'BASIC'}
                             </div>
                             <div className={`px-4 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border ${
                                company.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                             }`}>
                                  {company.status}
                             </div>
                           </div>
                            <div className="text-[10px] font-black opacity-30 uppercase tracking-widest flex flex-col items-end gap-1">
                                <span>NUIT: {company.nuit}</span>
                                <span className="text-sky-500/50">ADMIN: {company.admin?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-lg lg:text-2xl font-black italic tracking-tighter text-white/90 leading-tight">{company.name.toUpperCase()}</h4>
                        <p className="text-[8px] lg:text-[9px] font-bold opacity-20 lowercase tracking-tight truncate">{company.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                            <p className="text-[7px] lg:text-[8px] font-black uppercase opacity-20 tracking-widest">Receita Acumulada</p>
                            <p className="font-black text-sm lg:text-lg italic text-emerald-400">MT {company.stats?.revenue.toLocaleString() || '0'}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[7px] lg:text-[8px] font-black uppercase opacity-20 tracking-widest">Fluxo Diário</p>
                            <p className="font-black text-sm lg:text-lg italic text-sky-400">{company.stats?.dailyTrips || 0} Viagens</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                           <p className="text-[7px] font-black uppercase opacity-20 tracking-widest mb-1">Frota Activa</p>
                           <p className="text-xs font-black text-white italic">{company.stats?.fleetSize || 0} Autocarros</p>
                        </div>
                        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                           <p className="text-[7px] font-black uppercase opacity-20 tracking-widest mb-1">Hardware / POS</p>
                           <p className="text-xs font-black text-white italic">{company.stats?.hardwareCount || 0} Unidades</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Upgrade de Protocolo</span>
                            <div className="flex gap-2">
                                {['BASIC', 'PREMIUM', 'ELITE'].map((p) => (
                                    <button 
                                        key={p}
                                        onClick={() => handleUpdatePlan(company.id, p)}
                                        className={`px-2 py-1 rounded text-[7px] font-black transition-all ${
                                            company.plan === p ? 'bg-sky-500 text-white' : 'bg-white/5 text-white/20 hover:bg-white/10'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button 
                           onClick={() => handleUpdateStatus(company.id, company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                           className={`flex-1 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                              company.status === 'ACTIVE' ? 'border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white'
                           }`}
                        >
                           {company.status === 'ACTIVE' ? (
                              <><Ban size={14} /> Suspender</>
                           ) : (
                              <><Power size={14} /> Activar</>
                           )}
                        </button>
                        <button className="bg-white/5 border border-white/5 p-3 rounded-xl text-white/30 hover:text-white hover:border-sky-500/50 transition-all">
                           <ArrowUpRight size={18} />
                        </button>
                    </div>

                    <div className="absolute -bottom-8 -right-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity transform -rotate-12">
                         <Globe size={180} />
                    </div>
                </motion.div>
            ))}
        </div>
      )}

      {/* OPERATOR COMMAND CENTER (PORTAL) */}
      <AnimatePresence>
        {selectedCompany && (
          <div className="fixed inset-0 z-[150] flex items-center justify-end overflow-hidden">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setSelectedCompany(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="w-full max-w-4xl h-full bg-[#070709] border-l border-white/5 relative z-10 flex flex-col shadow-[-50px_0_100px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar"
            >
                {/* Portal Header */}
                <div className="sticky top-0 z-20 bg-[#070709]/80 backdrop-blur-xl border-b border-white/5 p-8 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-500">
                            <Hexagon size={32} />
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{selectedCompany.name}</h3>
                              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black tracking-widest">{selectedCompany.status}</span>
                           </div>
                           <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mt-1">Portal de Governança Estratégica</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedCompany(null)} className="bg-white/5 p-4 rounded-2xl text-white/30 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 lg:p-12 space-y-12 pb-32">
                    {/* Metrics Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-aura p-6 border border-white/5 rounded-3xl space-y-4">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Receita Bruta</p>
                            <h4 className="text-2xl font-black text-emerald-400 italic">MT {selectedCompany.stats?.revenue.toLocaleString()}</h4>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[65%]" />
                            </div>
                        </div>
                        <div className="glass-aura p-6 border border-white/5 rounded-3xl space-y-4">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Frota Operacional</p>
                            <h4 className="text-2xl font-black text-sky-500 italic">{selectedCompany.stats?.fleetSize} Autocarros</h4>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 w-[80%]" />
                            </div>
                        </div>
                        <div className="glass-aura p-6 border border-white/5 rounded-3xl space-y-4">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Fluxo Diário</p>
                            <h4 className="text-2xl font-black text-amber-500 italic">{selectedCompany.stats?.dailyTrips} Viagens</h4>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[45%]" />
                            </div>
                        </div>
                    </div>

                    {/* Hardware & Infrastructure */}
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-4">
                           Infraestrutura de Hardware
                           <div className="h-px flex-1 bg-white/5" />
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {selectedCompany.hardware?.length > 0 ? selectedCompany.hardware.map(hw => (
                              <div key={hw.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center group hover:border-sky-500/30 transition-all">
                                 <Zap size={16} className="mx-auto mb-3 text-sky-500/40 group-hover:text-sky-500" />
                                 <p className="text-[9px] font-black text-white truncate">{hw.serialNumber}</p>
                                 <p className="text-[7px] font-bold text-white/20 uppercase mt-1">{hw.type}</p>
                              </div>
                           )) : (
                              <div className="col-span-4 py-8 text-center border border-dashed border-white/10 rounded-3xl opacity-20">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-white">Nenhum hardware registado</p>
                              </div>
                           )}
                        </div>
                    </div>

                    {/* Governance & Plan */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Upgrade de Protocolo</h5>
                           <div className="flex flex-col gap-3">
                                {['BASIC', 'PREMIUM', 'ELITE'].map((p) => (
                                    <button 
                                        key={p}
                                        onClick={() => handleUpdatePlan(selectedCompany.id, p)}
                                        className={`w-full p-5 rounded-2xl border flex justify-between items-center transition-all ${
                                            selectedCompany.plan === p 
                                            ? 'bg-sky-500/10 border-sky-500 text-white font-black' 
                                            : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20'
                                        }`}
                                    >
                                        <span className="text-[10px] uppercase tracking-widest">{p} PROTOCOL</span>
                                        {selectedCompany.plan === p && <ShieldCheck size={18} />}
                                    </button>
                                ))}
                           </div>
                        </div>

                        <div className="space-y-6">
                           <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Canal Estratégico (Direct)</h5>
                           <div className="glass-aura p-6 rounded-3xl border border-white/5 space-y-4">
                              <textarea 
                                 placeholder="Escreva uma directiva para o administrador da operadora..."
                                 className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-4 outline-none focus:border-sky-500/50 text-[11px] text-white font-medium resize-none placeholder:text-white/10"
                                 value={messageText}
                                 onChange={(e) => setMessageText(e.target.value)}
                              />
                              <button 
                                 onClick={handleSendMessage}
                                 disabled={isSendingMessage || !messageText}
                                 className="w-full py-4 bg-sky-500 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:scale-100"
                              >
                                 {isSendingMessage ? 'PROCESSANDO...' : 'ENVIAR DIRECTIVA'}
                              </button>
                           </div>
                        </div>
                    </div>

                    {/* Status Control */}
                    <div className="pt-8 border-t border-white/5 flex gap-4">
                       <button 
                          onClick={() => handleUpdateStatus(selectedCompany.id, selectedCompany.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                          className={`flex-1 py-5 rounded-2xl border font-black text-[11px] uppercase tracking-[0.4em] transition-all ${
                             selectedCompany.status === 'ACTIVE' 
                             ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white' 
                             : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                       >
                          {selectedCompany.status === 'ACTIVE' ? 'SUSPENDER OPERAÇÃO' : 'ACTIVAR OPERAÇÃO'}
                       </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Elite */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setShowCreateModal(false)}
               className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-[#0D0D10] border border-white/10 w-full max-w-xl rounded-[40px] p-12 space-y-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative z-10"
            >
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Protocolo de Ingestão</p>
                      <h3 className="text-3xl font-black uppercase tracking-tighter italic">Nova <span className="text-sky-500">Operadora</span></h3>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="bg-white/5 p-3 rounded-2xl text-white/30 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Razão Social</label>
                        <input 
                            required
                            type="text"
                            placeholder="Ex: Nagi Investimentos"
                            className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Identificação Fiscal (NUIT)</label>
                            <input 
                                required
                                type="text"
                                placeholder="..."
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                                value={formData.nuit}
                                onChange={e => setFormData({...formData, nuit: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">E-mail Administrativo</label>
                            <input 
                                required
                                type="email"
                                placeholder="..."
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Username do Administrador</label>
                            <input 
                                required
                                type="text"
                                placeholder="gestor.nagi"
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Telefone de Contacto</label>
                            <input 
                                required
                                type="text"
                                placeholder="+258..."
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full h-16 bg-sky-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-sky-400 transition-all shadow-[0_15px_40px_rgba(14,165,233,0.3)] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Estabelecer Conexão <Zap size={14} fill="currentColor" />
                    </button>
                    <p className="text-center text-[9px] opacity-20 font-bold uppercase tracking-widest">Password Provisória: {formData.password}</p>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Credentials Modal */}
      <AnimatePresence>
        {createdCredentials && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
               className="bg-[#0D0D10] border border-sky-500/30 w-full max-w-md rounded-[40px] p-10 space-y-8 relative z-10 shadow-[0_0_100px_rgba(14,165,233,0.2)] text-center"
            >
                <div className="w-20 h-20 bg-sky-500 rounded-3xl flex items-center justify-center text-black mx-auto shadow-[0_0_40px_#0EA5E9]">
                    <ShieldCheck size={40} />
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Credenciais <span className="text-sky-500">Geradas</span></h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Conexão estabelecida com sucesso para {createdCredentials.name}</p>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-left relative group">
                        <p className="text-[8px] font-black uppercase text-white/20 mb-2 tracking-widest">Utilizador / Login</p>
                        <p className="text-sm font-black text-sky-400 font-mono">{createdCredentials.username}</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-left relative group">
                        <p className="text-[8px] font-black uppercase text-white/20 mb-2 tracking-widest">Password Provisória</p>
                        <p className="text-sm font-black text-emerald-400 font-mono">{createdCredentials.password}</p>
                    </div>
                </div>

                <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                    <p className="text-[9px] font-bold text-sky-500/80 leading-relaxed">
                        IMPORTANTE: Partilhe estas credenciais apenas com o administrador da operadora. Ele deverá alterar a password no primeiro acesso.
                    </p>
                </div>

                <button 
                    onClick={() => setCreatedCredentials(null)}
                    className="w-full py-5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-sky-500 hover:text-white transition-all shadow-2xl"
                >
                    CONCLUÍDO
                </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
