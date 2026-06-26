"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award, FileText, TrendingUp, CheckCircle, Clock,
  Download, Send, ChevronRight, Building, Banknote,
  ShieldCheck, AlertTriangle, Sparkles, ArrowLeft
} from "lucide-react";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";

// Données de démo — en prod: récupérées depuis l'API /api/clients/[id]
const DEMO_CLIENT = {
  id: "c2",
  name: "Tech Startup CI",
  sector: "Technologie",
  country: "CI",
  rccm: "CI-ABJ-2022-B-12345",
  ifu: "2022456789",
  score: 88,
  rating: "AAA",
  caAnnuel: 26100000,
  ebitda: 5200000,
  capitauxPropres: 8500000,
  tresorerie: 3200000,
  eligible: true,
};

const BANKS = [
  { id: "sgbci", name: "Société Générale CI", logo: "🏦", montantMax: 15000000, taux: "9.5%", duree: "36 mois" },
  { id: "bicici", name: "BICICI", logo: "🏛️", montantMax: 10000000, taux: "10.2%", duree: "24 mois" },
  { id: "boa", name: "Bank of Africa", logo: "🌍", montantMax: 20000000, taux: "11%", duree: "48 mois" },
  { id: "ecobank", name: "Ecobank CI", logo: "💳", montantMax: 12000000, taux: "9.8%", duree: "36 mois" },
];

type Step = "eval" | "montant" | "banques" | "dossier" | "envoye";

