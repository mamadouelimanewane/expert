"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Calendar, FileText, RefreshCw, ShieldCheck } from "lucide-react";

type DeclarationSuivie = {
    id: string;
    clientId: string;
    client: string;
    statut: string;
    montant: number | null;
    echeance: string;
    referenceDepot: string | null;
};

type EcheanceSuivie = {
    obligationId: string;
    titre: string;
    categorie: string;
    dateEcheance: string;
    statut: string;
    reference: string;
    source: string;
    sourceUrl: string | null;
    ruleVersion: number | null;
    nbDossiersEligibles: number;
    nbDeclarationsSaisies: number;
    nbDeclarationsDeposees: number;
    nbDeclarationsEnCours: number;
    nbDeclarationsRejetees: number;
    nbNonSaisiesDansOutil: number;
    montantRenseigne: number;
    declarations: DeclarationSuivie[];
};

type TableauConformite = {
    pays: string;
    annee: number;
    mois: number;
    echeances: EcheanceSuivie[];
    statutReglementaire: string;
    avertissement: string;
    aucuneDonnee: boolean;
    synthese: {
        clientsAvecDeclaration: number;
        declarationsSaisies: number;
        declarationsEnCours: number;
        declarationsRejetees: number;
        nonSaisiesDansOutil: number;
        montantRenseigne: number;
    };
};

const devisePays = (pays: string) => ["CM", "GA", "CG", "TD", "CF", "GQ"].includes(pays) ? "XAF" : "XOF";
const libelleStatut: Record<string, string> = {
    NON_CONCERNE: "Aucun dossier concerné",
    A_SAISIR_DANS_OUTIL: "Aucune déclaration saisie ici",
    PARTIEL: "Suivi partiel dans l’application",
    REJETEE: "Au moins une déclaration rejetée",
    EN_COURS: "Déclarations à préparer ou valider",
    DEPOSEE: "Déclarations déposées ou réglées",
    A_VERIFIER: "À vérifier",
};

function couleurStatut(statut: string) {
    if (statut === "DEPOSEE") return "bg-emerald-500/20 text-emerald-400";
    if (statut === "REJETEE") return "bg-rose-500/20 text-rose-400";
    if (statut === "EN_COURS" || statut === "PARTIEL") return "bg-amber-500/20 text-amber-400";
    return "bg-slate-500/20 text-slate-300";
}

