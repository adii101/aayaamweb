import { motion } from 'framer-motion';
import { Music, Zap, Star, Bolt, Camera } from 'lucide-react';

export function FloatingElements() {
  const elements = [
    { Icon: Music, color: 'text-[hsl(var(--secondary))]', size: 48, top: '10%', left: '5%', delay: 0 },
    { Icon: Star, color: 'text-[hsl(var(--primary))]', size: 64, top: '15%', right: '10%', delay: 0.5 },
    { Icon: Bolt, color: 'text-[hsl(var(--tertiary))]', size: 56, bottom: '20%', left: '15%', delay: 1 },
    { Icon: Camera, color: 'text-[hsl(var(--accent))]', size: 40, bottom: '15%', right: '5%', delay: 1.5 },
    { Icon: Zap, color: 'text-[hsl(var(--secondary))]', size: 32, top: '40%', left: '80%', delay: 0.2 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className={`absolute ${el.color}`}
          style={{ top: el.top, left: el.left, right: el.right, bottom: el.bottom }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 12, -12, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: el.delay,
            ease: "easeInOut"
          }}
        >
          {/* Comic outline wrapper for icons */}
          <div className="relative">
            <el.Icon size={el.size} className="absolute text-black translate-x-[2px] translate-y-[2px]" strokeWidth={3} />
            <el.Icon size={el.size} className="relative" fill="currentColor" strokeWidth={2} stroke="black" />
          </div>
        </motion.div>
      ))}
      
      {/* Abstract Comic Shapes - bouncier */}
      <motion.div 
        className="absolute w-32 h-32 bg-[hsl(var(--primary))] rounded-full comic-border comic-shadow-sm -top-10 -left-10"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute w-40 h-16 bg-[hsl(var(--secondary))] comic-border comic-shadow-sm bottom-40 -right-8 rotate-12"
        animate={{ rotate: [12, 18, 12], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Halftone dots blob */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-halftone rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
    </div>
  );
}
