"use client";

import { useState } from "react";
import {
  Calendar, Flag, Zap, Bell, CheckCircle2, AlertTriangle, Clock,
  ChevronLeft, ChevronRight, FileText, Download, Send, Loader2,
  Globe, BarChart3, RefreshCw, ShieldCheck, ArrowRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ============================================
// DONNÉES : Obligations fiscales OHADA / SN
// ============================================
const OBLIGATIONS = [
  {
    id: "tva-mensuelle", titre: "Déclaration & Paiement TVA Mensuelle", echeance: "15 Juin",
    pays: ["SN", "CI", "CM", "BJ"], type: "TVA", urgence: "IMMINENTE",
    montantEstime: 4_800_000, statut: "EN_ATTENTE", nbDossiers: 12,
    description: "Déclaration de la TVA collectée et déductible du mois de mai."
  },
  {
    id: "ipres-css", titre: "Cotisations Sociales IPRES / CSS", echeance: "15 Juin",
    pays: ["SN"], type: "SOCIAL", urgence: "IMMINENTE",
    montantEstime: 2_340_000, statut: "EN_ATTENTE", nbDossiers: 7,
    description: "Déclaration et paiement des cotisations retraite (IPRES RG + RC) et CSS."
  },
  {
    id: "cmb", titre: "Contribution Minimum de Base (CMB)", echeance: "30 Juin",
    pays: ["SN"], type: "IS", urgence: "NORMALE",
    montantEstime: 500_000, statut: "BROUILLON", nbDossiers: 18,
    description: "Acompte minimum IS (CMB). Minimum 500 000 FCFA pour les sociétés au SN."
  },
  {
    id: "cfce", titre: "CFCE — Contribution Forf. Charge Employeurs", echeance: "15 Juin",
    pays: ["SN"], type: "SOCIAL", urgence: "IMMINENTE",
    montantEstime: 890_000, statut: "VALIDE", nbDossiers: 7,
    description: "3% de la masse salariale brute. Déclarée conjointement avec la paie."
  },
  {
    id: "bic-acompte", titre: "Acompte BIC (1/3 annuel)", echeance: "30 Juin",
    pays: ["SN", "CI"], type: "BIC", urgence: "NORMALE",
    montantEstime: 3_200_000, statut: "BROUILLON", nbDossiers: 5,
    description: "Premier tiers de l'impôt BIC à payer en avance (1/4 pour les sociétés soumises à l'IS)."
  },
  {
    id: "irs", titre: "Retenue à la Source BNC / IRS", echeance: "30 Juin",
    pays: ["SN", "CI", "CM"], type: "RAS", urgence: "NORMALE",
    montantEstime: 620_000, statut: "EN_ATTENTE", nbDossiers: 9,
    description: "Retenues effectuées sur les honoraires versés à des non-salariés."
  },
];

const STATUT_STYLE: Record<string, string> = {
  VALIDE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  EN_ATTENTE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  BROUILLON: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};
const URGENCE_STYLE: Record<string, string> = {
  IMMINENTE: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  NORMALE: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};
const TYPE_COLOR: Record<string, string> = {
  TVA: "text-violet-400", IS: "text-indigo-400", SOCIAL: "text-emerald-400",
  BIC: "text-blue-400", RAS: "text-amber-400",
};

export default function FiscaliteOhada() {
  const [activeTab, setActiveTab] = useState<"calendrier" | "obligations" | "simulation">("obligations");
  const [selected, setSelected] = useState(OBLIGATIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [paysCible, setPaysCible] = useState("SN");
  const [simulCA, setSimulCA] = useState(50000000);
  const [simulCharges, setSimulCharges] = useState(30000000);

  const totalADeclarer = OBLIGATIONS.filter(o => o.statut !== "VALIDE").reduce((a, o) => a + o.montantEstime, 0);
  const nbImminentes = OBLIGATIONS.filter(o => o.urgence === "IMMINENTE").length;
  const dossiersCibles = OBLIGATIONS.filter(o => o.statut !== "VALIDE").reduce((a, o) => a + o.nbDossiers, 0);

  const handleGenerate = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsProcessing(false);
    setIsProcessed(true);
  };

  // === Simulation IS / BIC Sénégal ===
  const beneficeNet = simulCA - simulCharges;
  const baseIS = Math.max(0, beneficeNet);
  const isAmount = beneficeNet > 0 ? baseIS * 0.30 : 0; // IS 30% SN
  const cmbAmount = Math.max(500000, simulCA * 0.005); // CMB : min 500k ou 0.5% du CA
  const impotDu = Math.max(isAmount, cmbAmount);
  const tva = simulCA * 0.18;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500/20 to-orange-600/10 border border-rose-500/20 flex items-center justify-center shadow-xl shadow-rose-500/10">
            <Flag className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Fiscalité OHADA — Sénégal 🇸🇳</h2>
            <p className="text-slate-400 mt-1">Gestion intelligente des obligations fiscales et sociales. Déclarations générées et télétransmises automatiquement.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={paysCible}
            onChange={e => setPaysCible(e.target.value)}
            className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="SN">🇸🇳 Sénégal</option>
            <option value="CI">🇨🇮 Côte d'Ivoire</option>
            <option value="CM">🇨🇲 Cameroun</option>
            <option value="BJ">🇧🇯 Bénin</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: "Obligations imminentes", val: nbImminentes, sub: "Avant le 15 Juin", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
          { icon: Clock, label: "Montant total à déclarer", val: (totalADeclarer / 1_000_000).toFixed(1) + " M FCFA", sub: "Sur le mois", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { icon: FileText, label: "Dossiers impactés", val: dossiersCibles, sub: "à traiter", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { icon: CheckCircle2, label: "Déclarations validées", val: OBLIGATIONS.filter(o => o.statut === "VALIDE").length, sub: "Ce mois", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        ].map((k, i) => (
          <div key={i} className={cn("rounded-[24px] border p-5", k.color)}>
            <k.icon className="w-5 h-5 mb-4" />
            <p className="text-2xl font-black tabular-nums">{k.val}</p>
            <p className="text-xs font-bold mt-1 opacity-70">{k.label}</p>
            <p className="text-[10px] mt-1 opacity-50">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900/40 border border-white/5 rounded-2xl w-fit">
        {([
          { key: "obligations", label: "Obligations du Mois", icon: Bell },
          { key: "simulation", label: "Simulateur IS / TVA", icon: Sparkles },
          { key: "calendrier", label: "Calendrier Fiscal", icon: Calendar },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === t.key ? "bg-rose-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== OBLIGATIONS DU MOIS ===== */}
      {activeTab === "obligations" && (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Liste */}
          <div className="lg:col-span-5 space-y-3">
            {OBLIGATIONS.map(ob => (
              <div
                key={ob.id}
                onClick={() => { setSelected(ob); setIsProcessed(false); }}
                className={cn(
                  "cursor-pointer p-5 rounded-2xl border transition-all",
                  selected.id === ob.id ? "bg-rose-600/10 border-rose-500/30" : "bg-slate-900/40 border-white/5 hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className={cn("font-bold text-sm", selected.id === ob.id ? "text-rose-300" : "text-white")}>{ob.titre}</p>
                  <span className={cn("text-[9px] px-2 py-1 rounded-lg border font-black uppercase shrink-0", URGENCE_STYLE[ob.urgence])}>
                    {ob.urgence}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-black", TYPE_COLOR[ob.type])}>{ob.type}</span>
                    <span className="text-[10px] text-slate-500">· {ob.pays.join(", ")}</span>
                  </div>
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-lg border font-black uppercase", STATUT_STYLE[ob.statut])}>
                    {ob.statut.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {ob.echeance}</p>
                  <p className="text-sm font-black text-white tabular-nums">{ob.montantEstime.toLocaleString()} F</p>
                </div>
              </div>
            ))}
          </div>

          {/* Détail + Action */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className={cn("text-xs font-black uppercase tracking-widest mb-1", TYPE_COLOR[selected.type])}>{selected.type} — {selected.pays.join(", ")}</p>
                  <h3 className="text-xl font-black text-white">{selected.titre}</h3>
                  <p className="text-slate-400 text-sm mt-2">{selected.description}</p>
                </div>
              </div>

              {/* Détails */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Échéance</p>
                  <p className="font-black text-rose-400 text-lg flex items-center gap-2"><Calendar className="w-4 h-4" /> {selected.echeance}</p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Montant Estimé</p>
                  <p className="font-black text-white text-lg tabular-nums">{selected.montantEstime.toLocaleString()} F</p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Dossiers</p>
                  <p className="font-black text-white text-lg">{selected.nbDossiers} clients</p>
                </div>
              </div>

              {/* Action IA */}
              {!isProcessed ? (
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3"
                >
                  {isProcessing
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Génération IA en cours…</>
                    : <><Zap className="w-5 h-5" /> Générer & Télétransmettre la Déclaration</>
                  }
                </button>
              ) : (
                <div className="w-full p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                      <p className="font-black text-sm">Déclaration générée et transmise</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PDF archivé · Accusé DGI enregistré · Dossiers clients notifiés</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-xs font-black text-white hover:bg-slate-700 border border-white/5 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Télécharger PDF
                  </button>
                </div>
              )}
            </div>

            {/* Lien liasse */}
            <Link href="/comptabilite/liasse-fiscale" className="flex items-center justify-between p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-600/20 transition-all group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="font-black text-white text-sm">Générer la Liasse Fiscale OHADA</p>
                  <p className="text-[10px] text-slate-400">Bilan + Compte de Résultat + États annexés</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
        </div>
      )}

      {/* ===== SIMULATEUR IS / TVA ===== */}
      {activeTab === "simulation" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="font-black text-white text-lg">Simulateur Fiscal — {paysCible === "SN" ? "Sénégal 🇸🇳" : paysCible}</h3>
            </div>
            <p className="text-slate-400 text-sm">Estimez instantanément vos impôts (IS, BIC, TVA) selon les barèmes en vigueur.</p>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Chiffre d'Affaires HT (FCFA)</label>
                <input type="number" value={simulCA} onChange={e => setSimulCA(Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Charges Déductibles Totales (FCFA)</label>
                <input type="number" value={simulCharges} onChange={e => setSimulCharges(Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8 space-y-5">
              <h3 className="font-black text-white text-sm uppercase tracking-widest">Résultat Simulation</h3>

              {[
                { label: "Bénéfice Net Avant Impôt", val: beneficeNet, color: beneficeNet >= 0 ? "text-emerald-400" : "text-rose-400" },
                { label: `IS (30%) ou CMB (min 500 000 F)`, val: impotDu, color: "text-orange-400", sub: impotDu === cmbAmount ? "⚠️ CMB applicable" : "Barème IS" },
                { label: "TVA Collectée (18%)", val: tva, color: "text-violet-400" },
                { label: "Total charges fiscales du mois", val: impotDu + tva, color: "text-rose-400", bold: true },
              ].map((item, i) => (
                <div key={i} className={cn("flex items-center justify-between p-4 rounded-xl border", item.bold ? "bg-rose-500/5 border-rose-500/20" : "bg-slate-800/30 border-white/5")}>
                  <div>
                    <p className={cn("text-xs font-bold", item.bold ? "text-white" : "text-slate-400")}>{item.label}</p>
                    {item.sub && <p className="text-[10px] text-amber-400 mt-0.5">{item.sub}</p>}
                  </div>
                  <p className={cn("font-black text-lg tabular-nums", item.color)}>{item.val.toLocaleString()} F</p>
                </div>
              ))}
            </div>

            <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-indigo-300 font-black text-xs">Recommandation IA</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {beneficeNet > 0 && impotDu === cmbAmount
                    ? "⚠️ La CMB est supérieure à l'IS théorique. Envisagez d'optimiser vos charges déductibles ou de provisionner davantage avant clôture."
                    : beneficeNet <= 0
                    ? "✅ Pas d'IS dû. Seule la CMB (500 000 F min) s'applique. Vérifiez les provisions pour charges futures."
                    : "✅ Situation fiscale saine. L'IS est calculé sur le bénéfice réel. Pensez à constituer une provision IS de " + (impotDu / 1_000_000).toFixed(1) + " M F."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CALENDRIER ===== */}
      {activeTab === "calendrier" && (
        <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-white text-xl">Juin 2026</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3 mb-4">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {/* Décalage (Lundi = 1er Juin 2026) */}
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
              const evts = OBLIGATIONS.filter(o => {
                const d = parseInt(o.echeance);
                return d === day;
              });
              const isToday = day === 3;
              return (
                <div key={day} className={cn(
                  "min-h-[80px] rounded-2xl border p-2 transition-all",
                  isToday ? "bg-indigo-600/20 border-indigo-500/40" :
                  evts.length > 0 ? "bg-slate-800/50 border-white/10" : "bg-slate-900/20 border-white/5"
                )}>
                  <span className={cn("text-sm font-black", isToday ? "text-indigo-400" : evts.length > 0 ? "text-white" : "text-slate-600")}>{day}</span>
                  <div className="mt-1 space-y-1">
                    {evts.map((ev, idx) => (
                      <div key={idx} className={cn(
                        "text-[8px] px-1.5 py-1 rounded font-black truncate",
                        ev.urgence === "IMMINENTE" ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-300"
                      )}>
                        {ev.type}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
