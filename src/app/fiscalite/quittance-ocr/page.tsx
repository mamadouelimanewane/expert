"use client";

import { useState } from "react";
import {
    ScanLine, CheckCircle2, AlertTriangle, AlertCircle,
    ArrowRight, Sparkles, FileText, Check, ShieldCheck
} from "lucide-react";

export default function QuittanceOCRPage() {
    const [declarationId, setDeclarationId] = useState("");
    const [texteExtrait, setTexteExtrait] = useState("");
    const [validerAutomatiquement, setValiderAutomatiquement] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resultat, setResultat] = useState<any | null>(null);

    const chargerExempleSenegal = () => {
        setTexteExtrait(`REPUBLIQUE DU SENEGAL
MINISTERE DES FINANCES ET DU BUDGET
DIRECTION GENERALE DES IMPOTS ET DES DOMAINES
CENTRE DES SERVICES FISCAUX DAKAR PLATEAU

QUITTANCE DE PAIEMENT FISCAL
N° de quittance : QUIT-2026-DKR-0098421
Date de règlement : 14/02/2026 10:45:12

REDEVABLE :
Raison Sociale : SENEGAL LOGISTICS SERVICES SA
NINEA : 00458921 2V2

NATURE DU VERSEMENT :
Impôt : TVA & Retenues à la source
Période : JANVIER 2026
Montant Principal : 4.500.000 F CFA
Pénalités : 0 F CFA
MONTANT TOTAL PAYE : 4.500.000 FCFA

Réf. transaction télépaiement : ETX-SN-99812401
Mode de paiement : Télérèglement bancaire validé`);
    };

    const chargerExempleCoteIvoire = () => {
        setTexteExtrait(`REPUBLIQUE DE COTE D'IVOIRE
DIRECTION GENERALE DES IMPOTS
PORTAIL E-IMPOTS CI

ATTESTATION DE VERSEMENT
Reçu N° : CERT-CI-2026-04512
Date : 15/01/2026

Contribuable : ABIDJAN CONSULTING SARL
Compte Contribuable (CC) : 1845120 B

Impôt : Acompte Impôt sur les Sociétés (IS)
Période : 4ème Trimestre 2025
Montant Réglé : 3.250.000 FCFA

Quittance électronique certifiée.`);
    };

    const analyserQuittance = async () => {
        if (!declarationId.trim()) {
            setError("Veuillez saisir un identifiant de déclaration (MongoDB ID).");
            return;
        }
        if (!texteExtrait.trim() || texteExtrait.trim().length < 15) {
            setError("Le texte de la quittance est trop court pour être analysé.");
            return;
        }

        setLoading(true);
        setError("");
        setResultat(null);

        try {
            const res = await fetch("/api/fiscalite/quittance-ocr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    declarationId: declarationId.trim(),
                    texteExtrait,
                    validerAutomatiquement,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Erreur lors de l'analyse de la quittance.");
            }

            setResultat(data);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'analyse.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <ScanLine className="w-6 h-6 text-primary" />
                    Ingestion Intelligente de Quittances Fiscales par OCR
                </h2>
                <p className="page-subtitle">
                    Numérisation, extraction automatique des métadonnées (quittance, date, montant, NINEA/IFU) et réconciliation sans saisie manuelle.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Formulaire à gauche (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Identifiant de la Déclaration Fiscale Cible (MongoDB ID) *
                            </label>
                            <input
                                type="text"
                                value={declarationId}
                                onChange={(e) => setDeclarationId(e.target.value)}
                                placeholder="ex: 66a2b8e5c1d3f20014a991b1"
                                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                La quittance analysée sera directement rattachée à cette déclaration pour sceller son statut de paiement.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-semibold text-foreground">
                                    Texte brut issu de l'OCR ou du reçu PDF *
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={chargerExempleSenegal}
                                        className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3 text-primary" />
                                        Exemple DGID Sénégal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={chargerExempleCoteIvoire}
                                        className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3 text-primary" />
                                        Exemple DGI Côte d'Ivoire
                                    </button>
                                </div>
                            </div>

                            <textarea
                                rows={10}
                                value={texteExtrait}
                                onChange={(e) => setTexteExtrait(e.target.value)}
                                placeholder="Collez ici le texte extrait du document officiel de quittance (DGID, e-Impots, avis de débit banque)..."
                                className="w-full p-3 text-xs bg-background border border-border rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border">
                            <input
                                type="checkbox"
                                id="autoValidate"
                                checked={validerAutomatiquement}
                                onChange={(e) => setValiderAutomatiquement(e.target.checked)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                            />
                            <label htmlFor="autoValidate" className="text-xs text-foreground cursor-pointer">
                                <strong>Validation automatique :</strong> Si le score de confiance OCR est supérieur ou égal à 70 %, marquer la déclaration comme payée (<code className="text-emerald-400">VALIDATED</code>) et enregistrer le reçu officiel.
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={analyserQuittance}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <>Extraction et rapprochement en cours...</>
                            ) : (
                                <>
                                    <ScanLine className="w-4 h-4" />
                                    Lancer l'Extraction & le Rapprochement OCR
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Panneau de résultats à droite (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {!resultat ? (
                        <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-3">
                            <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
                            <h4 className="text-sm font-semibold text-foreground">Aucune quittance analysée</h4>
                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                Collez un reçu ou utilisez un des boutons d'exemple pour lancer le moteur d'extraction certifié OHADA.
                            </p>
                        </div>
                    ) : (
                        <div className="p-6 rounded-2xl border border-border bg-card/60 space-y-6">
                            {/* Score de confiance */}
                            <div className="flex items-center justify-between pb-4 border-b border-border">
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Indice de Fiabilité OCR</h3>
                                    <p className="text-xs text-muted-foreground">Score de confiance global</p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`text-2xl font-black ${
                                            resultat.extraction.confianceGlobale >= 70
                                                ? "text-emerald-400"
                                                : resultat.extraction.confianceGlobale >= 40
                                                ? "text-amber-400"
                                                : "text-rose-400"
                                        }`}
                                    >
                                        {resultat.extraction.confianceGlobale} %
                                    </span>
                                </div>
                            </div>

                            {/* Statut déclaration */}
                            {resultat.declarationMiseAJour ? (
                                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
                                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        Déclaration Validée & Rapprochée
                                    </div>
                                    <p>
                                        La déclaration a été basculée au statut <strong className="underline">VALIDATED</strong> avec le reçu n° <code className="font-mono">{resultat.declarationMiseAJour.filingReceipt}</code>.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
                                    {resultat.message}
                                </div>
                            )}

                            {/* Données extraites */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Données Fiscales Détectées
                                </h4>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between p-2 rounded-lg bg-background border border-border">
                                        <span className="text-muted-foreground">N° Quittance :</span>
                                        <span className="font-mono font-bold text-foreground">
                                            {resultat.extraction.numeroQuittance || "Non détecté"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between p-2 rounded-lg bg-background border border-border">
                                        <span className="text-muted-foreground">Date de Paiement :</span>
                                        <span className="font-mono text-foreground">
                                            {resultat.extraction.datePaiement || "Non détectée"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between p-2 rounded-lg bg-background border border-border">
                                        <span className="text-muted-foreground">Montant Règlement :</span>
                                        <span className="font-mono font-bold text-emerald-400 text-sm">
                                            {resultat.extraction.montantPaye !== null
                                                ? `${Number(resultat.extraction.montantPaye).toLocaleString("fr-FR")} F`
                                                : "Non détecté"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between p-2 rounded-lg bg-background border border-border">
                                        <span className="text-muted-foreground">Identifiant Fiscal (NINEA/IFU) :</span>
                                        <span className="font-mono text-foreground">
                                            {resultat.extraction.identifiantFiscal || "Non détecté"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between p-2 rounded-lg bg-background border border-border">
                                        <span className="text-muted-foreground">Période :</span>
                                        <span className="font-mono text-foreground">
                                            {resultat.extraction.periodeFiscale || "Non détectée"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between p-2 rounded-lg bg-background border border-border">
                                        <span className="text-muted-foreground">Type d'impôt :</span>
                                        <span className="font-mono text-foreground">
                                            {resultat.extraction.typeDeclarationDetecte || "Non détecté"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Alertes éventuelles */}
                            {resultat.extraction.alertes && resultat.extraction.alertes.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-border">
                                    <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Points de Vigilance ({resultat.extraction.alertes.length})
                                    </h4>
                                    <ul className="space-y-1">
                                        {resultat.extraction.alertes.map((a: string, idx: number) => (
                                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                                <span className="text-amber-400">•</span>
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
