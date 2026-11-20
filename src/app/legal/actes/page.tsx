"use client";

import { useState } from "react";
import { Scale, FileText, CheckCircle2, ShieldCheck, Download, Copy, RefreshCw } from "lucide-react";

export default function NexusLegalActesPage() {
    const [typeActe, setTypeActe] = useState<string>("PV_AGOA");
    const [denomination, setDenomination] = useState("SAHEL SOLUTIONS SARL");
    const [siegeSocial, setSiegeSocial] = useState("Dakar Plateau, Sénégal");
    const [capitalSocial, setCapitalSocial] = useState(10000000);
    const [exerciceClos, setExerciceClos] = useState(2024);
    const [resultatNet, setResultatNet] = useState(25000000);
    const [dividendes, setDividendes] = useState(15000000);
    const [nomGerant, setNomGerant] = useState("Moustapha Ndiaye");

    const [loading, setLoading] = useState(false);
    const [acte, setActe] = useState<any>(null);
    const [copie, setCopie] = useState(false);

    const genererActe = async () => {
        setLoading(true);
        try {
            let params: any = {};
            if (typeActe === "PV_AGOA") {
                params = {
                    denomination,
                    formeSociale: "SARL",
                    capitalSocial: Number(capitalSocial),
                    siegeSocial,
                    rccm: "SN-DKR-2023-B-1234",
                    dateAssemblee: "30 juin 2025",
                    lieuAssemblee: "Dakar",
                    exerciceClos: Number(exerciceClos),
                    resultatNet: Number(resultatNet),
                    affectationReserveLegale: Math.round(Number(resultatNet) * 0.1),
                    dividendesDistribues: Number(dividendes),
                    nomGerantOuPresident: nomGerant,
                    presentsOuRepresentesPourcentage: 100,
                };
            } else if (typeActe === "STATUTS_SARL") {
                params = {
                    denomination,
                    siegeSocial,
                    dureeAnnees: 99,
                    objetSocial: "Prestations informatiques, conseil en gestion et commerce général.",
                    capitalSocial: Number(capitalSocial),
                    valeurNominalePart: 10000,
                    gerantNom: nomGerant,
                    gerantNationalite: "Sénégalaise",
                    associes: [
                        { nom: nomGerant, parts: 600, apportMontant: 6000000 },
                        { nom: "Associé Partenaire", parts: 400, apportMontant: 4000000 },
                    ],
                };
            } else if (typeActe === "BAIL_COMMERCIAL") {
                params = {
                    bailleurNom: "Société Civile Immobilière Teranga",
                    bailleurAdresse: "Dakar Fann Résidence",
                    preneurDenomination: denomination,
                    preneurRCCM: "SN-DKR-2023-B-1234",
                    designationLocaux: "Bureaux professionnels 200 m² - Immeuble Horizon",
                    activiteAutorisee: "Activités de conseil et prestations de services",
                    loyerMensuelHT: 800000,
                    depotGarantieMois: 3,
                    dureeBailAnnees: 3,
                    datePriseEffet: "1er janvier 2025",
                };
            } else if (typeActe === "CONTRAT_TRAVAIL_CDI") {
                params = {
                    employeurDenomination: denomination,
                    employeurSiege: siegeSocial,
                    salarieNomPrenom: "Abdoulaye Seck",
                    salarieNationalite: "Sénégalaise",
                    posteIntitule: "Responsable Comptable & Fiscal",
                    categorieProfessionnelle: "Cadre",
                    salaireBaseMensuel: 850000,
                    primesMensuelles: 150000,
                    periodeEssaiMois: 3,
                    dateEmbauche: "1er mars 2025",
                    conventionCollective: "CCNI Sénégal",
                };
            }

            const res = await fetch("/api/legal/generate-act", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: typeActe, params, pays: "SN" }),
            });
            const data = await res.json();
            if (data.acte) {
                setActe(data.acte);
            }
        } catch (err) {
            console.error("Erreur génération acte:", err);
        } finally {
            setLoading(false);
        }
    };

    const copierTexte = () => {
        if (!acte) return;
        navigator.clipboard.writeText(acte.texteIntegral);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Scale className="w-6 h-6 text-indigo-400" />
                    <h1 className="page-title text-2xl font-bold tracking-tight">Nexus-Legal v2 : Rédacteur d'Actes OHADA</h1>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Génération automatisée et sécurisée d'actes certifiés conformes (AUSCGIE, AUDCG, CCNI).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Paramétrage de l'acte */}
                <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Type d'acte & Paramètres
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="text-muted-foreground">Sélection de l'acte juridique</label>
                            <select
                                value={typeActe}
                                onChange={(e) => setTypeActe(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-medium"
                            >
                                <option value="PV_AGOA">PV d'AGOA (Approbation des comptes)</option>
                                <option value="STATUTS_SARL">Statuts constitutifs de SARL</option>
                                <option value="BAIL_COMMERCIAL">Bail commercial (AUDCG art. 101+)</option>
                                <option value="CONTRAT_TRAVAIL_CDI">Contrat de travail CDI (CCNI)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-muted-foreground">Dénomination sociale / Société</label>
                            <input
                                type="text"
                                value={denomination}
                                onChange={(e) => setDenomination(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div>
                            <label className="text-muted-foreground">Siège social</label>
                            <input
                                type="text"
                                value={siegeSocial}
                                onChange={(e) => setSiegeSocial(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div>
                            <label className="text-muted-foreground">Dirigeant / Gérant</label>
                            <input
                                type="text"
                                value={nomGerant}
                                onChange={(e) => setNomGerant(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        {typeActe === "PV_AGOA" && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-muted-foreground">Exercice clos</label>
                                        <input
                                            type="number"
                                            value={exerciceClos}
                                            onChange={(e) => setExerciceClos(Number(e.target.value))}
                                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted-foreground">Capital (FCFA)</label>
                                        <input
                                            type="number"
                                            value={capitalSocial}
                                            onChange={(e) => setCapitalSocial(Number(e.target.value))}
                                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-muted-foreground">Résultat Net (FCFA)</label>
                                        <input
                                            type="number"
                                            value={resultatNet}
                                            onChange={(e) => setResultatNet(Number(e.target.value))}
                                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-semibold text-emerald-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted-foreground">Dividendes (FCFA)</label>
                                        <input
                                            type="number"
                                            value={dividendes}
                                            onChange={(e) => setDividendes(Number(e.target.value))}
                                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background text-indigo-400"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            onClick={genererActe}
                            disabled={loading}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-white transition flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                            Rédiger l'acte certifié
                        </button>
                    </div>
                </div>

                {/* Prévisualisation & Audit de conformité */}
                <div className="md:col-span-2 space-y-4">
                    {acte ? (
                        <>
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40">
                                <div>
                                    <div className="text-xs text-muted-foreground">Score de Conformité OHADA</div>
                                    <div className="text-2xl font-bold mt-1 text-emerald-400 flex items-center gap-2">
                                        <ShieldCheck className="w-6 h-6" />
                                        {acte.analyseConformite.scoreConformite} / 100
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={copierTexte}
                                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary flex items-center gap-1.5 text-foreground"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        {copie ? "Copié !" : "Copier le texte"}
                                    </button>
                                </div>
                            </div>

                            {/* Mentions vérifiées */}
                            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Formalités et Mentions Obligatoires Validées ({acte.mentionsObligatoiresVerifiees.length})
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                                    {acte.mentionsObligatoiresVerifiees.map((m: string, i: number) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <span className="text-emerald-400">✓</span> {m}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Texte intégral de l'acte */}
                            <div className="p-5 rounded-xl border border-border bg-card/40 space-y-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
                                    <span>{acte.titre}</span>
                                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">OHADA Certified</span>
                                </h3>
                                <pre className="p-4 rounded-lg bg-background border border-border font-mono text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto">
                                    {acte.texteIntegral}
                                </pre>
                                <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2">
                                    {acte.disclaimerLegal}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                            <Scale className="w-8 h-8 text-indigo-400/50 mb-3" />
                            <p>Choisissez un type d'acte et renseignez les parties pour générer un document juridique certifié OHADA.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
