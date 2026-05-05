"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Shield, X, Loader2, UserCheck, Trash2, Mail, Phone, Zap, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: 'password123',
    role: 'FISCAL'
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('mozbus_user') || '{}');
      const companyId = storedUser.companyId;
      
      const res = await api.get(`/users/company/${companyId}`);
      // Filtrar apenas Staff relevant (Fiscal, Gestor etc)
      setStaff(res.data.filter((u: any) => u.role !== 'PASSENGER'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowCreateModal(false);
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        username: '', 
        password: 'password123', 
        role: 'FISCAL' 
      });
      fetchStaff();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao registar colaborador');
    }
  };

  return (
    <div className="relative min-h-screen space-y-16 pb-32 p-8 notranslate" translate="no">
      <div className="aura-bg-main" />

      {/* Header Elite */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-sky-500/50"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500">Recursos Humanos</span>
          </div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">
            Equipa <span className="text-sky-500 glow-text">Operacional</span>
          </h2>
          <p className="opacity-40 text-xs font-medium mt-2 max-w-sm">
            Gestão de fiscais e equipa técnica. Total de <span className="text-white font-bold">{staff.length}</span> ativos.
          </p>
        </motion.div>

        <div className="flex gap-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-[0_0_30px_rgba(14,165,233,0.1)] active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Registar Colaborador
          </button>
        </div>
      </div>

      {loading ? <EliteLoader /> : staff.length === 0 ? (
        <div className="card-aura p-24 rounded-[40px] text-center space-y-8 border border-white/5 opacity-50 relative z-10">
           <Users size={64} strokeWidth={1} className="mx-auto text-sky-500" />
           <div className="space-y-2">
              <h4 className="font-black uppercase tracking-widest italic text-xl">Sem Efectivos</h4>
              <p className="text-[10px] font-medium opacity-50 uppercase tracking-[0.3em]">Nenhum colaborador operacional registado.</p>
           </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {staff.map((member) => (
                <motion.div 
                    key={member.id}
                    layoutId={member.id}
                    className="card-aura p-10 space-y-8 group hover:border-sky-500/30 transition-all relative overflow-hidden"
                >
                    <div className="flex justify-between items-start">
                        <div className="bg-white/5 p-5 rounded-3xl text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all group-hover:scale-110">
                            <Briefcase size={28} />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border ${
                            member.role === 'COMPANY_ADMIN' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                          }`}>
                              {member.role.replace('_', ' ')}
                          </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase opacity-20 tracking-[0.3em]">Nome Completo</p>
                        <h4 className="text-2xl font-black italic tracking-tighter text-white/90 truncate">{member.name.toUpperCase()}</h4>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4 text-white/40">
                          <Mail size={14} className="text-sky-500/50" />
                          <span className="text-[11px] font-bold lowercase truncate tracking-tight">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/40">
                          <Phone size={14} className="text-sky-500/50" />
                          <span className="text-[11px] font-bold tracking-tight">{member.phone}</span>
                        </div>
                    </div>

                    <div className="absolute -bottom-8 -right-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity transform -rotate-12">
                         <UserCheck size={180} />
                    </div>
                </motion.div>
            ))}
        </div>
      )}

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
                      <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Protocolo de Recrutamento</p>
                      <h3 className="text-3xl font-black uppercase tracking-tighter italic">Novo <span className="text-sky-500">Agente</span></h3>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="bg-white/5 p-3 rounded-2xl text-white/30 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Nome Completo</label>
                        <input 
                            required
                            type="text"
                            placeholder="Ex: Albino Manuel"
                            className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">E-mail Corporativo</label>
                            <input 
                                required
                                type="email"
                                placeholder="..."
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Telefone</label>
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

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Username de Acesso</label>
                            <input 
                                required
                                type="text"
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Nível de Acesso</label>
                            <select 
                                className="w-full bg-[#141416] border border-white/5 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black text-xs appearance-none"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="FISCAL">FISCAL (VALIDADOR)</option>
                                <option value="COMPANY_ADMIN">GESTOR (ADMIN)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full h-16 bg-sky-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-sky-400 transition-all shadow-[0_15px_40px_rgba(14,165,233,0.3)] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Activar Credenciais <Zap size={14} fill="currentColor" />
                    </button>
                    <p className="text-center text-[9px] opacity-20 font-bold uppercase tracking-widest">Password Automática: password123</p>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}