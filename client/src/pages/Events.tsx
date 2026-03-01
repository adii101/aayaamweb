import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { X, Users, User as UserIcon, Trophy, Target } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { FestEvent } from "@shared/schema";
import { useUser } from "@/hooks/use-local-store";
import { apiRequest } from "@/lib/queryClient";

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

function toFestEvent(ev: DbEvent): FestEvent {
  return {
    id: ev.id,
    name: ev.name,
    date: ev.date,
    description: ev.description,
    fullDescription: ev.fullDescription,
    type: ev.type,
    prize: ev.prize,
    rules: ev.rules ?? [],
    rounds: ev.rounds,
    unstopUrl: ev.unstopUrl,
    ruleBookUrl: ev.ruleBookUrl,
  };
}

export default function Events() {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FestEvent | null>(null);
  const [recentQr, setRecentQr] = useState<{ code: string; eventName: string } | null>(null);
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/events", { signal: ac.signal, credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: DbEvent[]) => setEvents(data.map(toFestEvent)))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
    return () => ac.abort();
  }, []);

  async function ensureLoggedIn() {
    if (!user) {
      setLocation("/login");
      return false;
    }
    return true;
  }

  async function registerForEvent(
    event: FestEvent,
    mode: "attend" | "participate",
  ) {
    if (!(await ensureLoggedIn())) return;
    if (!user?.phone) return;

    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/registrations", {
        phone: user.phone,
        eventId: event.id,
        eventName: event.name,
        mode,
      });
      const created = await res.json();

      if (mode === "attend" && created.qrCode) {
        setRecentQr({ code: created.qrCode, eventName: created.eventName });
        alert("You are registered as an attendee! Scan the QR below to save or use later.");
      } else if (mode === "attend") {
        alert(
          "You are registered as an attendee! Your QR will appear in your Dashboard.",
        );
      }
    } catch (err: any) {
      alert(err?.message || "Failed to register for event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const colors: ('primary' | 'secondary' | 'tertiary' | 'accent')[] = ['primary', 'tertiary', 'secondary', 'accent', 'primary'];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-7xl mx-auto">
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-16 relative"
      >
        <h1 className="text-6xl md:text-8xl text-[hsl(var(--tertiary))] text-comic-stroke inline-block rotate-[-2deg]">
          EPIC EVENTS
        </h1>
        <div className="speech-bubble bg-white comic-border p-4 absolute -top-8 right-0 md:right-1/4 rotate-12 hidden sm:block">
          <p className="font-bold text-xl uppercase">Choose your battle!</p>
        </div>
      </motion.div>

      {eventsLoading ? (
        <p className="font-display text-2xl text-center py-12">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="font-display text-2xl text-center py-12 text-gray-600">
          No events listed yet. Check back soon!
        </p>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, index) => (
          <ComicCard 
            key={event.id}
            bgVariant={colors[index % colors.length]}
            interactive
            tiltAmount={index % 2 === 0 ? 3 : -3}
            className="cursor-pointer h-full flex flex-col"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="bg-white comic-border px-3 py-1 rounded-full w-fit mb-4 text-sm font-bold uppercase inline-flex items-center gap-2">
              {event.type === 'Team' ? <Users size={16} /> : <UserIcon size={16} />}
              {event.type}
            </div>
            
            <h3 className="text-3xl font-display uppercase tracking-widest text-white text-comic-stroke mb-2">
              {event.name}
            </h3>
            
            <p className="font-bold text-lg mb-4 flex-grow bg-white/80 p-3 rounded-lg border-2 border-black border-dashed">
              {event.description}
            </p>
            
            <div className="flex justify-between items-center mt-auto border-t-4 border-black pt-4">
              <span className="font-bold bg-black text-white px-3 py-1 rounded-lg uppercase text-sm">
                {event.date}
              </span>
              <button className="font-display text-xl underline decoration-2 hover:text-white transition-colors">
                Rule Book &rarr;
              </button>
            </div>
          </ComicCard>
        ))}
      </div>

      {/* Modal / Dialog */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -10, y: 100 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.5, rotate: 10, y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 250, stiffness: 400 }}
              className="bg-white comic-border comic-shadow-lg rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <div className="sticky top-0 bg-[hsl(var(--tertiary))] border-b-4 border-black p-4 flex justify-between items-center z-10">
                <h2 className="text-3xl font-display text-white text-comic-stroke m-0">{selectedEvent.name}</h2>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="bg-white comic-border rounded-full p-1 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className="bg-yellow-300 comic-border px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Target size={20} /> {selectedEvent.type}
                  </span>
                  <span className="bg-green-300 comic-border px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Trophy size={20} /> Prize: {selectedEvent.prize}
                  </span>
                </div>

                <div>
                  <h4 className="font-display text-2xl mb-2 flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-1 rounded">The Mission</span>
                  </h4>
                  {/* preserve paragraphs entered in admin textarea */}
                  <div className="text-lg font-bold bg-gray-100 p-4 comic-border rounded-xl space-y-4">
                    {selectedEvent.fullDescription
                      .split("\n")
                      .map((para, idx) => (
                        <p key={idx} className="m-0">
                          {para}
                        </p>
                      ))}
                  </div>
                </div>



                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <ComicButton 
                    variant="secondary" 
                    size="lg" 
                    className="w-full sm:w-auto"
                    disabled={!selectedEvent?.ruleBookUrl}
                    onClick={() => {
                      if (selectedEvent?.ruleBookUrl) {
                        window.open(selectedEvent.ruleBookUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    {selectedEvent?.ruleBookUrl ? "Rule Book" : "No rule book"}
                  </ComicButton>
                  <ComicButton 
                    variant="accent" 
                    size="lg" 
                    className="w-full sm:w-auto"
                    disabled={isSubmitting || !selectedEvent?.unstopUrl}
                    onClick={async () => {
                      if (!selectedEvent) return;
                      await registerForEvent(selectedEvent, "participate");
                      if (selectedEvent.unstopUrl) {
                        window.open(selectedEvent.unstopUrl, "_blank", "noopener,noreferrer");
                      }
                      setSelectedEvent(null);
                    }}
                  >
                    {isSubmitting ? "REDIRECTING..." : "Click to participate"}
                  </ComicButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {recentQr && (
          <motion.div 
            key="recent-qr"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setRecentQr(null)}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 150 }}
              className="bg-white comic-border comic-shadow-lg rounded-2xl p-8 max-w-sm text-center"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl mb-4">QR for {recentQr.eventName}</h2>
              <div className="bg-white comic-border p-2 inline-block">
                <QRCodeCanvas value={`aayaam-registration:${recentQr.code}`} size={150} level="M" includeMargin={false} />
              </div>
              <p className="mt-4 text-sm break-all">{recentQr.code}</p>
              <ComicButton className="mt-6" onClick={() => setRecentQr(null)}>Close</ComicButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