export default function ConformiteDashboardPage() {
    const maintenant = new Date();
    const [pays, setPays] = useState("SN");
    const [annee, setAnnee] = useState(maintenant.getFullYear());
    const [mois, setMois] = useState(maintenant.getMonth() + 1);
    const [loading, setLoading] = useState(false);
    const [tableau, setTableau] = useState<TableauConformite | null>(null);
    const [erreur, setErreur] = useState("");

    const chargerTableau = useCallback(async () => {
        setLoading(true);
        setErreur("");
        try {
            const params = new URLSearchParams({ pays, annee: String(annee), mois: String(mois) });
            const res = await fetch(`/api/conformite/dashboard?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Impossible de charger le suivi réglementaire.");
            setTableau(data as TableauConformite);
        } catch (err) {
            setTableau(null);
            setErreur(err instanceof Error ? err.message : "Erreur de chargement.");
        } finally {
            setLoading(false);
        }
    }, [pays, annee, mois]);

    useEffect(() => { void chargerTableau(); }, [chargerTableau]);

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <h1 className="page-title text-2xl font-bold tracking-tight">Suivi des obligations et déclarations</h1>
                    </div>
                    <p className="page-subtitle text-sm text-muted-foreground mt-0.5">
                        État calculé à partir des dossiers et déclarations réellement enregistrés dans ce cabinet.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select aria-label="Pays" value={pays} onChange={(e) => setPays(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
                        <option value="SN">Sénégal (SN)</option>
                        <option value="CI">Côte d&apos;Ivoire (CI)</option>
                        <option value="CM">Cameroun (CM)</option>
                        <option value="BJ">Bénin (BJ)</option>
                        <option value="BF">Burkina Faso (BF)</option>
                        <option value="ML">Mali (ML)</option>
                        <option value="TG">Togo (TG)</option>
                        <option value="NE">Niger (NE)</option>
                    </select>
                    <input aria-label="Année" type="number" min={2000} max={2100} value={annee} onChange={(e) => setAnnee(Number(e.target.value))} className="w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-sm" />
                    <select aria-label="Mois" value={mois} onChange={(e) => setMois(Number(e.target.value))} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(new Date(2025, i, 1))}</option>)}
                    </select>
                    <button onClick={() => void chargerTableau()} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Actualiser
                    </button>
                </div>
            </div>

            {erreur && <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{erreur}</div>}

            {tableau && (
                <>
                    <div role="note" className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                        <div><strong>Calendrier indicatif, sans score de conformité ni pénalité calculée.</strong><p className="mt-1 text-xs text-amber-100/80">{tableau.avertissement}</p></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Kpi label="Déclarations enregistrées" value={tableau.synthese.declarationsSaisies} detail={`${tableau.synthese.clientsAvecDeclaration} client(s) représenté(s)`} />
                        <Kpi label="À préparer ou valider" value={tableau.synthese.declarationsEnCours} detail="Statuts DRAFT et PENDING en base" />
                        <Kpi label="Rejetées" value={tableau.synthese.declarationsRejetees} detail="À examiner avec le dossier" />
                        <Kpi label="Clients sans saisie correspondante" value={tableau.synthese.nonSaisiesDansOutil} detail="Absence dans l’application, dépôt externe non vérifié" />
                    </div>

                    {tableau.aucuneDonnee && <p className="text-sm text-muted-foreground">Aucune déclaration n’est enregistrée pour ce pays et ce mois. Cela ne signifie pas que les clients sont à jour ou en défaut.</p>}

                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Catalogue indicatif · {new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(new Date(2025, tableau.mois - 1, 1))} {tableau.annee}</h2>
                            <Link href="/declarations" className="text-sm text-primary hover:underline">Ouvrir les déclarations</Link>
                        </div>
                        <div className="divide-y divide-border">
                            {tableau.echeances.map((ech) => (
                                <div key={ech.obligationId} className="py-4 space-y-3">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-sm text-foreground">{ech.titre}</span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${couleurStatut(ech.statut)}`}>{libelleStatut[ech.statut] || ech.statut}</span>
                                                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{ech.categorie}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Date indicative : {new Date(ech.dateEcheance).toLocaleDateString("fr-FR")} · {ech.reference}</div>
                                            <div className="text-[11px] text-muted-foreground/80">{ech.source}{ech.sourceUrl && <> · <a href={ech.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Lire la source validée</a></>}</div>
                                            <div className="text-xs text-muted-foreground">{ech.nbDeclarationsSaisies} déclaration(s) saisie(s) / {ech.nbDossiersEligibles} dossier(s) correspondant(s) au profil enregistré · {ech.nbNonSaisiesDansOutil} non saisie(s) dans l’application</div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">Montants saisis : {new Intl.NumberFormat("fr-FR").format(ech.montantRenseigne)} {devisePays(tableau.pays)}</span>
                                    </div>
                                    {ech.declarations.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{ech.declarations.map((declaration) => <div key={declaration.id} className="rounded-lg border border-border/70 bg-background/40 p-3 text-xs"><div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /><strong>{declaration.client}</strong><span className="text-muted-foreground">{declaration.statut}</span></div><div className="mt-1 text-muted-foreground">Échéance saisie : {new Date(declaration.echeance).toLocaleDateString("fr-FR")}{declaration.montant !== null ? ` · ${new Intl.NumberFormat("fr-FR").format(declaration.montant)} ${devisePays(tableau.pays)}` : " · montant non renseigné"}</div></div>)}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function Kpi({ label, value, detail }: { label: string; value: number; detail: string }) {
    return <div className="p-5 rounded-xl border border-border bg-card/40"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold mt-1 text-foreground">{value}</div><div className="text-[11px] text-muted-foreground mt-1">{detail}</div></div>;
}
