import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { useUser } from "@/hooks/use-local-store";
import { QrCode, Ticket, ShieldCheck, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

// Local schema definition matching the prompt requirements
const passFormSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email, hero!").optional(),
  college: z.string().min(2, "Where do you study?"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits (no +91, spaces, or letters)"),
});

type PassFormValues = z.infer<typeof passFormSchema>;

export default function FestPass() {
  const [_, setLocation] = useLocation();
  const { user, saveUser } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTicket, setShowTicket] = useState(!!user?.entryId);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PassFormValues>({
    resolver: zodResolver(passFormSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      college: user.college,
      phone: user.phone
    } : undefined
  });

  const onSubmit = (data: PassFormValues) => {
    setIsGenerating(true);
    
    // Simulate API delay and processing
    setTimeout(() => {
      const generatedId = `AAYAAM-26-${Math.floor(10000 + Math.random() * 90000)}`;
      
      saveUser({
        ...data,
        entryId: generatedId
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF007F', '#00E5FF', '#39FF14']
      });

      setIsGenerating(false);
      setShowTicket(true);
    }, 1500);
  };

  const handleDownload = () => {
    alert("Ticket downloaded! (Simulated)");
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl relative">
        
        {/* Floating decorations */}
        <motion.div 
          animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -left-10 text-[hsl(var(--primary))] z-[-1] hidden md:block"
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" stroke="black" strokeWidth="4">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          </svg>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showTicket ? (
            <motion.div
              key="form"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <ComicCard bgVariant="white" className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-5xl text-[hsl(var(--secondary))] text-comic-stroke inline-block rotate-[-2deg] mb-2">Get Your Pass!</h1>
                  <p className="font-bold text-xl bg-yellow-200 inline-block px-3 py-1 comic-border rounded-lg rotate-1">Unlock the madness.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="space-y-2">
                    <label className="font-display text-2xl uppercase tracking-wider block">Secret Identity (Name)</label>
                    <input 
                      {...register("name")}
                      className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] transition-all comic-shadow-sm"
                      placeholder="Peter Parker"
                    />
                    {errors.name && <p className="text-red-500 font-bold bg-red-100 p-2 rounded comic-border inline-block text-sm">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="font-display text-2xl uppercase tracking-wider block">Comm Channel (Email)</label>
                    <input 
                      {...register("email")}
                      type="email"
                      className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--secondary))] transition-all comic-shadow-sm"
                      placeholder="spidey@dailybugle.com"
                    />
                    {errors.email && <p className="text-red-500 font-bold bg-red-100 p-2 rounded comic-border inline-block text-sm">{errors.email.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-display text-2xl uppercase tracking-wider block">Base (College)</label>
                      <input 
                        {...register("college")}
                        className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--accent))] transition-all comic-shadow-sm"
                        placeholder="SGSITS"
                      />
                      {errors.college && <p className="text-red-500 font-bold bg-red-100 p-2 rounded comic-border inline-block text-sm">{errors.college.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="font-display text-2xl uppercase tracking-wider block">Hotline (10 digits, no +91)</label>
                      <input 
                        {...register("phone", {
                          onChange: (e) => setValue("phone", e.target.value.replace(/\D/g, "").slice(0, 10)),
                        })}
                        inputMode="numeric"
                        className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all comic-shadow-sm"
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      {errors.phone && <p className="text-red-500 font-bold bg-red-100 p-2 rounded comic-border inline-block text-sm">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <ComicButton 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    className="w-full mt-8 flex justify-center items-center gap-3"
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating Powers..." : "Claim Ticket"}
                    {!isGenerating && <Ticket size={28} strokeWidth={3} />}
                  </ComicButton>

                </form>
              </ComicCard>
            </motion.div>
          ) : (
            <motion.div
              key="ticket"
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative"
            >
              {/* TICKET DESIGN */}
              <div className="bg-[hsl(var(--tertiary))] p-2 rounded-[2rem] comic-border comic-shadow-lg">
                <div className="bg-white rounded-[1.5rem] border-4 border-dashed border-black overflow-hidden flex flex-col md:flex-row">
                  
                  {/* Left Side: Branding */}
                  <div className="bg-[hsl(var(--primary))] p-6 md:w-1/3 flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-dashed border-black">
                    <h2 className="font-display text-5xl text-black text-center rotate-[-10deg]">AAYAAM<br/><span className="text-white text-comic-stroke">2026</span></h2>
                    <div className="mt-8 font-bold text-center uppercase tracking-widest bg-black text-white px-4 py-2 rounded-xl">
                      VIP PASS
                    </div>
                  </div>

                  {/* Right Side: Details */}
                  <div className="p-6 md:w-2/3 flex flex-col justify-between relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZjBmMGIzIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')]">
                    
                    <div className="bg-white/90 p-4 rounded-xl comic-border mb-4">
                      <p className="text-sm font-bold text-gray-500 uppercase">Authorized Entity</p>
                      <p className="font-display text-3xl">{user?.name}</p>
                      <p className="font-bold">{user?.college}</p>
                    </div>

                    <div className="flex items-end justify-between bg-white/90 p-4 rounded-xl comic-border">
                      <div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Entry Clearance ID</p>
                        <p className="font-display text-2xl text-[hsl(var(--secondary))] tracking-widest">{user?.entryId}</p>
                      </div>
                      <div className="bg-black p-2 rounded-lg">
                        <QrCode className="text-white w-16 h-16" strokeWidth={1.5} />
                      </div>
                    </div>
                    {user?.entryId && (
                      <div className="mt-4 flex justify-center">
                        <QRCodeCanvas
                          value={`aayaam-pass:${user.entryId}`}
                          size={100}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 justify-center">
                <ComicButton onClick={handleDownload} variant="white" className="flex gap-2 items-center">
                  <Download /> Save Pass
                </ComicButton>
                <ComicButton onClick={() => setLocation('/dashboard')} variant="accent" className="flex gap-2 items-center">
                  <ShieldCheck /> Head to HQ
                </ComicButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
