"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Bus, CheckCircle, Download, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function TicketDemoPage() {
  const mockTicket = {
    qrCode: "MOZ-B82FCA12",
    seatNumber: 12,
    trip: {
        departureTime: new Date().toISOString(),
        route: { origin: "Maputo", destination: "Beira" },
        bus: { model: "Yutong ZK6122H", plate: "AFG-123-MC", company: { name: "Maningue Nice" } }
    },
    passenger: { name: "Usuário Teste Elite" }
  };

  return (
    <main className="min-h-screen hero-gradient p-12 text-white flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        
        <div className="text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle size={32} />
            </motion.div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Demonstração de <span className="text-orange-500">BILHETE</span></h1>
        </div>

        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-white text-black rounded-[40px] overflow-hidden shadow-2xl relative">
            <div className="bg-zinc-100 p-8 border-b-2 border-dashed border-zinc-300 flex justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase opacity-40">Transportadora</p>
                    <h2 className="text-lg font-black">{mockTicket.trip.bus.company.name}</h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-40">Nº</p>
                    <p className="font-bold">{mockTicket.qrCode}</p>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center text-center">
                    <div>
                        <p className="text-[10px] font-black opacity-30 uppercase">Origem</p>
                        <p className="text-xl font-black">{mockTicket.trip.route.origin}</p>
                    </div>
                    <Bus size={24} className="text-orange-500 opacity-20" />
                    <div>
                        <p className="text-[10px] font-black opacity-30 uppercase">Destino</p>
                        <p className="text-xl font-black">{mockTicket.trip.route.destination}</p>
                    </div>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 border border-zinc-100">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-orange-500/10">
                        <QRCodeSVG value={mockTicket.qrCode} size={150} level="H" includeMargin={true} />
                    </div>
                    <p className="text-[8px] font-black uppercase opacity-40 tracking-[0.3em]">Validado pelo Ecossistema MozBus</p>
                </div>
            </div>

            <div className="bg-black text-white p-6 px-8 flex justify-between items-center">
                <div>
                    <p className="text-[8px] font-black uppercase opacity-40">Assento</p>
                    <p className="text-lg font-black text-orange-500">{mockTicket.seatNumber}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black uppercase opacity-40">Status</p>
                    <p className="text-[10px] font-black uppercase text-green-400">Pronto para Embarque</p>
                </div>
            </div>
        </motion.div>

        <div className="text-center">
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">Voltar ao Início</Link>
        </div>
      </div>
    </main>
  );
}
