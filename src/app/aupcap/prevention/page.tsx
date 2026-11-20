"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Activity,
  Calculator,
  FileCheck,
  TrendingDown,
  Clock,
  DollarSign,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  calculerZScoreOHADA,
  simulerConcordatApurement,
  type DonneesFinancieresEntreprise,
  type ParametresConcordat,
  type DiagnosticVulnerabilite,
} from "@/lib/ohada/prevention-difficultes-aupcap";

const DONNEES_DEFAUT: DonneesFinancieresEntreprise = {
  chiffreAffaires: 350000000,
  valeurAjoutee: 95000000,
  ebe: 18000000,
  resultatExploitation: 4500000,
  resultatNet: -12000000,
  totalActif: 280000000,
  actifCirculant: 90000000,
  tresorerieActif: 6000000,
  capitauxPropres: 35000000,
  dettesFinancieresLMT: 95000000,
  dettesFournisseurs: 75000000,
  dettesFiscalesSociales: 45000000,
  decouvertsBancaires: 20000000,
};

const CONCORDAT_DEFAUT: ParametresConcordat = {
  dureeAnnees: 3,
  tauxAbandonNegocie: 20,
  apportFondsPropres: 30000000,
  economiesStructureAnnuelles: 25000000,
};

export default function AupcapPreventionPage() {
  const [onglet, setOnglet] = useState<"DIAGNOSTIC" | "CONCORDAT">("DIAGNOSTIC");
  const [donnees, setDonnees] = useState<DonneesFinancieresEntreprise>(DONNEES_DEFAUT);
  const [paramsConcordat, setParamsConcordat] = useState<ParametresConcordat>(CONCORDAT_DEFAUT);
  const [copieEffectuee, setCopieEffectuee] = useState(false);

  const analyse = calculerZScoreOHADA(donnees);
  const concordat = simulerConcordatApurement(donnees, paramsConcordat);

  const updateDonnee = (cle: keyof DonneesFinancieresEntreprise, val: number) => {
    setDonnees((prev) => ({ ...prev, [cle]: val }));
  };

  const handleCopier = (texte: string) => {
    navigator.clipboard.writeText(texte);
    setCopieEffectuee(true);
    setTimeout(() => setCopieEffectuee(false), 2000);
  };

  const badgeColorZ = (diag: DiagnosticVulnerabilite) => {
    switch (diag) {
      case "SAIN":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "SOUS_OBSERVATION":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ALERTE_PREVENTIVE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "CESSATION_IMMINENTE":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Prévention AUPCAP & Plan de Redressement
            </h1>
            <p className="text-sm text-muted-foreground">
              Z-Score OHADA, détection de cessation des paiements et simulation de concordat préventif / curatif
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex p-1 bg-card/60 border border-border rounded-lg">
          <button
            onClick={() => setOnglet("DIAGNOSTIC")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition ${
              onglet === "DIAGNOSTIC"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Z-Score & Cessation
          </button>
          <button
            onClick={() => setOnglet("CONCORDAT")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition ${
              onglet === "CONCORDAT"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Plan de Concordat AUPCAP
          </button>
        </div>
      </div>

      {/* Bandeau d'état récapitulatif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Z-Score OHADA
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {analyse.scoreZ}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColorZ(
                analyse.diagnostic
              )}`}
            >
              {analyse.diagnostic.replace("_", " ")}
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Cible saine : &gt; 2.60
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Test Cessation des Paiements
          </span>
          <div
            className={`text-lg font-bold font-mono ${
              analyse.estEnCessationPaiements ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {analyse.estEnCessationPaiements ? "CESSATION CARACTÉRISÉE" : "IN BONIS (SAIN)"}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Art. 25 AUPCAP (Actif &lt; Passif)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Procédure AUPCAP Conseillée
          </span>
          <div className="text-base font-bold font-mono text-amber-400">
            {analyse.procedureConseillee.replace("_", " ")}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Saisine Tribunal de Commerce
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Trésorerie Nette Immédiate
          </span>
          <div
            className={`text-xl font-bold font-mono ${
              analyse.tresorerieNette >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {analyse.tresorerieNette.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Disponibilités - Découverts
          </span>
        </div>
      </div>

      {onglet === "DIAGNOSTIC" ? (
        /* Grille Diagnostic & Saisie */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne gauche : Paramètres financiers de l'entreprise */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                Données du Bilan & Compte de Résultat OHADA
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1">Chiffre d'Affaires HT</label>
                  <input
                    type="number"
                    value={donnees.chiffreAffaires}
                    onChange={(e) => updateDonnee("chiffreAffaires", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Excédent Brut (EBE)</label>
                  <input
                    type="number"
                    value={donnees.ebe}
                    onChange={(e) => updateDonnee("ebe", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Résultat d'Exploitation</label>
                  <input
                    type="number"
                    value={donnees.resultatExploitation}
                    onChange={(e) => updateDonnee("resultatExploitation", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Total Actif du Bilan</label>
                  <input
                    type="number"
                    value={donnees.totalActif}
                    onChange={(e) => updateDonnee("totalActif", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Capitaux Propres</label>
                  <input
                    type="number"
                    value={donnees.capitauxPropres}
                    onChange={(e) => updateDonnee("capitauxPropres", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Dettes Financières LMT</label>
                  <input
                    type="number"
                    value={donnees.dettesFinancieresLMT}
                    onChange={(e) => updateDonnee("dettesFinancieresLMT", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Dettes Fournisseurs</label>
                  <input
                    type="number"
                    value={donnees.dettesFournisseurs}
                    onChange={(e) => updateDonnee("dettesFournisseurs", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Dettes Fiscales & Sociales</label>
                  <input
                    type="number"
                    value={donnees.dettesFiscalesSociales}
                    onChange={(e) => updateDonnee("dettesFiscalesSociales", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right text-rose-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Trésorerie Actif (Dispo)</label>
                  <input
                    type="number"
                    value={donnees.tresorerieActif}
                    onChange={(e) => updateDonnee("tresorerieActif", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right text-emerald-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Découverts Bancaires</label>
                  <input
                    type="number"
                    value={donnees.decouvertsBancaires}
                    onChange={(e) => updateDonnee("decouvertsBancaires", Number(e.target.value))}
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Décomposition des 5 Ratios & Analyse Légale */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Décomposition du Z-Score UEMOA & Équilibre Financier
              </h2>

              <div className="space-y-3">
                <div className="p-3 bg-card/60 rounded-lg border border-border flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold block text-foreground">R1 — Liquidité Structurelle</span>
                    <span className="text-muted-foreground">FRNG / Total Actif</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {analyse.ratios.liquiditeStructurelle}
                  </span>
                </div>

                <div className="p-3 bg-card/60 rounded-lg border border-border flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold block text-foreground">R2 — Capacité de Remboursement</span>
                    <span className="text-muted-foreground">EBE / Dettes Totales</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {analyse.ratios.capaciteRemboursement}
                  </span>
                </div>

                <div className="p-3 bg-card/60 rounded-lg border border-border flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold block text-foreground">R3 — Autonomie Financière</span>
                    <span className="text-muted-foreground">Capitaux Propres / Dettes Financières</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {analyse.ratios.autonomieFinanciere}
                  </span>
                </div>

                <div className="p-3 bg-card/60 rounded-lg border border-border flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold block text-foreground">R4 — Rotation des Actifs</span>
                    <span className="text-muted-foreground">Chiffre d'Affaires / Total Actif</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {analyse.ratios.rotationActifs}
                  </span>
                </div>

                <div className="p-3 bg-card/60 rounded-lg border border-border flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold block text-foreground">R5 — Rentabilité Économique</span>
                    <span className="text-muted-foreground">Résultat d'Exploitation / Total Actif</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {analyse.ratios.rentabiliteEconomique}
                  </span>
                </div>
              </div>

              {/* Note d'analyse légale */}
              <div className="p-3.5 bg-muted/20 border border-border rounded-lg text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground block mb-1">Avis de l'Expert Judiciaire / Mandataire :</span>
                {analyse.syntheseDiagnostic}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grille Concordat */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne gauche : Paramètres du Concordat */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                Paramètres du Concordat (AUPCAP)
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1">
                    Durée d'apurement du plan ({paramsConcordat.dureeAnnees} an(s))
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={paramsConcordat.dureeAnnees}
                    onChange={(e) =>
                      setParamsConcordat((prev) => ({ ...prev, dureeAnnees: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>1 an</span>
                    <span>3 ans (Règlement préventif)</span>
                    <span>5 ans (Redressement)</span>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">
                    Taux d'abandon consenti par les créanciers ({paramsConcordat.tauxAbandonNegocie}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={paramsConcordat.tauxAbandonNegocie}
                    onChange={(e) =>
                      setParamsConcordat((prev) => ({
                        ...prev,
                        tauxAbandonNegocie: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">
                    Apport immédiat en fonds propres (FCFA)
                  </label>
                  <input
                    type="number"
                    value={paramsConcordat.apportFondsPropres}
                    onChange={(e) =>
                      setParamsConcordat((prev) => ({
                        ...prev,
                        apportFondsPropres: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">
                    Économies de structure annuelles (FCFA / an)
                  </label>
                  <input
                    type="number"
                    value={paramsConcordat.economiesStructureAnnuelles}
                    onChange={(e) =>
                      setParamsConcordat((prev) => ({
                        ...prev,
                        economiesStructureAnnuelles: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>
              </div>

              {/* Résultats chiffrés d'apurement */}
              <div className="pt-3 border-t border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passif total à traiter :</span>
                  <span className="font-mono font-medium">
                    {concordat.passifTotalTraite.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Abandon de créances négocié :</span>
                  <span className="font-mono font-medium">
                    - {concordat.montantAbandonCreances.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t border-border pt-1">
                  <span>Passif résiduel à rembourser :</span>
                  <span className="font-mono text-amber-400">
                    {concordat.passifResiduelARembourser.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Échéancier annuel & Projet de Concordat */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Échéancier Prévisionnel de Remboursement
                </h2>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    concordat.viabilitePlan
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {concordat.viabilitePlan ? "Plan Viable & Équilibré" : "Cash-Flow Insuffisant"}
                </span>
              </div>

              {/* Table des annuités */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2">Année</th>
                      <th className="py-2 text-right">Annuité Remboursement</th>
                      <th className="py-2 text-right">Cash-Flow Prévu</th>
                      <th className="py-2 text-right">Trésorerie Fin d'Année</th>
                    </tr>
                  </thead>
                  <tbody>
                    {concordat.echeancierAnnuel.map((ech) => (
                      <tr key={ech.annee} className="border-b border-border/50 font-mono">
                        <td className="py-2.5 font-bold text-foreground">Année {ech.annee}</td>
                        <td className="py-2.5 text-right text-rose-400">
                          {ech.annuiteRemboursementDettes.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="py-2.5 text-right text-emerald-400">
                          {ech.cashFlowExploitationPrevu.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td
                          className={`py-2.5 text-right font-bold ${
                            ech.tresorerieFinAnnee >= 0 ? "text-foreground" : "text-rose-500"
                          }`}
                        >
                          {ech.tresorerieFinAnnee.toLocaleString("fr-FR")} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Projet formel d'offre de concordat */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Projet Formel de Concordat (Dépôt Tribunal)
                  </span>
                  <button
                    onClick={() => handleCopier(concordat.projetOffreConcordat)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-card/60 hover:bg-card border border-border rounded text-xs font-medium transition"
                  >
                    {copieEffectuee ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copier le projet
                      </>
                    )}
                  </button>
                </div>

                <pre className="whitespace-pre-wrap font-mono text-[11px] text-muted-foreground bg-muted/10 p-3.5 rounded-lg border border-border leading-relaxed max-h-60 overflow-y-auto">
                  {concordat.projetOffreConcordat}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
