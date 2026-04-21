"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Navigation2, MoreVertical, X, Loader2, Trash2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

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
      alert('Rota criada com sucesso!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao criar rota');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja remover esta rota?')) return;
    try {
      await api.delete(`/routes/${id}`);
      fetchRoutes();
    } catch (e) {
      alert('Erro ao remover rota');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">GESTÃO DE <span className="text-orange-500">ROTAS</span></h2>
          <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
            {routes.length} Destinos Mapeados
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-95"
        >
            <Plus size={20} /> Nova Rota
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 size={40} className="animate-spin text-orange-500 opacity-20" />
        </div>
      ) : routes.length === 0 ? (
        <div className="glass p-20 rounded-[40px] text-center space-y-6 border border-white/5 opacity-40">
           <MapPin size={64} className="mx-auto" />
           <p className="font-black uppercase tracking-widest italic">Nenhuma rota definida ainda.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {routes.map((route, idx) => (
                <motion.div 
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass p-10 rounded-[45px] space-y-8 group hover:border-orange-500/30 transition-all border border-white/5 relative overflow-hidden"
                >
                    <div className="flex justify-between items-start">
                       <div className="bg-orange-500/10 p-4 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                          <Navigation2 size={24} />
                       </div>
                       <button 
                        onClick={() => handleDelete(route.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                       >
                          <Trash2 size={20} />
                       </button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-white/20 border border-white/10 group-hover:bg-white transition-colors"></div>
                            <span className="font-black text-xl italic uppercase tracking-tighter truncate">{route.origin}</span>
                        </div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-white/10 to-orange-500/30 ml-[5px]"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                            <span className="font-black text-xl italic uppercase tracking-tighter truncate text-orange-500">{route.destination}</span>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
                        <div>
                           <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.2em] mb-1">Distância</p>
                           <p className="font-black text-sm">{route.distance}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.2em] mb-1">Duração</p>
                           <p className="font-black text-sm">{route.duration}</p>
                        </div>
                    </div>

                    {/* Fundo Decorativo */}
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                        <MapPin size={150} />
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
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">DEFINIR <span className="text-orange-500">NOVA ROTA</span></h3>
                    <button onClick={() => setShowCreateModal(false)} className="text-white/30 hover:text-white transition-colors">
                        <X size={32} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">Cidade Origem</label>
                            <input 
                                required
                                type="text"
                                placeholder="Ex: Maputo"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black"
                                value={formData.origin}
                                onChange={e => setFormData({...formData, origin: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">Cidade Destino</label>
                            <input 
                                required
                                type="text"
                                placeholder="Ex: Beira"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black text-orange-500"
                                value={formData.destination}
                                onChange={e => setFormData({...formData, destination: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">Distância (KM)</label>
                            <input 
                                required
                                type="text"
                                placeholder="Ex: 1100km"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black"
                                value={formData.distance}
                                onChange={e => setFormData({...formData, distance: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">Duração (Horas)</label>
                            <input 
                                required
                                type="text"
                                placeholder="Ex: 18h"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black"
                                value={formData.duration}
                                onChange={e => setFormData({...formData, duration: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-orange-500 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                    >
                        Publicar Rota
                    </button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
