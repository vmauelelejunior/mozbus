'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Bus, CheckCircle, AlertCircle, Key, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: Token/New Password
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { identifier });
      setSuccess(res.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(res.data.message);
      setStep(3); // Final success state
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token inválido ou erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <main className="min-h-screen hero-gradient flex items-center justify-center px-6">
        <div className="glass p-10 rounded-[3rem] text-center space-y-6 max-w-sm">
          <div className="bg-green-500 w-14 h-14 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl">
            <CheckCircle size={24} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Senha Redefinida!</h2>
          <p className="opacity-60 text-sm font-medium">{success}</p>
          <Link href="/auth/login" className="block w-full bg-sky-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
            Voltar ao Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070709] flex items-center justify-center px-6 selection:bg-sky-500/30 overflow-hidden relative">
      <div className="aura-bg-main" />

      <Link href="/auth/login" className="absolute top-12 left-12 z-20 flex items-center gap-3 opacity-30 hover:opacity-100 hover:text-sky-400 transition-all font-black text-[10px] uppercase tracking-[0.3em]">
        <ArrowLeft size={16} /> Voltar ao Login
      </Link>

      <div className="relative z-10 w-full max-w-lg">
        <div className="card-aura bg-[#0D0D10]/40 backdrop-blur-3xl p-10 md:p-12 rounded-[40px] border border-white/10 space-y-10">
          <header className="text-center space-y-4">
             <div className="bg-sky-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(14,165,233,0.3)]">
                <Key size={32} strokeWidth={2.5} className="text-white" />
             </div>
             <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                  Recuperar <span className="text-sky-500">CONTA</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Protocolo de Restauro</p>
             </div>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestReset} 
                className="space-y-8"
              >
                <div className="space-y-2 group text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 block">E-mail ou Telefone Registado</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="exemplo@email.mz ou +258..." 
                      className="w-full bg-white/[0.02] border-b border-white/10 py-5 px-4 outline-none focus:border-sky-500/50 focus:bg-white/[0.04] transition-all font-bold text-base placeholder:opacity-10 rounded-t-xl"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-sky-400 shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <EliteLoader size={30} /> : 'Enviar Instruções'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword} 
                className="space-y-8"
              >
                <div className="bg-sky-500/5 border border-sky-500/10 p-5 rounded-2xl text-[10px] font-bold text-sky-400/80 leading-relaxed uppercase tracking-widest">
                  {success}
                </div>

                <div className="space-y-6 text-left">
                  <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 block">Código de Verificação</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="6 dígitos" 
                        className="w-full bg-white/[0.02] border-b border-white/10 py-5 px-4 outline-none focus:border-sky-500/50 focus:bg-white/[0.04] transition-all font-bold text-base placeholder:opacity-10 rounded-t-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 block">Nova Senha</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-white/[0.02] border-b border-white/10 py-5 px-4 outline-none focus:border-sky-500/50 focus:bg-white/[0.04] transition-all font-bold text-base placeholder:opacity-10 rounded-t-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-sky-400 shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <EliteLoader size={30} /> : 'Redefinir Senha'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

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
