"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowLeft, Bus, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
     name: '',
     email: '',
     phone: '',
     password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('mozbus_token', response.data.access_token);
      localStorage.setItem('mozbus_user', JSON.stringify(response.data.user));
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Erro ao realizar cadastro.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <main className="min-h-screen hero-gradient flex items-center justify-center px-6">
            <div className="glass p-8 rounded-2xl text-center space-y-5 max-w-xs border border-white/10">
                <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-[#0B0B0F] shadow-[0_15px_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={24} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Conta Criada!</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-relaxed">Unidade registada com sucesso no ecossistema MozBus.</p>
                <Link href="/auth/login" className="block w-full bg-sky-500 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-white transition-all">
                    Aceder à Consola
                </Link>
            </div>
        </main>
      )
  }

  return (
    <main className="min-h-screen bg-[#070709] flex items-center justify-center px-6 py-20 selection:bg-sky-500/30 overflow-x-hidden relative">
      <div className="aura-bg-main" />

      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-[9999] bg-[#070709]/95 backdrop-blur-3xl flex items-center justify-center"
        >
          <EliteLoader size={120} />
        </motion.div>
      )}

      <Link href="/auth/login" className="absolute top-12 left-12 z-20 flex items-center gap-3 opacity-30 hover:opacity-100 hover:text-sky-400 transition-all font-black text-[10px] uppercase tracking-[0.3em]">
        <ArrowLeft size={16} /> Voltar ao Login
      </Link>

      <div className="relative z-10 w-full max-w-lg">
        <div className="card-aura bg-[#0D0D10]/40 backdrop-blur-3xl p-8 md:p-10 rounded-2xl border border-white/10 space-y-8">
          <header className="text-center space-y-5">
             <div className="bg-sky-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-[0_15px_40px_rgba(14,165,233,0.3)]">
                <User size={24} strokeWidth={2.5} className="text-[#0B0B0F]" />
             </div>
             <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none italic text-white">
                  CRIAR <span className="text-sky-500">CONTA</span>
                </h1>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Protocolo de Recrutamento</p>
             </div>
          </header>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-xl flex items-center gap-4 text-rose-500 text-[10px] font-black uppercase tracking-widest"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 group md:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 ml-2 block">Identificação Nominal</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="NOME COMPLETO" 
                    className="w-full bg-black/40 border border-white/5 py-4 px-5 outline-none focus:border-sky-500/40 focus:bg-black/60 transition-all font-black text-sm placeholder:text-white/5 rounded-xl text-white tracking-tight"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 ml-2 block">E-mail Corporativo</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="EMAIL@MOZBUS.MZ" 
                    className="w-full bg-black/40 border border-white/5 py-4 px-5 outline-none focus:border-sky-500/40 focus:bg-black/60 transition-all font-black text-sm placeholder:text-white/5 rounded-xl text-white tracking-tight"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 ml-2 block">Contacto Móvel</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="84 000 0000" 
                    className="w-full bg-black/40 border border-white/5 py-4 px-5 outline-none focus:border-sky-500/40 focus:bg-black/60 transition-all font-black text-sm placeholder:text-white/5 rounded-xl text-white tracking-tight"
                  />
                </div>
              </div>

              <div className="space-y-2 group md:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 ml-2 block">Chave de Segurança</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full bg-black/40 border border-white/5 py-4 px-6 outline-none focus:border-sky-500/40 focus:bg-black/60 transition-all font-black text-sm placeholder:text-white/5 rounded-2xl text-white tracking-[0.4em]"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-sky-500 text-[#0B0B0F] rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-sky-400 shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn"
            >
              <span className="relative z-10">{loading ? 'Codificando Dados...' : 'Finalizar Cadastro'}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          <footer className="text-center pt-4 border-t border-white/5">
             <div className="flex items-center justify-center gap-4 opacity-20">
                <ShieldCheck size={14} />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Protocolo de Segurança Ativo</span>
             </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
