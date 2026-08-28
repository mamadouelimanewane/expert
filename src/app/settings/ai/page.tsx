"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, XCircle, Loader2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page présentait un choix entre cinq fournisseurs IA (Ollama, Mistral,
// OpenAI, Anthropic, DeepSeek) avec endpoint et clé API éditables, et un
// bouton "Enregistrer la configuration" qui ne faisait qu'un setTimeout —
// rien n'était persisté, et même sauvegardé, ce choix n'aurait rien changé :
// l'application n'appelle qu'un seul fournisseur, DeepSeek, configuré côté
// serveur via la variable d'environnement DEEPSEEK_API_KEY
// (src/lib/llm.ts). Un utilisateur saisissant une vraie clé OpenAI ici
// aurait cru avoir changé de fournisseur sans que rien ne se produise. La
// barre "Règles d'imputation (Fallback)" affichait aussi une répartition
// fixe (60% / 30% / 10%) sans donnée réelle derrière.
//
// Cette page affiche désormais l'état réel de la configuration plutôt
// qu'un formulaire trompeur.
// ─────────────────────────────────────────────────────────────────────────────

export default function AILlmSettings() {
    const [statut, setStatut] = useState<{ configured: boolean } | null>(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        fetch("/api/settings/ai-status")
            .then((r) => r.json())
            .then(setStatut)
            .catch(() => setStatut(null))
            .finally(() => setChargement(false));
    }, []);

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/20 flex items-center justify-center shadow-xl shadow-indigo-500/10">
                    <BrainCircuit className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <h2 className="page-title">Moteur IA</h2>
                    <p className="page-subtitle">Assistant utilisé pour les fonctionnalités « Nexus » (rédaction, synthèses).</p>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8 space-y-4">
                {chargement ? (
                    <div className="flex items-center gap-3 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" /> Vérification…
                    </div>
                ) : statut?.configured ? (
                    <div className="flex items-center gap-3 text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                        <div>
                            <p className="font-bold">DeepSeek configuré</p>
                            <p className="text-xs text-slate-500">La clé DEEPSEEK_API_KEY est renseignée côté serveur.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-amber-400">
                        <XCircle className="w-6 h-6" />
                        <div>
                            <p className="font-bold">DeepSeek non configuré</p>
                            <p className="text-xs text-slate-500">
                                La variable d&apos;environnement DEEPSEEK_API_KEY n&apos;est pas renseignée. Les
                                fonctionnalités IA répondent honnêtement qu&apos;elles ne sont pas disponibles plutôt que
                                d&apos;échouer silencieusement.
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        L&apos;application n&apos;intègre actuellement qu&apos;un seul fournisseur (DeepSeek). Le
                        changement de fournisseur ou de modèle n&apos;est pas configurable depuis l&apos;interface : il
                        nécessite une modification du code (src/lib/llm.ts) et un déploiement.
                    </p>
                </div>
            </div>
        </div>
    );
}
