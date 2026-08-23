import { Radar } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affirmait qu'une IA « surveille les lois de finances OHADA » et
// avait détecté une hausse de taxe télécoms touchant « 14 clients » pour une
// perte de trésorerie moyenne de « -4,5M FCFA », avec un bouton « Notifier
// ces 14 clients » qui n'envoyait rien. Le statut par pays (« Côte d'Ivoire :
// 1 Loi en Revue », « Mali : 2 Décrets Récents ») était tout aussi fixe.
// Aucune veille réglementaire externe (flux légal, API gouvernementale)
// n'est intégrée à l'application : il n'existe donc aucune donnée réelle à
// afficher ici, et en inventer une reviendrait à faire croire au cabinet
// qu'un changement de loi réel a été détecté et notifié à des clients.
// ─────────────────────────────────────────────────────────────────────────────

export default function RadarImpactPage() {
    return (
        <div className="p-8 max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-10 text-center space-y-4">
                <Radar className="w-14 h-14 text-rose-500 mx-auto" />
                <h2 className="text-xl font-black text-white">Veille réglementaire non disponible</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Aucun flux de veille légale ou réglementaire externe n&apos;est intégré à l&apos;application. La
                    détection automatique de nouvelles lois de finances ou décrets, et leur impact estimé sur le
                    portefeuille, n&apos;est pas encore implémentée.
                </p>
                <p className="text-slate-500 text-xs">
                    Le calendrier des échéances fiscales connues reste disponible depuis les modules Fiscalité.
                </p>
            </div>
        </div>
    );
}
