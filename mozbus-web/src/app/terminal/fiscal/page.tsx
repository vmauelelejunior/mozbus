"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    QrCode, CheckCircle, XCircle, Users, 
    Wifi, WifiOff, RefreshCw, Bus, ArrowLeft, 
    Search, Camera, ShieldCheck, Battery, 
    Signal, MapPin, Zap, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveManifest, validateTicketLocally, ManifestPassenger } from '@/lib/offline-store';

export default function FiscalScannerPage() {
    const [isOffline, setIsOffline] = useState(false);
    const [lastResult, setLastResult] = useState<{ success: boolean; message: string; passenger?: any } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [manifestCount, setManifestCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState(98);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsOffline(!navigator.onLine);
        window.addEventListener('online', () => setIsOffline(false));
        window.addEventListener('offline', () => setIsOffline(true));
        
        loadMockManifest();
        
        // Auto-focus logic for hardware scanners
        const focusInterval = setInterval(() => {
            if (inputRef.current && document.activeElement !== inputRef.current) {
                inputRef.current.focus();
            }
        }, 1000);

        return () => clearInterval(focusInterval);
    }, []);

    const loadMockManifest = async () => {
        const mockPassengers: ManifestPassenger[] = [
            { ticketId: 'T1', passengerName: 'António Mucavele', seatNumber: 5, qrCode: 'MOZ-12345', isValidated: false },
            { ticketId: 'T2', passengerName: 'Maria Chirindza', seatNumber: 12, qrCode: 'MOZ-67890', isValidated: false },
            { ticketId: 'T3', passengerName: 'José Langa', seatNumber: 22, qrCode: 'MOZ-55555', isValidated: false },
        ];
        await saveManifest('TRIP-LIVE', mockPassengers);
        setManifestCount(mockPassengers.length);
    };

    const handleManualScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        
        const result = await validateTicketLocally(searchQuery);
        setLastResult(result);
        setSearchQuery('');
        
        if (navigator.vibrate) {
            navigator.vibrate(result.success ? [100] : [200, 100, 200]);
        }

        setTimeout(() => setLastResult(null), 5000);
    };

    const syncData = async () => {
        setSyncing(true);
        await new Promise(r => setTimeout(r, 2000));
        setSyncing(false);
    };

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white relative flex flex-col font-sans overflow-hidden">
            {/* Ultra Background Aura */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/4 -right-1/4 w-[100%] h-[100%] bg-sky-500/10 blur-[150px] animate-pulse" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[100%] h-[100%] bg-emerald-500/5 blur-[150px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>
            
            {/* Status Bar - Mission Control Style */}
            <div className="px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex justify-between items-center z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Signal size={12} className={isOffline ? 'text-rose-500' : 'text-emerald-500'} />
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-60">
                            {isOffline ? 'OFF-GRID' : 'LTE-PREMIUM'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-sky-500" />
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-60 italic">Terminal Maputo</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Battery size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-60">{batteryLevel}%</span>
                    </div>
                    <div className="text-[10px] font-black tracking-widest uppercase opacity-60">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* Header Operacional */}
            <div className="p-6 flex justify-between items-center z-40 relative">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()} 
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
                           <ShieldCheck size={20} className="text-sky-500" /> 
                           FISCAL <span className="text-white/40 font-light">COMMAND</span>
                        </h1>
                        <p className="text-[8px] font-bold text-sky-500/60 tracking-[0.3em] uppercase">Viatura Operacional • #MB-042</p>
                    </div>
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={syncData}
                    disabled={syncing || isOffline}
                    className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/10 transition-all disabled:opacity-20"
                >
                    <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizar</span>
                </motion.button>
            </div>

            {/* Operação Central */}
            <div className="flex-1 p-6 space-y-8 max-w-lg mx-auto w-full z-40 relative">
                
                {/* Dashboard de Missão */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative overflow-hidden group">
                        <div className="absolute inset-0 bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors" />
                        <div className="relative p-6 border border-white/5 rounded-[32px] glass-aura">
                            <div className="flex justify-between items-start mb-4">
                               <Users size={20} className="text-sky-500" />
                               <span className="text-[8px] font-black uppercase opacity-30 italic">MANIFESTO</span>
                            </div>
                            <p className="text-3xl font-black tracking-tighter">{manifestCount}</p>
                            <p className="text-[10px] font-bold uppercase opacity-40 mt-1">Passageiros em Lista</p>
                            <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 w-[65%]" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="relative p-6 border border-white/5 rounded-[32px] glass-aura">
                            <div className="flex justify-between items-start mb-4">
                               <CheckCircle size={20} className="text-emerald-500" />
                               <span className="text-[8px] font-black uppercase opacity-30 italic">CHECK-IN</span>
                            </div>
                            <p className="text-3xl font-black tracking-tighter">18</p>
                            <p className="text-[10px] font-bold uppercase opacity-40 mt-1">Embarcados</p>
                            <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[45%]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input de Scanner Invisível / Hardware Optimized */}
                <div className="space-y-6">
                    <form onSubmit={handleManualScan} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-transparent to-sky-500/10 rounded-[32px] animate-pulse pointer-events-none" />
                        <input 
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="AGUARDANDO LEITURA..."
                            className="w-full bg-black/60 border border-white/10 focus:border-sky-500/50 p-8 rounded-[32px] text-center font-black tracking-[0.4em] uppercase text-sm outline-none transition-all placeholder:opacity-20 backdrop-blur-xl"
                        />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                            <Zap size={20} className="text-sky-500 animate-pulse" />
                        </div>
                    </form>

                    <button className="group relative w-full overflow-hidden rounded-[32px] p-[2px] transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500 animate-gradient-x" />
                        <div className="relative flex items-center justify-center gap-4 bg-black rounded-[30px] p-6 transition-all group-hover:bg-transparent">
                            <Camera size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[12px] font-black uppercase tracking-[0.5em]">Ativar Scanner Óptico</span>
                        </div>
                    </button>
                </div>

                {/* Visualizador de Resultados Elite */}
                <div className="min-h-[300px] relative">
                    <AnimatePresence mode="wait">
                        {lastResult ? (
                            <motion.div 
                                key="result"
                                initial={{ y: 20, opacity: 0, scale: 0.9 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -20, opacity: 0, scale: 0.9 }}
                                className={`h-full w-full rounded-[48px] p-10 flex flex-col items-center justify-center text-center space-y-8 shadow-2xl overflow-hidden relative ${
                                    lastResult.success ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.pattern.png')] opacity-10" />
                                
                                {lastResult.success ? (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white blur-3xl opacity-20 animate-pulse" />
                                        <CheckCircle size={100} strokeWidth={3} className="text-white relative z-10" />
                                    </div>
                                ) : (
                                    <XCircle size={100} strokeWidth={3} className="text-white animate-shake" />
                                )}
                                
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                                        {lastResult.message}
                                    </h2>
                                    {lastResult.passenger && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 space-y-3"
                                        >
                                            <p className="text-sm font-black uppercase tracking-[0.2em] bg-black/20 py-3 px-8 rounded-full inline-block border border-white/10">
                                                {lastResult.passenger.passengerName}
                                            </p>
                                            <div className="flex justify-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold opacity-60 uppercase">Assento</p>
                                                    <p className="text-xl font-black">#{lastResult.passenger.seatNumber}</p>
                                                </div>
                                                <div className="w-[1px] bg-white/20" />
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold opacity-60 uppercase">Estado</p>
                                                    <p className="text-xl font-black uppercase">Válido</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full w-full rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center space-y-6 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/5 transition-colors" />
                                <div className="relative">
                                    <Bus size={48} className="text-white opacity-10 group-hover:opacity-20 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-[12px] font-black uppercase tracking-[0.6em] opacity-20">Scanner Activo</p>
                                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-sky-500/40 italic">Aguardando Aproximação do Bilhete</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Rodapé Operacional de Elite */}
            <div className="p-8 text-center space-y-4 z-40 relative bg-black/40 backdrop-blur-xl border-t border-white/5">
                <div className="flex justify-center gap-10 opacity-30">
                    <div className="flex items-center gap-2 group cursor-help">
                        <Eye size={12} className="group-hover:text-sky-500 transition-colors" />
                        <span className="text-[9px] font-black uppercase tracking-widest">LOGS-LIVE</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-help">
                        <Zap size={12} className="group-hover:text-emerald-500 transition-colors" />
                        <span className="text-[9px] font-black uppercase tracking-widest">K-VAL-SEC</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-help">
                        <ShieldCheck size={12} className="group-hover:text-sky-500 transition-colors" />
                        <span className="text-[9px] font-black uppercase tracking-widest">ENCRYPTED</span>
                    </div>
                </div>
                <p className="text-[8px] font-black uppercase tracking-[0.5em] opacity-10">
                    SISTEMA DE FISCALIZAÇÃO MOZBUS • TOTAL AUTHORITY v6.0
                </p>
            </div>
        </main>
    );
}
