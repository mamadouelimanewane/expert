"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Link2, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseWaveCSV } from "@/lib/connectors/wave-connector";

// ─────────────────────────────────────────────────────────────────────────────
// Connecteurs & imports.
//
// Cette page simulait un import : la zone de dépôt ne lisait aucun fichier,
// et après un délai artificiel affichait toujours les cinq mêmes lignes
// fictives, annonçant « 342 écritures détectées, 100 % mappé automatiquement »
// et un bouton « Valider & Intégrer au Grand Livre » qui n'écrivait rien.
//
// Seuls les formats CSV (Wave, CSV générique) disposent d'un analyseur réel
// (parseWaveCSV). Sage 100 (.PNM propriétaire) et QuickBooks (FEC) n'en ont
// pas : plutôt que de prétendre les supporter, ils sont désactivés. Le
// fichier déposé est réellement lu, chaque ligne passe par le même moteur
// d'imputation que le canal WhatsApp (règles, apprentissage, sinon compte
// d'attente), et le résultat affiché est celui que l'import a réellement
// produit — jamais un taux de succès annoncé à l'avance.
// ─────────────────────────────────────────────────────────────────────────────

type Connecteur = {
    id: string;
    name: string;
    color: string;
    desc: string;
    badge: string;
    disponible: boolean;
};

const CONNECTORS: Connecteur[] = [
    { id: "wave", name: "Wave Accounting", color: "emerald", desc: "Export CSV (date, description, compte, montant)", badge: "CSV", disponible: true },
    { id: "csv", name: "CSV Générique", color: "slate", desc: "Même format de colonnes que Wave", badge: "CSV", disponible: true },
    { id: "sage", name: "Sage 100", color: "blue", desc: "Format .PNM propriétaire — non pris en charge", badge: "Indisponible", disponible: false },
    { id: "quickbooks", name: "QuickBooks (FEC)", color: "amber", desc: "Export FEC — non pris en charge", badge: "Indisponible", disponible: false },
];

type ResultatImport = { importees: number; ecritures: number; aQualifier: number; periode: string };

