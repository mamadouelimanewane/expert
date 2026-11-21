"use client";

import Link from "next/link";
import { Building, Award, FileText, TrendingUp, ShieldCheck, Landmark } from "lucide-react";

export default function AccompagnementHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            PÔLE ACCOMPAGNEMENT & FINANCEMENT PME
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            RELATION BANQUES & BAILLEURS
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
          Accompagnement Stratégique & Financement des Entreprises
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Montage de dossiers de crédit bancaire, formalisation du statut de l&apos;entreprenant et accès aux financements concessionnels
        </p>
      </div>

      {/* Cartes Métiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 1: Dossier de Financement Bancaire */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dossier de Financement Bancaire</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Constitution de dossiers de crédit institutionnels aux standards des comités des engagements : calcul du DSCR, tableau d&apos;amortissement, structuration des garanties et mémorandum d&apos;information.
            </p>
          </div>
          <Link
            href="/accompagnement/financement-bancaire"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            Monter un dossier de crédit →
          </Link>
        </div>

        {/* Module 2: Statut de l'Entreprenant */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Statut de l&apos;Entreprenant OHADA</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Formalisation accélérée et déclaration au RCCM pour les commerçants et artisans souhaitant migrer du secteur informel vers l&apos;économie formelle avec régimes fiscaux allégés.
            </p>
          </div>
          <Link
            href="/accompagnement/entreprenant"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            Gérer les entreprenants →
          </Link>
        </div>

        {/* Module 3: Fonds d'Impact & Bailleurs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Levée de Fonds d&apos;Impact (BAD / BOAD)</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Modélisation 3-statements sur 5 ans avec WACC pays intégrant le spread souverain africain, valorisation DCF et notation des externalités positives ODD.
            </p>
          </div>
          <Link
            href="/strategy/fonds-impact"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
          >
            Modéliser la levée de fonds →
          </Link>
        </div>

        {/* Module 4: Gages & Warrants Agricoles */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Collateral & Warrants</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Supervision des stocks nantis sous tierce détention (Cacao, Arachide, Coton), valorisation mark-to-market, ratios Loan-to-Value (LTV) et protocoles de mainlevée progressive.
            </p>
          </div>
          <Link
            href="/fintech/warrants"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            Superviser les sûretés →
          </Link>
        </div>

        {/* Module 5: Scoring BCEAO */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-violet-500/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Notation PME & Éligibilité BCEAO</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Évaluation du scoring prudentiel selon le canevas officiel de refinancement bancaire de la Banque Centrale des États de l&apos;Afrique de l&apos;Ouest.
            </p>
          </div>
          <Link
            href="/fintech/credit-bceao"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300"
          >
            Calculer le score BCEAO →
          </Link>
        </div>

        {/* Module 6: Copilote Vocal Terroir SMT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Copilote Vocal Terroir (SMT)</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Inclusion financière des petits commerçants : dictée vocale en Wolof, Dioula, Bambara ou Haoussa convertie automatiquement en journal de caisse conforme.
            </p>
          </div>
          <Link
            href="/comptabilite/copilote-vocal"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            Ouvrir le copilote vocal →
          </Link>
        </div>
      </div>
    </div>
  );
}
