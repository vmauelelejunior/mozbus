"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Bus, Download, Share2, CheckCircle, 
  CreditCard, Smartphone, ShieldCheck, 
  Loader2, ArrowRight, XCircle, AlertCircle
} from 'lucide-react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function TicketSuccessPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'invite' | 'loading' | 'success'>('invite');

  const fetchTicket = async () => {
      try {
          const res = await api.get(`/tickets/${id}`);
          setTicket(res.data);
          if (res.data.status === 'PAID') {
            setPaymentStep('success');
          }
      } catch (e) {
          console.error(e);
      }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleSimulatePayment = async () => {
    setPaying(true);
    setPaymentStep('loading');
    
    // Simular o tempo de resposta do celular do usuário (Push do M-Pesa)
    setTimeout(async () => {
        try {
            await api.post(`/tickets/${id}/pay`);
            await fetchTicket();
            setPaymentStep('success');
        } catch (e) {
            console.error(e);
            setPaymentStep('invite');
        } finally {
            setPaying(false);
        }
    }, 4000);
  };

  if (!ticket) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Bus size={48} className="animate-bounce text-orange-500" />
        <p className="font-black uppercase tracking-[0.3em] opacity-20">Verificando Bilhete...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-start">
            
            {/* Coluna Esquerda: O Status e Pagamento */}
            <div className="space-y-8">
                <AnimatePresence mode="wait">
                    {paymentStep === 'invite' && (
                        <motion.div 
                            key="invite"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-zinc-900 border border-white/5 p-10 rounded-[40px] space-y-8 shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
                                <CreditCard size={32} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black uppercase tracking-tighter">PAGAMENTO <span className="text-orange-500">PENDENTE</span></h1>
                                <p className="opacity-50 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                    Para confirmar a sua reserva no assento {ticket.seatNumber}, por favor efetue o pagamento via M-Pesa.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <Smartphone className="text-orange-500" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase opacity-40">Enviar Push para</p>
                                        <p className="font-bold">{ticket.passenger.phone || '84 XXX XXXX'}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-4">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-40">Total a Pagar</p>
                                    <p className="text-2xl font-black">{ticket.trip.price} MT</p>
                                </div>
                            </div>

                            <button 
                                onClick={handleSimulatePayment}
                                className="w-full bg-orange-500 hover:bg-orange-400 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                            >
                                Confirmar e Pagar <ArrowRight size={18} />
                            </button>

                            <div className="flex items-center justify-center gap-2 opacity-30">
                                <ShieldCheck size={14} />
                                <span className="text-[8px] font-bold uppercase tracking-widest">Pagamento Seguro via M-Pesa</span>
                            </div>
                        </motion.div>
                    )}

                    {paymentStep === 'loading' && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="bg-zinc-900 border border-white/5 p-12 rounded-[40px] text-center space-y-8 flex flex-col items-center justify-center min-h-[400px]"
                        >
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                                <Smartphone className="absolute inset-0 m-auto text-orange-500" size={32} />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Aguardando <span className="text-orange-500 uppercase">Confirmação</span></h2>
                                <p className="opacity-50 text-xs font-bold uppercase tracking-widest max-w-[250px] mx-auto leading-loose">
                                    Enviamos um pedido para o seu telemóvel. Por favor introduza o seu PIN do M-Pesa.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {paymentStep === 'success' && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="text-center md:text-left space-y-4">
                                <div className="bg-green-500 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/20 mb-6 mx-auto md:mx-0 rotate-3">
                                    <CheckCircle size={40} />
                                </div>
                                <h1 className="text-5xl font-black uppercase tracking-tighter italic">BOA <span className="text-orange-500">VIAGEM!</span></h1>
                                <p className="opacity-50 text-sm font-bold uppercase tracking-[0.2em]">O seu bilhete está ativo e pronto para uso.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="bg-white text-black p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-orange-500 hover:text-white transition-all group">
                                    <Download size={24} className="group-hover:translate-y-1 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Baixar PDF</span>
                                </button>
                                <button className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                    <Share2 size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Partilhar</span>
                                </button>
                            </div>

                            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl flex items-start gap-4">
                                <AlertCircle className="text-orange-500 shrink-0" size={20} />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-70">
                                    Apresente o QR Code no embarque. O seu fiscal fará o check-in através do bilhete digital.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Coluna Direita: O Bilhete Visual */}
            <div className="relative">
                <div className={`transition-all duration-700 ${paymentStep !== 'success' ? 'blur-xl grayscale opacity-30 scale-95 pointer-events-none' : 'blur-0 opacity-100 scale-100'}`}>
                    <motion.div 
                        layoutId="ticket-card"
                        className="bg-white text-black rounded-[48px] overflow-hidden shadow-[0_40px_80px_rgba(249,115,22,0.15)] relative"
                    >
                        {/* Corte Lateral */}
                        <div className="absolute top-[40%] -left-5 w-10 h-10 bg-black rounded-full shadow-inner"></div>
                        <div className="absolute top-[40%] -right-5 w-10 h-10 bg-black rounded-full shadow-inner"></div>
                        
                        {/* Topo Branding */}
                        <div className="bg-zinc-100 p-10 border-b-2 border-dashed border-zinc-200">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em]">Transportadora</p>
                                    <h2 className="text-2xl font-black italic">{ticket.trip.bus.company.name.toUpperCase()}</h2>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <Bus className="text-orange-500" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="p-10 space-y-10">
                            {/* Rota */}
                            <div className="flex justify-between items-center bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase opacity-30">ORIGEM</p>
                                    <p className="text-xl font-black">{ticket.trip.route.origin}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1 opacity-20">
                                    <div className="w-12 h-0.5 bg-black"></div>
                                    <Bus size={14} />
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-black uppercase opacity-30">DESTINO</p>
                                    <p className="text-xl font-black">{ticket.trip.route.destination}</p>
                                </div>
                            </div>

                            {/* Detalhes Extra */}
                            <div className="grid grid-cols-2 gap-8 px-2">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase opacity-30">PARTIDA</p>
                                    <p className="text-sm font-bold">{new Date(ticket.trip.departureTime).toLocaleDateString([], {day:'2-digit', month: 'short', year: 'numeric'})}</p>
                                    <p className="text-lg font-black text-orange-500">
                                        {new Date(ticket.trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-black uppercase opacity-30">ASSENTO</p>
                                    <p className="text-5xl font-black tracking-tighter">{ticket.seatNumber}</p>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="bg-zinc-100 rounded-[32px] p-8 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-zinc-200">
                                <div className="bg-white p-5 rounded-3xl shadow-md">
                                    <QRCodeSVG value={ticket.qrCode} size={160} level="H" includeMargin={true} />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em]">{ticket.qrCode}</p>
                                    <p className="text-[8px] font-bold uppercase opacity-40">Digital ID Validation</p>
                                </div>
                            </div>
                        </div>

                        {/* Rodapé Passageiro */}
                        <div className="bg-black text-white p-10 flex justify-between items-center">
                            <div>
                                <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mb-1">Passageiro</p>
                                <p className="text-md font-bold">{ticket.passenger.name}</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-green-500/20 text-green-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    Confirmado
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Overlay de Bloqueio de Pagamento */}
                {paymentStep !== 'success' && (
                    <div className="absolute inset-x-0 bottom-10 flex justify-center">
                         <div className="bg-white/10 backdrop-blur-md border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-3 animate-pulse">
                            <Smartphone className="text-orange-500" size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Aguarda Pagamento</span>
                         </div>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all">
                ← Voltar ao Início
            </Link>
            <div className="flex gap-6">
                <Link href="/tickets/meus-bilhetes" className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-orange-500 transition-colors">
                    Gerir Bilhetes
                </Link>
                <Link href="/settings" className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-orange-500 transition-colors">
                    Apoio ao Cliente
                </Link>
            </div>
        </div>
      </div>
    </main>
  );
}

  );
}
