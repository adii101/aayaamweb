import { motion, AnimatePresence } from "framer-motion";

const POW_WORDS = ["POW!", "BAM!", "ZAP!", "BOOM!", "WOW!"];

interface ComicPowProps {
  show: boolean;
  onComplete?: () => void;
  word?: string;
}

export function ComicPow({ show, onComplete, word }: ComicPowProps) {
  const text = word ?? POW_WORDS[Math.floor(Math.random() * POW_WORDS.length)];

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="pow"
          initial={{ scale: 0, opacity: 1, rotate: -20 }}
          animate={{ scale: 1.5, opacity: 1, rotate: 5 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          onAnimationComplete={onComplete}
          className="absolute -top-2 -right-2 font-display text-2xl md:text-3xl text-[hsl(var(--secondary))] text-comic-stroke pointer-events-none z-10"
          style={{ textShadow: "3px 3px 0 black" }}
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
