"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    Fingerprint,
    Search,
    ShieldCheck,
    User,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Identification et statut KYC des clients.
//
// Cette page produisait des ATTESTATIONS DE VÉRIFICATION FABRIQUÉES : pour
// n'importe quelle saisie correspondant à un nom, elle renvoyait un score de
// correspondance (95 %, voire 100 %), « identité : match », « conformité :
// clear », « adresse : confirmée », « documents : valides », attribués à un
// « Nexus Global Identity Network » qui n'existe pas. Des institutions réelles
// y figuraient nommément comme vérifiées.
//
// En matière de LCB-FT, un verdict de conformité est un acte engageant. Aucun
// prestataire de vérification d'identité n'étant connecté à cette application,
// elle ne peut pas en produire — et ne le fait plus.
//
// Ce qu'elle affiche désormais est ce que le cabinet sait réellement : les
// identifiants OHADA enregistrés sur la fiche client, et le statut KYC qu'un
// collaborateur a lui-même renseigné. Rien d'autre.
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

export default function NexusIDVerifyPage() {
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
        <div className="space-y-8 pb-20">
            <div className="flex items-start gap-3">
                <span className="mt-1 rounded-xl bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
                    <Fingerprint size={20} />
                </span>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Identification des clients (KYC)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Identifiants OHADA enregistrés et statut de vérification renseigné par le
                        cabinet.
                    </p>
                </div>
            </div>

            {/* Avertissement : aucun prestataire externe n'est connecté. */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
                <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                    aria-hidden="true"
                />
                <p className="text-amber-900 dark:text-amber-200">
                    <strong className="font-semibold">
                        Aucun prestataire de vérification d&apos;identité n&apos;est connecté.
                    </strong>{" "}
                    Cette page n&apos;interroge ni registre officiel, ni liste de sanctions, ni base
                    de personnes politiquement exposées. Elle restitue uniquement ce qui a été saisi
                    sur les fiches clients. Le criblage LCB-FT reste à effectuer hors de
                    l&apos;application, et son résultat à consigner au dossier.
                </p>
            </div>

            {/* Indicateurs, tous issus du registre réel */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: "Clients actifs", valeur: kpis?.total ?? 0 },
                    { label: "Statut validé", valeur: kpis?.validCount ?? 0 },
                    { label: "Statut invalide", valeur: kpis?.invalidCount ?? 0 },
                    { label: "Non renseigné", valeur: kpis?.pendingCount ?? 0 },
                ].map((k) => (
                    <div
                        key={k.label}
                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                        <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                            {k.valeur}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {k.label}
                        </p>
                    </div>
                ))}
            </div>

            {kpis && kpis.pendingCount > 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    {kpis.pendingCount} client{kpis.pendingCount > 1 ? "s" : ""} sans statut KYC
                    renseigné. Un statut absent ne vaut pas conformité.
                </p>
            )}

            <label className="relative block max-w-xl">
                <span className="sr-only">Rechercher un client</span>
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="search"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    placeholder="Nom du client ou code pays…"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-[var(--primary)] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
            </label>

            {erreur && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    {erreur}
                </div>
            )}

            {chargement ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
            ) : resultats.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {terme ? "Aucun client ne correspond." : "Aucun client actif enregistré."}
                </p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                <tr>
                                    <th className="px-5 py-3 text-left font-medium">Client</th>
                                    <th className="px-5 py-3 text-left font-medium">Pays</th>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Identifiants OHADA
                                    </th>
                                    <th className="px-5 py-3 text-left font-medium">Statut KYC</th>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Dernière mise à jour
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {resultats.map((e) => {
                                    const statut = STATUT[e.status] ?? STATUT["Non renseigné"];
                                    const Icone = statut.icone;

                                    return (
                                        <tr
                                            key={e.id}
                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                        >
                                            <td className="px-5 py-3">
                                                <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                                    <Building2
                                                        size={14}
                                                        className="shrink-0 text-slate-400"
                                                    />
                                                    {e.name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-mono text-xs text-slate-500">
                                                {e.country}
                                            </td>
                                            <td className="px-5 py-3">
                                                {e.hasIdentifiers ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400">
                                                        Renseignés
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 dark:text-amber-400">
                                                        Manquants
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold",
                                                        statut.classe
                                                    )}
                                                >
                                                    <Icone size={12} />
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-500">
                                                {e.lastUpdate}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <User size={13} className="mt-0.5 shrink-0" />
                Le statut KYC est saisi manuellement sur la fiche client. Il reflète le jugement du
                collaborateur qui l&apos;a renseigné, et non une vérification automatique.
            </p>
        </div>
    );
}
