"use client";

import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Bus, Clock, User, ShieldCheck } from 'lucide-react';

interface TicketPrinterProps {
  ticket: any;
}

const TicketPrinter = forwardRef<HTMLDivElement, TicketPrinterProps>(({ ticket }, ref) => {
  if (!ticket || !ticket.trip || !ticket.passenger) return null;

  const departureDate = new Date(ticket.trip.departureTime);

  return (
    <div 
      ref={ref}
      className="bg-white text-black overflow-hidden relative shadow-none w-full max-w-[80mm] mx-auto min-h-[75mm] font-sans border-[1.5px] border-zinc-950 p-4 select-none"
      style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}
    >
      {/* COMPACT HEADER */}
      <div className="flex justify-between items-start border-b border-zinc-200 pb-2 mb-3">
        <div>
          <h2 className="text-sm font-black italic tracking-tighter leading-none">MOZBUS<span className="text-zinc-400">ELITE</span></h2>
          <p className="text-[6px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">{ticket.trip.bus.company.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[6px] font-black uppercase tracking-widest text-zinc-300">Ticket ID</p>
          <p className="text-[7px] font-mono font-bold leading-none">#{ticket.qrCode.split('-')[1] || 'ELITE'}</p>
        </div>
      </div>

      {/* CORE TRIP DATA - HIGH DENSITY */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div>
            <p className="text-[6px] font-black uppercase text-zinc-400 tracking-widest">Destination</p>
            <p className="text-sm font-black uppercase truncate leading-tight tracking-tight">{ticket.trip.route.destination}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-[6px] font-black uppercase text-zinc-400 tracking-widest">Date</p>
              <p className="text-[9px] font-black">{departureDate.toLocaleDateString('pt-PT', {day:'2-digit', month: 'short'})}</p>
            </div>
            <div>
              <p className="text-[6px] font-black uppercase text-zinc-400 tracking-widest">Time</p>
              <p className="text-[9px] font-black">{departureDate.toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
          <div>
             <p className="text-[6px] font-black uppercase text-zinc-400 tracking-widest">Passenger</p>
             <p className="text-[8px] font-bold uppercase truncate max-w-[100px]">{ticket.passenger.name}</p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center border-l border-zinc-100 pl-4">
           <p className="text-[6px] font-black uppercase text-zinc-400 tracking-widest mb-1">Seat</p>
           <div className="text-5xl font-black italic tracking-tighter leading-none text-zinc-950">{ticket.seatNumber}</div>
           <div className="mt-2 text-[8px] font-black text-zinc-900">{ticket.amountPaid} MT</div>
        </div>
      </div>

      {/* FOOTER & VALIDATION */}
      <div className="border-t border-dotted border-zinc-300 pt-3 flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className="border border-zinc-950 p-1 mb-1">
            <QRCodeSVG value={ticket.qrCode} size={45} level="M" />
          </div>
          <span className="text-[5px] font-mono opacity-40 uppercase tracking-tighter">{ticket.qrCode.substring(0, 15)}...</span>
        </div>
        
        <div className="text-right space-y-1.5">
          <div className="flex items-center justify-end gap-1">
             <ShieldCheck size={8} className="text-zinc-300" />
             <span className="text-[5px] font-black uppercase tracking-widest text-zinc-300">Verified System</span>
          </div>
          <p className="text-[6px] font-black text-zinc-400 leading-tight max-w-[120px]">Apresente este bilhete ao motorista no momento do embarque.</p>
        </div>
      </div>

      {/* CROP MARKS / DECO */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-200"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-200"></div>
    </div>
  );
});

TicketPrinter.displayName = 'TicketPrinter';

export default TicketPrinter;
