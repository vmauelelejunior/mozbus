'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EliteLoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function EliteLoader({ size = 80, color = "var(--aura-accent)", className = "" }: EliteLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className="relative">
        {/* Intense Glow Effect */}
        <motion.div
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full blur-[50px]"
          style={{ width: size, height: size, backgroundColor: color }}
        />

        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
          style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
        >
          {/* Main Bus Shell */}
          <motion.path
            d="M3 10V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Windows Divider */}
          <motion.path
            d="M3 10h18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />

          {/* Windows Details */}
          <motion.path
            d="M7 7h2m4 0h4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          />

          {/* Wheels */}
          <motion.circle
            cx="7" cy="18" r="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
          />
          <motion.circle
            cx="17" cy="18" r="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex flex-col items-center"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-aura-muted">
          Processando Elite
        </span>
        <div className="flex gap-1 mt-2">
            <motion.div 
                animate={{ scale: [1, 1.5, 1] }} 
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                className="w-1 h-1 bg-aura-accent rounded-full" 
            />
            <motion.div 
                animate={{ scale: [1, 1.5, 1] }} 
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-1 h-1 bg-aura-accent rounded-full" 
            />
            <motion.div 
                animate={{ scale: [1, 1.5, 1] }} 
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-1 h-1 bg-aura-accent rounded-full" 
            />
        </div>
      </motion.div>
    </div>
  );
}
