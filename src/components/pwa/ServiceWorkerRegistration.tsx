"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker après le chargement.
 *
 * Auparavant un <script> inline dans layout.tsx : incompatible avec la
 * Content-Security-Policy à nonce (src/lib/csp.ts) — un nonce apposé en
 * JSX est masqué par le navigateur et faisait échouer l'hydratation React
 * (erreur #418). Un composant client fait la même chose sans script inline.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // L'échec d'enregistrement était silencieux : la promesse rejetée
    // remontait en "Uncaught (in promise)" dans la console, sans cause.
    navigator.serviceWorker.register("/sw.js").catch((e: unknown) => {
      console.warn("Service worker non enregistré :", e instanceof Error ? e.message : e);
    });
  }, []);
  return null;
}
