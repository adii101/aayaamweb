import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ComicButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'destructive' | 'white';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function ComicButton({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: ComicButtonProps) {
  
  const variants = {
    primary: "bg-[hsl(var(--primary))] text-black",
    secondary: "bg-[hsl(var(--secondary))] text-white text-shadow-none text-comic-stroke",
    tertiary: "bg-[hsl(var(--tertiary))] text-black",
    accent: "bg-[hsl(var(--accent))] text-black",
    destructive: "bg-[hsl(var(--destructive))] text-white text-shadow-none text-comic-stroke",
    white: "bg-white text-black",
  };

  const sizes = {
    sm: "px-4 py-2 text-lg",
    md: "px-6 py-3 text-2xl",
    lg: "px-10 py-5 text-3xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, rotate: Math.random() * 4 - 2 }}
      whileTap={{ scale: 0.95, y: 4, x: 4, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
      className={cn(
        "font-display uppercase tracking-wider",
        "comic-border comic-shadow transition-colors duration-200",
        variants[variant],
        sizes[size],
        className
      )}
      style={{
        boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)"
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
