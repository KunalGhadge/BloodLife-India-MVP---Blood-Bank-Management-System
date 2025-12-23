
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', noHover = false, ...props }) => {
  return (
    <motion.div
      whileHover={noHover ? {} : { 
        y: -6, 
        scale: 1.01,
        boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.15)" 
      }}
      className={`glass rounded-3xl p-6 transition-all duration-500 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
