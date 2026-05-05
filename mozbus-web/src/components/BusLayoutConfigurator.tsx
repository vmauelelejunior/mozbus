"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, LayoutGrid, AlertCircle, X } from 'lucide-react';

interface BusLayoutConfiguratorProps {
  initialCapacity?: number;
  initialLayout?: string;
  onSave: (capacity: number, layout: string) => Promise<void>;
  onClose: () => void;
}

export default function BusLayoutConfigurator({
  initialCapacity = 40,
  initialLayout = '2-2',
  onSave,
  onClose
}: BusLayoutConfiguratorProps) {
  const [capacity, setCapacity] = useState(initialCapacity);
  const [layout, setLayout] = useState(initialLayout);
  const [isSaving, setIsSaving] = useState(false);

  const layouts = [
    { id: '2-2', name: 'Padrão (2-2)', desc: '4 assentos por fila com 1 corredor' },
    { id: '2-1', name: 'Executivo (2-1)', desc: '3 assentos por fila com 1 corredor' },
    { id: '1-1-1', name: 'VIP Leito (1-1-1)', desc: '3 assentos por fila com 2 corredores' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(capacity, layout);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-zinc-950 border border-white/10 w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row h-[80vh] md:h-auto max-h-[800px]"
      >
        {/* Painel Esquerdo: Configuração */}
        <div className="flex-1 p-8 md:p-12 space-y-10 overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-sky-500 mb-2">
                <Settings size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Configurador de Frota</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Layout da <span className="text-sky-500">Cabine</span></h2>
            </div>
            <button onClick={onClose} className="md:hidden bg-white/5 p-2 rounded-full text-white/50 hover:text-white">
               <X size={20} />
            </button>
          </div>

          <div className="space-y-8">
            {/* Input Capacidade */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest opacity-50">Lotação Máxima (Cadeiras)</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-sky-500/50 transition-colors">
                 <input 
                   type="number" 
                   value={capacity}
                   onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                   min={10}
                   max={80}
                   className="w-full bg-transparent text-2xl font-black italic p-4 outline-none text-white"
                 />
                 <span className="px-6 text-xs font-bold uppercase tracking-widest opacity-20">Assentos</span>
              </div>
            </div>

            {/* Seleção de Layout */}
            <div className="space-y-4">
               <label className="text-xs font-black uppercase tracking-widest opacity-50">Disposição dos Corredores</label>
               <div className="grid gap-3">
                 {layouts.map(l => (
                   <button 
                     key={l.id}
                     onClick={() => setLayout(l.id)}
                     className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-left ${
                       layout === l.id 
                         ? 'bg-sky-500/10 border-sky-500 text-sky-400' 
                         : 'bg-white/5 border-white/5 text-white/50 hover:border-white/20'
                     }`}
                   >
                     <div>
                       <h4 className="font-black text-sm">{l.name}</h4>
                       <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">{l.desc}</p>
                     </div>
                     <div className={`w-4 h-4 rounded-full border-2 ${layout === l.id ? 'border-sky-500 bg-sky-500' : 'border-white/20'}`} />
                   </button>
                 ))}
               </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(14,165,233,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSaving ? 'A Guardar...' : 'Salvar Configuração'} <Save size={16} />
            </button>
          </div>
        </div>

        {/* Painel Direito: Pré-Visualização Visual */}
        <div className="flex-1 bg-[#0A0A0C] border-l border-white/5 p-8 md:p-12 flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 text-[10px] font-black uppercase tracking-[0.4em] opacity-20 flex items-center gap-2">
              <LayoutGrid size={14} /> Pré-Visualização
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center py-12">
              {/* Miniatura do Autocarro */}
              <div className="w-[200px] space-y-6">
                 {/* Cockpit */}
                 <div className="h-16 bg-gradient-to-b from-black to-zinc-900/50 rounded-t-[40px] border-b-2 border-sky-500/20 relative overflow-hidden">
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-6 bg-white/5 rounded border border-white/10" />
                 </div>

                 {/* Assentos */}
                 <div className={`grid gap-x-2 gap-y-3 ${layout === '2-1' || layout === '1-1-1' ? 'grid-cols-3' : 'grid-cols-4'}`}>
                    {Array.from({ length: capacity }).map((_, idx) => {
                       let isAisleSeat = false;
                       if (layout === '2-2') isAisleSeat = (idx + 1) % 4 === 2;
                       else if (layout === '2-1') isAisleSeat = (idx + 1) % 3 === 2;
                       else if (layout === '1-1-1') isAisleSeat = (idx + 1) % 3 === 1 || (idx + 1) % 3 === 2;

                       return (
                         <div key={idx} className={`${isAisleSeat ? 'mr-6' : ''} flex justify-center`}>
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[8px] font-bold text-white/30">
                              {idx + 1}
                            </div>
                         </div>
                       );
                    })}
                 </div>
              </div>
           </div>
           
           <div className="mt-auto pt-6 border-t border-white/5">
              <div className="flex items-start gap-3 bg-sky-500/5 p-4 rounded-xl border border-sky-500/10">
                 <AlertCircle size={16} className="text-sky-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] leading-relaxed opacity-60">
                   A pré-visualização é uma aproximação visual do mapeamento físico. Certifique-se de que a disposição física do autocarro corresponde exatamente ao layout escolhido antes de aplicar.
                 </p>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
