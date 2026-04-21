"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Plus, Search, MoreVertical, ShieldCheck, AlertCircle, X, Loader2, Gauge, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface BusData {
  id: string;
  plate: string;
  model: string;
  seats: number;
  companyId: string;
}

export default function FleetPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    seats: 40,
    companyId: ''
  });

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('mozbus_user') || '{}');
      const companyId = storedUser.companyId || storedUser.companiesManaged?.[0]?.id;
      
      let res;
      if (companyId) {
        setFormData(prev => ({ ...prev, companyId }));
        res = await api.get(`/buses/company/${companyId}`);
      } else {
        res = await api.get('/buses');
      }
      setBuses(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/buses', formData);
      setShowCreateModal(false);
      setFormData({ ...formData, plate: '', model: '' });
      fetchBuses();
      alert('Viatura adicionada com sucesso!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao adicionar viatura');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja remover esta viatura?')) return;
    try {
      await api.delete(`/buses/${id}`);
      fetchBuses();
    } catch (e) {
      alert('Erro ao remover viatura');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">GESTÃO DE <span className="text-orange-500">FROTA</span></h2>
          <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
            {buses.length} {buses.length === 1 ? 'Viatura Registada' : 'Viaturas Registadas'}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-orange-500/30 hover:bg-orange-400 transition-all active:scale-95"
        >
            <Plus size={20} /> Adicionar Viatura
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 size={40} className="animate-spin text-orange-500 opacity-20" />
        </div>
      ) : buses.length === 0 ? (
        <div className="glass p-20 rounded-[40px] text-center space-y-6 border border-white/5 opacity-40">
           <Bus size={64} className="mx-auto" />
           <p className="font-black uppercase tracking-widest italic">Nenhuma viatura na garagem.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {buses.map((bus) => (
                <motion.div 
                    key={bus.id}
                    layoutId={bus.id}
                    className="glass p-10 rounded-[45px] space-y-8 group hover:border-orange-500/30 transition-all border border-white/5 relative overflow-hidden"
                >
                    <div className="flex justify-between items-start">
                        <div className="bg-white/5 p-5 rounded-3xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all group-hover:rotate-6">
                            <Bus size={32} />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDelete(bus.id)}
                            className="bg-red-500/10 text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="bg-zinc-800 border border-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                              {bus.plate}
                          </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Modelo do Veículo</p>
                        <h4 className="text-2xl font-black italic">{bus.model.toUpperCase()}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                            <p className="text-[9px] font-black uppercase opacity-30 mb-2">CAPACIDADE</p>
                            <div className="flex items-center gap-2">
                                <Gauge size={14} className="text-blue-400" />
                                <span className="font-black text-lg">{bus.seats}</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                            <p className="text-[9px] font-black uppercase opacity-30 mb-2">STATUS</p>
                            <div className="flex items-center gap-2 text-green-500">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase">Activo</span>
                            </div>
                        </div>
                    </div>

                    {/* Fundo Decorativo do Card */}
                    <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                         <Bus size={200} />
                    </div>
                </motion.div>
            ))}
        </div>
      )}

      {/* Modal de Criação */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[50px] p-12 space-y-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">REGISTAR <span className="text-orange-500">NOVA VIATURA</span></h3>
                    <button onClick={() => setShowCreateModal(false)} className="text-white/30 hover:text-white transition-colors">
                        <X size={32} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">Matrícula</label>
                            <input 
                                required
                                type="text"
                                placeholder="Ex: AFG-123-MC"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black uppercase tracking-widest"
                                value={formData.plate}
                                onChange={e => setFormData({...formData, plate: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">Lotação</label>
                            <input 
                                required
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black"
                                value={formData.seats}
                                onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">Modelo e Marca</label>
                        <input 
                            required
                            type="text"
                            placeholder="Ex: Yutong ZK6122H"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black"
                            value={formData.model}
                            onChange={e => setFormData({...formData, model: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-orange-500 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                    >
                        Adicionar à Frota
                    </button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
