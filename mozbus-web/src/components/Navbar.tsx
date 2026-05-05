"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, User, LogOut, Ticket, LayoutDashboard, ChevronDown, ChevronRight, ShieldCheck, Zap, Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('mozbus_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user", e);
        }
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mozbus_token');
    localStorage.removeItem('mozbus_user');
    setUser(null);
    setIsMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { name: 'VIAGENS', href: '/trips/results' },
    { name: 'TERMINAL', href: '/terminal' },
    { name: 'FISCAL', href: '/terminal/fiscal' },
    { name: 'ECOSSISTEMA', href: '#' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className={`max-w-7xl mx-auto px-6 md:px-8 transition-all duration-500`}>
        <div className={`relative flex items-center justify-between px-6 py-3.5 rounded-[24px] border transition-all duration-500 ${scrolled ? 'bg-aura-surface/70 backdrop-blur-2xl border-aura-border shadow-xl' : 'bg-transparent border-transparent'}`}>
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-4 group">
              <motion.div 
                whileHover={{ rotate: -10, scale: 1.1 }}
                className="bg-sky-500 w-10 h-10 rounded-[14px] text-[#0B0B0F] flex items-center justify-center shadow-[0_10px_30px_rgba(14,165,233,0.3)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                <Bus size={20} strokeWidth={2.5} />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase italic leading-none">
                    MOZ<span className="text-sky-500">BUS</span>
                </span>
                <span className="text-[6px] font-black tracking-[0.6em] text-white/30 uppercase mt-1">Operational Core</span>
              </div>
            </Link>
            
            {/* Command HUD Navigation */}
            <div className="hidden lg:flex items-center gap-12">
              {navLinks.map((link) => (
                <Link 
                    key={link.name} 
                    href={link.href} 
                    className={`relative text-[10px] font-black uppercase tracking-[0.4em] transition-all group overflow-hidden py-2 ${pathname === link.href ? 'text-sky-500' : 'text-white/40 hover:text-white'}`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-sky-500 transition-transform duration-500 ${pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </Link>
              ))}
            </div>

            {/* Tactical Console (Auth/Profile) */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-6">
                  {/* Notifications */}
                  <button className="relative p-2 text-white/20 hover:text-sky-500 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  </button>

                  <div className="relative">
                    <motion.button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-5 py-2 rounded-[16px] border border-white/5 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/5 transition-colors" />
                        <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-sky-500 to-sky-700 p-[1px] shadow-lg relative z-10">
                            <div className="w-full h-full rounded-[11px] bg-black/40 flex items-center justify-center overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[8px] font-black text-sky-400">
                                        {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-left hidden xl:block relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-tight text-white/90 leading-none mb-1">{user.name.split(' ')[0]}</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                                <p className="text-[8px] font-black uppercase tracking-widest text-sky-500/60 leading-none">Status: Online</p>
                            </div>
                        </div>
                        <ChevronDown size={16} className={`text-white/20 group-hover:text-sky-500 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                        {isMenuOpen && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[-1]"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <motion.div 
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                                className="absolute right-0 mt-4 w-64 glass-aura rounded-[24px] shadow-[0_20px_60px_var(--aura-shadow)] p-3 overflow-hidden z-50 backdrop-blur-3xl"
                            >
                                <div className="p-6 mb-2 bg-aura-surface/50 rounded-[24px] border border-aura-border">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-aura-muted mb-2">Protocol ID</p>
                                    <p className="text-xs font-black text-aura-text italic truncate">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-sky-500/60 uppercase tracking-widest">
                                        <ShieldCheck size={12} />
                                        Verified Operator
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {user.role === 'PASSENGER' && (
                                        <Link href="/tickets/meus-bilhetes" onClick={() => setIsMenuOpen(false)}>
                                            <div className="flex items-center justify-between px-6 py-4 rounded-[20px] hover:bg-sky-500 hover:text-[#0B0B0F] transition-all group/item cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <Ticket size={16} strokeWidth={2.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Carteira Digital</span>
                                                </div>
                                                <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-all" />
                                            </div>
                                        </Link>
                                    )}
                                    
                                    {(user.role === 'COMPANY_ADMIN' || user.role === 'SUPER_ADMIN') && (
                                        <Link href="/dashboard/overview" onClick={() => setIsMenuOpen(false)}>
                                            <div className="flex items-center justify-between px-6 py-4 rounded-[20px] bg-sky-500/5 hover:bg-sky-500 text-sky-500 hover:text-[#0B0B0F] transition-all group/item cursor-pointer border border-sky-500/10">
                                                <div className="flex items-center gap-4">
                                                    <LayoutDashboard size={16} strokeWidth={2.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Dashboard Hub</span>
                                                </div>
                                                <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-all" />
                                            </div>
                                        </Link>
                                    )}

                                    <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                                        <div className="flex items-center gap-4 px-6 py-4 rounded-[20px] hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white">
                                            <User size={16} strokeWidth={2.5} />
                                            Configurações
                                        </div>
                                    </Link>

                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-[20px] hover:bg-rose-500/10 transition-all text-[10px] font-black uppercase tracking-widest text-rose-500/60 hover:text-rose-500"
                                    >
                                        <LogOut size={16} strokeWidth={2.5} />
                                        Terminar Sessão
                                    </button>
                                </div>
                            </motion.div>
                        </>
                        )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                    <Link href="/auth/register" className="hidden sm:block text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all px-4">
                        Registar
                    </Link>
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/auth/login')}
                        className="bg-white text-[#0B0B0F] px-6 py-3 rounded-[14px] font-black text-[9px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-sky-500 hover:text-white transition-all border border-white/20"
                    >
                        Aceder Consola
                    </motion.button>
                </div>
              )}
            </div>
        </div>
      </div>
    </nav>
  );
}