export default function ConnectorsPage() {
    const [activeConnector, setActiveConnector] = useState(CONNECTORS[0].id);
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    const [clientId, setClientId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [resultat, setResultat] = useState<ResultatImport | null>(null);
    const [erreur, setErreur] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeConnData = CONNECTORS.find((c) => c.id === activeConnector)!;

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/clients?limit=200&isActive=true");
                if (!res.ok) return;
                const data = await res.json();
                setClients(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                    }))
                );
            } catch (e) {
                console.error("Chargement du portefeuille :", e);
            }
        })();
    }, []);

    const handleFile = async (file: File) => {
        if (!clientId) {
            setErreur("Sélectionnez le client concerné avant d'importer.");
            return;
        }

        setIsUploading(true);
        setErreur(null);
        setResultat(null);
        try {
            const contenu = await file.text();
            const { transactions, lignesRejetees } = parseWaveCSV(contenu);

            // Les lignes illisibles etaient auparavant ramenees a 0 FCFA et
            // importees comme des depenses : le releve entrait « avec succes »,
            // ampute. On refuse desormais l'import entier en les listant.
            if (lignesRejetees.length > 0) {
                throw new Error(
                    [
                        `Fichier non importé — ${lignesRejetees.length} ligne(s) illisible(s) :`,
                        ...lignesRejetees.slice(0, 10),
                    ].join(String.fromCharCode(10))
                );
            }

            if (transactions.length === 0) {
                throw new Error("Aucune ligne exploitable dans ce fichier (colonnes attendues : date, description, compte, montant).");
            }

            const res = await fetch("/api/ingest/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId,
                    transactions: transactions.map((t) => ({
                        date: t.date,
                        libelle: t.description,
                        amount: t.amount,
                        type: t.type,
                    })),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Réponse ${res.status}`);

            setResultat(data);
        } catch (e) {
            console.error("Import :", e);
            setErreur(e instanceof Error ? e.message : "Échec de l'import.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <Link2 className="w-6 h-6 text-primary" /> Connecteurs & Imports
                    </h2>
                    <p className="page-subtitle">
                        Import réel d&apos;écritures, imputées par le même moteur que le canal WhatsApp
                    </p>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-6">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Client concerné *
                </label>
                <select
                    value={clientId}
                    onChange={(e) => {
                        setClientId(e.target.value);
                        setResultat(null);
                        setErreur(null);
                    }}
                    className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white"
                >
                    <option value="">Sélectionner un client</option>
                    {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nom}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-4">
                    {CONNECTORS.map((conn) => (
                        <button
                            key={conn.id}
                            disabled={!conn.disponible}
                            onClick={() => {
                                setActiveConnector(conn.id);
                                setResultat(null);
                                setErreur(null);
                            }}
                            className={cn(
                                "w-full text-left p-6 rounded-[32px] border transition-all",
                                !conn.disponible && "opacity-40 cursor-not-allowed",
                                activeConnector === conn.id
                                    ? "bg-slate-900/80 border-primary/50 shadow-xl shadow-primary/10"
                                    : "bg-slate-900/40 border-white/5 hover:bg-slate-900/60"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl", `bg-${conn.color}-500/20 text-${conn.color}-400`)}>
                                    {conn.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-lg font-black text-slate-200">{conn.name}</h3>
                                        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-400">
                                            {conn.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">{conn.desc}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl h-full min-h-[400px] flex flex-col">
                        <div className="mb-8 pb-6 border-b border-white/5">
                            <h3 className="text-xl font-black text-white">Importer depuis {activeConnData.name}</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Chaque ligne est imputée par le moteur comptable ; les écritures non
                                reconnues partent en compte d&apos;attente, à qualifier avant export.
                            </p>
                        </div>

                        {!activeConnData.disponible ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
                                <p className="text-slate-400 text-sm max-w-sm">
                                    Aucun analyseur n&apos;est implémenté pour ce format. Exportez en CSV
                                    (colonnes date, description, compte, montant) puis utilisez le
                                    connecteur « CSV Générique ».
                                </p>
                            </div>
                        ) : erreur ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
                                <p className="text-rose-300 text-sm max-w-sm">{erreur}</p>
                                <button
                                    onClick={() => setErreur(null)}
                                    className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : resultat ? (
                            <div className="flex-1 flex flex-col">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 mb-4">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-400">Import terminé</h4>
                                        <p className="text-xs text-emerald-400/80">
                                            {resultat.importees} transaction{resultat.importees > 1 ? "s" : ""} lue
                                            {resultat.importees > 1 ? "s" : ""}, {resultat.ecritures} écriture
                                            {resultat.ecritures > 1 ? "s" : ""} créée{resultat.ecritures > 1 ? "s" : ""} en
                                            attente de validation.
                                        </p>
                                    </div>
                                </div>

                                {resultat.aQualifier > 0 && (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 mb-4">
                                        {resultat.aQualifier} transaction{resultat.aQualifier > 1 ? "s n'ont" : " n'a"} pas
                                        pu être imputée{resultat.aQualifier > 1 ? "s" : ""} automatiquement et
                                        {resultat.aQualifier > 1 ? " sont" : " est"} en compte d&apos;attente.
                                    </div>
                                )}

                                <a
                                    href="/comptabilite/production"
                                    className="mt-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                                >
                                    <FileSpreadsheet className="w-4 h-4" /> Voir la production comptable
                                </a>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div
                                    className={cn(
                                        "w-full max-w-lg border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-12 transition-colors",
                                        clientId
                                            ? "border-primary/30 bg-primary/5 hover:brightness-110/10 cursor-pointer"
                                            : "border-white/5 bg-white/[0.02] cursor-not-allowed"
                                    )}
                                    onClick={() => clientId && fileInputRef.current?.click()}
                                >
                                    <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                                        {isUploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <UploadCloud className="w-10 h-10" />}
                                    </div>
                                    <h4 className="text-lg font-black text-white mb-2">
                                        {isUploading ? "Import en cours…" : "Cliquez pour choisir un fichier"}
                                    </h4>
                                    <p className="text-slate-400 text-sm text-center">
                                        {clientId ? "Format accepté : .CSV" : "Sélectionnez un client ci-dessus au préalable"}
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,text/csv"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFile(file);
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