export default function DossierCreditAuto() {
  const [step, setStep] = useState<Step>("eval");
  const [montantDemande, setMontantDemande] = useState(5000000);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2500));
    setGenerating(false);
    setStep("dossier");
  };

  const handleSend = async () => {
    await new Promise(r => setTimeout(r, 1000));
    setStep("envoye");
  };

  const selectedBankData = BANKS.find(b => b.id === selectedBank);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/comptabilite/health-scores" className="mt-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Dossier Crédit Auto</h2>
            {DEMO_CLIENT.eligible && (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3 h-3" /> Éligible
              </span>
            )}
          </div>
          <p className="text-slate-400">Génération automatique d'un dossier de financement certifié par le cabinet — basé sur le score {DEMO_CLIENT.rating}.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: "eval", label: "Évaluation" },
          { id: "montant", label: "Montant" },
          { id: "banques", label: "Banque" },
          { id: "dossier", label: "Dossier" },
          { id: "envoye", label: "Envoyé" },
        ].map((s, i, arr) => {
          const steps: Step[] = ["eval", "montant", "banques", "dossier", "envoye"];
          const currentIdx = steps.indexOf(step);
          const thisIdx = steps.indexOf(s.id as Step);
          const isDone = thisIdx < currentIdx;
          const isActive = s.id === step;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isActive ? "bg-indigo-600 text-white" : isDone ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500"}`}>
                {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[9px]">{i + 1}</span>}
                {s.label}
              </div>
              {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* ÉTAPE 1 : Évaluation */}
      {step === "eval" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <FinancialHealthGauge score={DEMO_CLIENT.score} rating={DEMO_CLIENT.rating} clientName={DEMO_CLIENT.name} />

          <div className="space-y-4">
            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-[24px]">
              <h3 className="font-black text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Indicateurs Financiers
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Chiffre d'Affaires Annuel", val: `${(DEMO_CLIENT.caAnnuel / 1000000).toFixed(1)} M FCFA`, ok: true },
                  { label: "EBITDA", val: `${(DEMO_CLIENT.ebitda / 1000000).toFixed(1)} M FCFA`, ok: true },
                  { label: "Capitaux Propres", val: `${(DEMO_CLIENT.capitauxPropres / 1000000).toFixed(1)} M FCFA`, ok: true },
                  { label: "Trésorerie Nette", val: `${(DEMO_CLIENT.tresorerie / 1000000).toFixed(1)} M FCFA`, ok: true },
                  { label: "RCCM", val: DEMO_CLIENT.rccm, ok: true },
                  { label: "Identifiant Fiscal (IFU)", val: DEMO_CLIENT.ifu, ok: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.val}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-400 font-bold text-sm">Dossier certifié par le Cabinet</p>
                <p className="text-slate-400 text-xs mt-0.5">Les données financières sont extraites directement de la comptabilité OHADA validée par votre expert-comptable.</p>
              </div>
            </div>

            <button onClick={() => setStep("montant")} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
              Définir le Montant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 2 : Montant */}
      {step === "montant" && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[28px] text-center space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Montant sollicité</p>
              <p className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tabular-nums">
                {(montantDemande / 1000000).toFixed(1)} <span className="text-2xl text-slate-400">M FCFA</span>
              </p>
            </div>

            <input
              type="range"
              min={500000} max={DEMO_CLIENT.caAnnuel * 0.8} step={500000}
              value={montantDemande}
              onChange={e => setMontantDemande(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />

            <div className="flex justify-between text-[10px] text-slate-600 font-bold">
              <span>500 K</span>
              <span>{((DEMO_CLIENT.caAnnuel * 0.8) / 1000000).toFixed(0)} M (max)</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1000000, 5000000, 10000000].map(m => (
                <button key={m} onClick={() => setMontantDemande(m)} className={`py-2 rounded-xl text-xs font-black border transition-all ${montantDemande === m ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-800 text-slate-400 border-white/5 hover:text-white"}`}>
                  {(m / 1000000).toFixed(0)} M
                </button>
              ))}
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Capacité de remboursement estimée : {Math.round((DEMO_CLIENT.ebitda * 0.4) / 12000).toLocaleString()} FCFA/mois
            </div>

            <button onClick={() => setStep("banques")} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95">
              Choisir une Banque <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 : Banques */}
      {step === "banques" && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Banques partenaires pour un montant de <span className="text-white font-bold">{(montantDemande / 1000000).toFixed(1)} M FCFA</span> avec votre score <span className="text-emerald-400 font-black">{DEMO_CLIENT.rating}</span> :</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {BANKS.filter(b => b.montantMax >= montantDemande).map(bank => (
              <button
                key={bank.id}
                onClick={() => setSelectedBank(bank.id)}
                className={`p-5 rounded-[24px] border text-left transition-all ${selectedBank === bank.id ? "bg-indigo-600/20 border-indigo-500/50" : "bg-slate-900/40 border-white/5 hover:border-white/20"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl sm:text-2xl lg:text-3xl">{bank.logo}</span>
                  <div>
                    <p className="font-black text-white">{bank.name}</p>
                    {selectedBank === bank.id && <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5" />}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Taux", val: bank.taux },
                    { label: "Durée", val: bank.duree },
                    { label: "Max", val: `${(bank.montantMax / 1000000).toFixed(0)}M` },
                  ].map(info => (
                    <div key={info.label} className="bg-white/5 rounded-xl p-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{info.label}</p>
                      <p className="text-sm font-black text-white mt-0.5">{info.val}</p>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={!selectedBank || generating}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
          >
            {generating ? (
              <><Sparkles className="w-4 h-4 animate-pulse" /> Génération IA du dossier en cours…</>
            ) : (
              <><FileText className="w-4 h-4" /> Générer le Dossier</>
            )}
          </button>
        </div>
      )}

      {/* ÉTAPE 4 : Dossier généré */}
      {step === "dossier" && selectedBankData && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/30 rounded-[28px] flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 font-black text-lg">Dossier généré avec succès !</p>
              <p className="text-slate-400 text-sm">Certifié par Cabinet 360 · Score {DEMO_CLIENT.rating} · {new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
            <h3 className="font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Dossier de Demande de Crédit
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Building, label: "Demandeur", val: DEMO_CLIENT.name },
                { icon: Banknote, label: "Banque cible", val: selectedBankData.name },
                { icon: Award, label: "Score Cabinet", val: `${DEMO_CLIENT.rating} (${DEMO_CLIENT.score}/100)` },
                { icon: TrendingUp, label: "Montant sollicité", val: `${(montantDemande / 1000000).toFixed(1)} M FCFA` },
                { icon: Clock, label: "Taux proposé", val: selectedBankData.taux },
                { icon: ShieldCheck, label: "Durée", val: selectedBankData.duree },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5">
                  <item.icon className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-white mt-0.5">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Pièces jointes auto-générées</p>
              <div className="space-y-2">
                {["Bilan SYSCOHADA 2025", "Grand Livre certifié", "Balance générale", "Tableau de flux de trésorerie", "Score de Santé Financière Cabinet 360"].map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-xs text-slate-400 py-1.5 border-b border-white/5 last:border-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {doc}
                    <span className="ml-auto text-emerald-400/60 font-mono">PDF</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Télécharger PDF
            </button>
            <button onClick={handleSend} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
              <Send className="w-4 h-4" /> Envoyer à {selectedBankData.name}
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 5 : Envoyé */}
      {step === "envoye" && (
        <div className="text-center py-16 space-y-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
            <Send className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Dossier envoyé !</h3>
            <p className="text-slate-400 mt-2">Votre dossier certifié Cabinet 360 a été transmis à <span className="text-white font-bold">{selectedBankData?.name}</span>.</p>
            <p className="text-slate-500 text-sm mt-1">Délai de réponse estimé : 5 à 10 jours ouvrés</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/comptabilite/health-scores" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
              Retour aux Scores
            </Link>
            <button onClick={() => setStep("eval")} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl">
              Nouveau Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
