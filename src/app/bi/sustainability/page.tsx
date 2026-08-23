import { Leaf } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affichait un score ESG de 82/100 « Niveau Gold », des émissions
// de CO2, un index d'égalité femmes-hommes, une parité de conseil, etc. — des
// chiffres entièrement fixes, présentés comme « auto-calculés via FEC ».
// Aucun modèle de données de l'application ne suit d'indicateur
// environnemental, social ou de gouvernance (pas d'émissions, pas de RH, pas
// de composition de conseil) : la comptabilité SYSCOHADA ne permet pas de
// dériver ces chiffres, et aucun module de saisie ESG n'existe. Plutôt que de
// simuler un score, cette page indique honnêtement que la fonctionnalité
// n'est pas encore disponible.
// ─────────────────────────────────────────────────────────────────────────────

export default function SustainabilityHubPage() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 flex items-center justify-center">
            <div className="max-w-lg w-full bg-slate-900/60 border border-white/5 rounded-[32px] p-10 text-center space-y-4">
                <Leaf className="w-14 h-14 text-emerald-500 mx-auto" />
                <h2 className="text-xl font-black text-white">Reporting RSE non disponible</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Le suivi environnemental, social et de gouvernance (émissions, indicateurs RH, gouvernance)
                    nécessite des données que l&apos;application ne collecte pas aujourd&apos;hui — la comptabilité
                    SYSCOHADA seule ne permet pas de les calculer. Cette fonctionnalité n&apos;est pas encore
                    implémentée.
                </p>
            </div>
        </div>
    );
}
