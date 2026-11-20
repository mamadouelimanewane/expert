"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Scale,
  Building,
  Layers,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import {
  analyserDossierControleFiscal,
  type DossierControleFiscal,
  type ChefRedressementFiscal,
} from "@/lib/ohada/controle-fiscal-defense";

const DOSSIER_INIT: DossierControleFiscal = {
  contribuableNom: "Société Industrielle du Cap Vert SA",
  nineaRccm: "SN-DKR-2018-B-1234",
  centreDesImpots: "Direction des Grandes Entreprises de Dakar (DGE)",
  inspecteurNom: "M. Ndiaye, Inspecteur Principal",
  dateReceptionNotification: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0], // Reçu il y a 10 jours
  chefsRedressement: [
    {
      id: "CHEF-1",
      typeChef: "REJET_CHARGE_DEDUCTIBLE",
      exerciceConcerne: 2023,
      motifInspecteur: "Factures de sous-traitance sans NINEA mentionné (Art. 18 CGI).",
      baseRedressee: 85000000,
      tauxImposition: 30,
      droitsSimplesReclames: 25500000,
      degrePenalite: "MANQUEMENT_DELIBERE",
      estContestable: true,
      argumentsContestation: "Attestations de régularité fiscale fournies et preuve irréfragable des virements bancaires compensés.",
      baseAccepteeParContribuable: 0,
    },
    {
      id: "CHEF-2",
      typeChef: "OMISSION_RETENUE_BRS",
      exerciceConcerne: 2023,
      motifInspecteur: "Défaut de retenue BRS 5% sur honoraires d'ingénierie locale.",
      baseRedressee: 40000000,
      tauxImposition: 5,
      droitsSimplesReclames: 2000000,
      degrePenalite: "BONNE_FOI_STANDARD",
      estContestable: true,
      argumentsContestation: "Le prestataire bénéficiait d'une dispense légale d'agrément code des investissements.",
      baseAccepteeParContribuable: 0,
    },
    {
      id: "CHEF-3",
      typeChef: "REINTEGRATION_TVA",
      exerciceConcerne: 2024,
      motifInspecteur: "TVA déduite sur carburant pour véhicules de service affectés au transport.",
      baseRedressee: 12000000,
      tauxImposition: 18,
      droitsSimplesReclames: 2160000,
      degrePenalite: "BONNE_FOI_STANDARD",
      estContestable: false,
      argumentsContestation: "Dépense admise, demande d'abandon des pénalités à titre transactionnel.",
      baseAccepteeParContribuable: 12000000,
    },
  ],
};

export default function ControleFiscalDefensePage() {
  const [dossier, setDossier] = useState<DossierControleFiscal>(DOSSIER_INIT);
  const [copieEffectuee, setCopieEffectuee] = useState(false);

  const analyse = analyserDossierControleFiscal(dossier);

  const handleCopier = (texte: string) => {
    navigator.clipboard.writeText(texte);
    setCopieEffectuee(true);
    setTimeout(() => setCopieEffectuee(false), 2000);
  };

  const toggleContestation = (chefId: string) => {
    setDossier((prev) => ({
      ...prev,
      chefsRedressement: prev.chefsRedressement.map((c) =>
        c.id === chefId
          ? {
              ...c,
              estContestable: !c.estContestable,
              baseAccepteeParContribuable: !c.estContestable ? 0 : c.baseRedressee,
            }
          : c
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Bouclier & Défense en Contrôle Fiscal
            </h1>
            <p className="text-sm text-muted-foreground">
              Procédure contradictoire, calcul des pénalités LPF, négociation transactionnelle et rédaction des mémoires
            </p>
          </div>
        </div>

        {/* Compte à rebours 30 jours */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold ${
            analyse.joursRestantsPourRepondre <= 5
              ? "bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>
            {analyse.joursRestantsPourRepondre} jour(s) restant(s) (Échéance : {analyse.dateEcheanceReponse})
          </span>
        </div>
      </div>

      {/* Cartes KPI Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Total Réclamé par le Fisc
          </span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {analyse.totalReclameParFisc.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Droits : {analyse.totalDroitsSimples.toLocaleString("fr-FR")} + Pénalités : {analyse.totalPenalitesReclamees.toLocaleString("fr-FR")}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Montant Contesté (Mémoire)
          </span>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {analyse.montantTotalConteste.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Droits + pénalités contestés en droit
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Proposition Transactionnelle
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {analyse.propositionTransactionnelle.montantFinalTransaction.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Pénalités réduites à 10% sur 12 mois
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Économie Négociée Potentielle
          </span>
          <div className="text-xl font-bold font-mono text-purple-400">
            {analyse.propositionTransactionnelle.economieTotaleRealisee.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Gains pour le client
          </span>
        </div>
      </div>

      {/* Main Grid: Chefs de Redressement & Mémoire Formel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Liste des chefs notifiés */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              Chefs de Redressement Notifiés ({dossier.chefsRedressement.length})
            </h2>

            <div className="space-y-3">
              {dossier.chefsRedressement.map((chef) => (
                <div
                  key={chef.id}
                  className="p-4 bg-card/60 rounded-xl border border-border space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {chef.typeChef.replace(/_/g, " ")} — Ex. {chef.exerciceConcerne}
                      </div>
                      <div className="text-muted-foreground mt-0.5">{chef.motifInspecteur}</div>
                    </div>
                    <button
                      onClick={() => toggleContestation(chef.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                        chef.estContestable
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-muted/30 text-muted-foreground border-border"
                      }`}
                    >
                      {chef.estContestable ? "Contesté" : "Admis"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 font-mono text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Base notifiée</span>
                      <span className="font-bold text-foreground">
                        {chef.baseRedressee.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Droits simples ({chef.tauxImposition}%)</span>
                      <span className="font-bold text-rose-400">
                        {chef.droitsSimplesReclames.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Majoration</span>
                      <span className="font-bold text-amber-400">
                        {chef.degrePenalite === "MANQUEMENT_DELIBERE"
                          ? "50%"
                          : chef.degrePenalite === "MANOEUVRES_FRAUDULEUSES"
                          ? "100%"
                          : "25%"}
                      </span>
                    </div>
                  </div>

                  {chef.estContestable && (
                    <div className="p-2.5 bg-muted/20 border border-border/60 rounded text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground block mb-0.5">Moyen de défense invoqué :</span>
                      <span>{chef.argumentsContestation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite : Mémoire en Réponse formel (Art. 42 LPF) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Mémoire en Réponse Formel (Art. 42 LPF)
              </h2>
              <button
                onClick={() => handleCopier(analyse.memoireReponseFormel)}
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
                    Copier le Mémoire
                  </>
                )}
              </button>
            </div>

            <pre className="whitespace-pre-wrap font-mono text-[11px] text-muted-foreground bg-muted/10 p-3.5 rounded-lg border border-border leading-relaxed max-h-[500px] overflow-y-auto">
              {analyse.memoireReponseFormel}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
