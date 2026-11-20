"use client";

import { useState } from "react";
import { Gavel, Scale, Calculator, FileText, CheckCircle2, ShieldCheck, Download, Copy, RefreshCw, AlertTriangle } from "lucide-react";

export default function ExpertiseTribunauxPage() {
    const [tribunal, setTribunal] = useState("Tribunal de Commerce Hors Classe de Dakar");
    const [chambre, setChambre] = useState("2ème Chambre Commerciale");
    const [numeroRG, setNumeroRG] = useState("RG 142/2024");
    const [numeroOrdonnance, setNumeroOrdonnance] = useState("ORD-89/2024");
    const [dateOrdonnance, setDateOrdonnance] = useState("15 janvier 2024");
    const [magistrat, setMagistrat] = useState("M. le Juge Mamadou Diaw");
    const [expertNom, setExpertNom] = useState("Ousmane Kane");
    const [typeMission, setTypeMission] = useState("EVALUATION_PREJUDICE");
    const [libelleLitige, setLibelleLitige] = useState("Rupture brutale de relations commerciales et inexécution contractuelle");

    // Paramètres financiers de préjudice
    const [caHistorique, setCaHistorique] = useState(120000000);
    const [caReel, setCaReel] = useState(70000000);
    const [tauxMarge, setTauxMarge] = useState(35);
    const [fraisDirects, setFraisDirects] = useState(4500000);
    const [tauxInteret, setTauxInteret] = useState(6);
    const [anneesMoratoires, setAnneesMoratoires] = useState(2);

    // Honoraires et dépens
    const [heuresPassees, setHeuresPassees] = useState(45);
    const [tauxHoraire, setTauxHoraire] = useState(80000);
    const [debours, setDebours] = useState(600000);
    const [consignation, setConsignation] = useState(2000000);

    const [loading, setLoading] = useState(false);
    const [rapport, setRapport] = useState<any>(null);
    const [frais, setFrais] = useState<any>(null);
    const [copie, setCopie] = useState(false);

    const genererExpertise = async () => {
        setLoading(true);
        try {
            // 1. Calcul du préjudice financier
            const resPrejudice = await fetch("/api/expert-judiciaire/evaluer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "CALCULER_PREJUDICE",
                    paramsPrejudice: {
                        chiffreAffairesHistoriqueMoyenFCFA: Number(caHistorique),
                        chiffreAffairesReelConstatéFCFA: Number(caReel),
                        tauxMargeSurCoutVariablePourcentage: Number(tauxMarge),
                        dureePeriodePrejudiceMois: 12,
                        fraisDirectsSubisFCFA: Number(fraisDirects),
                        tauxInteretLegalPourcentage: Number(tauxInteret),
                        dureeMoratoireAnnees: Number(anneesMoratoires),
                    },
                }),
            });
            const dataPrejudice = await resPrejudice.json();

            // 2. Génération du rapport d'expertise judiciaire
            const dossier = {
                id: `EXP-${Date.now().toString().slice(-4)}`,
                tribunal,
                chambre,
                numeroRG,
                numeroOrdonnance,
                dateOrdonnance,
                magistratOrdonnateur: magistrat,
                expertNom,
                expertTitre: "Expert-comptable diplômé, Expert Judiciaire près les Cours et Tribunaux",
                typeMission,
                libelleLitige,
                parties: [
                    { qualite: "DEMANDEUR", nomOuDenomination: "Société Commerciale Demandresse", conseilAvocat: "Babacar Diop", adresse: "Dakar Plateau" },
                    { qualite: "DEFENDEUR", nomOuDenomination: "Consortium Logistique Défendeur", conseilAvocat: "Aïssatou Ba", adresse: "Dakar Port" },
                ],
                consignationInitialeFCFA: Number(consignation),
                phaseActuelle: "DEPOT_RAPPORT_DEFINITIF",
                dires: [
                    {
                        id: "D-1",
                        dateReception: "12 octobre 2024",
                        auteur: "Maître Aïssatou Ba (Conseil du Défendeur)",
                        resumeArguments: "Demande de déduction des charges fixes non engagées durant la rupture.",
                        reponseExpert: "L'expert a pris en compte exclusivement la marge sur coûts variables, neutralisant d'office les charges fixes.",
                        impactChiffrageFCFA: 0,
                    },
                ],
                heuresPassees: Number(heuresPassees),
                tauxHoraireExpertFCFA: Number(tauxHoraire),
                deboursEngagesFCFA: Number(debours),
                prejudiceCalcule: dataPrejudice.prejudice,
                dateDepotPrevue: new Date().toLocaleDateString("fr-FR"),
            };

            const resRapport = await fetch("/api/expert-judiciaire/evaluer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "GENERER_RAPPORT", dossier }),
            });
            const dataRapport = await resRapport.json();

            if (dataRapport.rapport) {
                setRapport(dataRapport.rapport);
                setFrais(dataRapport.frais);
            }
        } catch (err) {
            console.error("Erreur génération rapport judiciaire:", err);
        } finally {
            setLoading(false);
        }
    };

    const copierTexte = () => {
        if (!rapport) return;
        navigator.clipboard.writeText(rapport.texteIntegral);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Gavel className="w-6 h-6 text-amber-400" />
                    <h1 className="page-title text-2xl font-bold tracking-tight">Expertise Judiciaire & Financière auprès des Tribunaux</h1>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Modélisation de préjudices économiques (damnum emergens, lucrum cessans), gestion du contradictoire et liquidation de taxe.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Paramétrage de la désignation judiciaire */}
                <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Scale className="w-4 h-4 text-primary" />
                        Données de l'Ordonnance
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="text-muted-foreground">Juridiction ordonnatrice</label>
                            <input
                                type="text"
                                value={tribunal}
                                onChange={(e) => setTribunal(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-muted-foreground">N° RG (Instance)</label>
                                <input
                                    type="text"
                                    value={numeroRG}
                                    onChange={(e) => setNumeroRG(e.target.value)}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                            <div>
                                <label className="text-muted-foreground">N° Ordonnance</label>
                                <input
                                    type="text"
                                    value={numeroOrdonnance}
                                    onChange={(e) => setNumeroOrdonnance(e.target.value)}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-muted-foreground">Magistrat délégataire</label>
                            <input
                                type="text"
                                value={magistrat}
                                onChange={(e) => setMagistrat(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div>
                            <label className="text-muted-foreground">Expert Judiciaire désigné</label>
                            <input
                                type="text"
                                value={expertNom}
                                onChange={(e) => setExpertNom(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div className="border-t border-border pt-2 space-y-2">
                            <div className="font-semibold text-foreground text-[11px]">Paramètres du Préjudice Financier</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-muted-foreground">CA Historique Ref.</label>
                                    <input
                                        type="number"
                                        value={caHistorique}
                                        onChange={(e) => setCaHistorique(Number(e.target.value))}
                                        className="w-full mt-1 px-2 py-1 rounded border border-border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="text-muted-foreground">CA Réel Constaté</label>
                                    <input
                                        type="number"
                                        value={caReel}
                                        onChange={(e) => setCaReel(Number(e.target.value))}
                                        className="w-full mt-1 px-2 py-1 rounded border border-border bg-background"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-muted-foreground">Marge s/ Coût Var (%)</label>
                                    <input
                                        type="number"
                                        value={tauxMarge}
                                        onChange={(e) => setTauxMarge(Number(e.target.value))}
                                        className="w-full mt-1 px-2 py-1 rounded border border-border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="text-muted-foreground">Frais Subis (Pertes)</label>
                                    <input
                                        type="number"
                                        value={fraisDirects}
                                        onChange={(e) => setFraisDirects(Number(e.target.value))}
                                        className="w-full mt-1 px-2 py-1 rounded border border-border bg-background"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border pt-2 space-y-2">
                            <div className="font-semibold text-foreground text-[11px]">Dépens & Rémunération de l'Expert</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-muted-foreground">Heures d'expertise</label>
                                    <input
                                        type="number"
                                        value={heuresPassees}
                                        onChange={(e) => setHeuresPassees(Number(e.target.value))}
                                        className="w-full mt-1 px-2 py-1 rounded border border-border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="text-muted-foreground">Taux Horaire FCFA</label>
                                    <input
                                        type="number"
                                        value={tauxHoraire}
                                        onChange={(e) => setTauxHoraire(Number(e.target.value))}
                                        className="w-full mt-1 px-2 py-1 rounded border border-border bg-background"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Consignation déjà perçue (FCFA)</label>
                                <input
                                    type="number"
                                    value={consignation}
                                    onChange={(e) => setConsignation(Number(e.target.value))}
                                    className="w-full mt-1 px-2 py-1 rounded border border-border bg-background"
                                />
                            </div>
                        </div>

                        <button
                            onClick={genererExpertise}
                            disabled={loading}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 font-medium text-white transition flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
                            Chiffrer & Rédiger le rapport
                        </button>
                    </div>
                </div>

                {/* Rapport Judiciaire & Synthèse financière */}
                <div className="md:col-span-2 space-y-4">
                    {rapport ? (
                        <>
                            {/* KPI Préjudice & Taxe */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Préjudice Total Retenu</div>
                                    <div className="text-xl font-bold mt-1 text-rose-400">
                                        {rapport.montantPrejudiceRetenuFCFA.toLocaleString("fr-FR")} FCFA
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">Damnum emergens + Lucrum cessans</div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Frais & Demande de Taxe</div>
                                    <div className="text-xl font-bold mt-1 text-emerald-400">
                                        {frais?.totalTTCFCFA.toLocaleString("fr-FR")} FCFA
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        Solde dû : {frais?.soldeDemandeDeTaxeFCFA.toLocaleString("fr-FR")} FCFA
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Contradictoire</div>
                                    <div className="text-sm font-bold mt-2 text-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        {rapport.diresTraites} Dire(s) motivé(s)
                                    </div>
                                </div>
                            </div>

                            {/* En-tête et actions */}
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40">
                                <div>
                                    <div className="font-semibold text-sm text-foreground">{rapport.titre}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        Conforme aux règles de procédure et à la déontologie de l'expert judiciaire
                                    </div>
                                </div>
                                <button
                                    onClick={copierTexte}
                                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary flex items-center gap-1.5 text-foreground"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copie ? "Copié !" : "Copier le rapport"}
                                </button>
                            </div>

                            {/* Texte intégral du rapport d'expertise */}
                            <div className="p-5 rounded-xl border border-border bg-card/40 space-y-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
                                    <span>Texte Intégral du Rapport d'Expertise Judiciaire</span>
                                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">Cour & Tribunaux</span>
                                </h3>
                                <pre className="p-4 rounded-lg bg-background border border-border font-mono text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                                    {rapport.texteIntegral}
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                            <Gavel className="w-8 h-8 text-amber-400/50 mb-3" />
                            <p>Renseignez les données de l'ordonnance et les paramètres financiers pour chiffrer le préjudice et rédiger le rapport judiciaire.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
