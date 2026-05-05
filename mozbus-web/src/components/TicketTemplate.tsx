'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Bus, MapPin, Calendar, Clock, User, Briefcase, Info } from 'lucide-react';

interface TicketTemplateProps {
  ticketData: {
    id: string;
    passengerName: string;
    from: string;
    to: string;
    date: string;
    time: string;
    seat: string;
    busPlate: string;
    price: number;
    luggage: string;
    operatorId: string;
  };
}

export default function TicketTemplate({ ticketData }: TicketTemplateProps) {
  return (
    <div className="ticket-print-container bg-white text-black p-2 w-[58mm] font-mono text-[11px] leading-tight border border-dashed border-gray-300 mx-auto">
      {/* Header */}
      <div className="text-center border-b border-dashed border-black pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase tracking-tighter">MOZBUS EXPRESS</h1>
        <p className="text-[10px]">Transporte & Logística Segura</p>
        <p className="text-[10px]">Maputo, Moçambique</p>
        <p className="text-[10px]">NUIT: 400123456</p>
      </div>

      {/* Ticket Type */}
      <div className="text-center bg-black text-white py-1 mb-4 font-bold uppercase tracking-widest text-xs">
        Bilhete de Passagem
      </div>

      {/* Main Info */}
      <div className="space-y-3">
        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="font-bold">BILHETE:</span>
          <span>#{ticketData.id}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase">Passageiro:</span>
          <span className="font-bold text-base truncate">{ticketData.passengerName}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 py-2 border-y border-dashed border-gray-200">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">Origem:</span>
            <span className="font-bold">{ticketData.from}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-500 uppercase">Destino:</span>
            <span className="font-bold">{ticketData.to}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{ticketData.date}</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            <span>{ticketData.time}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase">Assento</span>
            <span className="font-bold text-lg">{ticketData.seat}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase">Bagagem</span>
            <span className="font-bold">{ticketData.luggage}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase">Viat.</span>
            <span className="font-bold">{ticketData.busPlate}</span>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="flex flex-col items-center justify-center py-6">
        <QRCodeSVG 
          value={`mozbus://${ticketData.id}`} 
          size={100}
          level="H"
          includeMargin={false}
        />
        <p className="text-[9px] mt-2 text-gray-400 capitalize">Valide este QR com o Fiscal MozBus</p>
      </div>

      {/* Pricing */}
      <div className="border-t border-dashed border-black pt-2 mt-2">
        <div className="flex justify-between text-base font-black">
          <span>TOTAL PAGO:</span>
          <span>{ticketData.price.toLocaleString()} MT</span>
        </div>
        <p className="text-[9px] text-center mt-4 italic">
          Obrigado por escolher a MozBus.<br />
          Chegue 30min antes do embarque.
        </p>
      </div>

      {/* Footer Meta */}
      <div className="text-[8px] text-gray-400 mt-4 flex justify-between">
        <span>Op: {ticketData.operatorId}</span>
        <span>{new Date().toLocaleString()}</span>
      </div>
      
      {/* Cut line simulation */}
      <div className="mt-4 border-b-2 border-dotted border-gray-300 w-full"></div>
    </div>
  );
}
