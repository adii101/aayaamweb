import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { QrCode, Calendar, Shield, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [adminOk, setAdminOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAdminOk(data?.admin === true))
      .catch(() => setAdminOk(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setLocation("/admin/login");
  };

  if (adminOk === null) {
    return (
      <div className="min-h-screen flex items-center justify-center font-display text-2xl">
        Loading...
      </div>
    );
  }
  if (adminOk === false) {
    setLocation("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl uppercase flex items-center justify-center gap-3 text-[hsl(var(--secondary))] text-comic-stroke">
          <Shield size={48} /> Admin panel
        </h1>
        <p className="font-bold text-lg mt-2 text-gray-600">
          Verify entry QR codes and manage fest events.
        </p>
      </div>

      <div className="grid gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ComicCard
            bgVariant="primary"
            tiltAmount={0}
            interactive
            className="cursor-pointer"
            onClick={() => setLocation("/admin/scan")}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white comic-border flex items-center justify-center">
                <QrCode size={32} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl uppercase">QR entry verification</h2>
                <p className="font-bold text-gray-700 mt-1">
                  Scan student QR codes at the gate. Each code works only once.
                </p>
              </div>
              <ComicButton variant="white" size="sm">Open scanner</ComicButton>
            </div>
          </ComicCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ComicCard
            bgVariant="tertiary"
            tiltAmount={0}
            interactive
            className="cursor-pointer"
            onClick={() => setLocation("/admin/events")}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white comic-border flex items-center justify-center">
                <Calendar size={32} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl uppercase">Manage events</h2>
                <p className="font-bold text-gray-700 mt-1">
                  Add new events and edit event details. These appear on the public Events page.
                </p>
              </div>
              <ComicButton variant="white" size="sm">Manage</ComicButton>
            </div>
          </ComicCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ComicCard
            bgVariant="accent"
            tiltAmount={0}
            interactive
            className="cursor-pointer"
            onClick={() => setLocation("/admin/events")}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white comic-border flex items-center justify-center">
                <Calendar size={32} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl uppercase">Rule book links</h2>
                <p className="font-bold text-gray-700 mt-1">
                  Set or change the URL each event’s Rule Book button should open.
                </p>
              </div>
              <ComicButton variant="white" size="sm">Open rules</ComicButton>
            </div>
          </ComicCard>
        </motion.div>
      </div>

      <div className="mt-10 flex justify-center">
        <ComicButton variant="destructive" size="sm" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut size={18} /> Logout
        </ComicButton>
      </div>
    </div>
  );
}
