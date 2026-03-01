import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { useUser } from "@/hooks/use-local-store";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { saveUser } = useUser();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!name || !phone) {
      setError("Please fill name and phone number.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
      setError("Phone must be exactly 10 digits (no +91, spaces, or letters).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/request-otp", { phone });
      const data = (await res.json()) as { ok: boolean; delivery?: "email" | "console" };
      setStep("otp");
      setInfo(
        data.delivery === "console"
          ? "OTP generated (dev mode). Check the server terminal logs for the code."
          : "OTP sent to your phone. Enter it below.",
      );
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!name || !phone || !otp) {
      setError("Please fill name, phone and OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-otp", {
        name,
        phone,
        code: otp,
      });
      const data = (await res.json()) as { ok: boolean; user: any };

      // Store the logged-in user (the rest of the app currently reads from localStorage)
      saveUser({
        name: data.user?.name || name || "User",
        email: data.user?.email,
        college: data.user?.college || "Unknown",
        phone: data.user?.phone || phone || "0000000000",
        entryId: data.user?.entryId,
      });

      setLocation("/dashboard");
    } catch (err: any) {
      setError(err?.message || "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
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
            Login with an OTP sent to your phone number.
          </p>

          {error && (
            <div className="font-bold text-red-700 bg-red-100 p-3 comic-border rounded-xl">
              {error}
            </div>
          )}
          {info && (
            <div className="font-bold text-green-800 bg-green-100 p-3 comic-border rounded-xl">
              {info}
            </div>
          )}

          {step === "details" ? (
            <form onSubmit={requestOtp} className="space-y-6">
              <div>
                <label className="font-display text-2xl uppercase tracking-wider block mb-2">Hero Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] transition-all comic-shadow-sm"
                  placeholder="Bruce Wayne"
                />
              </div>

              <div>
                <label className="font-display text-2xl uppercase tracking-wider block mb-2">Phone (10 digits, no +91)</label>
                <input 
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] transition-all comic-shadow-sm"
                  placeholder="9876543210"
                  pattern="\d{10}"
                  title="Enter exactly 10 digits (no +91, spaces, or letters)"
                />
              </div>

              <ComicButton type="submit" variant="primary" className="w-full">
                {isLoading ? "SENDING..." : "SEND OTP"}
              </ComicButton>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-6">
              <div>
                <label className="font-display text-2xl uppercase tracking-wider block mb-2">Phone (10 digits)</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] transition-all comic-shadow-sm"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="font-display text-2xl uppercase tracking-wider block mb-2">OTP Code</label>
                <input
                  inputMode="numeric"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold tracking-widest text-center focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] transition-all comic-shadow-sm"
                  placeholder="123456"
                  maxLength={8}
                />
                <div className="mt-2 flex justify-between text-sm font-bold">
                  <button
                    type="button"
                    className="underline hover:text-black"
                    onClick={() => {
                      setStep("details");
                      setOtp("");
                      setError(null);
                      setInfo(null);
                    }}
                    disabled={isLoading}
                  >
                    Change phone
                  </button>
                  <button
                    type="button"
                    className="underline hover:text-black"
                    onClick={() => {
                      setOtp("");
                      setStep("details");
                      setInfo(null);
                      setError(null);
                    }}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              <ComicButton type="submit" variant="primary" className="w-full">
                {isLoading ? "VERIFYING..." : "VERIFY & LOGIN"}
              </ComicButton>
            </form>
          )}
        </ComicCard>
      </motion.div>
    </div>
  );
}
