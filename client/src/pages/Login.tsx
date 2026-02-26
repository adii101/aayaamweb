import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { useUser } from "@/hooks/use-local-store";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { saveUser } = useUser();
  const [email, setEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate login by setting a dummy user in localStorage
    saveUser({
      name: email.split('@')[0], // Derive simple name from email
      email: email,
      college: "SGSITS (Dummy)",
      phone: "0000000000",
      entryId: "AAYAAM-26-DUMMY"
    });
    
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[hsl(var(--tertiary))] relative z-0">
      
      {/* Halftone backdrop explicitly for login to pop */}
      <div className="absolute inset-0 bg-halftone opacity-30 z-[-1]"></div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-6xl text-white text-comic-stroke rotate-[-5deg] inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[hsl(var(--secondary))] px-6 py-2 border-4 border-black">
            HQ LOGIN
          </h1>
        </div>

        <ComicCard tiltAmount={0} className="p-8 space-y-6 relative overflow-visible">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400 rounded-full comic-border flex items-center justify-center font-bold text-xl rotate-12 comic-shadow">
            PSSST!
          </div>

          <p className="font-bold text-lg text-center bg-gray-100 p-4 comic-border rounded-xl">
            Enter any email to access the dashboard. This is a simulation!
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="font-display text-2xl uppercase tracking-wider block mb-2">Comm Channel</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] transition-all comic-shadow-sm"
                placeholder="hero@academy.com"
              />
            </div>

            <ComicButton type="submit" variant="primary" className="w-full">
              INITIALIZE UPLINK
            </ComicButton>
          </form>
        </ComicCard>
      </motion.div>
    </div>
  );
}
