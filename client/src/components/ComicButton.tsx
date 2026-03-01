import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ComicPow } from './ComicPow';

interface ComicButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'destructive' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showPow?: boolean;
  children: React.ReactNode;
}

export function ComicButton({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  showPow = true,
  onPointerDown: onPointerDownProp,
  ...props 
}: ComicButtonProps) {
  const [pow, setPow] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (showPow) {
      setPow(true);
      setTimeout(() => setPow(false), 450);
    }
    onPointerDownProp?.(e);
  };
  
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
      onPointerDown={handlePointerDown}
      whileHover={{
        scale: 1.08,
        rotate: 2,
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 12 },
      }}
      whileTap={{
        scale: 0.92,
        y: 6,
        x: 4,
        boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
        transition: { type: "spring", stiffness: 500, damping: 20 },
      }}
      className={cn(
        "font-display uppercase tracking-wider relative overflow-visible",
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
      {showPow && <ComicPow show={pow} onComplete={() => setPow(false)} />}
      {children}
    </motion.button>
  );
}
