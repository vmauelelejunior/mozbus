"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, Lock, Save, Globe, Bell, LogOut, 
  ChevronRight, Smartphone, Shield, Star, Languages, 
  CreditCard, Check, AlertCircle, X, Camera, MapPin,
  Clock, Activity, Zap, TrendingUp, ShieldCheck, Bus
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EliteLoader from '@/components/EliteLoader';
import { useToast } from '@/components/EliteToast';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
}

type Tab = 'profile' | 'security' | 'regional' | 'role_specific' | 'payments';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [fetchingTickets, setFetchingTickets] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    lang: 'PT-MZ',
    currency: 'MT',
    notifs: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    const loadUser = () => {
        const storedUser = localStorage.getItem('mozbus_user');
        const storedSettings = localStorage.getItem('mozbus_settings');

        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                const settings = storedSettings ? JSON.parse(storedSettings) : {};
                
                setFormData({
                    name: parsed.name || '',
                    phone: parsed.phone || '',
                    avatar: parsed.avatar || '',
                    lang: settings.lang || 'PT-MZ',
                    currency: settings.currency || 'MT',
                    notifs: settings.notifs ?? true
                });
            } catch (e) {
                router.push('/auth/login');
            }
        } else {
            router.push('/auth/login');
        }
        setLoading(false);
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'payments' && user) {
        fetchTickets();
    }
  }, [activeTab, user?.id]);

  const fetchTickets = async () => {
    if (!user) return;
    setFetchingTickets(true);
    try {
        const res = await api.get(`/tickets/user/${user.id}`);
        setTickets(res.data);
    } catch (e) {
        console.error('Erro ao carregar pagamentos:', e);
        toast('Falha ao carregar histórico de pagamentos.', 'error');
    } finally {
        setFetchingTickets(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (user) {
        const res = await api.patch(`/users/${user.id}`, {
          name: formData.name,
          phone: formData.phone,
          avatar: formData.avatar
        });

        const updatedUser = { ...user, ...res.data };
        localStorage.setItem('mozbus_user', JSON.stringify(updatedUser));
        localStorage.setItem('mozbus_settings', JSON.stringify({
          lang: formData.lang,
          currency: formData.currency,
          notifs: formData.notifs
        }));

        window.dispatchEvent(new Event('storage'));
        toast('Perfil actualizado com sucesso.', 'success');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassError('As novas palavras-passe não coincidem.');
      return;
    }

    setPassSaving(true);
    try {
      if (user) {
        await api.post('/users/change-password', {
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });

        setPassSuccess(true);
        toast('Palavra-passe alterada com sucesso.', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPassSuccess(false), 5000);
      }
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Falha ao alterar senha.');
    } finally {
      setPassSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Preview Optimista (Super Functional Skill)
    const localPreview = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, avatar: localPreview }));

    setSaving(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await api.post(`/users/avatar/upload/${user.id}`, formDataUpload);
      const updatedAvatarUrl = res.data.avatar;
      
      // Actualização Atómica e Final do Servidor
      setFormData(prev => ({ ...prev, avatar: updatedAvatarUrl }));
      
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, avatar: updatedAvatarUrl };
        localStorage.setItem('mozbus_user', JSON.stringify(updated));
        return updated;
      });

      // Notificar o ecossistema (Navbar, etc)
      window.dispatchEvent(new Event('storage'));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Falha no upload:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erro na comunicação';
      toast(`Falha no Perfil: ${errorMsg}`, 'error');
      setFormData(prev => ({ ...prev, avatar: user?.avatar || null }));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mozbus_user');
    localStorage.removeItem('mozbus_token');
    router.push('/');
  };

  if (loading) return <EliteLoader />;

  if (!user) return null;

  const getRoleLabel = (role: string) => {
    switch(role) {
        case 'SUPER_ADMIN': return 'Diretor Executivo (CEO)';
        case 'COMPANY_ADMIN': return 'Gestor de Frota';
        case 'FISCAL': return 'Agente de Fiscalização';
        default: return 'Passageiro Gold';
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-sky-500/30 overflow-x-hidden notranslate" translate="no">
      <div className="aura-bg-main" />
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 relative z-10">
        
        <header className="mb-8 space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                DEFINIÇÕES <span className="text-sky-500">DE ELITE</span>
            </h1>
            <p className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30 text-white/50">Intelligence Protocol v2.0</p>
        </header>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
            
            {/* SIDEBAR NAVIGATION */}
            <aside className="space-y-4 sticky top-28">
                <div className="card-aura p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl space-y-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-b from-sky-400 to-sky-900 shadow-[0_10px_30px_rgba(14,165,233,0.15)]">
                                <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt={user?.name || 'User'} className={`w-full h-full object-cover transition-all duration-500 ${saving ? 'blur-sm scale-95 opacity-50' : 'group-hover:scale-110'}`} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                            <UserIcon size={40} className="opacity-20" />
                                        </div>
                                    )}
                                    
                                    {saving && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}

                                    {!saving && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center shadow-xl">
                                <ShieldCheck size={16} className="text-black" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">{user.name}</h2>
                            <p className="text-[8px] font-black uppercase tracking-widest text-sky-500 mt-0.5">{getRoleLabel(user.role)}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'profile', label: 'Dados de Perfil', icon: UserIcon },
                            { id: 'security', label: 'Segurança', icon: Shield },
                            { id: 'payments', label: 'Pagamentos', icon: CreditCard },
                            { id: 'regional', label: 'Regional', icon: Globe },
                            { id: 'role_specific', label: user.role === 'PASSENGER' ? 'Painel MozBus' : 'Painel Gestão', icon: Activity }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as Tab)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all font-black text-[8px] uppercase tracking-widest ${activeTab === item.id ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/10' : 'hover:bg-white/5 opacity-40 hover:opacity-100'}`}
                            >
                                <item.icon size={14} strokeWidth={2.5} />
                                {item.label}
                                {activeTab === item.id && <motion.div layoutId="nav-pill" className="ml-auto w-1 h-1 bg-black rounded-full" />}
                            </button>
                        ))}
                    </nav>

                    <button 
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg text-rose-500 font-black text-[8px] uppercase tracking-widest hover:bg-rose-500/10 transition-all opacity-60 hover:opacity-100"
                    >
                        <LogOut size={12} /> Encerrar Sessão
                    </button>
                </div>

                {/* STATS PREVIEW (Role Specific) */}
                <div className="card-aura p-5 rounded-[28px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <Activity className="text-sky-500" size={14} />
                        <h3 className="text-[8px] font-black uppercase tracking-widest">Actividade Recente</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-40">
                            <span>Último Acesso</span>
                            <span className="text-white">Hoje, 22:15</span>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                            <span className="text-sky-500">Estado</span>
                            <span className="flex items-center gap-2 text-green-500">
                                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                Encriptado
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="space-y-12 pb-32">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <section className="card-aura p-6 md:p-8 rounded-[28px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl space-y-5">
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Dados do <span className="text-sky-500">Utilizador</span></h3>
                                    <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 text-white/50">Identity Module</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 block group-focus-within:text-sky-500 transition-colors">Nome Completo</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-2.5 px-4 rounded-xl outline-none focus:border-sky-500/50 focus:bg-white/[0.05] transition-all font-bold text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 block group-focus-within:text-sky-500 transition-colors">Contacto Móvel</label>
                                        <div className="relative">
                                            < Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={14} />
                                            <input 
                                                type="tel" 
                                                value={formData.phone}
                                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/10 py-2.5 pl-12 pr-5 rounded-xl outline-none focus:border-sky-500/50 focus:bg-white/[0.05] transition-all font-bold text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[7px] font-black uppercase tracking-[0.3em] ml-1 block">E-mail</label>
                                        <div className="relative">
                                            <X className="absolute right-5 top-1/2 -translate-y-1/2 text-rose-500/40" size={12} />
                                            <input 
                                                type="email" 
                                                disabled 
                                                value={user.email}
                                                className="w-full bg-white/[0.03] border border-white/10 py-3 px-5 rounded-xl cursor-not-allowed font-bold text-xs opacity-50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col md:flex-row gap-3">
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-sky-500 text-black h-12 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 group"
                                    >
                                        {saving ? 'Saving...' : <><Save size={14} /> Update Core</>}
                                    </button>
                                    <div className={`px-6 h-12 rounded-xl flex items-center justify-center border border-white/5 bg-white/[0.02] transition-all duration-500 ${success ? 'opacity-100 translate-y-0 text-green-500' : 'opacity-0 translate-y-2'}`}>
                                        <Check className="mr-2" size={14} /> <span className="text-[8px] font-black uppercase tracking-widest">Synced</span>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <section className="card-aura p-6 md:p-8 rounded-[28px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl space-y-5">
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Cofre de <span className="text-sky-500">Segurança</span></h3>
                                    <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 text-white/50">Security Protocols</p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 block">Senha Actual</label>
                                        <input 
                                            type="password" 
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-5 rounded-xl outline-none focus:border-sky-500/50 transition-all font-bold text-xs"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 block">Nova Senha</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={passwordData.newPassword}
                                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/10 py-3 px-5 rounded-xl outline-none focus:border-sky-500/50 transition-all font-bold text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 ml-1 block">Confirmar</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/10 py-3 px-5 rounded-xl outline-none focus:border-sky-500/50 transition-all font-bold text-xs"
                                            />
                                        </div>
                                    </div>

                                    {passError && <p className="text-rose-500 text-[8px] font-black uppercase tracking-widest">{passError}</p>}
                                    {passSuccess && <p className="text-green-500 text-[8px] font-black uppercase tracking-widest">Protocol updated.</p>}

                                    <button 
                                        type="submit"
                                        disabled={passSaving}
                                        className="w-full bg-white text-black h-12 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-sky-500 hover:text-white transition-all active:scale-95 disabled:opacity-20"
                                    >
                                        {passSaving ? 'Processing...' : 'Synchronize Credentials'}
                                    </button>
                                </form>
                            </section>

                            {/* DEVICE MANAGEMENT MOCK */}
                            <section className="card-aura p-5 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-5 grayscale hover:grayscale-0 transition-all duration-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="text-sky-500" size={18} />
                                        <h3 className="text-base font-black uppercase tracking-tighter italic">Dispositivos <span className="opacity-30">Conectados</span></h3>
                                    </div>
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-[6px] font-black uppercase tracking-widest opacity-40">2 Activos</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-500">
                                                <Smartphone size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">iPhone 15 Pro Max</p>
                                                <p className="text-[8px] font-bold opacity-30 uppercase">Maputo, MZ • Esta Sessão</p>
                                            </div>
                                        </div>
                                        <span className="text-green-500 text-[8px] font-black uppercase tracking-[0.2em]">Online</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl opacity-40">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                                <Globe size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">MacBook Pro M3</p>
                                                <p className="text-[8px] font-bold opacity-30 uppercase">Beira, MZ • Há 2 dias</p>
                                            </div>
                                        </div>
                                        <button className="text-rose-500 text-[8px] font-black uppercase tracking-[0.2em] hover:underline">Revogar</button>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'regional' && (
                        <motion.div
                            key="regional"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-10"
                        >
                            <section className="card-aura p-6 rounded-[32px] border border-white/5 bg-white/[0.01] space-y-6">
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Regional & <span className="text-sky-500">Global</span></h3>
                                    <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 text-white/50">Localização e Unidades</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 ml-2">Idioma de Sistema</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.lang}
                                                onChange={e => setFormData({...formData, lang: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/10 py-3 px-5 rounded-xl outline-none appearance-none font-bold uppercase text-[10px] tracking-widest cursor-pointer"
                                            >
                                                <option value="PT-MZ">Português (MZ)</option>
                                                <option value="EN-US">English (US)</option>
                                            </select>
                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 opacity-20" size={14} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 ml-2">Moeda de Pagamento</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.currency}
                                                onChange={e => setFormData({...formData, currency: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/10 py-3 px-5 rounded-xl outline-none appearance-none font-bold uppercase text-[10px] tracking-widest cursor-pointer"
                                            >
                                                <option value="MT">Metical (MZN)</option>
                                                <option value="USD">Dólar (USD)</option>
                                                <option value="ZAR">Rand (ZAR)</option>
                                            </select>
                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 opacity-20" size={14} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.notifs ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20' : 'bg-white/5 opacity-20'}`}>
                                                <Bell size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Notificações Push</p>
                                                <p className="text-[7px] font-bold opacity-30 uppercase">Alertas de viagem</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setFormData({...formData, notifs: !formData.notifs})}
                                            className={`w-10 h-6 rounded-full p-1 transition-all duration-500 ${formData.notifs ? 'bg-sky-500' : 'bg-white/10'}`}
                                        >
                                            <motion.div animate={{ x: formData.notifs ? 16 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-lg" />
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'role_specific' && (
                        <motion.div
                            key="role"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="space-y-10"
                        >
                            {/* PASSENGER VIEW */}
                            {user.role === 'PASSENGER' && (
                                <section className="card-aura p-6 rounded-[32px] border border-white/5 bg-white/[0.01] space-y-6">
                                    <div className="space-y-0.5">
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Painel do <span className="text-sky-500">Passageiro</span></h3>
                                        <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 text-white/50">Status de Fidelidade</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-sky-500 p-4 rounded-2xl text-black space-y-2">
                                            <Star size={18} />
                                            <div>
                                                <p className="text-[7px] font-black uppercase tracking-widest opacity-60">Pontos</p>
                                                <p className="text-xl font-black tracking-tighter">2,450</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl space-y-2">
                                            <TrendingUp className="text-sky-500" size={18} />
                                            <div>
                                                <p className="text-[7px] font-black uppercase tracking-widest opacity-40">Viagens</p>
                                                <p className="text-xl font-black tracking-tighter">14</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl space-y-2">
                                            <Clock className="text-sky-500" size={18} />
                                            <div>
                                                <p className="text-[7px] font-black uppercase tracking-widest opacity-40">Horas</p>
                                                <p className="text-xl font-black tracking-tighter">128h</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border border-white/5 bg-gradient-to-r from-sky-500/10 to-transparent rounded-2xl flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className="text-[10px] font-black uppercase tracking-tighter">Vantagens <span className="text-sky-500">Gold Member</span></h4>
                                            <p className="text-[7px] font-bold uppercase opacity-30 tracking-widest">Embarque Prioritário • 10% OFF</p>
                                        </div>
                                        <Zap className="text-sky-500 animate-pulse" size={20} />
                                    </div>
                                </section>
                            )}

                            {/* COMPANY ADMIN VIEW */}
                            {user.role === 'COMPANY_ADMIN' && (
                                <section className="card-aura p-6 rounded-[32px] border border-white/5 bg-white/[0.01] space-y-6">
                                    <div className="space-y-0.5">
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Gestão da <span className="text-sky-500">Frota</span></h3>
                                        <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 text-white/50">Operações & Staff</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <button className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-3 hover:bg-sky-500 hover:text-black transition-all group">
                                            <div className="w-10 h-10 bg-sky-500/20 group-hover:bg-black/10 rounded-xl flex items-center justify-center transition-colors">
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tighter">Gerir Fiscais</p>
                                                <p className="text-[7px] font-bold uppercase opacity-40 group-hover:opacity-60">Controlar acessos</p>
                                            </div>
                                        </button>
                                        <button className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-3 hover:bg-sky-500 hover:text-black transition-all group">
                                            <div className="w-10 h-10 bg-sky-500/20 group-hover:bg-black/10 rounded-xl flex items-center justify-center transition-colors">
                                                <Bus size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tighter">Frota Ativa</p>
                                                <p className="text-[7px] font-bold uppercase opacity-40 group-hover:opacity-60">Estado mecânico</p>
                                            </div>
                                        </button>
                                    </div>
                                </section>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'payments' && (
                        <motion.div
                            key="payments"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <section className="card-aura p-6 md:p-8 rounded-[28px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl space-y-5">
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Histórico de <span className="text-sky-500">Pagamentos</span></h3>
                                    <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30 text-white/50">Financial Ledger</p>
                                </div>

                                {fetchingTickets ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-3 opacity-30">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <p className="text-[8px] font-black uppercase tracking-widest">Retrieving transactions...</p>
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                                        <CreditCard size={24} className="mx-auto mb-3 opacity-10" />
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30">No transaction records</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {tickets.map((ticket) => (
                                            <div key={ticket.id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all">
                                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ticket.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                        <Bus size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">{ticket.trip.route.origin} → {ticket.trip.route.destination}</p>
                                                        <p className="text-[11px] font-black uppercase tracking-tighter">{new Date(ticket.trip.departureTime).toLocaleDateString('pt-PT', {day:'2-digit', month:'short'})}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0">
                                                    <div className="text-right">
                                                        <p className="text-[5px] font-black uppercase tracking-widest opacity-30 mb-0.5">Value</p>
                                                        <p className="text-sm font-black italic">{ticket.amountPaid || ticket.trip.price} <span className="text-[7px] not-italic opacity-40">MT</span></p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`px-2 py-0.5 rounded-full text-[5px] font-black uppercase tracking-widest ${ticket.status === 'PAID' ? 'bg-green-500 text-black' : 'bg-amber-500/20 text-amber-500'}`}>
                                                            {ticket.status === 'PAID' ? 'Settled' : 'Pending'}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => router.push(`/tickets/success/${ticket.id}`)}
                                                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-sky-500 hover:text-black transition-all"
                                                    >
                                                        <ChevronRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* PAYMENT METHODS MOCK */}
                             <section className="card-aura p-5 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-5">
                                 <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <Smartphone className="text-sky-500" size={18} />
                                         <h3 className="text-base font-black uppercase tracking-tighter italic">Carteiras <span className="opacity-30">Móveis</span></h3>
                                     </div>
                                     <button className="bg-sky-500 text-black px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all">+ Add</button>
                                 </div>
                                 <div className="grid md:grid-cols-2 gap-3">
                                     <div className="p-3.5 bg-gradient-to-br from-red-600/20 to-transparent border border-white/5 rounded-xl flex items-center justify-between group cursor-pointer hover:border-red-500/30 transition-all">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black italic text-xs text-white">M</div>
                                             <div>
                                                 <p className="text-[9px] font-black uppercase tracking-widest">M-Pesa</p>
                                                 <p className="text-[6px] font-bold opacity-30 uppercase">84XXXXXXX</p>
                                             </div>
                                         </div>
                                         <div className="w-4 h-4 rounded-full border border-red-500 flex items-center justify-center">
                                             <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                         </div>
                                     </div>
                                     <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between opacity-40 grayscale group cursor-not-allowed">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/50 font-black italic text-xs">m</div>
                                             <div>
                                                 <p className="text-[9px] font-black uppercase tracking-widest">m-Kesh</p>
                                                 <p className="text-[6px] font-bold opacity-30 uppercase">N/A</p>
                                             </div>
                                         </div>
                                         <div className="w-4 h-4 rounded-full border border-white/10" />
                                     </div>
                                 </div>
                             </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </main>

      {/* MODAL DE LOGOUT */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-zinc-900 border border-white/10 p-8 rounded-[32px] max-w-sm text-center space-y-6">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={24} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Sair Agora?</h3>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Sua sessão será encerrada com segurança.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowLogoutConfirm(false)} className="h-10 rounded-xl bg-white/5 font-black uppercase text-[8px] tracking-widest">Voltar</button>
                    <button onClick={handleLogout} className="h-10 rounded-xl bg-rose-600 font-black uppercase text-[8px] tracking-widest shadow-lg shadow-rose-600/10">Confirmar</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
