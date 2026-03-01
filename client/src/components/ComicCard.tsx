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
    whileHover: {
      scale: 1.03,
      rotate: tiltAmount,
      y: -8,
      transition: { type: "spring", stiffness: 400, damping: 15 },
    },
    whileTap: {
      scale: 0.97,
      y: 4,
      rotate: 0,
      boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
      transition: { type: "spring", stiffness: 500, damping: 25 },
    },
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
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
