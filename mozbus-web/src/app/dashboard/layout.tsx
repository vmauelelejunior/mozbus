"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Bus, Map, Calendar, Users, Settings, LogOut, Bell, Search, Hexagon, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Director Geral',
  COMPANY_ADMIN: 'Gestor Operacional',
  FISCAL: 'Agente de Campo',
  PASSENGER: 'Cliente Premium',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mozbus_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          if (parsedUser.role === 'PASSENGER') {
            router.push('/tickets/meus-bilhetes');
          }
        } catch {
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'MB';
  };

  const allItems = [
    { icon: LayoutDashboard, label: 'Analytics', href: '/dashboard/overview', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'FISCAL'] },
    { icon: Bus, label: 'Frota', href: '/dashboard/buses', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    { icon: Map, label: 'Rotas', href: '/dashboard/routes', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    { icon: Calendar, label: 'Logística', href: '/dashboard/trips', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    { icon: Users, label: 'Staff', href: '/dashboard/staff', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    { icon: Zap, label: 'Validação', href: '/fiscal', roles: ['FISCAL', 'SUPER_ADMIN'] },
  ];

  const menuItems = allItems.filter(item => user && item.roles.includes(user.role));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      {/* Sidebar Aura Negra */}
      <aside className="w-80 bg-zinc-950/20 backdrop-blur-3xl border-r border-white/5 p-10 flex flex-col justify-between sticky top-0 h-screen z-50">
        <div className="space-y-16">
          {/* Logo Premium */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-[0_0_40px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform duration-500">
                <Bus size={24} strokeWidth={3} />
              </div>
              <div className="absolute -inset-2 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <span className="text-2xl font-black uppercase tracking-tighter leading-none block">
                MOZ<span className="text-orange-500">BUS</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">Connect Pro</span>
            </div>
          </div>

          {/* Navigation System */}
          <nav className="space-y-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.label} href={item.href}>
                  <motion.div 
                    whileHover={{ x: 8 }}
                    className={`flex items-center gap-4 px-6 py-5 rounded-[22px] transition-all relative group
                    ${isActive 
                      ? 'bg-orange-500 text-white shadow-2xl shadow-orange-500/20 font-black italic' 
                      : 'text-white/30 hover:text-white hover:bg-white/5 font-black uppercase'}`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
                    <span className="text-[10px] tracking-[0.3em] uppercase">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav-dot"
                        className="absolute right-6 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card Sidebar */}
        <div className="space-y-8">
             <div className="glass p-6 rounded-[35px] border border-white/5 bg-white/[0.02] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                   <ShieldCheck size={24} />
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Status Licença</p>
                   <p className="text-[10px] font-black uppercase tracking-widest truncate">Corporate Elite</p>
                </div>
             </div>

             <div className="pt-8 border-t border-white/5 space-y-4">
                 <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 text-red-500/50 hover:text-red-500 font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-red-500/5 rounded-2xl"
                 >
                    <LogOut size={18} /> Encerrar Sessão
                 </button>
             </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col h-screen relative">
        {/* Background Decorative Glow */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-orange-500/5 blur-[150px] -z-10 pointer-events-none"></div>
        
        {/* Superior Control Center */}
        <header className="px-16 py-10 flex justify-between items-center z-40 bg-transparent">
           <div className="relative group w-[500px]">
              <Search className="absolute left-6 top-5 text-white/10 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="PROCURAR NA REDE MOZBUS..." 
                className="w-full bg-white/[0.03] border border-white/5 rounded-[25px] py-5 pl-16 pr-6 outline-none focus:border-orange-500/30 transition-all font-black text-[11px] tracking-widest uppercase placeholder:opacity-20"
              />
           </div>

           <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">System Online</span>
              </div>
              
              <button className="relative bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                 <Bell size={22} />
                 <span className="absolute top-4 right-4 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,1)]"></span>
              </button>

              <div className="flex items-center gap-6 group cursor-pointer pl-6 border-l border-white/5">
                 <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-tighter italic">{user.name}</p>
                    <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest mt-1 opacity-60 italic">{roleLabels[user.role] || user.role}</p>
                 </div>
                 <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-white/5 to-white/10 p-0.5 group-hover:from-orange-500 group-hover:to-orange-400 transition-all duration-500 relative">
                    <div className="w-full h-full rounded-[20px] bg-[#050505] flex items-center justify-center font-black text-white text-lg italic tracking-widest overflow-hidden">
                      {getInitials(user.name)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-[#050505] w-5 h-5 rounded-full"></div>
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-y-auto px-16 py-8 custom-scrollbar">
            {children}
        </div>
      </main>
    </div>
  );
}
