"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Lock, Save, X, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mozbus_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setFormData({
            ...formData,
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
          });
        } catch {
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
    }
    setLoading(false);
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/users/${user?.id}`, {
        name: formData.name,
        phone: formData.phone,
      });

      if (formData.newPassword) {
        await api.post('/users/change-password', {
          userId: user?.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }

      const updatedUser = { ...user, name: formData.name, phone: formData.phone };
      localStorage.setItem('mozbus_user', JSON.stringify(updatedUser));
      setUser(updatedUser as User);

      setSuccess(true);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao guardar alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black hero-gradient text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-8 py-16 space-y-10">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">
            DEFINIÇÕES <span className="text-orange-500 underline decoration-white/10">DA CONTA</span>
          </h2>
          <p className="opacity-50 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
            Garanta a integridade e segurança dos seus dados.
          </p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 p-4 rounded-2xl text-green-500 font-bold text-sm text-center"
          >
            Alterações guardadas com sucesso!
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 p-4 rounded-2xl text-red-500 font-bold text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[32px] p-8 border border-white/5 space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-500/20 p-3 rounded-2xl">
                <User size={24} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Dados Pessoais</h3>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 text-white/20" size={18} />
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 font-bold text-sm"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-white/20" size={18} />
                  <input
                    type="email"
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-sm opacity-50"
                    value={formData.email}
                  />
                </div>
                <p className="text-[10px] opacity-30 ml-1">O email não pode ser alterado.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">
                  Telemóvel
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-4 text-white/20" size={18} />
                  <input
                    type="tel"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/50 font-bold text-sm"
                    placeholder="+258 84 XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-[32px] p-8 border border-white/5 space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-500/20 p-3 rounded-2xl">
                <Lock size={24} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Alterar Palavra-passe</h3>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">
                  Palavra-passe Actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-white/20" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-orange-500/50 font-bold text-sm"
                    placeholder="••••••••"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-white/30 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">
                  Nova Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-white/20" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-orange-500/50 font-bold text-sm"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-white/30 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">
                  Confirmar Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-white/20" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-orange-500/50 font-bold text-sm"
                    placeholder="Confirmar nova palavra-passe"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/overview')}
              className="flex-1 bg-white/5 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <X size={18} /> Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Guardar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}