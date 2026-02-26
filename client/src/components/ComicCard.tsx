import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ComicCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  tiltAmount?: number;
  interactive?: boolean;
  bgVariant?: 'white' | 'primary' | 'secondary' | 'tertiary' | 'accent';
}

export function ComicCard({ 
  children, 
  className, 
  tiltAmount = 2,
  interactive = false,
  bgVariant = 'white',
  ...props 
}: ComicCardProps) {

  const bgs = {
    white: "bg-white",
    primary: "bg-[hsl(var(--primary))]",
    secondary: "bg-[hsl(var(--secondary))]",
    tertiary: "bg-[hsl(var(--tertiary))]",
    accent: "bg-[hsl(var(--accent))]",
  };

  const interactiveProps = interactive ? {
    whileHover: { scale: 1.02, rotate: tiltAmount, y: -5 },
    whileTap: { scale: 0.98, y: 2, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      {...interactiveProps}
      className={cn(
        "comic-border comic-shadow rounded-xl p-6",
        bgs[bgVariant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
