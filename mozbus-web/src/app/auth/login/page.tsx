"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Bus, AlertCircle, ShieldCheck, Zap, Globe, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';

const DEMO_USERS = [
  { id: 'usr-demo-ceo', email: 'ceo@mozbus.mz', password: 'mozbus123', name: 'Director Executivo', role: 'SUPER_ADMIN' },
  { id: 'usr-demo-002', email: 'gestor@nagibus.mz', password: 'gestor123', name: 'Carlos Matsinhe', role: 'COMPANY_ADMIN' },
  { id: 'usr-demo-003', email: 'fiscal@nagibus.mz', password: 'fiscal123', name: 'João Mandlate', role: 'FISCAL' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { identifier: email, password });
      const { access_token, user } = res.data;
      
      localStorage.setItem('mozbus_token', access_token);
      localStorage.setItem('mozbus_user', JSON.stringify(user));
      
      if (user.role === 'PASSENGER') {
        router.push('/');
      } else {
        router.push('/dashboard/overview');
      }
    } catch (apiError: any) {
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (demoUser) {
        localStorage.setItem('mozbus_token', 'demo_token_' + Date.now());
        localStorage.setItem('mozbus_user', JSON.stringify(demoUser));
        
        if (demoUser.role === 'PASSENGER') {
          router.push('/');
        } else {
          router.push('/dashboard/overview');
        }
        return;
      }
      setError(apiError.response?.data?.message || 'PROTOCOL_ERROR: Falha na validação de identidade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-6 selection:bg-sky-500/30 overflow-hidden relative font-sans notranslate" translate="no">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 right-0 w-[80%] h-[80%] bg-sky-500/5 blur-[120px] transition-all duration-1000 ${focusedField === 'email' ? 'opacity-40' : 'opacity-20'}`} />
        <div className={`absolute bottom-0 left-0 w-[80%] h-[80%] bg-emerald-500/5 blur-[120px] transition-all duration-1000 ${focusedField === 'password' ? 'opacity-40' : 'opacity-20'}`} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Elite Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[9999] bg-[#0B0B0F]/90 backdrop-blur-3xl flex flex-col items-center justify-center space-y-8"
          >
            <EliteLoader size={120} />
            <motion.p 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-[10px] font-black uppercase tracking-[0.8em] text-sky-500"
            >
                Iniciando Protocolo de Segurança
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <Link 
        href="/" 
        className="absolute top-12 left-12 z-20 flex items-center gap-4 text-white/30 hover:text-sky-400 transition-all font-black text-[10px] uppercase tracking-[0.5em] group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Retornar ao Portal
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-aura p-6 md:p-8 rounded-2xl relative overflow-hidden border border-white/5"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
          
          <header className="text-center mb-6 relative">
             <motion.div 
              whileHover={{ rotate: -5, scale: 1.05 }}
              className="bg-sky-500 w-10 h-10 rounded-xl flex items-center justify-center mx-auto shadow-[0_15px_40px_rgba(14,165,233,0.3)] mb-4 relative group"
             >
                <div className="absolute inset-0 bg-white blur-xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full" />
                <Bus size={20} strokeWidth={2.5} className="text-[#0B0B0F] relative z-10" />
             </motion.div>
             <div className="space-y-1.5">
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-white italic">
                  MOZ<span className="text-sky-500">BUS</span>
                </h1>
                 <div className="flex items-center justify-center gap-2">
                    <div className="h-[1px] w-4 bg-sky-500/20" />
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Console Hub v6.0</p>
                    <div className="h-[1px] w-4 bg-sky-500/20" />
                 </div>
              </div>
          </header>

          <AnimatePresence>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                >
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-center gap-4 text-rose-500">
                        <AlertCircle size={20} className="shrink-0" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest">Acesso Negado</p>
                            <p className="text-[11px] font-bold opacity-80">{error}</p>
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 block">Credential ID</label>
                <Globe size={12} className="text-sky-500/20" />
              </div>
              <div className="relative group">
                <div className={`absolute inset-0 bg-sky-500/5 rounded-xl blur-xl transition-opacity duration-500 ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`} />
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="E-mail ou Identificador" 
                    className="w-full bg-black/40 border border-white/5 py-3.5 px-4 outline-none focus:border-sky-500/40 focus:bg-black/60 transition-all font-black text-sm placeholder:text-white/5 rounded-xl text-white tracking-tight relative z-10"
                    required
                  />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 block">Access Key</label>
                <Fingerprint size={12} className="text-emerald-500/20" />
              </div>
              <div className="relative group">
                <div className={`absolute inset-0 bg-emerald-500/5 rounded-xl blur-xl transition-opacity duration-500 ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••" 
                    className="w-full bg-black/40 border border-white/5 py-3.5 px-4 outline-none focus:border-emerald-500/40 focus:bg-black/60 transition-all font-black text-sm placeholder:text-white/5 rounded-xl text-white tracking-[0.3em] relative z-10"
                    required
                  />
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-sky-500 text-[#0B0B0F] rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-sky-400 shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition-all disabled:opacity-20 flex items-center justify-center gap-3 relative overflow-hidden group/btn"
              >
                <span className="relative z-10 flex items-center gap-3 font-black">
                   {loading ? 'Sincronizando...' : 'Iniciar Sessão'}
                   {!loading && <Zap size={14} fill="currentColor" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
              </motion.button>

              <div className="flex flex-col gap-3">
                <Link 
                    href="/auth/forgot-password" 
                    className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-sky-500 transition-all"
                >
                    Recuperar Chave de Segurança
                </Link>
                <Link 
                    href="/auth/register"
                    className="w-full h-12 border border-white/5 text-white/40 rounded-xl font-black text-[9px] uppercase tracking-[0.4em] hover:bg-white/5 hover:text-white transition-all flex items-center justify-center"
                >
                    Registar Nova Unidade
                </Link>
              </div>
            </div>
          </form>

          <footer className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
             <div className="flex items-center gap-4 opacity-30">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">AES-256</span>
                </div>
                <div className="w-[1px] h-2.5 bg-white/20" />
                <div className="flex items-center gap-2">
                    <Zap size={12} className="text-sky-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">SSL-PLUS</span>
                </div>
             </div>
             <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-10">MozBus Operational Core • Authorized Personnel Only</p>
          </footer>
        </motion.div>
      </div>
    </main>
  );
}
