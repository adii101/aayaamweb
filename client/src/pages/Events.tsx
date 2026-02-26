import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { X, Users, User as UserIcon, Trophy, Target } from "lucide-react";
import type { FestEvent } from "@shared/schema";

// Dummy data since we don't have a real backend
const EVENTS: FestEvent[] = [
  {
    id: "evt-001",
    name: "Battle of Bands",
    date: "13 March 2026",
    description: "Plug in and rock out! The ultimate showdown of musical titans.",
    fullDescription: "Get ready to blow the roof off! Battle of the Bands brings together the most electrifying student bands from across the country. Bring your original compositions or mind-bending covers. Equipment provided: Drum kit, Bass amp, 2 Guitar amps. Max 15 minutes stage time per band.",
    type: "Team",
    prize: "₹50,000 + Studio Time",
    rules: ["Teams of 3-7 members", "No pre-recorded tracks", "Obscenity leads to disqualification"],
    rounds: 2
  },
  {
    id: "evt-002",
    name: "Rap Wars",
    date: "14 March 2026",
    description: "Drop the hottest bars and claim the mic. 1v1 freestyle battles.",
    fullDescription: "Spit fire and show your lyrical genius. The Rap Wars feature intense 1v1 battles where quick wit and flow are your only weapons. DJ will provide beats on the spot. Bring your crew to hype you up!",
    type: "Solo",
    prize: "₹15,000",
    rules: ["No personal attacks on judges", "3 rounds of 60 seconds each", "Hindi/English allowed"],
    rounds: 3
  },
  {
    id: "evt-003",
    name: "Step Up (Group Dance)",
    date: "15 March 2026",
    description: "Synchronized chaos! Showcase your crew's moves and choreography.",
    fullDescription: "From Hip Hop to Contemporary, Folk to Bollywood. Step Up is the premier group dance competition. We're looking for energy, synchronization, costumes, and overall impact.",
    type: "Team",
    prize: "₹40,000",
    rules: ["Team size: 8-20 members", "Time limit: 8-10 minutes", "Props must be pre-approved"],
    rounds: 1
  },
  {
    id: "evt-004",
    name: "Graffiti Wall",
    date: "13-15 March 2026",
    description: "Leave your mark. A 3-day live art marathon.",
    fullDescription: "Transform blank canvases into masterpieces. Participants will be given an 8x8 ft wall section and basic supplies. Theme will be announced on the spot.",
    type: "Solo",
    prize: "₹10,000",
    rules: ["Basic spray cans provided", "Must complete within 48 hours", "Original art only"],
    rounds: 1
  },
  {
    id: "evt-005",
    name: "Improv Comedy",
    date: "14 March 2026",
    description: "Make it up as you go! Unscripted hilarity.",
    fullDescription: "Think on your feet! Teams will be given prompts from the audience and must perform unscripted sketches. Judged on creativity, humor, and teamwork.",
    type: "Team",
    prize: "₹20,000",
    rules: ["Teams of 3-5", "No offensive content", "Props will be provided randomly"],
    rounds: 3
  }
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<FestEvent | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {EVENTS.map((event, index) => (
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
                Details &rarr;
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
                  <p className="text-lg font-bold bg-gray-100 p-4 comic-border rounded-xl">
                    {selectedEvent.fullDescription}
                  </p>
                </div>

                <div>
                  <h4 className="font-display text-2xl mb-2 flex items-center gap-2">
                    <span className="bg-[hsl(var(--secondary))] text-white px-2 py-1 rounded comic-border">Rules of Engagement</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedEvent.rules.map((rule, idx) => (
                      <li key={idx} className="flex gap-3 text-lg font-bold items-start">
                        <span className="text-xl">💥</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-bold text-gray-500 italic">* Event has {selectedEvent.rounds} rounds.</p>
                </div>

                <div className="pt-6 flex justify-center">
                  <ComicButton 
                    variant="accent" 
                    size="lg" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      alert("Redirecting to Unstop...");
                      setSelectedEvent(null);
                    }}
                  >
                    Register on Unstop
                  </ComicButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
