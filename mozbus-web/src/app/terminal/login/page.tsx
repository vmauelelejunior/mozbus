'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, KeyRound, User, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EliteLoader from '@/components/EliteLoader';

export default function TerminalLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username, password })
      });

      if (!res.ok) throw new Error('Credenciais de Terminal Inválidas');

      const data = await res.json();
      localStorage.setItem('mozbus_token', data.access_token);
      localStorage.setItem('mozbus_user', JSON.stringify(data.user));
      
      // Dispatch storage event to update Navbar
      window.dispatchEvent(new Event('storage'));
      
      router.push('/terminal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elite Loading Overlay */}
      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-[9999] bg-black/90 backdrop-blur-3xl flex items-center justify-center"
        >
          <EliteLoader size={120} />
        </motion.div>
      )}

      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      
      <div 
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-10 rounded-[40px] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-sky-500 p-4 rounded-3xl shadow-[0_0_30px_rgba(14,165,233,0.5)] mb-6">
              <Bus className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-2 italic">Terminal Access</h1>
            <p className="text-white/30 text-sm font-bold uppercase tracking-[0.2em]">MozBus POS System v2.0</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest ml-1">Utilizador / ID Operador</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-sky-400 transition-colors" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ex: junta_op01"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/40 outline-none transition-all font-bold text-lg placeholder:text-white/5"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest ml-1">Código PIN / Password</label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-sky-400 transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/40 outline-none transition-all font-bold text-lg placeholder:text-white/5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-black text-center uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}

            <button 
              disabled={loading || !username || !password}
              className={`
                w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                ${(loading || !username || !password) 
                  ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5' 
                  : 'bg-white text-black hover:bg-sky-400 active:scale-95'}
              `}
            >
              <span className="relative z-10">{loading ? 'AUTENTICANDO...' : 'ACEDER AO TERMINAL'}</span>
              {!loading && <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />}
              {loading && <Loader2 className="w-6 h-6 animate-spin" />}
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
