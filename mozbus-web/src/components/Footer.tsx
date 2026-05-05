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
    <footer className="relative bg-aura-bg border-t border-aura-border pt-24 pb-12 overflow-hidden">
      {/* Background Kinetic Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-aura-accent to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-aura-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-6 gap-12 mb-20">
          {/* Brand Presence */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex flex-col">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-aura-accent w-10 h-10 rounded-[14px] text-aura-bg flex items-center justify-center shadow-[0_10px_30px_var(--aura-accent)]">
                  <Bus size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tighter uppercase italic leading-none">
                    MOZ<span className="text-aura-accent">BUS</span>
                  </span>
                  <span className="text-[7px] font-black tracking-[0.5em] text-aura-muted uppercase mt-1">Digital Infrastructure</span>
                </div>
              </Link>
            </div>
            
            <p className="text-sm font-bold text-aura-muted leading-relaxed uppercase tracking-tight max-w-sm">
              A espinha dorsal tecnológica da mobilidade em Moçambique. Desenvolvido para operações de alto impacto e segurança militar de dados.
            </p>

            <div className="flex items-center gap-6">
              {[Globe, ShieldCheck, Zap].map((Icon, i) => Icon && (
                <motion.a 
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-aura-surface/30 border border-aura-border flex items-center justify-center text-aura-muted hover:text-aura-accent hover:border-aura-accent/50 transition-all hover:bg-aura-accent/5"
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
                <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-aura-accent/60">{section.title}</h4>
                <ul className="space-y-5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-[11px] font-black uppercase tracking-[0.2em] text-aura-muted hover:text-aura-text transition-all flex items-center gap-2 group/link"
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
         <div className="pt-16 border-t border-aura-border flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
             <div className="flex items-center gap-3 bg-aura-surface/20 border border-aura-border px-5 py-2.5 rounded-full">
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                    <div className="w-1 h-1 bg-emerald-500/20 rounded-full" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-aura-muted">All Systems Operational</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-aura-muted/40">
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
              <div className="h-4 w-[1px] bg-aura-border hidden md:block" />
              <p className="text-[9px] font-black uppercase tracking-[0.6em] text-aura-accent/40 italic">
                 Engineering Moz Mobility
              </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
