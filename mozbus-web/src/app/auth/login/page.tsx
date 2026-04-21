"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Bus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const DEMO_USERS = [
  { email: 'passageiro@mozbus.mz', password: 'passageiro123', name: 'Maria Sousa', role: 'PASSENGER' },
  { email: 'gestor@nagibus.mz', password: 'gestor123', name: 'Carlos Matsinhe', role: 'COMPANY_ADMIN' },
  { email: 'fiscal@nagibus.mz', password: 'fiscal123', name: 'João Mandlate', role: 'FISCAL' },
  { email: 'admin@mozbus.mz', password: 'admin123', name: 'Admin MozBus', role: 'SUPER_ADMIN' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try real API first
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      
      // Save token and user
      localStorage.setItem('mozbus_token', access_token);
      localStorage.setItem('mozbus_user', JSON.stringify(user));
      
      // Redirect based on role
      if (user.role === 'PASSENGER') {
        router.push('/');
      } else {
        router.push('/dashboard/overview');
      }
    } catch (apiError: any) {
      // If API fails, try demo mode
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
      setError(apiError.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 selection:bg-orange-500/30 overflow-hidden relative">
      {/* Background Silhouette Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-5">
         <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
         >
            <Bus size={800} strokeWidth={0.5} className="text-orange-500" />
         </motion.div>
      </div>

      <Link href="/" className="absolute top-12 left-12 z-20 flex items-center gap-3 opacity-30 hover:opacity-100 hover:text-orange-500 transition-all font-black text-[10px] uppercase tracking-[0.3em]">
        <ArrowLeft size={16} /> Voltar ao Início
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass bg-white/[0.02] p-12 md:p-20 rounded-[80px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/5 space-y-12">
          
          <header className="text-center space-y-6">
             <motion.div 
              whileHover={{ rotate: -5, scale: 1.1 }}
              className="bg-orange-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(249,115,22,0.3)]"
             >
                <Bus size={40} strokeWidth={2.5} />
             </motion.div>
             <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
                  MOZ<span className="text-orange-500">BUS</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">A Elite do Transporte</p>
             </div>
          </header>

          {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-widest"
              >
                  <AlertCircle size={18} />
                  {error}
              </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-2 group">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20 ml-1 block">Identificação (E-mail)</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail..." 
                  className="w-full bg-transparent border-b-2 border-white/5 py-4 outline-none focus:border-orange-500 transition-all font-bold text-lg placeholder:opacity-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-end">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20 ml-1 block">Acesso (Senha)</label>
                <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20 hover:opacity-100 hover:text-orange-500 transition-all">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-transparent border-b-2 border-white/5 py-4 outline-none focus:border-orange-500 transition-all font-bold text-lg placeholder:opacity-10"
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-20 bg-orange-500 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.5em] hover:bg-orange-400 hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-20 flex items-center justify-center gap-4 relative overflow-hidden group/btn"
              >
                <span className="relative z-10">{loading ? 'Autenticando...' : 'Entrar na Conta'}</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
              </button>
            </div>
          </form>

          <footer className="text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">
               Ainda não tem conta? <Link href="/auth/register" className="text-orange-500 hover:opacity-80 transition-opacity">Criar Cadastro</Link>
             </p>
          </footer>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 blur-[120px] -z-10"></div>
      </motion.div>
    </main>
  );
}
