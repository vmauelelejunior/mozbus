"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface EliteSkeletonProps {
  className?: string;
}

export default function EliteSkeleton({ className }: EliteSkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/10 to-transparent"
      />
    </div>
  );
}
