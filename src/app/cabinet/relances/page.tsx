"use client";

import { useState } from "react";
import {
  AlertOctagon,
  Mail,
  MessageSquare,
  FileText,
  Clock,
  ShieldAlert,
  Copy,
  CheckCircle2,
  Send,
  Calendar,
  DollarSign,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  calculerPlanRelance,
  analyserPortefeuilleCreances,
  type FactureCreance,
  type NiveauRelance,
} from "@/lib/ohada/relances-honoraires";

const FACTURES_DEMO: FactureCreance[] = [
  {
    id: "FAC-001",
    numeroFacture: "FAC-2025-089",
    clientNom: "Trans-UEMOA Logistique SA",
    clientEmail: "direction@transuemoa.sn",
    clientTelephone: "+221 77 123 45 67",
    dateEmission: "2025-01-10",
    dateEcheance: "2025-02-10",
    montantTTC: 4500000,
    montantDejaRegle: 1000000,
    soldeRestantDu: 3500000,
  },
  {
    id: "FAC-002",
    numeroFacture: "FAC-2025-112",
    clientNom: "Laboratoires Sahel Bio",
    clientEmail: "compta@sahelbio.sn",
    clientTelephone: "+221 78 987 65 43",
    dateEmission: "2025-02-15",
    dateEcheance: "2025-03-15",
    montantTTC: 2200000,
    montantDejaRegle: 0,
    soldeRestantDu: 2200000,
  },
  {
    id: "FAC-003",
    numeroFacture: "FAC-2025-145",
    clientNom: "Hôtel Résidence Les Almadies",
    clientEmail: "gestion@almadies-hotel.com",
    clientTelephone: "+221 76 555 44 33",
    dateEmission: "2025-04-01",
    dateEcheance: "2025-05-01",
    montantTTC: 1500000,
    montantDejaRegle: 0,
    soldeRestantDu: 1500000,
  },
  {
    id: "FAC-004",
    numeroFacture: "FAC-2025-180",
    clientNom: "Boutique Prestige Dakar",
    clientEmail: "contact@prestige.sn",
    clientTelephone: "+221 70 111 22 33",
    dateEmission: "2025-05-10",
    dateEcheance: "2025-06-10",
    montantTTC: 800000,
    montantDejaRegle: 0,
    soldeRestantDu: 800000,
  },
];

