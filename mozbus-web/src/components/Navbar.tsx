"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, User, LogOut, Ticket, LayoutDashboard, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('mozbus_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mozbus_token');
    localStorage.removeItem('mozbus_user');
    setUser(null);
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="w-full backdrop-blur-md sticky top-0 z-50 border-b border-white/5 bg-black/20">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/30"
          >
            <Bus size={20} />
          </motion.div>
          <span className="text-xl font-black tracking-tighter uppercase">
            Moz<span className="text-orange-500">Bus</span>
          </span>
        </Link>
        
        {/* Main Links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] opacity-40">
          <Link href="/trips/results" className="hover:text-orange-500 hover:opacity-100 transition-all">Viagens</Link>
          <Link href="/fiscal" className="hover:text-orange-500 hover:opacity-100 transition-all">Fiscal</Link>
          <a href="#" className="hover:text-orange-500 hover:opacity-100 transition-all">Empresas</a>
        </div>

        {/* User Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-2xl border border-white/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center text-[10px] font-black shadow-lg">
                  {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[9px] font-black uppercase opacity-30 leading-none mb-1">Acesso</p>
                  <p className="text-[11px] font-bold leading-none">{user.name.split(' ')[0]}</p>
                </div>
                <ChevronDown size={14} className={`opacity-20 group-hover:opacity-100 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 glass bg-[#0a0a0a]/90 border border-white/10 rounded-[24px] shadow-3xl p-3 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/5 mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Perfil Conectado</p>
                       <p className="text-xs font-bold mt-1 truncate">{user.email}</p>
                    </div>

                    <div className="space-y-1">
                      {user.role === 'PASSENGER' && (
                        <Link href="/tickets/meus-bilhetes" onClick={() => setIsMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest">
                            <Ticket size={16} className="text-orange-500" />
                            Meus Bilhetes
                          </div>
                        </Link>
                      )}
                      
                      {(user.role === 'COMPANY_ADMIN' || user.role === 'SUPER_ADMIN') && (
                        <Link href="/dashboard/overview" onClick={() => setIsMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest text-orange-500">
                            <LayoutDashboard size={16} />
                            Painel Gestão
                          </div>
                        </Link>
                      )}

                      <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest opacity-60">
                          <User size={16} />
                          Conta & Segurança
                        </div>
                      </Link>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-[11px] font-black uppercase tracking-widest text-red-500"
                      >
                        <LogOut size={16} />
                        Terminar Sessão
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/auth/login" className="bg-white text-black px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/20 shadow-xl hover:bg-orange-500 hover:text-white transition-all">
                Aceder
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
