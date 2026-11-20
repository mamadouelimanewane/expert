"use client";

import { useState } from "react";
import {
    Gavel,
    Scale,
    Calculator,
    FileText,
    CheckCircle2,
    ShieldCheck,
    Copy,
    RefreshCw,
    AlertTriangle,
    Brain,
    Building2,
    DollarSign,
    Layers,
    Send
} from "lucide-react";

export default function ExpertiseTribunauxPage() {
    const [ongletActif, setOngletActif] = useState<"MISSION" | "DIRES_IA" | "PENAL_IA">("MISSION");

    // Données de l'Ordonnance
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

    // Dépens et taxe
    const [heuresPassees, setHeuresPassees] = useState(45);
    const [tauxHoraire, setTauxHoraire] = useState(80000);
    const [debours, setDebours] = useState(600000);
    const [consignation, setConsignation] = useState(2000000);

    // États IA Copilote Dires
    const [direAvocatTexte, setDireAvocatTexte] = useState(
        "L'évaluation de l'expert judiciaire surévalue le préjudice en omettant d'imputer les économies de salaires et charges fixes réalisées."
    );
    const [argumentsExpert, setArgumentsExpert] = useState(
        "L'expert a isolé exclusivement les coûts proportionnels et variables, démontrant que la masse salariale CDI est incompressible."
    );
    const [reponseIAResultat, setReponseIAResultat] = useState<any>(null);

    // États IA Pénale
    const [anomaliePenaleMontant, setAnomaliePenaleMontant] = useState(45000000);
    const [anomaliePenaleDescription, setAnomaliePenaleDescription] = useState(
        "Prélèvements personnels répétés du gérant sur le compte bancaire de la société via compte 4551 sans délibération d'AG."
    );
    const [analysePenaleResultat, setAnalysePenaleResultat] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [rapport, setRapport] = useState<any>(null);
    const [frais, setFrais] = useState<any>(null);
    const [auditProc, setAuditProc] = useState<any>(null);
    const [copie, setCopie] = useState(false);

    const genererExpertise = async () => {
        setLoading(true);
        try {
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
                        reponseExpert: reponseIAResultat?.reponseProposee || "L'expert a pris en compte exclusivement la marge sur coûts variables, neutralisant d'office les charges fixes.",
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
                setAuditProc(dataRapport.auditProcedural);
            }
        } catch (err) {
            console.error("Erreur génération rapport judiciaire:", err);
        } finally {
            setLoading(false);
        }
    };

    const executerRefutationIA = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/expert-judiciaire/evaluer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "REPONDRE_DIRE_IA",
                    typeMission,
                    direTexte: direAvocatTexte,
                    argumentsExpert,
                }),
            });
            const data = await res.json();
            if (data.reponseIA) {
                setReponseIAResultat(data.reponseIA);
            }
        } catch (err) {
            console.error("Erreur réfutation IA:", err);
        } finally {
            setLoading(false);
        }
    };

    const executerQualificationPenaleIA = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/expert-judiciaire/evaluer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "QUALIFIER_INFRACTIONS_PENALES",
                    constatsPenaux: [
                        {
                            descriptionFait: anomaliePenaleDescription,
                            comptesImpliques: ["4551", "471"],
                            montantConcerneFCFA: Number(anomaliePenaleMontant),
                            beneficiaireIdentifie: "Gérant majoritaire",
                            absenceJustificatif: true,
                        },
                    ],
                }),
            });
            const data = await res.json();
            if (data.analysePenale) {
                setAnalysePenaleResultat(data.analysePenale);
            }
        } catch (err) {
            console.error("Erreur qualification pénale:", err);
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Gavel className="w-6 h-6 text-amber-400" />
                        <h1 className="page-title text-2xl font-bold tracking-tight">Expertise Judiciaire auprès des Tribunaux & IA</h1>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/60 border border-border text-xs">
                        <button
                            onClick={() => setOngletActif("MISSION")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                ongletActif === "MISSION" ? "bg-amber-500/20 text-amber-400" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Scale className="w-3.5 h-3.5 inline mr-1" />
                            Mission & Préjudice
                        </button>
                        <button
                            onClick={() => setOngletActif("DIRES_IA")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                ongletActif === "DIRES_IA" ? "bg-indigo-500/20 text-indigo-400" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Brain className="w-3.5 h-3.5 inline mr-1" />
                            Réfutation Dires IA
                        </button>
                        <button
                            onClick={() => setOngletActif("PENAL_IA")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                ongletActif === "PENAL_IA" ? "bg-rose-500/20 text-rose-400" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                            Pôle Pénal IA
                        </button>
                    </div>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Modélisation de préjudice économique, cessation des paiements AUPCAP, infractions pénales ABS et arbitrage CCJA.
                </p>
            </div>

            {/* ONGLET 1 : MISSION & RAPPORT */}
            {ongletActif === "MISSION" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Scale className="w-4 h-4 text-primary" />
                            Données de l'Ordonnance
                        </h2>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="text-muted-foreground">Type de Mission Judiciaire (11 Types)</label>
                                <select
                                    value={typeMission}
                                    onChange={(e) => setTypeMission(e.target.value)}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-medium text-amber-400"
                                >
                                    <option value="EVALUATION_PREJUDICE">Évaluation de préjudice économique & commercial</option>
                                    <option value="CESSATION_PAIEMENTS_AUPCAP">Cessation des paiements & période suspecte (AUPCAP art. 34)</option>
                                    <option value="INFRACTIONS_PENALES_FINANCIERES">Infractions pénales financières & ABS (art. 891)</option>
                                    <option value="CONCURRENCE_ET_RUPTURE_CONTRAT">Rupture brutale & concurrence déloyale</option>
                                    <option value="EXPERTISE_GESTION">Expertise de gestion minoritaire (art. 159 AUSCGIE)</option>
                                    <option value="REDDITION_COMPTES">Reddition de comptes gérance / associés</option>
                                    <option value="RECONSTITUTION_COMPTABLE">Reconstitution comptable litige fiscal / successoral</option>
                                    <option value="EVALUATION_PARTS_LITIGE">Évaluation de parts sociales contestées (art. 59)</option>
                                    <option value="LIQUIDATION_COMMUNAUTE_SUCCESSION">Partage successoral & actifs sociétaires</option>
                                    <option value="LITIGE_FISCAL_DOUANIER">Expertise technique contentieux fiscal / douanier</option>
                                    <option value="ARBITRAGE_COMMERCIAL">Arbitrage commercial technique (CCJA)</option>
                                </select>
                            </div>

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

                            <div className="border-t border-border pt-2 space-y-2">
                                <div className="font-semibold text-foreground text-[11px]">Paramètres Financiers de l'Évaluation</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-muted-foreground">CA Référence FCFA</label>
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
                                        <label className="text-muted-foreground">Pertes Subies (FCFA)</label>
                                        <input
                                            type="number"
                                            value={fraisDirects}
                                            onChange={(e) => setFraisDirects(Number(e.target.value))}
                                            className="w-full mt-1 px-2 py-1 rounded border border-border bg-background"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={genererExpertise}
                                disabled={loading}
                                className="w-full mt-3 py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 font-medium text-white transition flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
                                Chiffrer & Rédiger le rapport judiciaire
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        {rapport ? (
                            <>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 rounded-xl border border-border bg-card/40">
                                        <div className="text-xs text-muted-foreground">Préjudice Retenu</div>
                                        <div className="text-xl font-bold mt-1 text-rose-400">
                                            {rapport.montantPrejudiceRetenuFCFA.toLocaleString("fr-FR")} FCFA
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-border bg-card/40">
                                        <div className="text-xs text-muted-foreground">Demande de Taxe</div>
                                        <div className="text-xl font-bold mt-1 text-emerald-400">
                                            {frais?.totalTTCFCFA.toLocaleString("fr-FR")} FCFA
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-border bg-card/40">
                                        <div className="text-xs text-muted-foreground">Sécurité Procédurale</div>
                                        <div className="text-sm font-bold mt-2 text-foreground flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                            {auditProc?.scoreSecuriteJuridique}/100
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-xl border border-border bg-card/40 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-foreground">{rapport.titre}</h3>
                                        <button
                                            onClick={copierTexte}
                                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary flex items-center gap-1.5"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            {copie ? "Copié !" : "Copier"}
                                        </button>
                                    </div>
                                    <pre className="p-4 rounded-lg bg-background border border-border font-mono text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                                        {rapport.texteIntegral}
                                    </pre>
                                </div>
                            </>
                        ) : (
                            <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                                <Gavel className="w-8 h-8 text-amber-400/50 mb-3" />
                                <p>Renseignez l'ordonnance et lancez l'évaluation pour produire le rapport judiciaire opposable.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ONGLET 2 : RÉFUTATION DE DIRES IA */}
            {ongletActif === "DIRES_IA" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Brain className="w-4 h-4 text-indigo-400" />
                            Analyse & Réfutation Assistée par IA d'un Dire d'Avocat
                        </h2>
                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="text-muted-foreground">Texte du Dire ou Mémoire de l'Avocat</label>
                                <textarea
                                    rows={4}
                                    value={direAvocatTexte}
                                    onChange={(e) => setDireAvocatTexte(e.target.value)}
                                    className="w-full mt-1 p-2.5 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <div>
                                <label className="text-muted-foreground">Arguments techniques de l'expert judiciaire</label>
                                <textarea
                                    rows={3}
                                    value={argumentsExpert}
                                    onChange={(e) => setArgumentsExpert(e.target.value)}
                                    className="w-full mt-1 p-2.5 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <button
                                onClick={executerRefutationIA}
                                disabled={loading}
                                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-white transition flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                Rédiger la réponse juridique au Dire
                            </button>
                        </div>
                    </div>

                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Projet de Réponse de l'Expert
                        </h2>

                        {reponseIAResultat ? (
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                        Source : {reponseIAResultat.source}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-lg bg-background border border-border text-foreground/90 leading-relaxed">
                                    {reponseIAResultat.reponseProposee}
                                </div>

                                <div className="space-y-1 pt-2">
                                    <div className="font-semibold text-muted-foreground text-[11px]">Principes & Visas Légaux :</div>
                                    {reponseIAResultat.pointsJuridiques.map((pt: string, idx: number) => (
                                        <div key={idx} className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                                            <span className="text-emerald-400">✓</span> {pt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[220px] flex items-center justify-center text-center text-muted-foreground text-xs">
                                Soumettez un Dire pour générer la réponse contradictoire officielle.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ONGLET 3 : PÔLE PÉNAL ÉCONOMIQUE IA */}
            {ongletActif === "PENAL_IA" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-rose-400" />
                            Détection & Qualification Pénale (Pôle Économique & Financier)
                        </h2>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="text-muted-foreground">Description factuelle des opérations litigieuses</label>
                                <textarea
                                    rows={4}
                                    value={anomaliePenaleDescription}
                                    onChange={(e) => setAnomaliePenaleDescription(e.target.value)}
                                    className="w-full mt-1 p-2.5 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <div>
                                <label className="text-muted-foreground">Montant des flux financiers suspects (FCFA)</label>
                                <input
                                    type="number"
                                    value={anomaliePenaleMontant}
                                    onChange={(e) => setAnomaliePenaleMontant(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-semibold text-rose-400"
                                />
                            </div>

                            <button
                                onClick={executerQualificationPenaleIA}
                                disabled={loading}
                                className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 font-medium text-white transition flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                                Analyser et qualifier les infractions pénales
                            </button>
                        </div>
                    </div>

                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Gavel className="w-4 h-4 text-amber-400" />
                            Qualification Juridique & Note pour le Parquet
                        </h2>

                        {analysePenaleResultat ? (
                            <div className="space-y-3 text-xs">
                                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300">
                                    <div className="font-bold">{analysePenaleResultat.qualificationLegale}</div>
                                    <div className="text-[10px] mt-0.5 uppercase tracking-wider text-rose-400">
                                        Gravité : {analysePenaleResultat.gravite}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-semibold text-foreground text-[11px]">Articles de Loi Applicables :</div>
                                    {analysePenaleResultat.articlesApplicables.map((art: string, idx: number) => (
                                        <div key={idx} className="text-muted-foreground text-[11px] font-mono">
                                            ⚖️ {art}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3.5 rounded-lg bg-background border border-border space-y-1">
                                    <div className="font-semibold text-foreground text-[11px]">Note Technique pour le Magistrat :</div>
                                    <pre className="font-mono text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {analysePenaleResultat.noteOrientationParquet}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[220px] flex items-center justify-center text-center text-muted-foreground text-xs">
                                Saisissez les opérations suspectes pour obtenir la qualification pénale et la note parquet.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
