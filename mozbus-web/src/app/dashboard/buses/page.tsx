"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Plus, Search, ShieldCheck, X, Loader2, Gauge, Trash2, Zap, LayoutGrid, Settings2 } from 'lucide-react';
import api from '@/lib/api';
import BusLayoutConfigurator from '@/components/BusLayoutConfigurator';
import EliteLoader from '@/components/EliteLoader';

interface BusData {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  companyId: string;
}

export default function FleetPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    capacity: 40,
    companyId: ''
  });
  const [configuringBus, setConfiguringBus] = useState<BusData | null>(null);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/buses');
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
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao adicionar viatura');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta unidade da frota operativa?')) return;
    try {
      await api.delete(`/buses/${id}`);
      fetchBuses();
    } catch (e) {
      alert('Falha na desativação da unidade.');
    }
  };

  const handleSaveLayout = async (capacity: number, layout: string) => {
    if (!configuringBus) return;
    try {
      await api.patch(`/buses/${configuringBus.id}`, { capacity, layout });
      setConfiguringBus(null);
      fetchBuses();
    } catch (e) {
      alert('Erro ao atualizar layout');
    }
  };

  return (
    <div className="relative min-h-screen space-y-12 pb-24 notranslate" translate="no">
      <div className="aura-bg-main" />

      {/* Header Elite */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-sky-500/50"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500">Gestão Logística</span>
          </div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">
            Frota <span className="text-sky-500 glow-text">Operativa</span>
          </h2>
          <p className="opacity-40 text-xs font-medium mt-2 max-w-sm">
            Monitorização e configuração de unidades móveis. Total de <span className="text-white font-bold">{buses.length}</span> activos.
          </p>
        </motion.div>

        <div className="flex gap-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-[0_0_30px_rgba(14,165,233,0.1)] active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Registar Unidade
          </button>
        </div>
      </div>

      {loading ? <EliteLoader /> : buses.length === 0 ? (
        <div className="card-aura p-24 rounded-[40px] text-center space-y-8 border border-white/5 opacity-50 relative z-10">
           <Bus size={64} strokeWidth={1} className="mx-auto text-sky-500" />
           <div className="space-y-2">
              <h4 className="font-black uppercase tracking-widest italic text-xl">Doca Vazia</h4>
              <p className="text-[10px] font-medium opacity-50 uppercase tracking-[0.3em]">Nenhuma viatura registada no sistema até ao momento.</p>
           </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {buses.map((bus) => (
                <motion.div 
                    key={bus.id}
                    layoutId={bus.id}
                    className="card-aura p-10 space-y-8 group hover:border-sky-500/30 transition-all relative overflow-hidden"
                >
                    <div className="flex justify-between items-start">
                        <div className="bg-white/5 p-5 rounded-3xl text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all group-hover:scale-110">
                            <Bus size={28} />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="bg-[#141416] border border-white/10 px-5 py-2.5 rounded-2xl text-[12px] font-black tracking-[0.2em] text-white/90">
                              {bus.plate}
                          </div>
                          <button 
                            onClick={() => handleDelete(bus.id)}
                            className="text-rose-500/20 hover:text-rose-500 transition-colors p-2"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase opacity-20 tracking-[0.3em]">Modelo Operativo</p>
                        <h4 className="text-2xl font-black italic tracking-tighter text-white/90">{bus.model.toUpperCase()}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="bg-white/[0.02] p-5 rounded-3xl border border-white/5 relative group/config">
                            <button 
                                onClick={() => setConfiguringBus(bus)}
                                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-sky-500/90 text-white opacity-0 group-hover/config:opacity-100 transition-all rounded-3xl backdrop-blur-sm z-10"
                            >
                               <Settings2 size={24} className="mb-1" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Configurar</span>
                            </button>
                            <p className="text-[8px] font-black uppercase opacity-20 mb-2 tracking-widest">Capacidade / Layout</p>
                            <div className="flex items-center gap-2">
                                <LayoutGrid size={12} className="text-sky-400/50" />
                                <span className="font-black text-xl italic">{bus.capacity}</span>
                            </div>
                        </div>
                        <div className="bg-white/[0.02] p-5 rounded-3xl border border-white/5">
                            <p className="text-[8px] font-black uppercase opacity-20 mb-2 tracking-widest">Sinal</p>
                            <div className="flex items-center gap-2 text-emerald-400">
                                <ShieldCheck size={12} />
                                <span className="text-[9px] font-black uppercase tracking-wider">Activo</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-8 -right-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                         <Bus size={180} />
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
                      <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Protocolo de Frota</p>
                      <h3 className="text-3xl font-black uppercase tracking-tighter italic">Novo <span className="text-sky-500">Recurso</span></h3>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="bg-white/5 p-3 rounded-2xl text-white/30 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Matrícula</label>
                            <input 
                                required
                                type="text"
                                placeholder="ABC-123-MC"
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black uppercase tracking-widest transition-all"
                                value={formData.plate}
                                onChange={e => setFormData({...formData, plate: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Lotação (Lugares)</label>
                            <input 
                                required
                                type="number"
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all italic"
                                value={formData.capacity}
                                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Especificação do Fabricante</label>
                        <input 
                            required
                            type="text"
                            placeholder="Ex: Marcopolo G7 1200"
                            className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                            value={formData.model}
                            onChange={e => setFormData({...formData, model: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full h-16 bg-sky-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-sky-400 transition-all shadow-[0_15px_40px_rgba(14,165,233,0.3)] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Adicionar à Frota <Zap size={14} fill="currentColor" />
                    </button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {configuringBus && (
           <BusLayoutConfigurator 
             initialCapacity={configuringBus.capacity}
             initialLayout={(configuringBus as any).layout || '2-2'}
             onSave={handleSaveLayout}
             onClose={() => setConfiguringBus(null)}
           />
        )}
      </AnimatePresence>
    </div>
  );
}
