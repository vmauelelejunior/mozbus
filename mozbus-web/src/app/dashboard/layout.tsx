"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Bus, Map, Calendar, Users, 
  Settings, LogOut, Bell, Search, Hexagon, 
  ShieldCheck, Zap, Compass, Activity, Menu, X, CreditCard, MessageCircle
} from 'lucide-react';
import NotificationPrompt from '@/components/NotificationPrompt';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import EliteLoader from '@/components/EliteLoader';
import { useToast } from '@/components/EliteToast';
import api from '@/lib/api';

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
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mozbus_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          if (parsedUser.role === 'PASSENGER') {
            router.push('/tickets/meus-bilhetes');
          } else {
            // Iniciar Polling de Mensagens
            fetchUnread(parsedUser);
            const interval = setInterval(() => fetchUnread(parsedUser), 10000);
            return () => clearInterval(interval);
          }
        } catch {
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [isMounted, router]);

  const fetchUnread = async (currentUser: any) => {
    try {
      const resCount = await api.get('/communication/unread');
      const resDetails = await api.get('/communication/unread-details');
      
      if (resCount.data > unreadCount) {
        const lastMsg = resDetails.data[0];
        toast(`Mensagem de ${lastMsg?.sender?.name}: "${lastMsg?.content?.substring(0, 30)}..."`, 'info');
      }
      
      setUnreadCount(resCount.data);
      setNotifications(resDetails.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      await api.patch(`/communication/read/${notification.id}`);
      setIsNotificationsOpen(false);
      fetchUnread(user);
      
      if (user?.role === 'SUPER_ADMIN') {
        router.push('/dashboard/companies');
      } else {
        router.push('/dashboard/messages');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'MB';
  };

  const allItems = [
    { icon: Compass, label: 'Market Intelligence', href: '/dashboard/overview', roles: ['SUPER_ADMIN'] },
    { icon: CreditCard, label: 'Gestão Financeira', href: '/dashboard/finance', roles: ['SUPER_ADMIN'] },
    { icon: Compass, label: 'Analytics', href: '/dashboard/overview', roles: ['COMPANY_ADMIN'] },
    { icon: Hexagon, label: 'Rede Global', href: '/dashboard/companies', roles: ['SUPER_ADMIN'] },
    { icon: Bus, label: 'Frota', href: '/dashboard/buses', roles: ['COMPANY_ADMIN'] },
    { icon: Map, label: 'Rotas', href: '/dashboard/routes', roles: ['COMPANY_ADMIN'] },
    { icon: Calendar, label: 'Logística', href: '/dashboard/trips', roles: ['COMPANY_ADMIN'] },
    { icon: Users, label: 'Staff Hub', href: '/dashboard/staff', roles: ['COMPANY_ADMIN'] },
    { icon: Activity, label: 'Operação de Campo', href: '/fiscal', roles: ['FISCAL'] },
    { icon: MessageCircle, label: 'Mensagens', href: '/dashboard/messages', roles: ['COMPANY_ADMIN'] },
    { icon: Settings, label: 'Configurações', href: '/settings', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'FISCAL'] },
  ];

  const menuItems = allItems.filter(item => user && item.roles.includes(user.role));

  if (!isMounted || loading || !user) return <EliteLoader />;

  return (
    <div className="min-h-screen bg-background text-slate-200 flex overflow-hidden selection:bg-sky-500/30 notranslate" translate="no">
      <div className="aura-bg-main" />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Ultra Absolute */}
      <aside className={`
        fixed xl:sticky top-0 h-screen z-[70] transition-transform duration-500 ease-in-out
        w-72 glass-aura border-r border-white/5 p-6 xl:p-10 flex flex-col justify-between
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
      `}>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-8 right-8 text-white/40 hover:text-white xl:hidden"
        >
          <X size={24} />
        </button>
        <div className="space-y-20">
          {/* Logo Elite */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="bg-sky-500 p-3 rounded-2xl text-black shadow-[0_15px_40px_rgba(14,165,233,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Bus size={22} strokeWidth={3} />
              </div>
            </div>
            <div>
              <span className="text-xl font-black uppercase tracking-tighter leading-none block text-white">
                MOZ<span className="text-sky-500">BUS</span>
              </span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-sky-500 transition-colors">Ultra Absolute</span>
            </div>
          </div>

          {/* Navigation System */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.label} href={item.href}>
                  <motion.div 
                    whileHover={{ x: 6 }}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all relative group
                    ${isActive 
                      ? 'bg-sky-500/10 text-white font-black border border-sky-500/30 shadow-[0_10px_30px_rgba(14,165,233,0.1)]' 
                      : 'text-white/10 hover:text-white/40 font-black'}`}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 3 : 1.5} className={isActive ? 'text-sky-500' : ''} />
                    <span className="text-[9px] tracking-[0.2em] uppercase">{item.label}</span>
                    {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-sky-500 rounded-full shadow-[0_0_10px_#0EA5E9]" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card Sidebar */}
         <div className="space-y-6">
              <div className="glass-aura p-4 flex items-center gap-4 border border-white/5 rounded-2xl">
                 <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 border border-sky-500/20">
                    <ShieldCheck size={20} />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Licença</p>
                    <p className="text-[9px] font-black uppercase tracking-widest truncate text-sky-500">Corporate Absolute</p>
                 </div>
              </div>

              <button 
                 onClick={handleLogout}
                 className="w-full flex items-center gap-4 px-5 py-4 text-white/10 hover:text-rose-500 font-black text-[9px] uppercase tracking-[0.3em] transition-all hover:bg-rose-500/5 rounded-xl group"
              >
                 <LogOut size={16} className="group-hover:rotate-12 transition-transform" /> Logout
              </button>
         </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col h-screen relative">
        {/* Superior Control Center */}
        <header className="px-6 xl:px-12 py-5 xl:py-8 flex justify-between items-center z-40 relative">
            <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="xl:hidden bg-white/5 p-2 rounded-lg border border-white/10 text-sky-500"
                >
                  <Menu size={20} />
                </button>
                <div className="relative group w-full md:w-[350px] hidden sm:block">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-sky-500 transition-colors" size={16} />
                   <input 
                     type="text" 
                     placeholder="BUSCAR NO ECOSSISTEMA..." 
                     className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-14 pr-8 outline-none focus:border-sky-500/50 focus:bg-black/60 transition-all font-black text-[8px] xl:text-[9px] tracking-[0.2em] uppercase placeholder:text-white/5 text-white"
                   />
                </div>
            </div>

            <div className="flex items-center gap-6 lg:gap-8">
               <div className="hidden md:flex items-center gap-3 bg-white/[0.03] px-4 py-2 rounded-lg border border-white/5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981] animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">GRID ESTÁVEL</span>
               </div>
               
               <div className="relative">
                 <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all border border-white/5 group"
                 >
                    <Bell size={18} className="text-white/30 group-hover:text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-sky-500 rounded-full shadow-[0_0_15px_#0EA5E9] border-2 border-background flex items-center justify-center text-[7px] font-black text-white">
                        {unreadCount}
                      </span>
                    )}
                 </button>

                 <AnimatePresence>
                   {isNotificationsOpen && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 glass-aura border border-white/10 rounded-3xl overflow-hidden z-[100] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
                     >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                           <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Central de Alertas</h5>
                           {unreadCount > 0 && <span className="text-[8px] font-black bg-sky-500 text-black px-2 py-0.5 rounded-full">{unreadCount} NOVOS</span>}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                           {notifications.length === 0 ? (
                             <div className="p-12 text-center space-y-4 opacity-20">
                                <Bell size={32} className="mx-auto" strokeWidth={1} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum alerta pendente</p>
                             </div>
                           ) : notifications.map((n, i) => (
                             <div 
                                key={i}
                                onClick={() => handleNotificationClick(n)}
                                className="p-6 border-b border-white/5 hover:bg-white/[0.05] cursor-pointer transition-all group"
                             >
                                <div className="flex justify-between items-start mb-2">
                                   <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">{n.sender?.name}</p>
                                   <span className="text-[7px] font-bold text-white/20">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-[11px] text-white/60 line-clamp-2 group-hover:text-white transition-colors leading-relaxed">
                                   {n.content}
                                </p>
                                {n.company && <p className="text-[7px] font-black text-white/10 uppercase mt-2 tracking-widest">{n.company.name}</p>}
                             </div>
                           ))}
                        </div>
                        {notifications.length > 0 && (
                          <button 
                            onClick={() => router.push(user?.role === 'SUPER_ADMIN' ? '/dashboard/companies' : '/dashboard/messages')}
                            className="w-full py-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white hover:bg-white/5 transition-all"
                          >
                            Ver Todo o Histórico
                          </button>
                        )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <div className="flex items-center gap-4 group cursor-pointer xl:pl-8 xl:border-l xl:border-white/10">
                  <div className="text-right hidden md:block">
                     <p className="text-[10px] font-black uppercase tracking-tighter text-white group-hover:text-sky-400 transition-colors">{user.name}</p>
                     <p className="text-[8px] text-sky-500 font-black uppercase tracking-[0.2em] mt-1">{roleLabels[user.role] || user.role}</p>
                  </div>
                  <div className="w-9 h-9 xl:w-11 xl:h-11 rounded-xl bg-gradient-to-tr from-sky-500/20 to-sky-500/40 p-0.5 group-hover:from-sky-500 group-hover:to-emerald-400 transition-all duration-700 relative shadow-2xl">
                     <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center font-black text-white text-[9px] xl:text-xs tracking-widest">
                       {getInitials(user.name)}
                     </div>
                     <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 border-2 border-background w-2.5 h-2.5 rounded-full shadow-lg"></div>
                  </div>
               </div>
            </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 xl:px-16 py-6 lg:py-8 custom-scrollbar relative z-10">
            {children}
        </div>
      </main>
    </div>
  );
}
