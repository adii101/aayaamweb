import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { apiRequest } from "@/lib/queryClient";
import { Shield, KeyRound, Smartphone } from "lucide-react";

type LoginMode = "password" | "phone";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<LoginMode>("phone");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("70007799744");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError("Enter admin password.");
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/admin/login", { password: password.trim() });
      setLocation("/admin/scan");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/request-otp", { phone: digits.slice(-10) });
      setOtpStep("code");
      setInfo("OTP sent. Check the server console in dev, or your phone if SMS is configured.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp.trim()) {
      setError("Enter the OTP code.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/admin/login-with-phone", {
        phone: phone.replace(/\D/g, ""),
        code: otp.trim(),
      });
      const data = (await res.json()) as { ok: boolean; name?: string };
      setLocation("/admin/scan");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP or not authorized.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[hsl(var(--secondary))] relative z-0 pt-20">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-5xl text-white text-comic-stroke rotate-[-3deg] inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-black px-6 py-2 border-4 border-white flex items-center justify-center gap-2 mx-auto w-fit">
            <Shield size={36} /> ADMIN
          </h1>
        </div>

        <ComicCard tiltAmount={0} bgVariant="white" className="p-8 space-y-6">
          <p className="font-bold text-lg text-center bg-gray-100 p-4 comic-border rounded-xl">
            Sign in as admin to verify QR codes and manage events.
          </p>

          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode("phone");
                setError(null);
                setInfo(null);
                setOtpStep("phone");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-colors ${mode === "phone" ? "bg-white comic-border comic-shadow" : ""}`}
            >
              <Smartphone size={18} /> Adi (phone)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setError(null);
                setInfo(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-colors ${mode === "password" ? "bg-white comic-border comic-shadow" : ""}`}
            >
              <KeyRound size={18} /> Password
            </button>
          </div>

          {error && (
            <div className="font-bold text-red-700 bg-red-100 p-3 comic-border rounded-xl">
              {error}
            </div>
          )}
          {info && (
            <div className="font-bold text-green-800 bg-green-100 p-3 comic-border rounded-xl text-sm">
              {info}
            </div>
          )}

          {mode === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="font-display text-xl uppercase tracking-wider block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] comic-shadow-sm"
                  placeholder="Admin password"
                />
              </div>
              <ComicButton type="submit" variant="primary" className="w-full">
                {isLoading ? "CHECKING..." : "LOG IN"}
              </ComicButton>
            </form>
          ) : (
            <>
              {otpStep === "phone" ? (
                <form onSubmit={handleRequestOtp} className="space-y-6">
                  <div>
                    <label className="font-display text-xl uppercase tracking-wider block mb-2">
                      Admin phone (Adi)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] comic-shadow-sm"
                      placeholder="70007799744"
                    />
                  </div>
                  <ComicButton type="submit" variant="primary" className="w-full" disabled={isLoading}>
                    {isLoading ? "SENDING OTP..." : "SEND OTP"}
                  </ComicButton>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="font-display text-xl uppercase tracking-wider block mb-2">
                      OTP code
                    </label>
                    <input
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full p-4 border-4 border-black rounded-xl text-lg font-bold tracking-widest text-center focus:outline-none focus:ring-4 focus:ring-[hsl(var(--tertiary))] comic-shadow-sm"
                      placeholder="123456"
                      maxLength={8}
                    />
                  </div>
                  <ComicButton type="submit" variant="primary" className="w-full" disabled={isLoading}>
                    {isLoading ? "VERIFYING..." : "VERIFY & LOG IN"}
                  </ComicButton>
                  <button
                    type="button"
                    onClick={() => { setOtpStep("phone"); setOtp(""); setError(null); }}
                    className="w-full text-center font-bold text-sm underline"
                  >
                    Change number
                  </button>
                </form>
              )}
            </>
          )}
        </ComicCard>
      </motion.div>
    </div>
  );
}
