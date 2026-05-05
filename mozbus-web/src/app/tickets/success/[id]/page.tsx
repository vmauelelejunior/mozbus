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
import TicketPrinter from '@/components/TicketPrinter';
import EliteLoader from '@/components/EliteLoader';
import { useToast } from '@/components/EliteToast';

export default function TicketSuccessPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'invite' | 'loading' | 'success'>('invite');
  const { toast } = useToast();

  const fetchTicket = async () => {
      try {
          const res = await api.get(`/tickets/${id}`);
          setTicket(res.data);
          // TEMPORARY BYPASS: Auto-success for printing module work
          setPaymentStep('success');
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

  const ticketRef = React.useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(ticketRef.current, { 
            quality: 0.95,
            backgroundColor: '#000000',
            style: {
                borderRadius: '0px' // Garantir que as bordas saiam perfeitas no ficheiro
            }
        });
        const link = document.createElement('a');
        link.download = `bilhete-mozbus-${id}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Erro ao baixar bilhete:', err);
        toast('Erro ao gerar imagem do bilhete. Tente usar a opção PDF.', 'error');
    } finally {
        setDownloading(false);
    }
  };

  if (!ticket) return <EliteLoader />;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-sky-500/30 notranslate" translate="no">
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
                            className="bg-zinc-900 border border-white/5 p-8 rounded-3xl space-y-6 shadow-2xl"
                        >
                            <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-500">
                                <CreditCard size={24} />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-black uppercase tracking-tighter">Pagamento <span className="text-sky-500">Pendente</span></h1>
                                <p className="opacity-50 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    Confirme a sua reserva no assento {ticket.seatNumber} via M-Pesa.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <Smartphone size={18} className="text-sky-500" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase opacity-40">Push para</p>
                                        <p className="text-xs font-bold">{ticket.passenger.phone || '84 XXX XXXX'}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Total</p>
                                    <p className="text-xl font-black">{ticket.trip.price} MT</p>
                                </div>
                            </div>

                            <button 
                                onClick={handleSimulatePayment}
                                className="w-full bg-sky-500 hover:bg-sky-400 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all shadow-xl shadow-sky-500/20 active:scale-95"
                            >
                                Confirmar e Pagar <ArrowRight size={14} />
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
                                <div className="w-24 h-24 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                                <Smartphone className="absolute inset-0 m-auto text-sky-500" size={32} />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Aguardando <span className="text-sky-500 uppercase">Confirmação</span></h2>
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
                            <div className="text-center md:text-left space-y-3">
                                <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/20 mb-4 mx-auto md:mx-0 rotate-3">
                                    <CheckCircle size={32} />
                                </div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Boa <span className="text-sky-500">Viagem!</span></h1>
                                <p className="opacity-50 text-[10px] font-bold uppercase tracking-[0.2em]">O seu bilhete está ativo.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={handleDownloadImage}
                                    disabled={downloading}
                                    className="bg-white text-black p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-sky-500 hover:text-white transition-all group disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Download size={20} className="group-hover:translate-y-1 transition-transform" />
                                    )}
                                    <span className="text-[9px] font-black uppercase tracking-widest">Baixar Imagem</span>
                                </button>
                                <button 
                                    onClick={() => window.print()}
                                    className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    <Share2 size={20} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Imprimir / PDF</span>
                                </button>
                            </div>

                            <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="text-sky-500 shrink-0" size={16} />
                                <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed opacity-70">
                                    Apresente o QR Code no embarque para check-in.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative print:hidden">
                <div 
                    ref={ticketRef}
                    className={`transition-all duration-700 ${paymentStep !== 'success' ? 'blur-xl grayscale opacity-30 scale-95 pointer-events-none' : 'blur-0 opacity-100 scale-100'}`}
                >
                    <motion.div 
                        layoutId="ticket-card"
                        className="bg-white text-black border-[1.5px] border-black p-6 md:p-8 relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] max-w-[400px] mx-auto"
                    >
                        {/* DIGITAL TWIN HEADER */}
                        <div className="flex justify-between items-start border-b border-zinc-200 pb-4 mb-6">
                            <div>
                                <h2 className="text-xl font-black italic tracking-tighter leading-none">MOZBUS<span className="text-zinc-400">ELITE</span></h2>
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-1.5">{ticket.trip.bus.company.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[7px] font-black uppercase tracking-widest text-zinc-300">Digital ID</p>
                                <p className="text-[10px] font-mono font-bold leading-none">#{ticket.qrCode.split('-')[1] || 'ELITE'}</p>
                            </div>
                        </div>

                        {/* CORE TRIP DATA */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-5">
                                <div>
                                    <p className="text-[7px] font-black uppercase text-zinc-400 tracking-widest mb-1">Destination</p>
                                    <p className="text-xl font-black uppercase leading-tight tracking-tight">{ticket.trip.route.destination}</p>
                                </div>
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-[7px] font-black uppercase text-zinc-400 tracking-widest mb-1">Date</p>
                                        <p className="text-xs font-black">{new Date(ticket.trip.departureTime).toLocaleDateString('pt-PT', {day:'2-digit', month: 'short'})}</p>
                                    </div>
                                    <div>
                                        <p className="text-[7px] font-black uppercase text-zinc-400 tracking-widest mb-1">Time</p>
                                        <p className="text-xs font-black">{new Date(ticket.trip.departureTime).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[7px] font-black uppercase text-zinc-400 tracking-widest mb-1">Passenger</p>
                                    <p className="text-[10px] font-bold uppercase truncate">{ticket.passenger.name}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-center border-l border-zinc-100 pl-8">
                                <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest mb-2">Seat</p>
                                <div className="text-7xl font-black italic tracking-tighter leading-none text-zinc-950">{ticket.seatNumber}</div>
                                <div className="mt-4 text-sm font-black text-zinc-900 border-t border-zinc-950 pt-1 w-full text-right">{ticket.amountPaid || ticket.trip.price} MT</div>
                            </div>
                        </div>

                        {/* FOOTER & QR */}
                        <div className="border-t border-dotted border-zinc-300 pt-6 flex items-end justify-between">
                            <div className="flex flex-col items-center">
                                <div className="border-[1.5px] border-black p-2 mb-2 bg-white">
                                    <QRCodeSVG value={ticket.qrCode} size={90} level="M" />
                                </div>
                                <span className="text-[7px] font-mono opacity-40 uppercase tracking-tighter">VERIFIED_ELITE_ID</span>
                            </div>
                            
                            <div className="text-right space-y-3">
                                <div className="flex items-center justify-end gap-1.5">
                                    <ShieldCheck size={12} className="text-zinc-300" />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-300">Secure Protocol</span>
                                </div>
                                <p className="text-[8px] font-black text-zinc-400 leading-tight max-w-[140px] italic">Apresente este bilhete digital no momento do embarque.</p>
                            </div>
                        </div>

                        {/* CROP MARKS */}
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-zinc-200"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-zinc-200"></div>
                        
                        {/* Overlay de Bloqueio de Pagamento */}
                        {paymentStep !== 'success' && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-12 h-12 rounded-full border-2 border-zinc-950 flex items-center justify-center mb-4">
                                    <Smartphone className="text-zinc-950" size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-950">Aguardando Confirmação M-Pesa</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            
            {/* O Bilhete para Impressão (Versão Papel/PDF) - Oculto no ecrã, Visível na impressão */}
            <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print-layer">
               <TicketPrinter ticket={ticket} />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-layer, .print-layer * {
                        visibility: visible;
                    }
                    .print-layer {
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                    @page { size: auto; margin: 0; }
                    body { background: white; }
                }
            `}} />
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all">
                ← Voltar ao Início
            </Link>
            <div className="flex gap-6">
                <Link href="/tickets/meus-bilhetes" className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-sky-500 transition-colors">
                    Gerir Bilhetes
                </Link>
                <Link href="/settings" className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-sky-500 transition-colors">
                    Apoio ao Cliente
                </Link>
            </div>
        </div>
      </div>
    </main>
  );
}
