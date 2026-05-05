"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Navigation2, X, Loader2, Trash2, ArrowRight, Zap, Globe } from 'lucide-react';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';
import { useToast } from '@/components/EliteToast';
import { AlertCircle } from 'lucide-react';

interface RouteData {
  id: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: '',
    duration: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/routes');
      setRoutes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/routes', formData);
      setShowCreateModal(false);
      setFormData({ origin: '', destination: '', distance: '', duration: '' });
      fetchRoutes();
      toast('Rota registada com sucesso no atlas.', 'success');
    } catch (e: any) {
      toast(e.response?.data?.message || 'Erro ao criar rota', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/routes/${id}`);
      fetchRoutes();
      toast('Rota removida permanentemente.', 'success');
      setShowDeleteConfirm(null);
    } catch (e) {
      toast('Erro ao remover rota', 'error');
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
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500">Atlas de Navegação</span>
          </div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">
            Rede de <span className="text-sky-500 glow-text">Caminhos</span>
          </h2>
          <p className="opacity-40 text-xs font-medium mt-2 max-w-sm">
            Mapeamento geográfico de destinos inter-provinciais. Total de <span className="text-white font-bold">{routes.length}</span> trajectos activos.
          </p>
        </motion.div>

        <div className="flex gap-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-[0_0_30px_rgba(14,165,233,0.1)] active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Nova Rota
          </button>
        </div>
      </div>

      {loading ? <EliteLoader /> : routes.length === 0 ? (
        <div className="card-aura p-24 rounded-[40px] text-center space-y-8 border border-white/5 opacity-50 relative z-10">
           <MapPin size={64} strokeWidth={1} className="mx-auto text-sky-500" />
           <div className="space-y-2">
              <h4 className="font-black uppercase tracking-widest italic text-xl">Terra Incognita</h4>
              <p className="text-[10px] font-medium opacity-50 uppercase tracking-[0.3em]">Nenhuma coordenada definida até ao momento.</p>
           </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {routes.map((route) => (
                <motion.div 
                    key={route.id}
                    layoutId={route.id}
                    className="card-aura p-10 space-y-8 group hover:border-sky-500/30 transition-all relative overflow-hidden"
                >
                    <div className="flex justify-between items-start">
                        <div className="bg-white/5 p-5 rounded-3xl text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all group-hover:scale-110">
                            <Navigation2 size={24} />
                        </div>
                        <button 
                          onClick={() => setShowDeleteConfirm(route.id)}
                          className="text-white/10 hover:text-rose-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-4 h-4 rounded-full border-2 border-sky-500/30 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-sky-500/50"></div>
                            </div>
                            <span className="font-black text-2xl italic tracking-tighter uppercase">{route.origin}</span>
                        </div>
                        <div className="ml-2 w-0.5 h-10 border-l border-dashed border-white/10 group-hover:border-sky-500/20"></div>
                        <div className="flex items-center gap-5">
                            <div className="w-4 h-4 rounded-full bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
                            <span className="font-black text-2xl italic tracking-tighter uppercase text-sky-400 glow-text">{route.destination}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase opacity-20 tracking-widest">Distância</p>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-lg italic">{route.distance}</span>
                            </div>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[8px] font-black uppercase opacity-20 tracking-widest">Duração</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className="font-black text-lg italic">{route.duration}</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -top-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity transform -rotate-12">
                         <Globe size={220} />
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
                      <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Protocolo de Rota</p>
                      <h3 className="text-3xl font-black uppercase tracking-tighter italic">Novo <span className="text-sky-500">Trajecto</span></h3>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="bg-white/5 p-3 rounded-2xl text-white/30 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Cidade de Origem</label>
                            <input 
                                required
                                type="text"
                                placeholder="MAPUTO"
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black uppercase transition-all"
                                value={formData.origin}
                                onChange={e => setFormData({...formData, origin: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Cidade de Destino</label>
                            <input 
                                required
                                type="text"
                                placeholder="BEIRA"
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black uppercase text-sky-400 transition-all"
                                value={formData.destination}
                                onChange={e => setFormData({...formData, destination: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Extensão (KM)</label>
                            <input 
                                required
                                type="text"
                                placeholder="1100 KM"
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                                value={formData.distance}
                                onChange={e => setFormData({...formData, distance: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 block">Tempo Estimado</label>
                            <input 
                                required
                                type="text"
                                placeholder="18 HORAS"
                                className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black transition-all"
                                value={formData.duration}
                                onChange={e => setFormData({...formData, duration: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full h-16 bg-sky-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-sky-400 transition-all shadow-[0_15px_40px_rgba(14,165,233,0.3)] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Validar Rota <Zap size={14} fill="currentColor" />
                    </button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* MODAL DE CONFIRMAÇÃO DE DELETE */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(null)} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-[#0D0D10] border border-white/10 p-10 rounded-[40px] max-w-sm text-center space-y-8 shadow-3xl">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto rotate-12">
                    <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Remover Rota?</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 leading-relaxed">Esta acção é irreversível e removerá o trajecto de todas as operações futuras.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowDeleteConfirm(null)} className="h-14 rounded-2xl bg-white/5 font-black uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                    <button onClick={() => handleDelete(showDeleteConfirm)} className="h-14 rounded-2xl bg-rose-600 text-white font-black uppercase text-[9px] tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-500 transition-all">Confirmar</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
