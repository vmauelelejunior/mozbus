"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowLeft, Bus, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

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
      setError(err.response?.data?.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <main className="min-h-screen hero-gradient flex items-center justify-center px-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass p-12 rounded-[50px] text-center space-y-6 max-w-sm">
                <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Conta Criada!</h2>
                <p className="opacity-60 text-sm font-medium">Obrigado por se juntar ao ecossistema MozBus. Você já pode fazer login.</p>
                <Link href="/auth/login" className="block w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                    Ir para o Login
                </Link>
            </motion.div>
        </main>
      )
  }

  return (
    <main className="min-h-screen hero-gradient flex items-center justify-center px-6 py-20 selection:bg-orange-500/30">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 opacity-50 hover:opacity-100 transition-all font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={16} /> Cancelar
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-lg p-12 rounded-[50px] shadow-3xl text-center space-y-10"
      >
        <div className="space-y-2">
           <h1 className="text-4xl font-black uppercase tracking-tighter">Crie sua <span className="text-orange-500">CONTA</span></h1>
           <p className="text-sm opacity-50 font-medium tracking-tight">Comece sua jornada pelo transporte digital.</p>
        </div>

        {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold">
                <AlertCircle size={16} />
                {error}
            </motion.div>
        )}

        <form onSubmit={handleRegister} className="grid md:grid-cols-2 gap-6 text-left">
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Nome Completo</label>
            <div className="relative group">
              <User className="absolute left-4 top-4 text-orange-500" size={18} />
              <input 
                required 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Como deseja ser chamado?" 
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition-all font-semibold" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-orange-500" size={18} />
              <input 
                required 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="seu@email.com" 
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition-all font-semibold" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Telefone</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-4 text-orange-500" size={18} />
              <input 
                required 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+258..." 
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition-all font-semibold" 
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Criar Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-orange-500" size={18} />
              <input 
                required 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Mínimo 8 caracteres" 
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 transition-all font-semibold" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-orange-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/30 disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="text-xs font-bold opacity-40 uppercase tracking-widest">
           Já é de casa? <Link href="/auth/login" className="text-orange-500 hover:underline">Faça Login</Link>
        </div>
      </motion.div>
    </main>
  );
}
