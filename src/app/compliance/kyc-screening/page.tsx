"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Globe,
    Search,
    ShieldCheck,
    UserCheck,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Surveillance KYC.
//
// Cette page attribuait à des entités nommées un score KYC sur 100, un niveau
// de risque et un statut « Compliant » / « Review Required » / « Blocked »,
// affichés en jauge circulaire — le tout inscrit dans le code, sans qu'aucune
// vérification n'ait eu lieu. Elle prétendait aussi se mettre à jour « en
// temps réel via Kanta API », un service qui n'est intégré nulle part.
//
// Comme /compliance/id-verify et /compliance/financial-crime, corrigés dans le
// même lot : aucun prestataire de criblage n'est connecté à cette application.
// Elle ne peut donc produire ni score, ni statut de conformité automatique.
// Ce qu'elle affiche est le registre réel — identifiants OHADA et statut KYC
// saisi par le cabinet — et non un verdict calculé.
// ─────────────────────────────────────────────────────────────────────────────

type EntreeRegistre = {
    id: string;
    name: string;
    country: string;
    hasIdentifiers: boolean;
    lastUpdate: string;
    status: string;
};

type Kpis = {
    total: number;
    validCount: number;
    invalidCount: number;
    pendingCount: number;
    coveragePct: number | null;
};

const STATUT: Record<string, { classe: string; icone: typeof CheckCircle2 }> = {
    "Validé": {
        classe: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icone: CheckCircle2,
    },
    Invalide: {
        classe: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        icone: XCircle,
    },
    "Non renseigné": {
        classe: "bg-slate-800 text-slate-400 border-white/10",
        icone: AlertTriangle,
    },
};

export default function KycScreeningPage() {
    const [recherche, setRecherche] = useState("");
    const [registre, setRegistre] = useState<EntreeRegistre[]>([]);
    const [kpis, setKpis] = useState<Kpis | null>(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/compliance/kyc");
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            const data = await res.json();
            setRegistre(data.registry ?? []);
            setKpis(data.kpis ?? null);
        } catch (e) {
            console.error("Chargement du registre KYC :", e);
            setErreur("Impossible de charger le registre des clients.");
            setRegistre([]);
            setKpis(null);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    const normaliser = (t: string) =>
        t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const terme = normaliser(recherche.trim());

    const resultats = terme
        ? registre.filter(
              (e) => normaliser(e.name).includes(terme) || normaliser(e.country).includes(terme)
          )
        : registre;

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-48 h-48 text-emerald-400" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-emerald-500/20">
                        Conformité LCB-FT
                    </div>
                    <h1 className="page-title-dark flex items-center gap-4">
                        <UserCheck className="w-10 h-10 text-emerald-500" />
                        Registre KYC
                    </h1>
                    <p className="page-subtitle-dark">
                        Identifiants OHADA enregistrés et statut de vérification saisi par le cabinet
                        sur chaque fiche client.
                    </p>
                </div>
            </div>

            {/* Ce que la page ne fait pas, dit sans ambiguïté */}
            <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
                <div className="bg-amber-500/10 p-3 rounded-full shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                        Aucun criblage automatique n&apos;est effectué
                    </h4>
                    <p className="text-xs text-amber-200/80 max-w-2xl leading-relaxed">
                        Aucune synchronisation avec les listes de sanctions ONU, UE ou OFAC, ni avec un
                        registre de personnes politiquement exposées : ce dispositif n&apos;est pas
                        connecté à l&apos;application. Le criblage doit être conduit sur les registres
                        officiels et son résultat consigné au dossier permanent du client.
                    </p>
                </div>
            </div>

            {/* Indicateurs, issus du registre réel */}
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {[
                    { label: "Clients actifs", valeur: kpis?.total ?? 0, icone: Globe },
                    { label: "Statut validé", valeur: kpis?.validCount ?? 0, icone: CheckCircle2 },
                    { label: "Statut invalide", valeur: kpis?.invalidCount ?? 0, icone: XCircle },
                    { label: "Non renseigné", valeur: kpis?.pendingCount ?? 0, icone: AlertTriangle },
                ].map((k) => (
                    <div
                        key={k.label}
                        className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40"
                    >
                        <k.icone className="w-5 h-5 mb-3 text-slate-500" />
                        <h3 className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                            {k.valeur}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {k.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Registre */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/60">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Globe className="w-5 h-5 text-indigo-400" />
                        Portefeuille ({resultats.length})
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="search"
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            placeholder="Rechercher une entité…"
                            className="bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                {erreur && <p className="p-8 text-sm text-rose-400">{erreur}</p>}

                {!erreur && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950/50">
                                <tr>
                                    <th className="px-8 py-5">Entité</th>
                                    <th className="px-6 py-5">Pays</th>
                                    <th className="px-6 py-5">Identifiants OHADA</th>
                                    <th className="px-6 py-5">Statut KYC</th>
                                    <th className="px-8 py-5">Dernière mise à jour</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {chargement ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-10 text-center text-sm text-slate-500">
                                            Chargement…
                                        </td>
                                    </tr>
                                ) : resultats.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-10 text-center text-sm text-slate-500">
                                            {terme ? "Aucun client ne correspond." : "Aucun client actif enregistré."}
                                        </td>
                                    </tr>
                                ) : (
                                    resultats.map((e) => {
                                        const statut = STATUT[e.status] ?? STATUT["Non renseigné"];
                                        const Icone = statut.icone;

                                        return (
                                            <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-white">{e.name}</div>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-mono text-slate-400">
                                                    {e.country}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {e.hasIdentifiers ? (
                                                        <span className="text-xs font-bold text-emerald-400">
                                                            Renseignés
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-amber-400">
                                                            Manquants
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                            statut.classe
                                                        )}
                                                    >
                                                        <Icone className="w-3 h-3" />
                                                        {e.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-mono text-slate-400">
                                                    {e.lastUpdate}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-500">
                Le statut KYC est saisi manuellement sur la fiche client. Il reflète le jugement du
                collaborateur qui l&apos;a renseigné, et non une vérification automatique.
            </p>
        </div>
    );
}
