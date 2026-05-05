"use client";

import React from 'react';

interface SeatSelectionGridProps {
  capacity: number;
  layout?: string;
  seatsData: any[]; // The parsed seatsMapping array
  selectedSeat: number | null;
  onSeatSelect: (seatNum: number) => void;
}

export default function SeatSelectionGrid({
  capacity = 40,
  layout = "2-2",
  seatsData = [],
  selectedSeat,
  onSeatSelect,
}: SeatSelectionGridProps) {
  
  const handleSeatClick = (idx: number) => {
    const isOccupied = seatsData[idx] === true || seatsData[idx] === 'true';
    if (!isOccupied) {
      onSeatSelect(idx + 1);
    }
  };

  return (
    <div className="relative p-8 md:p-12 bg-zinc-950/80 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-2xl">
      {/* Reflexo Decorativo Superior */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-[320px] mx-auto space-y-12">
        {/* Cockpit / Frente do Autocarro */}
        <div className="h-28 bg-gradient-to-b from-black to-zinc-900/40 rounded-t-[60px] rounded-b-[20px] border-b-[3px] border-sky-500/30 relative flex items-center justify-center overflow-hidden pointer-events-none shadow-inner">
          <div className="w-16 h-12 bg-sky-500/10 rounded-2xl border border-sky-500/20 flex items-center justify-center">
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(56,189,248,1)]"></div>
          </div>
        </div>

        {/* Grelha de Assentos */}
        <div className={`relative z-10 grid gap-x-4 gap-y-5 ${layout === '2-1' || layout === '1-1-1' ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {/* Corredor Central Invisível (Evita bloqueio de cliques) */}
          <div className="absolute left-[50%] top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2 pointer-events-none rounded-full"></div>

          {Array.from({ length: capacity }).map((_, idx) => {
            const isOccupied = seatsData[idx] === true || seatsData[idx] === 'true';
            const isSelected = selectedSeat === idx + 1;
            
            // Lógica para criar o corredor central dependendo do layout
            let isAisleSeat = false;
            if (layout === '2-2') {
              isAisleSeat = (idx + 1) % 4 === 2; // Margem no segundo assento da fila (4 cadeiras)
            } else if (layout === '2-1') {
              isAisleSeat = (idx + 1) % 3 === 2; // Margem no segundo assento da fila (3 cadeiras)
            } else if (layout === '1-1-1') {
              isAisleSeat = (idx + 1) % 3 === 1 || (idx + 1) % 3 === 2; // Dois corredores!
            }

            return (
              <div key={idx} className={`${isAisleSeat ? 'mr-6 md:mr-10' : ''} relative z-20 flex justify-center`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSeatClick(idx);
                  }}
                  disabled={isOccupied}
                  className={`
                    w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xs md:text-sm font-black transition-all duration-300
                    shadow-lg outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
                    ${isOccupied 
                      ? 'bg-zinc-800/60 text-white/10 cursor-not-allowed border border-white/5 shadow-none' 
                      : isSelected 
                        ? 'bg-sky-500 text-white border-2 border-white/40 scale-110 shadow-[0_0_25px_rgba(14,165,233,0.6)] focus:ring-sky-400 -translate-y-1' 
                        : 'bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-sky-500/50 text-white/40 hover:text-white cursor-pointer hover:-translate-y-0.5'
                    }
                  `}
                >
                  {idx + 1}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="pt-8 border-t border-white/5 flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-zinc-900 border border-white/10"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Livre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-zinc-800/60 border border-white/5"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Seleção</span>
          </div>
        </div>
      </div>
    </div>
  );
}
