import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { useUser } from "@/hooks/use-local-store";
import { User, Ticket } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

type RegistrationMode = "attend" | "participate";

type Registration = {
  _id: string;
  eventId: string;
  eventName: string;
  mode: RegistrationMode;
  qrCode?: string;
};
export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regsLoading, setRegsLoading] = useState(true);

  useEffect(() => {
    const phone = user?.phone;
    if (!phone) return;
    const controller = new AbortController();
    async function loadRegistrations(phoneNum: string) {
      try {
        setRegsLoading(true);
        const res = await fetch(
          `/api/registrations?phone=${encodeURIComponent(phoneNum)}`,
          { credentials: "include", signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as Registration[];
        setRegistrations(data);
      } catch {
        // ignore errors in UI
      } finally {
        setRegsLoading(false);
      }
    }
    loadRegistrations(phone);
    return () => controller.abort();
  }, [user?.phone]);

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center font-display text-4xl">LOADING HQ...</div>;
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-6xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Sidebar + My Events */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <ComicCard bgVariant="primary" tiltAmount={0} className="text-center relative">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white comic-border rounded-full flex items-center justify-center comic-shadow">
                <User size={40} strokeWidth={3} />
              </div>
              <div className="mt-8">
                <h2 className="font-display text-4xl uppercase">{user.name}</h2>
                <p className="font-bold text-lg bg-white/50 inline-block px-3 py-1 rounded-lg border-2 border-black mt-2">
                  {user.college}
                </p>
                <div className="mt-6 bg-black text-white p-3 rounded-xl">
                  <p className="text-sm font-bold text-gray-400 uppercase">Clearance Code</p>
                  <p className="font-display text-2xl tracking-widest text-[hsl(var(--accent))]">
                    {user.entryId || "NO PASS YET"}
                  </p>
                </div>
              </div>
            </ComicCard>
          </motion.div>

          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <ComicCard bgVariant="white" tiltAmount={0} className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl flex items-center gap-2">
                  <Ticket size={24} /> My Events
                </h3>
              </div>
              {regsLoading ? (
                <p className="font-bold text-gray-500">Loading your missions...</p>
              ) : registrations.length === 0 ? (
                <p className="font-bold text-gray-500">
                  You haven't registered for any events yet. Head to the EVENTS page to join the action!
                </p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {registrations.map((reg) => (
                    <div
                      key={reg._id}
                      className="flex gap-3 items-center bg-gray-50 comic-border rounded-xl p-3"
                    >
                      {reg.mode === "attend" && reg.qrCode ? (
                        <div className="bg-white comic-border p-1 rounded">
                          <QRCodeCanvas
                            value={`aayaam-registration:${reg.qrCode}`}
                            size={72}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      ) : (
                        <div className="w-[72px] h-[72px] flex items-center justify-center font-bold text-xs uppercase bg-yellow-200 comic-border">
                          PARTICIPATE
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-display text-lg">{reg.eventName}</div>
                        <div className="text-xs font-bold uppercase text-gray-500">
                          Mode: {reg.mode === "attend" ? "Attendee (QR)" : "Participant (Unstop)"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ComicCard>
          </motion.div>
        </div>

        {/* Right column currently unused (no squads) */}
        <div className="lg:col-span-2 space-y-6" />
      </div>
    </div>
  );
}
