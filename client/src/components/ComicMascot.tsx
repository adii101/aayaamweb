import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Cute chibi Iron Man - red & gold suit, arc reactor, round helmet */
const CUTE_MASCOT_SVG = (
  <svg
    viewBox="0 0 120 120"
    className="w-full h-full"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Back arc glow */}
    <circle cx="60" cy="65" r="18" fill="#C41E3A" opacity="0.3" />
    {/* Body - red torso */}
    <ellipse cx="60" cy="72" rx="26" ry="24" fill="#C41E3A" stroke="black" strokeWidth="2.5" />
    {/* Gold chest plate */}
    <ellipse cx="60" cy="68" rx="18" ry="16" fill="#D4AF37" stroke="black" strokeWidth="2" />
    {/* Arc reactor */}
    <circle cx="60" cy="68" r="8" fill="#00D4FF" stroke="black" strokeWidth="2" />
    <circle cx="60" cy="68" r="4" fill="#FFF" />
    {/* Helmet - rounded Iron Man style */}
    <ellipse cx="60" cy="38" r="26" ry="24" fill="#C41E3A" stroke="black" strokeWidth="2.5" />
    {/* Gold faceplate */}
    <path
      d="M38 38 Q60 28 82 38 Q85 45 82 52 Q60 62 38 52 Q35 45 38 38"
      fill="#D4AF37"
      stroke="black"
      strokeWidth="2"
    />
    {/* Cute eyes - glowing slits */}
    <ellipse cx="48" cy="38" rx="6" ry="2" fill="#00D4FF" stroke="black" strokeWidth="1" />
    <ellipse cx="72" cy="38" rx="6" ry="2" fill="#00D4FF" stroke="black" strokeWidth="1" />
    {/* Little arms - gold repulsors */}
    <path
      d="M32 58 Q22 52 24 45"
      stroke="#D4AF37"
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M88 58 Q98 52 96 45"
      stroke="#D4AF37"
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="24" cy="45" r="5" fill="#00D4FF" stroke="black" strokeWidth="1.5" />
    <circle cx="96" cy="45" r="5" fill="#00D4FF" stroke="black" strokeWidth="1.5" />
  </svg>
);

export function ComicMascot() {
  const [pos, setPos] = useState(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - 160 : 100,
    y: typeof window !== "undefined" ? window.innerHeight - 160 : 100,
  }));
  const [isMoving, setIsMoving] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const pendingClickRef = useRef<HTMLElement | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive =
        target.closest("button") ||
        target.closest('a[href]') ||
        target.closest("[role='button']") ||
        target.closest("input[type='submit']");
      pendingClickRef.current = interactive ? (interactive as HTMLElement) : null;

      const rect = document.body.getBoundingClientRect();
      const clickX = e.clientX - 60;
      const clickY = e.clientY - 90;

      setFacingRight(clickX > posRef.current.x);
      setIsMoving(true);
      setPos({
        x: Math.max(20, Math.min(rect.width - 80, clickX)),
        y: Math.max(20, Math.min(rect.height - 120, clickY)),
      });
    };

    document.addEventListener("click", handleClick, false);
    return () => document.removeEventListener("click", handleClick, false);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden" aria-hidden>
      <motion.div
        className="absolute w-[120px] h-[120px] origin-bottom"
        initial={false}
        animate={{
          x: pos.x,
          y: pos.y,
          rotateY: facingRight ? 0 : 180,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          onComplete: () => {
            setIsMoving(false);
            if (pendingClickRef.current) {
              setIsClicking(true);
              setTimeout(() => {
                pendingClickRef.current = null;
                setIsClicking(false);
              }, 350);
            }
          },
        }}
        style={{ transformOrigin: "center bottom" }}
      >
        <motion.div
          animate={
            isClicking
              ? { scale: 0.9, y: 4 }
              : { scale: [1, 1.03, 1], y: [0, -3, 0] }
          }
          transition={
            isClicking
              ? { type: "spring", stiffness: 500, damping: 20 }
              : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }
          className="w-full h-full drop-shadow-lg"
        >
          {CUTE_MASCOT_SVG}
        </motion.div>

        {/* Little "POW" when he clicks */}
        <AnimatePresence>
          {isClicking && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1, y: -20 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 font-display text-xl text-[hsl(var(--secondary))] text-comic-stroke whitespace-nowrap"
            >
              CLICK!
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
