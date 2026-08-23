"use client";

import { AlertTriangle } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page imprimait un Tableau des Flux de Trésorerie entièrement
// fabriqué (CAFG 28 000 000, trésorerie nette 12 000 000 FCFA, etc.), au
// format officiel avec zones de signature "L'EXPERT COMPTABLE" / "LE
// DIRIGEANT" — un document prêt à être imprimé et signé comme un état
// financier réel, sans lien à aucun client ni à aucune donnée Prisma.
//
// Aucun moteur de calcul du TFT (méthode indirecte : CAFG, variation du
// BFR, flux d'investissement et de financement par classe de compte
// SYSCOHADA) n'existe dans l'application — contrairement au bilan et au
// compte de résultat (src/lib/ohada/syscohada-engine.ts), qui sont testés
// et fiables. Plutôt que produire un TFT dont l'équilibre ne serait pas
// garanti, cette page indique honnêtement que la fonctionnalité n'est pas
// encore implémentée.
// ─────────────────────────────────────────────────────────────────────────────

export default function PrintTFTPage() {
    return (
        <div className="p-10 max-w-2xl mx-auto text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Tableau des Flux de Trésorerie non disponible</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
                Le calcul du TFT (méthode indirecte) n&apos;est pas encore implémenté dans l&apos;application. Le
                bilan et le compte de résultat, eux, sont calculés à partir des écritures réelles du client
                sélectionné.
            </p>
        </div>
    );
}
