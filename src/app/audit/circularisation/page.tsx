"use client";

import { useState, useCallback } from "react";
import {
    MailCheck,
    Send,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Copy,
    Building2,
    Users,
    Landmark,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    TiersACirculariser,
    ReponseTiersConfirmation,
    EcartRapprochementTiers
} from "@/lib/ohada/audit-circularisation";

const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

export default function CircularisationPage() {
    const [seuilSignification, setSeuilSignification] = useState(5_000_000);

    const [tiersList, setTiersList] = useState<TiersACirculariser[]>([
        { id: "1", categorie: "FOURNISSEUR", numeroCompte: "401100", denominationOuNom: "TOTAL ENERGIES MARKETING SENEGAL", adresse: "Route des hydrocarbures, Dakar", soldeComptableLivre: 28_500_000, devise: "XOF" },
        { id: "2", categorie: "FOURNISSEUR", numeroCompte: "401200", denominationOuNom: "SONATEL ENTREPRISES", adresse: "Boulevard de la République, Dakar", soldeComptableLivre: 4_200_000, devise: "XOF" },
        { id: "3", categorie: "CLIENT", numeroCompte: "411100", denominationOuNom: "DISTRIBUTEUR SAHEL SARL", adresse: "Avenue Malick Sy, Dakar", soldeComptableLivre: 16_800_000, devise: "XOF" },
        { id: "4", categorie: "BANQUE", numeroCompte: "521100", denominationOuNom: "CBAO GROUPE ATTIJARIWAFA BANK", adresse: "Place de l'Indépendance, Dakar", soldeComptableLivre: 85_400_000, devise: "XOF" },
    ]);

    // Rapprochement interactif sur le tiers sélectionné
    const [selectedTiers, setSelectedTiers] = useState<TiersACirculariser>(tiersList[0]);
    const [soldeConfirme, setSoldeConfirme] = useState(31_500_000);
    const [reglementsEnCours, setReglementsEnCours] = useState(3_000_000);
    const [facturesNonCompta, setFacturesNonCompta] = useState(0);

    const [loading, setLoading] = useState(false);
    const [rapprochementResult, setRapprochementResult] = useState<EcartRapprochementTiers | null>(null);
    const [lettreSelectionnee, setLettreSelectionnee] = useState<string>("");
    const [copie, setCopie] = useState(false);

    const echantillon = tiersList.filter(t => Math.abs(t.soldeComptableLivre) >= seuilSignification);

    const genererLettre = (t: TiersACirculariser) => {
        setSelectedTiers(t);
        const l = `DEMANDE DE CONFIRMATION DIRECTE DE SOLDE (ISA 505)

À l'attention de la Direction Financière / Comptable
${t.denominationOuNom}
${t.adresse}

Madame, Monsieur,
Dans le cadre de l'audit légal des comptes annuels au 31/12/2025 de notre société, nos Commissaires aux Comptes procèdent à la vérification directe des comptes de tiers.
Selon nos livres, le solde de votre compte (${t.numeroCompte}) présentait une position de : ${f(t.soldeComptableLivre)}.
Merci de confirmer la conformité de ce montant ou de communiquer vos éventuels écarts.`;
        setLettreSelectionnee(l);
    };

    const executerRapprochement = useCallback(async () => {
        setLoading(true);
        setRapprochementResult(null);

        const payload = {
            tiers: selectedTiers,
            reponse: {
                tiersId: selectedTiers.id,
                dateReponse: new Date().toISOString().split("T")[0],
                soldeConfirmeParTiers: soldeConfirme,
                montantReglementsEnCirculation: reglementsEnCours,
                montantFacturesNonComptabilisees: facturesNonCompta,
            }
        };

        try {
            const res = await fetch("/api/audit/circularisation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.ok) setRapprochementResult(data.rapprochement);
        } catch {} finally {
            setLoading(false);
        }
    }, [selectedTiers, soldeConfirme, reglementsEnCours, facturesNonCompta]);

    const copier = (texte: string) => {
        navigator.clipboard.writeText(texte);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            <div>
                <h1 className="page-title text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MailCheck className="w-6 h-6 text-primary" />
                    Circularisation & Confirmations Directes (Norme ISA 505)
                </h1>
                <p className="page-subtitle text-xs text-muted-foreground mt-1">
                    Échantillonnage statistique selon seuil de signification, génération automatique des lettres aux tiers et rapprochement des réponses.
                </p>
            </div>

            {/* Échantillonnage & Tiers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" />
                            Seuil de Signification ISA 320
                        </h2>
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1 font-medium">Seuil de planification (FCFA)</label>
                        <input
                            type="number"
                            value={seuilSignification}
                            onChange={(e) => setSeuilSignification(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                        />
                    </div>
                    <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tiers éligibles :</span>
                            <strong className="text-foreground">{echantillon.length} / {tiersList.length}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Couverture du solde :</span>
                            <strong className="text-emerald-400">96.8% de la masse</strong>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-card/40 border border-border rounded-xl p-5 space-y-3">
                    <h2 className="text-sm font-semibold flex items-center justify-between">
                        <span>Échantillon Retenu pour Confirmation Directe</span>
                        <span className="text-xs text-muted-foreground">{echantillon.length} tiers audités</span>
                    </h2>

                    <div className="space-y-2">
                        {echantillon.map((t) => (
                            <div
                                key={t.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border text-xs transition-all",
                                    selectedTiers.id === t.id ? "border-primary bg-primary/10" : "border-border bg-background/50 hover:bg-background"
                                )}
                            >
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-primary">{t.numeroCompte}</span>
                                        <span className="font-semibold text-foreground">{t.denominationOuNom}</span>
                                        <span className="text-[10px] text-muted-foreground">({t.categorie})</span>
                                    </div>
                                    <p className="text-muted-foreground text-[11px]">{t.adresse}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-foreground">{f(t.soldeComptableLivre)}</span>
                                    <button
                                        onClick={() => genererLettre(t)}
                                        className="bg-primary/20 text-primary hover:bg-primary/30 px-2.5 py-1 rounded text-xs font-medium"
                                    >
                                        Sélectionner
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rapprochement de la réponse du tiers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <Send className="w-4 h-4 text-primary" />
                        Dépouillement de la Réponse de {selectedTiers.denominationOuNom}
                    </h2>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Solde dans nos comptes</label>
                            <input
                                type="text"
                                disabled
                                value={f(selectedTiers.soldeComptableLivre)}
                                className="w-full bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Solde confirmé par le tiers</label>
                            <input
                                type="number"
                                value={soldeConfirme}
                                onChange={(e) => setSoldeConfirme(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Règlements en circulation (chèques/virements)</label>
                            <input
                                type="number"
                                value={reglementsEnCours}
                                onChange={(e) => setReglementsEnCours(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Factures non comptabilisées (FNP/FAE)</label>
                            <input
                                type="number"
                                value={facturesNonCompta}
                                onChange={(e) => setFacturesNonCompta(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <button
                        onClick={executerRapprochement}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Valider le Rapprochement de Circularisation
                    </button>

                    {rapprochementResult && (
                        <div className="pt-3 border-t border-border space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">Statut de la confirmation :</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded font-bold",
                                    rapprochementResult.statutAudit === "CONFORME" ? "bg-emerald-950/80 text-emerald-300" :
                                    rapprochementResult.statutAudit === "ECART_JUSTIFIE" ? "bg-amber-950/80 text-amber-300" : "bg-red-950/80 text-red-300"
                                )}>
                                    {rapprochementResult.statutAudit}
                                </span>
                            </div>
                            <p className="text-muted-foreground">{rapprochementResult.risqueDetecte}</p>
                        </div>
                    )}
                </div>

                {/* Lettre générée */}
                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Modèle de Lettre de Confirmation
                        </h2>
                        {lettreSelectionnee && (
                            <button
                                onClick={() => copier(lettreSelectionnee)}
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                {copie ? "Copié !" : "Copier"}
                            </button>
                        )}
                    </div>
                    <pre className="p-3 bg-background border border-border rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                        {lettreSelectionnee || "Sélectionnez un tiers ci-dessus pour afficher la lettre de circularisation."}
                    </pre>
                </div>
            </div>
        </div>
    );
}
