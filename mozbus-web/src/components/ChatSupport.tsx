'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    body: {
      user: user,
      token: token
    },
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text' as const, text: 'Olá! Sou a Lumiana, assistente virtual da MozBus 👋. Como posso ajudá-lo(a) hoje com as suas viagens?' }],
      },
    ] as UIMessage[],
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar histórico do localStorage ao montar
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('mozbus_chat_history');
    if (saved) {
      try {
        const storedUser = localStorage.getItem('mozbus_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        const storedToken = localStorage.getItem('mozbus_token');
        if (storedToken) {
          setToken(storedToken);
        }
        const lowerSaved = saved.toLowerCase();
        if (lowerSaved.includes('lúcia') || lowerSaved.includes('lucia')) {
          localStorage.removeItem('mozbus_chat_history');
          return;
        }
        
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }
  }, [setMessages]);

  // Salvar no localStorage com debounce para evitar travar a thread principal
  useEffect(() => {
    if (mounted && messages.length > 0) {
      const timeout = setTimeout(() => {
        localStorage.setItem('mozbus_chat_history', JSON.stringify(messages));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [messages, mounted]);

  const handleQuickAction = (text: string) => {
    if (isLoading) return;
    sendMessage({ text });
  };

  const handleClearHistory = () => {
    localStorage.removeItem('mozbus_chat_history');
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Olá! Sou a Lumiana, assistente virtual da MozBus 👋. Como posso ajudá-lo(a) hoje com as suas viagens?' }],
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue('');
  };

  if (!mounted) return null;

  return (
    <>
      {/* Botão Flutuante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            style={{ background: '#0ea5e9' }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full text-white shadow-[0_8px_32px_rgba(14,165,233,0.4)] hover:shadow-[0_8px_40px_rgba(14,165,233,0.6)] transition-all"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Janela de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: 'rgba(5, 5, 10, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
            }}
            className="fixed bottom-6 right-6 z-50 w-[320px] sm:w-[360px] h-[500px] max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-lg"
                >
                  <img src="/lumiana-avatar.png" alt="Lumiana" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Lumiana (Apoio MozBus)</h3>
                  <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,237,213,0.9)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleClearHistory}
                  title="Limpar conversa"
                  className="p-2 rounded-full transition-colors hover:bg-white/10"
                >
                  <MessageSquare size={14} className="opacity-70" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full transition-colors hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ background: 'rgba(2, 6, 23, 0.6)' }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/10"
                    style={{
                      background: message.role === 'user'
                        ? 'rgba(51, 65, 85, 0.9)'
                        : 'transparent',
                      color: message.role === 'user' ? '#fff' : 'inherit',
                    }}
                  >
                    {message.role === 'user' ? <User size={14} /> : <img src="/lumiana-avatar.png" alt="Lumiana" className="w-full h-full object-cover" />}
                  </div>
                  <div
                    className="px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed"
                    style={
                      message.role === 'user'
                        ? {
                            background: '#0ea5e9',
                            color: '#fff',
                            borderTopRightRadius: '4px',
                          }
                        : {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            color: 'rgba(226, 232, 240, 0.9)',
                            borderTopLeftRadius: '4px',
                          }
                    }
                  >
                    {message.parts
                      ? message.parts.flatMap((p, i) =>
                          p.type === 'text' ? [<span key={i}>{p.text}</span>] : []
                        )
                      : ''}
                  </div>
                </div>
              ))}

              {/* Botões de Ações Rápidas quando não está carregando e só tem a mensagem inicial */}
              {!isLoading && messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    '🚌 Quero viajar, que rotas têm?',
                    '💰 Quanto custa o bilhete?',
                    '📱 Como pago com M-Pesa?',
                    '🎫 Ver os meus bilhetes'
                  ].map((action) => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      className="text-xs px-3 py-2 rounded-full border border-sky-500/30 bg-sky-500/5 text-sky-200 hover:bg-sky-500/20 transition-all"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center">
                  Lamento, a Lumiana está com dificuldades técnicas agora. Tente novamente em breve.
                </div>
              )}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/10"
                  >
                    <img src="/lumiana-avatar.png" alt="Lumiana" className="w-full h-full object-cover" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderTopLeftRadius: '4px',
                    }}
                  >
                    <div className="flex gap-1 items-center">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'rgba(14,165,233,0.7)' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3 flex items-center gap-2"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(10, 15, 30, 0.95)',
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escreva a sua mensagem..."
                className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  caretColor: '#0ea5e9',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(14,165,233,0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#0ea5e9' }}
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
