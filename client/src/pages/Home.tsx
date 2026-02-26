import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ComicButton } from "@/components/ComicButton";

function CountdownTimer() {
  const targetDate = new Date('2026-03-13T09:00:00+05:30').getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days, color: 'bg-[hsl(var(--primary))]' },
    { label: 'Hours', value: timeLeft.hours, color: 'bg-[hsl(var(--tertiary))]' },
    { label: 'Mins', value: timeLeft.minutes, color: 'bg-[hsl(var(--secondary))]' },
    { label: 'Secs', value: timeLeft.seconds, color: 'bg-[hsl(var(--accent))]' },
  ];

  return (
    <div className="flex gap-2 sm:gap-4 md:gap-6 justify-center mt-12 mb-8">
      {timeUnits.map((unit, i) => (
        <motion.div 
          key={unit.label}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 + (i * 0.1), type: 'spring' }}
          className="flex flex-col items-center"
        >
          <div className={`${unit.color} w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-xl comic-border comic-shadow flex items-center justify-center relative overflow-hidden group`}>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={unit.value}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="font-display text-4xl sm:text-5xl md:text-7xl text-white text-comic-stroke drop-shadow-md z-10"
              >
                {unit.value.toString().padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            {/* Halftone texture inside */}
            <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none"></div>
          </div>
          <span className="font-bold text-sm sm:text-lg mt-2 uppercase tracking-widest bg-white px-3 py-1 comic-border rounded-full comic-shadow-sm -rotate-2">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center px-4 relative">
      
      {/* Decorative BOOM */}
      <motion.div 
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: -10 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="absolute top-32 left-4 md:left-20 bg-yellow-400 text-black font-display text-5xl p-6 rounded-full comic-border comic-shadow hidden md:block"
        style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
      >
        BAM!
      </motion.div>

      {/* Decorative WOW */}
      <motion.div 
        initial={{ scale: 0, rotate: 45 }}
        animate={{ scale: 1, rotate: 15 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.8 }}
        className="absolute bottom-40 right-4 md:right-20 bg-pink-500 text-white text-comic-stroke font-display text-5xl p-4 rounded-full comic-border comic-shadow hidden md:block"
      >
        WOW!
      </motion.div>

      <div className="text-center max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="relative inline-block"
        >
          <span className="absolute -top-8 -left-12 font-display text-3xl text-[hsl(var(--accent))] text-comic-stroke rotate-[-15deg]">SGSITS Presents</span>
          <h1 className="text-7xl sm:text-8xl md:text-[150px] leading-none mb-2 text-[hsl(var(--primary))] text-comic-stroke-lg drop-shadow-[8px_8px_0_rgba(0,0,0,1)] relative z-10">
            AAYAM <span className="text-[hsl(var(--secondary))] inline-block transform hover:rotate-12 transition-transform">26</span>
          </h1>
          <div className="bg-white comic-border comic-shadow-sm px-6 py-2 rounded-full inline-block mt-4 -rotate-2 transform hover:rotate-0 transition-transform cursor-default">
            <h2 className="text-xl md:text-3xl font-bold uppercase tracking-widest m-0 text-black shadow-none">
              Annual Cultural Fest
            </h2>
          </div>
        </motion.div>

        <CountdownTimer />

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-12"
        >
          <Link href="/events">
            <ComicButton variant="tertiary" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-3">
               Explore Events
            </ComicButton>
          </Link>
          <Link href="/fest-pass">
            <ComicButton variant="secondary" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-3">
               Get Fest Pass
            </ComicButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
