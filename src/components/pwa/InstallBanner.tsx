"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-50"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Installer Cabinet 360</p>
              <p className="text-xs text-indigo-200">Accès hors-ligne rapide</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleInstall} className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold">
              Installer
            </button>
            <button onClick={() => setShowBanner(false)} className="p-2 text-indigo-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
