"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User, ShieldCheck, Clock, Zap } from 'lucide-react';
import api from '@/lib/api';
import EliteLoader from '@/components/EliteLoader';
import { useToast } from '@/components/EliteToast';

export default function CompanyMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('mozbus_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      fetchMessages(parsed.companyId);
      const interval = setInterval(() => fetchMessages(parsed.companyId), 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchMessages = async (companyId: string) => {
    try {
      const res = await api.get(`/communication/messages/${companyId}`);
      setMessages(res.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText || !user?.companyId) return;

    setIsSending(true);
    try {
      await api.post('/communication/send', {
        companyId: user.companyId,
        content: messageText
      });
      setMessageText('');
      fetchMessages(user.companyId);
      toast('Resposta enviada!', 'success');
    } catch (e) {
      toast('Falha ao enviar resposta.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <EliteLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 notranslate" translate="no">
      <div className="aura-bg-main" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-sky-500/50"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500">Canal Direct / Governança</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
            Directivas <span className="text-sky-500 glow-text">CEO</span>
          </h2>
          <p className="opacity-30 text-[9px] lg:text-[10px] font-bold mt-2 max-w-sm tracking-tight uppercase">
            Comunicação directa com o conselho administrativo da MozBus.
          </p>
        </motion.div>
      </div>

      {/* Chat Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-aura border border-white/5 rounded-[40px] overflow-hidden flex flex-col h-[600px] relative z-10"
      >
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
               <MessageCircle size={64} strokeWidth={1} />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhuma directiva recebida</p>
            </div>
          ) : messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender.role === 'SUPER_ADMIN' ? 'justify-start' : 'justify-end'}`}>
               <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[70%]">
                  <div className={`flex items-center gap-2 mb-1 ${m.sender.role === 'SUPER_ADMIN' ? 'flex-row' : 'flex-row-reverse'}`}>
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-30">{m.sender.name}</p>
                     {m.sender.role === 'SUPER_ADMIN' && <ShieldCheck size={12} className="text-sky-500" />}
                  </div>
                  <div className={`p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                    m.sender.role === 'SUPER_ADMIN' 
                    ? 'bg-white/5 border border-white/10 text-white rounded-tl-none' 
                    : 'bg-sky-500 text-black font-black rounded-tr-none shadow-[0_10px_30px_rgba(14,165,233,0.2)]'
                  }`}>
                    {m.content}
                  </div>
                  <p className={`text-[7px] font-bold opacity-20 uppercase tracking-widest ${m.sender.role === 'SUPER_ADMIN' ? 'text-left' : 'text-right'}`}>
                    {new Date(m.createdAt).toLocaleDateString()} • {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
               </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 lg:p-8 bg-black/40 border-t border-white/5">
           <form onSubmit={handleSend} className="relative">
              <textarea 
                required
                placeholder="Escreva a sua mensagem estratégica ou reporte para o CEO..."
                className="w-full h-24 bg-white/[0.03] border border-white/10 rounded-2xl p-6 pr-32 outline-none focus:border-sky-500/50 transition-all text-sm text-white resize-none"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isSending || !messageText}
                className="absolute bottom-6 right-6 bg-sky-500 text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-20 flex items-center gap-3 shadow-[0_10px_30px_rgba(14,165,233,0.3)]"
              >
                {isSending ? '...' : <><Send size={14} /> Enviar Mensagem</>}
              </button>
           </form>
        </div>
      </motion.div>

      {/* Advisory Note */}
      <div className="flex items-center gap-4 p-6 bg-sky-500/5 border border-sky-500/10 rounded-3xl opacity-60">
          <Zap size={20} className="text-sky-500 shrink-0" />
          <p className="text-[10px] font-bold text-sky-500/80 leading-relaxed uppercase tracking-wider">
             As comunicações neste canal são auditadas e representam directivas oficiais do conselho MozBus. Responda com clareza e precisão operacional.
          </p>
      </div>
    </div>
  );
}
