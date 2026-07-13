"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div 
          initial={{ top: -50 }}
          animate={{ top: 0 }}
          exit={{ top: -50 }}
          className="fixed top-0 left-0 right-0 bg-red-500 text-white text-xs font-bold py-2 flex items-center justify-center gap-2 z-[100]"
        >
          <WifiOff className="w-4 h-4" />
          Vous êtes hors-ligne. Certaines fonctionnalités peuvent être limitées.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
