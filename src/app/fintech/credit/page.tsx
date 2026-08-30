"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award, FileText, TrendingUp, CheckCircle, Clock,
  Building, ChevronRight, ShieldCheck, AlertTriangle, ArrowLeft, Loader2, Printer
} from "lucide-react";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";

interface CreditClient {
  id: string;
  name: string;
  sector: string | null;
  country: string;
  rccm: string | null;
  ifu: string | null;
}

interface CreditFinancialData {
  ca: number;
  ebitda: number;
  netResult: number;
  equity: number;
  netCash: number;
  year: number;
}

interface CreditScoreData {
  score: number; // 0-1000
  isEligible: boolean;
  evaluatedAt: string;
}

function ratingFromScore(score: number): string {
  if (score >= 900) return "AAA";
  if (score >= 750) return "AA";
  if (score >= 600) return "A";
  if (score >= 450) return "B";
  return "C";
}

type Step = "eval" | "montant" | "banque" | "dossier";

export default function DossierCreditAuto() {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<CreditClient | null>(null);
  const [financialData, setFinancialData] = useState<CreditFinancialData | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null);

  const [step, setStep] = useState<Step>("eval");
  const [montantDemande, setMontantDemande] = useState(5000000);
  const [bankName, setBankName] = useState("");

  useEffect(() => {
    fetch("/api/fintech/credit")
      .then((r) => r.json())
      .then((data) => {
        setClient(data.client || null);
        setFinancialData(data.financialData || null);
        setCreditScore(data.creditScore || null);
        if (data.financialData?.ca) {
          setMontantDemande(Math.round(data.financialData.ca * 0.2));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!client) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-black text-white">Aucun client trouvé</h2>
        <p className="text-slate-400 text-sm">Créez un client pour générer un dossier de crédit.</p>
      </div>
    );
  }

  const rating = creditScore ? ratingFromScore(creditScore.score) : null;
  const gaugeScore = creditScore ? Math.round(creditScore.score / 10) : 0;
  const maxMontant = financialData ? Math.round(financialData.ca * 0.8) : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/comptabilite/health-scores" className="mt-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="page-title">Dossier Crédit</h2>
            {creditScore?.isEligible && (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3 h-3" /> Éligible
              </span>
            )}
          </div>
          <p className="page-subtitle">Constitution d'un dossier de financement à partir des données comptables réelles de {client.name}.</p>
        </div>
      </div>

      {!financialData && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400">Aucune donnée financière (FinancialData) enregistrée pour ce client. Importez un exercice comptable pour continuer.</p>
        </div>
      )}
      {!creditScore && financialData && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400">
            Aucun score de crédit calculé pour ce client. Générez-en un depuis le module{" "}
            <Link href="/comptabilite/health-scores" className="underline font-bold">Health Scores</Link>.
          </p>
        </div>
      )}

      {financialData && creditScore && (
        <>
          {/* Stepper */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: "eval", label: "Évaluation" },
              { id: "montant", label: "Montant" },
              { id: "banque", label: "Destinataire" },
              { id: "dossier", label: "Dossier" },
            ].map((s, i, arr) => {
              const steps: Step[] = ["eval", "montant", "banque", "dossier"];
              const currentIdx = steps.indexOf(step);
              const thisIdx = steps.indexOf(s.id as Step);
              const isDone = thisIdx < currentIdx;
              const isActive = s.id === step;
              return (
                <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isActive ? "bg-primary text-white" : isDone ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500"}`}>
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
              {rating && <FinancialHealthGauge score={gaugeScore} rating={rating} clientName={client.name} />}

              <div className="space-y-4">
                <div className="p-5 bg-slate-900/40 border border-white/5 rounded-[24px]">
                  <h3 className="font-black text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Indicateurs Financiers ({financialData.year})
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Chiffre d'Affaires Annuel", val: `${(financialData.ca / 1000000).toFixed(1)} M FCFA` },
                      { label: "EBITDA", val: `${(financialData.ebitda / 1000000).toFixed(1)} M FCFA` },
                      { label: "Résultat Net", val: `${(financialData.netResult / 1000000).toFixed(1)} M FCFA` },
                      { label: "Capitaux Propres", val: `${(financialData.equity / 1000000).toFixed(1)} M FCFA` },
                      { label: "Trésorerie Nette", val: `${(financialData.netCash / 1000000).toFixed(1)} M FCFA` },
                      { label: "RCCM", val: client.rccm || "Non renseigné" },
                      { label: "Identifiant Fiscal (IFU)", val: client.ifu || "Non renseigné" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-xs text-slate-400">{item.label}</span>
                        <span className="text-xs font-bold text-white">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-bold text-sm">Données extraites de la comptabilité réelle</p>
                    <p className="text-slate-400 text-xs mt-0.5">Ces chiffres proviennent des données financières enregistrées dans Cabinet 360 pour {client.name}.</p>
                  </div>
                </div>

                <button onClick={() => setStep("montant")} className="w-full py-4 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95">
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
                  min={500000} max={Math.max(maxMontant, 500000)} step={500000}
                  value={montantDemande}
                  onChange={e => setMontantDemande(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />

                <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                  <span>500 K</span>
                  <span>{(maxMontant / 1000000).toFixed(0)} M (max, 80% du CA)</span>
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Capacité de remboursement estimée (40% EBITDA/12) : {Math.round((financialData.ebitda * 0.4) / 12).toLocaleString("fr-FR")} FCFA/mois
                </div>

                <button onClick={() => setStep("banque")} className="w-full py-4 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95">
                  Choisir le Destinataire <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Destinataire (pas de partenariat bancaire réel connecté) */}
          {step === "banque" && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400 leading-relaxed">
                  Cabinet 360 n'a pas de partenariat bancaire automatisé configuré (pas de taux ni de plafonds réels par banque). Indiquez le nom de la banque à laquelle vous comptez transmettre ce dossier manuellement.
                </p>
              </div>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex : Société Générale, Ecobank, BICICI..."
                className="w-full p-4 rounded-2xl bg-slate-900/40 border border-white/5 text-white placeholder:text-slate-600 outline-none focus:border-primary"
              />
              <button
                onClick={() => setStep("dossier")}
                className="w-full py-4 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              >
                <FileText className="w-4 h-4" /> Générer le Récapitulatif
              </button>
            </div>
          )}

          {/* ÉTAPE 4 : Récapitulatif */}
          {step === "dossier" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[28px] flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-white font-black text-lg">Récapitulatif du dossier</p>
                  <p className="text-slate-400 text-sm">{client.name} · {new Date().toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
                <h3 className="font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Demande de Crédit
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Building, label: "Demandeur", val: client.name },
                    { icon: Award, label: "Score Cabinet 360", val: rating ? `${rating} (${creditScore.score}/1000)` : "—" },
                    { icon: TrendingUp, label: "Montant sollicité", val: `${(montantDemande / 1000000).toFixed(1)} M FCFA` },
                    { icon: Clock, label: "Destinataire", val: bankName || "Non renseigné" },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5">
                      <item.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-white mt-0.5">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400 leading-relaxed">
                  Envoi automatique non configuré — aucune API de transmission bancaire n'est connectée. Imprimez ou exportez ce récapitulatif et transmettez-le manuellement{bankName ? ` à ${bankName}` : ""}, accompagné des états financiers réels du client (bilan, grand livre, balance).
                </p>
              </div>

              <button onClick={() => window.print()} className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /> Imprimer / Exporter le Récapitulatif
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
