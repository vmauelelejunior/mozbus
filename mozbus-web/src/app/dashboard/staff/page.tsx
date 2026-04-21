"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Search, X, Phone, Mail, Bus, Loader2, ShieldAlert, CheckCircle2, MoreHorizontal } from 'lucide-react';
import api from '@/lib/api';

interface Fiscal {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  company?: {
    id: string;
    name: string;
  };
  bus?: {
    id: string;
    plate: string;
    model: string;
  };
}

export default function StaffManagementPage() {
  const [fiscals, setFiscals] = useState<Fiscal[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFiscal, setSelectedFiscal] = useState<Fiscal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyId: '',
    busId: '',
    password: 'fiscal123',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('mozbus_user') || '{}');
      const companyId = storedUser.companyId || storedUser.companiesManaged?.[0]?.id;

      let usersRes;
      if (companyId) {
        usersRes = await api.get(`/users/company/${companyId}`);
      } else {
        usersRes = await api.get('/users');
      }

      const filteredFiscals = usersRes.data.filter((u: any) => u.role === 'FISCAL');
      setFiscals(filteredFiscals);

      const [companiesRes, busesRes] = await Promise.all([
        api.get('/companies'),
        companyId ? api.get(`/buses/company/${companyId}`) : api.get('/buses'),
      ]);
      setCompanies(companiesRes.data);
      setBuses(busesRes.data);

      if (companyId) {
        setFormData(prev => ({ ...prev, companyId }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        ...formData,
        role: 'FISCAL',
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyId: formData.companyId, // Manter o companyId
        busId: '',
        password: 'fiscal123',
      });
      fetchData();
      alert('Membro da equipa registado com sucesso!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao criar fiscal');
    }
  };

  const filteredFiscals = fiscals.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">EQUIPA DE <span className="text-orange-500">FISCAIS</span></h2>
          <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.3em] mt-3 uppercase">
            Gestão de Agentes de Campo e Verificação de Bilhetes.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95"
        >
          <UserPlus size={20} /> Adicionar Membro
        </button>
      </div>

      <div className="relative group max-w-lg">
        <Search className="absolute left-6 top-5 text-white/20 group-focus-within:text-orange-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="PESQUISAR POR NOME OU CÓDIGO..."
          className="w-full bg-white/5 border border-white/5 rounded-3xl py-5 pl-16 pr-6 outline-none focus:border-orange-500/30 transition-all font-black text-[11px] uppercase tracking-widest placeholder:opacity-20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center">
          <Loader2 size={40} className="animate-spin text-orange-500 opacity-20" />
        </div>
      ) : filteredFiscals.length === 0 ? (
        <div className="glass p-20 rounded-[45px] text-center opacity-30 border border-white/5">
          <Users size={64} className="mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest italic">Nenhum fiscal activo.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFiscals.map((fiscal) => (
            <motion.div
              key={fiscal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-10 rounded-[45px] space-y-8 group hover:border-orange-500/30 transition-all border border-white/5 relative overflow-hidden"
              onClick={() => setSelectedFiscal(fiscal)}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-white/5 to-white/10 p-0.5 group-hover:from-orange-500 group-hover:to-orange-400 transition-colors">
                  <div className="w-full h-full rounded-[22px] bg-zinc-900 flex items-center justify-center font-black text-white text-2xl italic">
                    {fiscal.name.slice(0, 1).toUpperCase()}
                  </div>
                </div>
                <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-lg border border-green-500/20 text-[8px] font-black uppercase tracking-widest">
                   Activo
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                   <h4 className="text-2xl font-black italic uppercase tracking-tighter">{fiscal.name}</h4>
                   <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-1">Nível: Fiscal de Campo</p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-3">
                    <Mail size={12} className="text-orange-500" /> {fiscal.email}
                  </p>
                  {fiscal.phone && (
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-3">
                      <Phone size={12} className="text-orange-500" /> {fiscal.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
                  <div className="space-y-1">
                     <p className="text-[8px] font-black uppercase opacity-30 tracking-widest uppercase">Empresa</p>
                     <p className="font-black text-xs italic">{fiscal.company?.name || '---'}</p>
                  </div>
                  {fiscal.bus && (
                    <div className="text-right space-y-1">
                       <p className="text-[8px] font-black uppercase opacity-30 tracking-widest uppercase">Atribuído a</p>
                       <p className="font-black text-xs italic flex items-center gap-2 justify-end">
                         <Bus size={12} className="text-orange-500" /> {fiscal.bus.plate}
                       </p>
                    </div>
                  )}
              </div>

              {/* Fundo Decorativo */}
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <Shield size={150} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-[60px] p-12 space-y-10 shadow-3xl"
            >
              <div className="flex justify-between items-center">
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic">NOVO <span className="text-orange-500">FISCAL</span></h3>
                   <p className="text-[10px] font-black uppercase opacity-30 tracking-widest mt-1">O acesso será enviado para o email registado.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-4 bg-white/5 rounded-2xl hover:text-orange-500 transition-all"
                >
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Nome Completo</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black italic text-sm uppercase"
                        placeholder="EX: ANSELMO RALPH"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Telemóvel</label>
                      <input
                        type="tel"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black text-sm"
                        placeholder="+258 8X XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Email Profissional</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black text-sm"
                    placeholder="agente@mozbus.mz"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Atribuir Bus</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-orange-500/50 font-black uppercase text-xs appearance-none"
                        value={formData.busId}
                        onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                      >
                        <option value="" className="bg-zinc-900">Nenhum Atribuído</option>
                        {buses.map((b) => (
                          <option key={b.id} value={b.id} className="bg-zinc-900">
                            {b.plate} - {b.model}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Password Inicial</label>
                       <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-black text-sm opacity-50">
                          {formData.password}
                       </div>
                    </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-orange-400 transition-all shadow-2xl shadow-orange-500/20 active:scale-95"
                >
                  Finalizar Registo
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedFiscal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[60px] p-12 space-y-12 shadow-3xl text-center"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedFiscal(null)}
                  className="p-4 bg-white/5 rounded-2xl hover:text-orange-500 transition-all"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="flex flex-col items-center space-y-8">
                <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-orange-500 to-yellow-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[38px] bg-zinc-900 flex items-center justify-center font-black text-orange-500 text-4xl italic">
                    {selectedFiscal.name.slice(0, 1).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter">{selectedFiscal.name}</h4>
                  <div className="flex items-center justify-center gap-3 bg-white/5 py-2 px-6 rounded-full border border-white/5">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">FISCAL VERIFICADO</p>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-[35px] border border-white/5">
                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 tracking-widest italic">Empresa</p>
                    <p className="font-black text-sm uppercase italic">{selectedFiscal.company?.name || 'Autónomo'}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[35px] border border-white/5">
                    <p className="text-[9px] font-black uppercase opacity-40 mb-2 tracking-widest italic">Viatura Atribuída</p>
                    <p className="font-black text-sm uppercase italic">{selectedFiscal.bus?.plate || 'Pendente'}</p>
                  </div>
                </div>

                <div className="w-full space-y-4 pt-4">
                   <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                      <Mail size={18} className="text-orange-500" />
                      <p className="font-black text-xs uppercase italic">{selectedFiscal.email}</p>
                   </div>
                   <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                      <Phone size={18} className="text-orange-500" />
                      <p className="font-black text-xs uppercase italic">{selectedFiscal.phone || 'Sem contacto'}</p>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  className="flex-1 bg-white/5 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all border border-white/5"
                >
                  Suspender Acesso
                </button>
                <button
                  onClick={() => setSelectedFiscal(null)}
                  className="flex-1 bg-orange-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20"
                >
                  Concluído
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}