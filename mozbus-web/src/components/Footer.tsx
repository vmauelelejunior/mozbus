"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bus, ShieldCheck, Globe, Smartphone, ArrowUpRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "OPERACIONAL",
      links: [
        { name: "Terminais POS", href: "/terminal" },
        { name: "Fiscalização Live", href: "/terminal/fiscal" },
        { name: "Rastreio de Frota", href: "/tracking" },
        { name: "Mapa de Rotas", href: "/trips/results" },
      ]
    },
    {
      title: "ECOSSISTEMA",
      links: [
        { name: "Portal de Empresas", href: "#" },
        { name: "API de Parceiros", href: "#" },
        { name: "Carreiras Elite", href: "#" },
        { name: "Centro de Comando", href: "/dashboard/overview" },
      ]
    },
    {
      title: "PROTOCOLO",
      links: [
        { name: "Termos de Missão", href: "#" },
        { name: "Privacidade de Dados", href: "#" },
        { name: "Segurança Absoluta", href: "#" },
        { name: "SLA de Serviço", href: "#" },
      ]
    }
  ];

  return (
    <footer className="relative bg-[#0B0B0F] border-t border-white/5 pt-24 pb-12 overflow-hidden">
      {/* Background Kinetic Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-6 gap-12 mb-20">
          {/* Brand Presence */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex flex-col">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-sky-500 w-10 h-10 rounded-[14px] text-[#0B0B0F] flex items-center justify-center shadow-[0_10px_30px_rgba(14,165,233,0.3)]">
                  <Bus size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tighter uppercase italic leading-none">
                    MOZ<span className="text-sky-500">BUS</span>
                  </span>
                  <span className="text-[7px] font-black tracking-[0.5em] text-white/30 uppercase mt-1">Digital Infrastructure</span>
                </div>
              </Link>
            </div>
            
            <p className="text-sm font-bold text-white/30 leading-relaxed uppercase tracking-tight max-w-sm">
              A espinha dorsal tecnológica da mobilidade em Moçambique. Desenvolvido para operações de alto impacto e segurança militar de dados.
            </p>

            <div className="flex items-center gap-6">
              {[Globe, ShieldCheck, Zap].map((Icon, i) => Icon && (
                <motion.a 
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-sky-500 hover:border-sky-500/50 transition-all hover:bg-sky-500/5"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-4 grid sm:grid-cols-3 gap-12">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-sky-500/60">{section.title}</h4>
                <ul className="space-y-5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all flex items-center gap-2 group/link"
                      >
                        {link.name}
                        <ArrowUpRight size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-y-0 group-hover/link:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Status & Copyright */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
             <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-5 py-2.5 rounded-full">
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                    <div className="w-1 h-1 bg-emerald-500/20 rounded-full" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">All Systems Operational</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
                © {currentYear} MozBus Digital Infrastructure.
             </p>
          </div>

          <div className="flex items-center gap-12">
             <div className="flex items-center gap-4 opacity-20 grayscale">
                <ShieldCheck size={20} />
                <Globe size={20} />
                <Smartphone size={20} />
                <Zap size={20} fill="currentColor" />
             </div>
             <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
             <p className="text-[9px] font-black uppercase tracking-[0.6em] text-sky-500/40 italic">
                Engineering Moz Mobility
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
