"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Bus, ChevronRight, X, UserCheck, Search, Loader2, MapPin, DollarSign, Clock, Download, Power, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';
import { useToast } from '@/components/EliteToast';

export default function TripSchedulerPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
      departureTime: '',
      price: 0,
      busId: '',
      routeId: ''
  });

  const statusOptions = [
    { value: 'ALL', label: 'Todas' },
    { value: 'SCHEDULED', label: 'Agendadas', color: 'text-sky-500' },
    { value: 'BOARDING', label: 'Embarque', color: 'text-yellow-500' },
    { value: 'IN_TRANSIT', label: 'Em Trânsito', color: 'text-blue-500' },
    { value: 'COMPLETED', label: 'Concluídas', color: 'text-green-500' },
  ];

  const fetchData = async () => {
      try {
          setLoading(true);
          const [tripsRes, busesRes, routesRes] = await Promise.all([
              api.get('/trips').catch(err => ({ data: [] })),
              api.get('/buses').catch(err => ({ data: [] })),
              api.get('/routes').catch(err => ({ data: [] }))
          ]);

          setAllTrips(Array.isArray(tripsRes.data) ? tripsRes.data : []);
          setBuses(Array.isArray(busesRes.data) ? busesRes.data : []);
          setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);
      } catch (e) {
          console.error("Critical error fetching data:", e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const filteredTrips = React.useMemo(() => {
    if (statusFilter === 'ALL') return allTrips;
    return allTrips.filter(t => t.status === statusFilter);
  }, [allTrips, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.post('/trips', formData);
          setShowCreateModal(false);
          setFormData({ departureTime: '', price: 0, busId: '', routeId: '' });
          fetchData();
          toast('Viagem agendada com sucesso!', 'success');
      } catch (e) {
          toast('Erro ao criar viagem', 'error');
      }
  };

  const updateTripStatus = async (tripId: string, status: string) => {
      try {
          await api.patch(`/trips/${tripId}`, { status });
          fetchData();
          if (selectedTrip?.id === tripId) {
             const res = await api.get(`/trips/${tripId}`);
             setSelectedTrip(res.data);
          }
      } catch (e) {
          toast('Erro ao atualizar status', 'error');
      }
  };

  const openManifest = async (trip: any) => {
      try {
          const res = await api.get(`/trips/${trip.id}`);
          setSelectedTrip(res.data);
      } catch (e) {
          console.error(e);
      }
  };

  if (!isMounted || loading) return <EliteLoader />;

  return (
    <div className="space-y-12 pb-20 notranslate" translate="no">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">AGENDA DE <span className="text-sky-500">VIAGENS</span></h2>
          <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Logística Integrada e Manifesto Digital.</p>
        </div>
        <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-sky-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-sky-400 transition-all shadow-2xl shadow-sky-500/30 active:scale-95"
        >
            <Calendar size={20} /> Nova Partida
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border
              ${statusFilter === opt.value 
                ? 'bg-white text-black border-white shadow-xl' 
                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filteredTrips.length === 0 ? (
        <div className="glass p-20 rounded-[45px] text-center opacity-30 border border-white/5">
          <Clock size={64} className="mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest italic">Nenhuma viagem encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTrips.map((trip) => (
            <div 
              key={trip.id}
              className="glass p-10 rounded-[45px] flex items-center justify-between border border-white/5 hover:border-sky-500/30 transition-all cursor-pointer group"
              onClick={() => openManifest(trip)}
            >
              <div className="flex items-center gap-12">
                 <div className="text-center bg-black/40 border border-white/5 p-5 rounded-3xl min-w-[120px] group-hover:bg-sky-500 group-hover:border-sky-500 transition-all">
                    <p className="text-2xl font-black italic">
                      {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-[8px] font-black uppercase opacity-40 mt-1 uppercase group-hover:text-white/60">Partida</p>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter">
                        {trip.route?.origin || '---'} <span className="text-sky-500">→</span> {trip.route?.destination || '---'}
                      </h4>
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border ${
                        trip.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        trip.status === 'IN_TRANSIT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        trip.status === 'BOARDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-sky-500/10 text-sky-500 border-sky-500/20'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                      <p className="flex items-center gap-2 italic"><Bus size={14} className="text-sky-500" /> {trip.bus?.plate || 'S/V'} • {trip.bus?.model || '---'}</p>
                      <p className="flex items-center gap-2 italic"><Calendar size={14} className="text-sky-500" /> {new Date(trip.departureTime).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-16">
                 <div className="text-right">
                    <p className="text-2xl font-black tracking-tighter italic">{(trip.tickets?.filter((tk: any) => tk.status === 'PAID').length || 0)} <span className="text-sm opacity-30">/ {trip.bus?.seats || 0}</span></p>
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-1 italic">OCUPAÇÃO</p>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black text-white tracking-tighter italic">{trip.price?.toLocaleString() || 0} <span className="text-xs opacity-30">MT</span></p>
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-1 italic">TARIFA</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-full group-hover:bg-sky-500 transition-all border border-white/5 group-hover:scale-110">
                    <ChevronRight size={24} className="group-hover:text-white" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manifesto / Detalhes */}
      <AnimatePresence>
        {selectedTrip && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-zinc-900 border border-white/10 w-full max-w-6xl h-[90vh] rounded-[60px] overflow-hidden flex flex-col shadow-[0_50px_200px_rgba(0,0,0,1)]"
            >
                {/* Header do Modal */}
                <div className="px-12 py-10 border-b border-white/5 bg-white/[0.02] flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <h3 className="text-4xl font-black uppercase tracking-tighter italic text-sky-500">MANIFESTO #T-{selectedTrip.id.slice(-4)}</h3>
                           <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest opacity-40">
                              {selectedTrip.status}
                           </div>
                        </div>
                        <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest opacity-60">
                           <p className="flex items-center gap-2"><MapPin size={16} className="text-sky-500" /> {selectedTrip.route.origin} → {selectedTrip.route.destination}</p>
                           <p className="flex items-center gap-2"><Clock size={16} className="text-sky-500" /> {new Date(selectedTrip.departureTime).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                       {/* Control Status */}
                       <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                          {statusOptions.slice(1).map(opt => (
                             <button 
                                key={opt.value}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTripStatus(selectedTrip.id, opt.value);
                                }}
                                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${selectedTrip.status === opt.value ? 'bg-sky-500 text-white' : 'hover:bg-white/5 opacity-40'}`}
                             >
                                {opt.label}
                             </button>
                          ))}
                       </div>
                       <button onClick={() => setSelectedTrip(null)} className="p-4 bg-white/5 rounded-2xl hover:text-sky-500 transition-all">
                          <X size={28} />
                       </button>
                    </div>
                </div>

                {/* Conteúdo do Manifesto */}
                <div className="flex-1 overflow-y-auto p-12 grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                       <h4 className="text-xl font-black uppercase tracking-tighter italic border-l-4 border-sky-500 pl-4">LISTA DE PASSAGEIROS</h4>
                       
                       <div className="space-y-4">
                          {selectedTrip.tickets && selectedTrip.tickets.filter((tk: any) => tk.status === 'PAID').length > 0 ? (
                             selectedTrip.tickets.filter((tk: any) => tk.status === 'PAID').map((ticket: any) => (
                               <div key={ticket.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
                                  <div className="flex items-center gap-8">
                                     <div className="bg-sky-500/10 text-sky-500 w-16 h-16 rounded-2xl flex flex-col items-center justify-center">
                                       <span className="text-2xl font-black italic">{ticket.seatNumber}</span>
                                       <span className="text-[8px] font-bold uppercase opacity-50">Assento</span>
                                     </div>
                                     <div>
                                        <p className="text-lg font-black italic uppercase tracking-tighter">{ticket.passengerName || 'Passageiro'}</p>
                                        <p className="text-[9px] font-black uppercase opacity-30 mt-1 tracking-widest flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                          Venda: {ticket.passengerPhone} • {ticket.qrCode}
                                        </p>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                     {ticket.isBoarded ? (
                                        <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                                          <UserCheck size={14} /> Embarcado
                                        </div>
                                     ) : (
                                        <div className="text-sky-500/40 font-black text-[10px] uppercase italic">Pendente embarque</div>
                                     )}
                                  </div>
                               </div>
                             ))
                          ) : (
                             <div className="p-20 text-center opacity-10 border-2 border-dashed border-white/10 rounded-[40px]">
                                <Users size={64} className="mx-auto mb-4" />
                                <p className="font-black uppercase tracking-widest">Nenhum passageiro pagou ainda.</p>
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h4 className="text-xl font-black uppercase tracking-tighter italic border-l-4 border-sky-500 pl-4">DETALHES OPERACIONAIS</h4>
                       <div className="glass p-8 rounded-[40px] space-y-8 border border-white/5 bg-sky-500/[0.02]">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em]">AUTOCARRO ASSIGNADO</p>
                             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                                <div className="text-sky-500"><Bus size={24} /></div>
                                <p className="font-black text-sm uppercase">{selectedTrip.bus.plate} • {selectedTrip.bus.model}</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                <p className="text-[9px] font-black uppercase opacity-30 mb-2">RECEITA BRUTA</p>
                                <p className="text-xl font-black italic">{(selectedTrip.tickets?.filter((tk: any) => tk.status === 'PAID').length * selectedTrip.price).toLocaleString()} <span className="text-[10px] not-italic">MT</span></p>
                             </div>
                             <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                <p className="text-[9px] font-black uppercase opacity-30 mb-2">OCUPAÇÃO</p>
                                <p className="text-xl font-black italic">{Math.round((selectedTrip.tickets?.filter((tk: any) => tk.status === 'PAID').length / selectedTrip.bus.seats) * 100)}%</p>
                             </div>
                          </div>

                          <button 
                            onClick={() => {
                              const manifestText = `
MOZBUS ECOSYSTEM - MANIFESTO OFICIAL DE PASSAGEIROS
=================================================
VIAGEM ID: ${selectedTrip.id}
ROTA: ${selectedTrip.route.origin} -> ${selectedTrip.route.destination}
DATA/HORA: ${new Date(selectedTrip.departureTime).toLocaleString()}
VIATURA: ${selectedTrip.bus.plate} (${selectedTrip.bus.model})
MOTORISTA: Operacional Externo
=================================================

LISTA DE PASSAGEIROS:
-------------------------------------------------
${selectedTrip.tickets.filter((tk: any) => tk.status === 'PAID').map((t: any) => 
  `[SEAT ${t.seatNumber}] ${t.passengerName.padEnd(25)} | PHONE: ${t.passengerPhone} | QR: ${t.qrCode}`
).join('\n')}

-------------------------------------------------
TOTAL PASSAGEIROS: ${selectedTrip.tickets.filter((tk: any) => tk.status === 'PAID').length}
RECEITA TOTAL: ${(selectedTrip.tickets.filter((tk: any) => tk.status === 'PAID').length * selectedTrip.price).toLocaleString()} MT

ASSINATURA DESPACHANTE: _________________________
`;
                              const blob = new Blob([manifestText], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `manifesto_${selectedTrip.id.slice(-6)}.txt`;
                              link.click();
                            }}
                            className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-sky-500 hover:text-white transition-all shadow-xl active:scale-95"
                          >
                             <Download size={18} /> Baixar Manifesto TXT
                          </button>
                       </div>

                       <div className="glass p-8 rounded-[40px] border border-white/5 opacity-50">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-center">Os dados acima são actualizados via satélite MozBus Connect.</p>
                       </div>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Criação */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-[60px] p-12 space-y-12 shadow-3xl"
             >
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black uppercase tracking-tighter italic">AGENDAR <span className="text-sky-500">NOVA VIAGEM</span></h3>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Certifique-se da disponibilidade da viatura.</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="text-white/20 hover:text-sky-500 transition-all">
                        <X size={32} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">VIATURA</label>
                            <select 
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black uppercase text-xs"
                                value={formData.busId}
                                onChange={e => setFormData({...formData, busId: e.target.value})}
                            >
                                <option value="" className="bg-zinc-900">Seleccionar Bus</option>
                                {buses.map(b => (
                                    <option key={b.id} value={b.id} className="bg-zinc-900">{b.plate} - {b.model}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">ROTA</label>
                            <select 
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black uppercase text-xs"
                                value={formData.routeId}
                                onChange={e => setFormData({...formData, routeId: e.target.value})}
                            >
                                <option value="" className="bg-zinc-900">Seleccionar Destino</option>
                                {routes.map(r => (
                                    <option key={r.id} value={r.id} className="bg-zinc-900">{r.origin} → {r.destination}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">DATA E HORA</label>
                            <input 
                                required
                                type="datetime-local"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black text-xs"
                                value={formData.departureTime}
                                onChange={e => setFormData({...formData, departureTime: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">TARIFA (MT)</label>
                            <input 
                                required
                                type="number"
                                placeholder="800"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-sky-500/50 font-black text-sky-500"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-sky-500 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-sky-400 transition-all shadow-2xl shadow-sky-500/30 active:scale-95"
                    >
                        Publicar Partida
                    </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
