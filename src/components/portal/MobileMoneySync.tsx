"use client";

import { Smartphone } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Ce composant, montré directement aux clients externes du cabinet sur leur
// portail, simulait une synchronisation Mobile Money : un délai artificiel
// de 2s puis cinq transactions entièrement inventées (MOCK_TRANSACTIONS),
// nommant des tiers fictifs ("SENELEC", "Shell Cocody", "Pharmacie
// Centrale"), suivies d'un bouton "Envoyer au Moteur IA pour Traitement
// Comptable" qui ne faisait qu'un `alert()` sans aucun appel réseau. Aucune
// intégration de récupération d'historique Mobile Money (Wave/Orange/MTN)
// n'existe dans l'application — seule l'initiation de paiements sortants est
// implémentée (voir src/lib/fintech.ts), ce qui est un besoin différent. Un
// vrai client ne doit jamais voir des transactions inventées à son nom.
// ─────────────────────────────────────────────────────────────────────────────

export function MobileMoneySync() {
  return (
    <div className="rounded-[28px] border border-white/5 bg-slate-900/50 overflow-hidden">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h3 className="font-black text-white">Sync Mobile Money</h3>
          <p className="text-xs text-slate-500">
            Non disponible : la récupération automatique de vos transactions Wave, Orange Money ou MTN n&apos;est pas
            encore intégrée. Utilisez la saisie rapide ci-dessus en attendant.
          </p>
        </div>
      </div>
    </div>
  );
}
