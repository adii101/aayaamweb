import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { apiRequest } from "@/lib/queryClient";
import { QrCode, CheckCircle, XCircle, LogOut, ArrowLeft } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

const QR_PREFIX = "aayaam-registration:";

type ScanResult =
  | { status: "idle" }
  | { status: "valid"; eventName: string; userPhone: string }
  | { status: "invalid"; reason: string };

export default function AdminScan() {
  const [, setLocation] = useLocation();
  const [adminOk, setAdminOk] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult>({ status: "idle" });
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAdminOk(data?.admin === true))
      .catch(() => setAdminOk(false));
  }, []);

  const validateAndMarkUsed = useCallback(async (qrCode: string) => {
    if (lastScannedRef.current === qrCode) return;
    lastScannedRef.current = qrCode;
    setScanResult({ status: "idle" });
    try {
      const res = await apiRequest("POST", "/api/registrations/validate-qr", {
        qr: qrCode,
        markUsed: true,
      });
      const data = (await res.json()) as {
        valid: boolean;
        eventName?: string;
        userPhone?: string;
      };
      if (data.valid && data.eventName != null) {
        setScanResult({
          status: "valid",
          eventName: data.eventName,
          userPhone: data.userPhone ?? "",
        });
      } else {
        setScanResult({ status: "invalid", reason: "Invalid or already used." });
      }
    } catch (err: unknown) {
      const res = (err as { response?: Response })?.response;
      let reason = "Scan failed.";
      if (res?.status === 404) reason = "QR not found.";
      if (res?.status === 410) reason = "Already used (one-time entry).";
      setScanResult({ status: "invalid", reason });
    }
    setTimeout(() => {
      lastScannedRef.current = null;
    }, 2000);
  }, []);

  const startScanner = useCallback(() => {
    if (scannerRef.current) return;
    const html5Qr = new Html5Qrcode("admin-qr-reader");
    scannerRef.current = html5Qr;
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras?.length) {
          setScanResult({ status: "invalid", reason: "No camera found." });
          return;
        }
        const camId = cameras[0].id;
        return html5Qr.start(
          camId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (decodedText.startsWith(QR_PREFIX)) {
              const code = decodedText.slice(QR_PREFIX.length).trim();
              if (code) {
                html5Qr.pause();
                validateAndMarkUsed(code);
                setTimeout(() => {
                  html5Qr.resume();
                }, 1500);
              }
            }
          },
          () => {},
        );
      })
      .then(() => setIsScanning(true))
      .catch((err) => {
        setScanResult({ status: "invalid", reason: err?.message ?? "Camera error." });
        scannerRef.current = null;
      });
  }, [validateAndMarkUsed]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

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
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <ComicButton
            variant="white"
            size="sm"
            onClick={() => setLocation("/admin")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} /> Back
          </ComicButton>
          <h1 className="font-display text-3xl uppercase flex items-center gap-2">
            <QrCode size={32} /> Entry verification
          </h1>
        </div>
        <ComicButton variant="destructive" size="sm" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut size={18} /> Logout
        </ComicButton>
      </div>

      <ComicCard bgVariant="white" tiltAmount={0} className="overflow-hidden">
        <div id="admin-qr-reader" className="w-full min-h-[280px] bg-black rounded-xl" />
        {!isScanning && (
          <div className="mt-4 flex justify-center">
            <ComicButton variant="primary" onClick={startScanner}>
              Start camera & scan
            </ComicButton>
          </div>
        )}
        {isScanning && (
          <div className="mt-4 flex justify-center">
            <ComicButton variant="destructive" onClick={stopScanner}>
              Stop camera
            </ComicButton>
          </div>
        )}
      </ComicCard>

      <AnimatePresence mode="wait">
        {scanResult.status === "valid" && (
          <motion.div
            key="valid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <ComicCard bgVariant="accent" tiltAmount={0} className="flex items-center gap-4">
              <CheckCircle size={48} className="text-green-700 flex-shrink-0" />
              <div>
                <p className="font-display text-2xl text-green-800">Entry allowed</p>
                <p className="font-bold text-lg">{scanResult.eventName}</p>
                <p className="text-sm font-bold text-gray-700">Phone: {scanResult.userPhone}</p>
                <p className="text-xs font-bold text-gray-600 mt-1">QR marked as used (one-time).</p>
              </div>
            </ComicCard>
          </motion.div>
        )}
        {scanResult.status === "invalid" && (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <ComicCard bgVariant="white" tiltAmount={0} className="flex items-center gap-4 border-red-4">
              <XCircle size={48} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="font-display text-2xl text-red-700">Entry denied</p>
                <p className="font-bold text-lg">{scanResult.reason}</p>
              </div>
            </ComicCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