export default function RelancesHonorairesPage() {
  const [factures] = useState<FactureCreance[]>(FACTURES_DEMO);
  const [selectedFactureId, setSelectedFactureId] = useState<string>(FACTURES_DEMO[0].id);
  const [canalActif, setCanalActif] = useState<"EMAIL" | "WHATSAPP" | "COURRIER">("EMAIL");
  const [copieEffectuee, setCopieEffectuee] = useState(false);

  // Analyse du portefeuille
  const bilan = analyserPortefeuilleCreances(factures);
  const plans = factures.map((f) => calculerPlanRelance(f));
  const planSelectionne =
    plans.find((p) => p.factureId === selectedFactureId) || plans[0];

  const handleCopier = (texte: string) => {
    navigator.clipboard.writeText(texte);
    setCopieEffectuee(true);
    setTimeout(() => setCopieEffectuee(false), 2000);
  };

  const badgeColorNiveau = (niveau: NiveauRelance) => {
    switch (niveau) {
      case "RAPPEL_AMICAL":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "PREMIERE_RELANCE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "DEUXIEME_RELANCE":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MISE_EN_DEMEURE":
      case "CONTENTIEUX_AUPSRVE":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Recouvrement & Relances Honoraires
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestion de l'arriéré, application des voies d'exécution AUPSRVE et déontologie ONECCA
            </p>
          </div>
        </div>
      </div>

      {/* Balance Âgée & KPIs de Recouvrement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Total Créances Échues
          </span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {bilan.montantEchu.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            {bilan.nbFacturesEnRetard} facture(s) en impayé
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Tranche 0 - 15 Jours
          </span>
          <div className="text-lg font-bold font-mono text-blue-400">
            {bilan.repartitionParTranche.tranche0_15.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">Rappels courtois</span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Tranche 16 - 30 Jours
          </span>
          <div className="text-lg font-bold font-mono text-amber-400">
            {bilan.repartitionParTranche.tranche16_30.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">1ères relances</span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Tranche 31 - 60 Jours
          </span>
          <div className="text-lg font-bold font-mono text-orange-400">
            {bilan.repartitionParTranche.tranche31_60.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">Risque de suspension</span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Tranche &gt; 60 Jours (Critique)
          </span>
          <div className="text-lg font-bold font-mono text-rose-500">
            {bilan.repartitionParTranche.tranche60_plus.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-rose-400 mt-1 block font-medium">AUPSRVE / Injonction</span>
        </div>
      </div>

      {/* Grille principale : Liste des impayés + Panneau d'action & communication */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Factures en retard */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            Créances Échues ({plans.length})
          </h2>

          <div className="space-y-2">
            {plans.map((p) => {
              const isSelected = p.factureId === selectedFactureId;
              return (
                <div
                  key={p.factureId}
                  onClick={() => setSelectedFactureId(p.factureId)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-card/90 border-rose-500/50 shadow-sm"
                      : "bg-card/30 border-border hover:bg-card/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{p.clientNom}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {p.numeroFacture} • {p.joursRetard} jours de retard
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColorNiveau(
                        p.niveauRecommande
                      )}`}
                    >
                      {p.niveauRecommande.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Solde dû : </span>
                      <span className="font-mono font-bold text-rose-400">
                        {p.soldeRestantDu.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    {p.bloquerTravaux && (
                      <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Bloquer travaux
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne droite : Actions & Génération de Relances */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-5">
            {/* Titre & Statut de la facture sélectionnée */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted-foreground font-mono">
                  Dossier : {planSelectionne.numeroFacture}
                </span>
                <h2 className="text-xl font-bold">{planSelectionne.clientNom}</h2>
              </div>
              <div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColorNiveau(
                    planSelectionne.niveauRecommande
                  )}`}
                >
                  {planSelectionne.niveauRecommande.replace("_", " ")} ({planSelectionne.joursRetard} jours)
                </span>
              </div>
            </div>

            {/* Consigne d'action recommandée */}
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                planSelectionne.bloquerTravaux
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Instruction déontologique & procédurale :</span>
                <span>{planSelectionne.actionRecommandee}</span>
              </div>
            </div>

            {/* Calcul des créances actualisées */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-card/60 rounded-lg border border-border">
                <span className="text-[11px] text-muted-foreground block">Principal Impayé</span>
                <span className="text-base font-bold font-mono">
                  {planSelectionne.soldeRestantDu.toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">FCFA</span>
              </div>

              <div className="p-3 bg-card/60 rounded-lg border border-border">
                <span className="text-[11px] text-muted-foreground block">Intérêts Moratoires (6%)</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  +{planSelectionne.interetsMoratoires.toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">FCFA</span>
              </div>

              <div className="p-3 bg-card/60 rounded-lg border border-border">
                <span className="text-[11px] text-muted-foreground block">Total Exigible</span>
                <span className="text-base font-bold font-mono text-rose-400">
                  {planSelectionne.montantTotalExigible.toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">FCFA</span>
              </div>
            </div>

            {/* Sélecteur de canal de relance */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 p-1 bg-card/60 border border-border rounded-lg">
                  <button
                    onClick={() => setCanalActif("EMAIL")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                      canalActif === "EMAIL"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Courriel Formel
                  </button>

                  <button
                    onClick={() => setCanalActif("WHATSAPP")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                      canalActif === "WHATSAPP"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>

                  {planSelectionne.messageGenere.lettreMiseEnDemeure && (
                    <button
                      onClick={() => setCanalActif("COURRIER")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
                        canalActif === "COURRIER"
                          ? "bg-rose-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Mise en Demeure AUPSRVE
                    </button>
                  )}
                </div>

                <button
                  onClick={() =>
                    handleCopier(
                      canalActif === "EMAIL"
                        ? planSelectionne.messageGenere.corpsEmail
                        : canalActif === "WHATSAPP"
                        ? planSelectionne.messageGenere.texteWhatsApp
                        : planSelectionne.messageGenere.lettreMiseEnDemeure || ""
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card/60 hover:bg-card border border-border rounded-lg text-xs font-medium text-foreground transition"
                >
                  {copieEffectuee ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copier le texte
                    </>
                  )}
                </button>
              </div>

              {/* Contenu du message généré */}
              <div className="p-4 rounded-xl bg-card/60 border border-border">
                {canalActif === "EMAIL" && (
                  <div className="space-y-3 text-xs">
                    <div className="border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Objet : </span>
                      <span className="font-semibold text-foreground">
                        {planSelectionne.messageGenere.objet}
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
                      {planSelectionne.messageGenere.corpsEmail}
                    </pre>
                  </div>
                )}

                {canalActif === "WHATSAPP" && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-xs">
                    <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message WhatsApp prêt à envoyer
                    </div>
                    <p className="whitespace-pre-wrap text-emerald-200/90 font-sans leading-relaxed">
                      {planSelectionne.messageGenere.texteWhatsApp}
                    </p>
                  </div>
                )}

                {canalActif === "COURRIER" && (
                  <div className="space-y-3 text-xs">
                    <div className="text-rose-400 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Projet d'Acte — Mise en Demeure Pré-contentieuse (AUPSRVE)
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-[11px] text-muted-foreground bg-muted/10 p-3 rounded border border-border leading-relaxed">
                      {planSelectionne.messageGenere.lettreMiseEnDemeure}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
