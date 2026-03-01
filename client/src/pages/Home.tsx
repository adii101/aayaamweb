import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ComicButton } from "@/components/ComicButton";
import { ComicCard } from "@/components/ComicCard";
import { Linkedin, Instagram, Users, User as UserIcon } from "lucide-react";

type DbEvent = {
  id: string;
  name: string;
  date: string;
  description: string;
  fullDescription: string;
  type: "Solo" | "Team";
  prize: string;
  rules: string[];
  rounds: number;
  unstopUrl?: string;
  ruleBookUrl?: string;
};

const developers = [
  { name: "Aditya Salve", linkedin: "https://www.linkedin.com/in/aditya-salve-1631172b1?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", instagram: "https://www.instagram.com/aditya_salve._?igsh=c3ZlMXV0MWJ1eHJi" },
  { name: "Akshat Jain", linkedin: "https://www.linkedin.com/in/akshat-jain-2592bb333?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", instagram: "https://www.instagram.com/akshat297?igsh=emtjcmt6NHJldGIw" },
];

function CountdownTimer() {
  const targetDate = new Date("2026-03-13T09:00:00+05:30").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
    { label: "Days", value: timeLeft.days, color: "bg-[hsl(var(--primary))]" },
    { label: "Hours", value: timeLeft.hours, color: "bg-[hsl(var(--tertiary))]" },
    { label: "Mins", value: timeLeft.minutes, color: "bg-[hsl(var(--secondary))]" },
    { label: "Secs", value: timeLeft.seconds, color: "bg-[hsl(var(--accent))]" },
  ];

  return (
    <div className="flex gap-2 sm:gap-4 md:gap-6 justify-center mt-12 mb-8">
      {timeUnits.map((unit, i) => (
        <motion.div
          key={unit.label}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
          className="flex flex-col items-center"
        >
          <div className={`${unit.color} w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-xl comic-border comic-shadow flex items-center justify-center relative overflow-hidden`}>
            <motion.span
              key={unit.value}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-display text-4xl sm:text-5xl md:text-7xl text-white text-comic-stroke drop-shadow-md z-10"
            >
              {unit.value.toString().padStart(2, "0")}
            </motion.span>
            <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />
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
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/events", { signal: ac.signal, credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: DbEvent[]) => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
    return () => ac.abort();
  }, []);

  const scrollToEvents = () => {
    document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
  };

  const colors: ("primary" | "secondary" | "tertiary" | "accent")[] = ["primary", "tertiary", "secondary", "accent", "primary"];

  return (
    <div className="min-h-screen pt-24 pb-20 flex flex-col px-4 relative">
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: -10 }}
          className="absolute top-32 left-4 md:left-20 bg-yellow-400 text-black font-display text-5xl p-6 rounded-full comic-border comic-shadow hidden md:block cursor-default select-none"
          style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
        >
          BAM!
        </motion.div>
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 15 }}
          className="absolute bottom-40 right-4 md:right-20 bg-pink-500 text-white text-comic-stroke font-display text-5xl p-4 rounded-full comic-border comic-shadow hidden md:block cursor-default select-none"
        >
          WOW!
        </motion.div>

        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="relative inline-block"
        >
          <span className="absolute -top-8 -left-12 font-display text-3xl text-[hsl(var(--accent))] text-comic-stroke rotate-[-15deg]">
            SGSITS Presents
          </span>
          <h1 className="text-7xl sm:text-8xl md:text-[150px] leading-none mb-2 text-[hsl(var(--primary))] text-comic-stroke-lg drop-shadow-[8px_8px_0_rgba(0,0,0,1)] relative z-10">
            AAYAAM <motion.span className="text-[hsl(var(--secondary))] inline-block">26</motion.span>
          </h1>
          <motion.div className="bg-white comic-border comic-shadow-sm px-6 py-2 rounded-full inline-block mt-4 -rotate-2 cursor-default">
            <h2 className="text-xl md:text-3xl font-bold uppercase tracking-widest m-0 text-black shadow-none">
              Annual Cultural Fest
            </h2>
          </motion.div>
        </motion.div>

        <CountdownTimer />

        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}>
          <ComicButton variant="tertiary" size="lg" onClick={scrollToEvents}>
            Explore Events
          </ComicButton>
        </motion.div>
      </section>

      {/* Events section - scrollable */}
      <section id="events" className="w-full max-w-7xl mx-auto py-16 scroll-mt-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-display text-[hsl(var(--tertiary))] text-comic-stroke text-center mb-12"
        >
          Events
        </motion.h2>

        {eventsLoading ? (
          <p className="text-center font-bold text-gray-500 py-8">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center font-bold text-gray-500 py-8">No events yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev, index) => (
              <Link key={ev.id} href="/events" className="block h-full">
                <ComicCard
                  bgVariant={colors[index % colors.length]}
                  interactive
                  tiltAmount={index % 2 === 0 ? 3 : -3}
                  className="cursor-pointer h-full flex flex-col"
                >
                  <div className="bg-white comic-border px-3 py-1 rounded-full w-fit mb-4 text-sm font-bold uppercase inline-flex items-center gap-2">
                    {ev.type === "Team" ? <Users size={16} /> : <UserIcon size={16} />}
                    {ev.type}
                  </div>
                  <h3 className="text-2xl font-display uppercase tracking-widest text-white text-comic-stroke mb-2">
                    {ev.name}
                  </h3>
                  <p className="font-bold mb-4 flex-grow bg-white/80 p-3 rounded-lg border-2 border-black border-dashed line-clamp-2">
                    {ev.description}
                  </p>
                  <div className="flex justify-between items-center mt-auto border-t-4 border-black pt-4">
                    <span className="font-bold bg-black text-white px-3 py-1 rounded-lg uppercase text-sm">
                      {ev.date}
                    </span>
                    <span className="font-display text-lg underline decoration-2">Rule Book →</span>
                  </div>
                </ComicCard>
              </Link>
            ))}
          </div>
        )}
        {events.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/events">
              <ComicButton variant="secondary" size="md">
                View all events & register
              </ComicButton>
            </Link>
          </div>
        )}
      </section>

      {/* About section - highlighted with ComicCard for visibility */}
      <section id="about" className="w-full max-w-3xl mx-auto py-16 scroll-mt-24">
        <ComicCard bgVariant="white" tiltAmount={0} className="p-6 lg:p-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-display uppercase tracking-wider text-[hsl(var(--secondary))] text-center mb-6"
          >
            About
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-700 font-medium mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            Aayam 26 is the annual cultural fest of SGSITS. Explore events, register to attend or participate, and be part of the celebration.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Developed by</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-gray-600">
              {developers.map((dev) => (
                <span key={dev.name} className="inline-flex items-center gap-1.5 text-sm">
                  <span className="font-bold">{dev.name}</span>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-70 hover:opacity-100 text-[#0A66C2] transition-opacity"
                    aria-label={`${dev.name} LinkedIn`}
                  >
                    <Linkedin size={14} strokeWidth={2} />
                  </a>
                  <a
                    href={dev.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-70 hover:opacity-100 text-[#E4405F] transition-opacity"
                    aria-label={`${dev.name} Instagram`}
                  >
                    <Instagram size={14} strokeWidth={2} />
                  </a>
                </span>
              ))}
            </div>
          </motion.div>
        </ComicCard>
      </section>
    </div>
  );
}
