"use client";

import { useState, useCallback } from "react";
import {
    Gavel, FileText, CheckCircle2, AlertTriangle,
    Printer, RefreshCw, ShieldCheck, Plus, Trash2,
    Calendar, Building2, Scale, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConventionInput {
    id: string;
    personneConcernee: string;
    qualite: string;
    natureConvention: string;
    montantOuEngagement: number;
    interetPourSociete: string;
}

export default function AgGeneratorPage() {
    const [clientId, setClientId] = useState("");
    const [exercice, setExercice] = useState("");
    const [dateAssemblee, setDateAssemblee] = useState("");

    // Société
    const [raisonSociale, setRaisonSociale] = useState("");
    const [formeJuridique, setFormeJuridique] = useState<"" | "SARL" | "SAS" | "SA">("");
    const [capitalSocial, setCapitalSocial] = useState("");
    const [nombreTitres, setNombreTitres] = useState("");
    const [dirigeantNom, setDirigeantNom] = useState("");
    const [dirigeantQualite, setDirigeantQualite] = useState("");
    const [rccm, setRccm] = useState("");
    const [identifiantFiscal, setIdentifiantFiscal] = useState("");
    const [siegeSocial, setSiegeSocial] = useState("");
    const [ville, setVille] = useState("");
    const [pays, setPays] = useState("");

    // Données financières
    const [resultatNet, setResultatNet] = useState("");
    const [reportANouveau, setReportANouveau] = useState("");
    const [reserveLegaleExistante, setReserveLegaleExistante] = useState("");
    const [dividendeParTitre, setDividendeParTitre] = useState("");

    // Conventions
    const [conventions, setConventions] = useState<ConventionInput[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [liasse, setLiasse] = useState<any | null>(null);
    const [documentArchive, setDocumentArchive] = useState(false);

    const ajouterConvention = () => {
        setConventions([
            ...conventions,
            {
                id: String(Date.now()),
                personneConcernee: "",
                qualite: "",
                natureConvention: "",
                montantOuEngagement: 0,
                interetPourSociete: "",
            },
        ]);
    };

    const supprimerConvention = (id: string) => {
        setConventions(conventions.filter((c) => c.id !== id));
    };

    const modifierConvention = (id: string, champ: keyof ConventionInput, val: any) => {
        setConventions(conventions.map((c) => (c.id === id ? { ...c, [champ]: val } : c)));
    };

    const genererAG = async () => {
        if (!clientId.trim() || clientId.trim().length < 12) {
            setError("Veuillez renseigner un identifiant client valide (MongoDB ID).");
            return;
        }
        const requiredText = [raisonSociale, formeJuridique, rccm, identifiantFiscal, siegeSocial, ville, pays, dirigeantNom, dirigeantQualite, exercice, dateAssemblee, capitalSocial, nombreTitres, resultatNet, reportANouveau, reserveLegaleExistante, dividendeParTitre];
        if (requiredText.some((value) => !value.trim()) || Number(nombreTitres) <= 0 || Number(capitalSocial) < 0) {
            setError("Renseignez les informations juridiques et les données comptables réelles avant de générer le procès-verbal.");
            return;
        }

        setLoading(true);
        setError("");
        setDocumentArchive(false);

        try {
            const res = await fetch("/api/legal/ag-generator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: clientId.trim(),
                    societe: {
                        raisonSociale,
                        formeJuridique,
                        capitalSocial: Number(capitalSocial),
                        valeurNominaleTitre: Number(capitalSocial) / Number(nombreTitres),
                        nombreTitres: Number(nombreTitres),
                        rccm,
                        identifiantFiscal,
                        siegeSocial,
                        ville,
                        pays: pays.toLowerCase(),
                        dirigeantNom,
                        dirigeantQualite,
                    },
                    financier: {
                        exercice: Number(exercice),
                        dateAssemblee,
                        resultatNetExercice: Number(resultatNet),
                        reportANouveauExistant: Number(reportANouveau),
                        reserveLegaleExistante: Number(reserveLegaleExistante),
                        dividendeProposeParTitre: Number(dividendeParTitre),
                    },
                    conventions,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur de génération");

            setLiasse(data.liasse);
            setDocumentArchive(true);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la génération de la liasse juridique.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Gavel className="w-6 h-6 text-primary" />
                    Secrétariat Juridique — Approbation des Comptes & AGOA (OHADA)
                </h2>
                <p className="page-subtitle">
                    Générateur d'Assemblée Générale Ordinaire Annuelle selon l'AUSCGIE : Réserve Légale 20 %, affectation du résultat, conventions réglementées et formalités de dépôt au greffe RCCM.
                </p>
                <p className="mt-2 text-xs text-amber-300">Le document est généré à partir des informations saisies. Vérifiez les pièces sociales, les comptes approuvés, les règles applicables et les délais avant signature ou dépôt.</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Formulaire Paramètres Juridiques */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border text-foreground font-semibold text-sm">
                    <Building2 className="w-4 h-4 text-primary" />
                    1. Caractéristiques de la Société & Gouvernance
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div>
                        <label className="block text-muted-foreground mb-1">Identifiant Client (MongoDB ID) *</label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="ex: 60c72b2f9b1d8b2bad592a88"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1">Raison Sociale</label>
                        <input
                            type="text"
                            value={raisonSociale}
                            onChange={(e) => setRaisonSociale(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1">Forme Sociale OHADA</label>
                        <select
                            value={formeJuridique}
                            onChange={(e) => setFormeJuridique(e.target.value as "" | "SARL" | "SAS" | "SA")}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-semibold"
                        >
                            <option value="">Choisir la forme sociale</option>
                            <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                            <option value="SAS">SAS (Société par Actions Simplifiée)</option>
                            <option value="SA">SA (Société Anonyme avec CA ou Administrateur)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1">Capital Social (FCFA)</label>
                        <input
                            type="number"
                            value={capitalSocial}
                            onChange={(e) => setCapitalSocial(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                    <label className="block text-muted-foreground">Numéro RCCM<input value={rccm} onChange={(e) => setRccm(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" /></label>
                    <label className="block text-muted-foreground">Identifiant fiscal<input value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" /></label>
                    <label className="block text-muted-foreground">Adresse du siège<input value={siegeSocial} onChange={(e) => setSiegeSocial(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" /></label>
                    <label className="block text-muted-foreground">Ville<input value={ville} onChange={(e) => setVille(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" /></label>
                    <label className="block text-muted-foreground">Code pays<input value={pays} onChange={(e) => setPays(e.target.value)} placeholder="sn, ci, cm…" className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" /></label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label className="block text-muted-foreground mb-1">Nombre d'Actions / Parts Sociales</label>
                        <input
                            type="number"
                            value={nombreTitres}
                            onChange={(e) => setNombreTitres(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1">Nom du Dirigeant Social</label>
                        <input
                            type="text"
                            value={dirigeantNom}
                            onChange={(e) => setDirigeantNom(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1">Qualité / Titre</label>
                        <input
                            type="text"
                            value={dirigeantQualite}
                            onChange={(e) => setDirigeantQualite(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        />
                    </div>
                </div>
            </div>

            {/* Paramètres Financiers & Affectation */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border text-foreground font-semibold text-sm">
                    <Scale className="w-4 h-4 text-primary" />
                    2. Données Comptables de l'Exercice & Projet de Distribution
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 text-xs font-mono">
                    <div>
                        <label className="block text-muted-foreground mb-1 font-sans">Exercice Clos</label>
                        <input
                            type="number"
                            value={exercice}
                            onChange={(e) => setExercice(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1 font-sans">Date de Réunion de l'AG</label>
                        <input
                            type="date"
                            value={dateAssemblee}
                            onChange={(e) => setDateAssemblee(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1 font-sans">Résultat Net Comptable</label>
                        <input
                            type="number"
                            value={resultatNet}
                            onChange={(e) => setResultatNet(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-bold text-foreground"
                        />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1 font-sans">Report à nouveau</label>
                        <input type="number" value={reportANouveau} onChange={(e) => setReportANouveau(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1 font-sans">Réserve Légale Actuelle</label>
                        <input
                            type="number"
                            value={reserveLegaleExistante}
                            onChange={(e) => setReserveLegaleExistante(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-muted-foreground mb-1 font-sans">Dividende Brut / Action</label>
                        <input
                            type="number"
                            value={dividendeParTitre}
                            onChange={(e) => setDividendeParTitre(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-primary font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Conventions Réglementées */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">
                            3. Conventions Réglementées (AUSCGIE art. 350 & 438)
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Conventions conclues directement ou par personne interposée avec les dirigeants ou associés significatifs.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={ajouterConvention}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition"
                    >
                        <Plus className="w-3.5 h-3.5 text-primary" />
                        Ajouter une convention
                    </button>
                </div>

                <div className="space-y-3">
                    {conventions.map((conv) => (
                        <div
                            key={conv.id}
                            className="p-4 rounded-xl border border-border bg-background/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
                        >
                            <div className="md:col-span-3">
                                <label className="text-[10px] text-muted-foreground block">Personne concernée & Qualité</label>
                                <input
                                    type="text"
                                    value={conv.personneConcernee}
                                    onChange={(e) => modifierConvention(conv.id, "personneConcernee", e.target.value)}
                                    placeholder="Nom"
                                    className="w-full px-2 py-1 rounded border border-border bg-background font-medium mb-1"
                                />
                                <input
                                    type="text"
                                    value={conv.qualite}
                                    onChange={(e) => modifierConvention(conv.id, "qualite", e.target.value)}
                                    placeholder="Qualité (ex: Gérant)"
                                    className="w-full px-2 py-1 rounded border border-border bg-background text-[11px]"
                                />
                            </div>
                            <div className="md:col-span-4">
                                <label className="text-[10px] text-muted-foreground block">Nature & Objet</label>
                                <input
                                    type="text"
                                    value={conv.natureConvention}
                                    onChange={(e) => modifierConvention(conv.id, "natureConvention", e.target.value)}
                                    className="w-full px-2 py-1 rounded border border-border bg-background mb-1"
                                />
                                <input
                                    type="text"
                                    value={conv.interetPourSociete}
                                    onChange={(e) => modifierConvention(conv.id, "interetPourSociete", e.target.value)}
                                    placeholder="Justification économique"
                                    className="w-full px-2 py-1 rounded border border-border bg-background text-[11px]"
                                />
                            </div>
                            <div className="md:col-span-4">
                                <label className="text-[10px] text-muted-foreground block">Montant / Engagement (FCFA)</label>
                                <input
                                    type="number"
                                    value={conv.montantOuEngagement}
                                    onChange={(e) => modifierConvention(conv.id, "montantOuEngagement", Number(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded border border-border bg-background font-mono font-bold"
                                />
                            </div>
                            <div className="md:col-span-1 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => supprimerConvention(conv.id)}
                                    className="p-1.5 text-muted-foreground hover:text-rose-400 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-3">
                    <button
                        onClick={genererAG}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Générer et Sceller la Liasse Juridique d'AGOA
                    </button>
                </div>
            </div>

            {/* Résultats & Documents Juridiques Produits */}
            {liasse && (
                <div className="space-y-6">
                    {/* Alerte Délais RCCM */}
                    <div className="p-5 rounded-2xl border border-primary/30 bg-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                            <span className="font-bold text-sm text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Formalité Légale de Dépôt au Greffe du Tribunal (RCCM)
                            </span>
                            <p className="text-muted-foreground">
                                Les comptes annuels et le PV d'AGOA doivent être obligatoirement déposés au greffe sous <strong>1 mois</strong> suivant l'AG (AUSCGIE art. 548).
                            </p>
                            <p className="font-mono text-primary font-bold">
                                Date limite impérative de dépôt : {liasse.formalitesDepotGreffe.dateLimiteDepot}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2 transition"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimer la Liasse Juridique
                            </button>
                        </div>
                    </div>

                    {/* Tableau Synthèse Affectation */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
                            Décompte d'Affectation du Résultat (AUSCGIE art. 346)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                            <div className="p-3 bg-background rounded-xl border border-border">
                                <span className="text-muted-foreground font-sans block">Plafond Réserve (20% Capital)</span>
                                <span className="text-base font-black text-foreground">
                                    {liasse.affectation.plafondReserveLegale20Pct.toLocaleString("fr-FR")} F
                                </span>
                            </div>
                            <div className="p-3 bg-background rounded-xl border border-border">
                                <span className="text-muted-foreground font-sans block">Dotation Réserve Requise</span>
                                <span className="text-base font-black text-amber-400">
                                    {liasse.affectation.dotationReserveLegaleRequise.toLocaleString("fr-FR")} F
                                </span>
                            </div>
                            <div className="p-3 bg-background rounded-xl border border-border">
                                <span className="text-muted-foreground font-sans block">Dividende Brut Total</span>
                                <span className="text-base font-black text-foreground">
                                    {liasse.affectation.dividendeTotalBrut.toLocaleString("fr-FR")} F
                                </span>
                            </div>
                            <div className="p-3 bg-background rounded-xl border border-border">
                                <span className="text-muted-foreground font-sans block">Dividende Net après IRVM (10%)</span>
                                <span className="text-base font-black text-emerald-400">
                                    {liasse.affectation.dividendeNetTotal.toLocaleString("fr-FR")} F
                                </span>
                                <span className="text-[10px] text-muted-foreground block">
                                    {liasse.affectation.dividendeNetParTitre} F / action
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Textes des Résolutions */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
                            Résolutions Soumises à l'Assemblée Générale ({liasse.resolutions.length})
                        </h3>

                        <div className="space-y-4">
                            {liasse.resolutions.map((r: any) => (
                                <div key={r.numero} className="p-4 rounded-xl border border-border bg-background space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-xs text-primary">
                                            RÉSOLUTION N° {r.numero} : {r.titre}
                                        </h4>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold">
                                            {r.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line font-serif">
                                        {r.texte}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
