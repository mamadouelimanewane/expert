"use client";

import { useState, useRef } from "react";
import { ScoreEvolutionChart } from "@/components/portal/ScoreEvolutionChart";
import {
  FileText, Download, Printer, Eye, ChevronDown,
  TrendingUp, Award, Shield, BarChart2, CheckCircle,
  AlertTriangle, Building2
} from "lucide-react";

const CLIENTS = [
  {
    id: "c1", name: "PMI Dakar SARL", sector: "Commerce", country: "SN", siret: "SN-2024-001234",
    score: 72, rating: "AA", trend: +4, eligible: true,
    evolution: [
      { month: "Jan", score: 45 }, { month: "Fév", score: 50 }, { month: "Mar", score: 55 },
      { month: "Avr", score: 62 }, { month: "Mai", score: 68 }, { month: "Jun", score: 72 },
    ],
    metrics: { liquidite: 1.4, solvabilite: 0.65, rentabilite: 8.2, bfr: 12, tvaConformity: 95, regularite: 88 },
    recommendation: "Entreprise en croissance stable. Le ratio de liquidité est adéquat et la conformité TVA excellente. Éligible à un crédit court terme jusqu'à 15M FCFA.",
  },
  {
    id: "c2", name: "Tech Startup CI", sector: "Technologie", country: "CI", siret: "CI-2023-005678",
    score: 88, rating: "AAA", trend: +3, eligible: true,
    evolution: [
      { month: "Jan", score: 70 }, { month: "Fév", score: 74 }, { month: "Mar", score: 78 },
      { month: "Avr", score: 81 }, { month: "Mai", score: 85 }, { month: "Jun", score: 88 },
    ],
    metrics: { liquidite: 2.1, solvabilite: 0.78, rentabilite: 14.5, bfr: 8, tvaConformity: 100, regularite: 96 },
    recommendation: "Excellente santé financière. Croissance soutenue avec des ratios remarquables. Éligible à un financement structuré jusqu'à 50M FCFA.",
  },
  {
    id: "c3", name: "Chez Marie Traiteur", sector: "Restauration", country: "CI", siret: "CI-2025-002345",
    score: 45, rating: "B", trend: -1, eligible: false,
    evolution: [
      { month: "Jan", score: 52 }, { month: "Fév", score: 50 }, { month: "Mar", score: 48 },
      { month: "Avr", score: 47 }, { month: "Mai", score: 46 }, { month: "Jun", score: 45 },
    ],
    metrics: { liquidite: 0.9, solvabilite: 0.42, rentabilite: 2.1, bfr: 28, tvaConformity: 72, regularite: 60 },
    recommendation: "Attention requise. Le BFR est trop élevé et la liquidité insuffisante. Accompagnement renforcé recommandé avant toute demande de crédit.",
  },
];

const RATING_COLOR: Record<string, string> = {
  AAA: "#10b981", AA: "#6366f1", A: "#3b82f6", B: "#f59e0b", C: "#ef4444"
};

export default function HealthReportPage() {
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0]);
  const [showPreview, setShowPreview] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !reportRef.current) return;
    printWindow.document.write(`
      <html><head><title>Rapport Santé - ${selectedClient.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', 'Segoe UI', sans-serif; background: white; color: #1e293b; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #6366f1; }
        .date { color: #94a3b8; font-size: 12px; }
        .title { font-size: 22px; font-weight: 900; margin: 20px 0; }
        .section { margin: 24px 0; }
        .section-title { font-size: 14px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; border-left: 4px solid #6366f1; padding-left: 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .metric { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
        .metric-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .metric-value { font-size: 24px; font-weight: 900; margin-top: 4px; }
        .score-box { text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 20px; padding: 32px; margin: 24px 0; }
        .score-number { font-size: 64px; font-weight: 900; }
        .rating { font-size: 28px; font-weight: 900; margin-top: 8px; }
        .recommendation { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .recommendation p { font-size: 13px; line-height: 1.6; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px; }
        .stamp { display: inline-block; border: 2px solid #6366f1; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; text-align: center; color: #6366f1; font-weight: 900; font-size: 11px; margin: 20px 0; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <div class="header">
          <div class="logo">CABINET 360 — OHADA</div>
          <div class="date">Rapport généré le ${today}</div>
        </div>
        <div class="title">Rapport de Santé Financière</div>
        <p style="color:#64748b;font-size:13px;margin-bottom:8px;">${selectedClient.name} · ${selectedClient.sector} · ${selectedClient.country} · ${selectedClient.siret}</p>

        <div class="score-box">
          <div class="score-number">${selectedClient.score}</div>
          <div class="rating">Notation ${selectedClient.rating}</div>
          <p style="opacity:0.7;font-size:12px;margin-top:8px;">Score de santé financière OHADA sur 100 points</p>
        </div>

        <div class="section">
          <div class="section-title">Indicateurs clés</div>
          <div class="grid">
            <div class="metric"><div class="metric-label">Liquidité générale</div><div class="metric-value">${selectedClient.metrics.liquidite}</div></div>
            <div class="metric"><div class="metric-label">Solvabilité</div><div class="metric-value">${(selectedClient.metrics.solvabilite * 100).toFixed(0)}%</div></div>
            <div class="metric"><div class="metric-label">Rentabilité (%)</div><div class="metric-value">${selectedClient.metrics.rentabilite}%</div></div>
            <div class="metric"><div class="metric-label">BFR (jours)</div><div class="metric-value">${selectedClient.metrics.bfr}j</div></div>
            <div class="metric"><div class="metric-label">Conformité TVA</div><div class="metric-value">${selectedClient.metrics.tvaConformity}%</div></div>
            <div class="metric"><div class="metric-label">Régularité saisie</div><div class="metric-value">${selectedClient.metrics.regularite}%</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Recommandation</div>
          <div class="recommendation"><p>${selectedClient.recommendation}</p></div>
        </div>

        <div class="section">
          <div class="section-title">Éligibilité crédit</div>
          <p style="font-size:14px;font-weight:700;color:${selectedClient.eligible ? '#059669' : '#dc2626'}">
            ${selectedClient.eligible ? '✅ Éligible — Dossier de crédit automatique disponible' : '❌ Non éligible — Amélioration des indicateurs nécessaire'}
          </p>
        </div>

        <div style="text-align:center;margin-top:40px;">
          <div class="stamp">CERTIFIÉ</div>
          <p style="font-size:11px;color:#6366f1;font-weight:700;">Visa du cabinet comptable</p>
        </div>

        <div class="footer">
          <p>Ce rapport est généré automatiquement par la plateforme CABINET 360 — Module Santé Financière OHADA</p>
          <p>Document confidentiel — Ne pas diffuser sans autorisation du cabinet</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-500" />
            Rapport de Santé Financière
          </h2>
          <p className="text-slate-400 mt-1">Générer un rapport PDF certifié pour vos clients PMI</p>
        </div>
      </div>

      {/* Client selector */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-6">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Sélectionner un client
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CLIENTS.map(c => (
            <button key={c.id} onClick={() => { setSelectedClient(c); setShowPreview(false); }}
              className={`p-4 rounded-2xl border text-left transition-all ${selectedClient.id === c.id
                ? "bg-indigo-600/20 border-indigo-500/30 ring-2 ring-indigo-500/20"
                : "bg-slate-800/40 border-white/5 hover:border-white/10"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white"
                  style={{ background: RATING_COLOR[c.rating] + "33", color: RATING_COLOR[c.rating] }}>
                  {c.rating}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-[10px] text-slate-500">{c.sector} · {c.country} · Score {c.score}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Aperçu du rapport */}
      <div ref={reportRef} className="bg-slate-900/40 border border-white/5 rounded-[28px] overflow-hidden">
        {/* En-tête rapport */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/10 p-8 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-2">Rapport de Santé Financière OHADA</p>
              <h3 className="text-2xl font-black text-white">{selectedClient.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{selectedClient.sector} · {selectedClient.country} · {selectedClient.siret}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{today}</p>
              <p className="text-[10px] text-slate-600 mt-1">Cabinet 360 — Certifié</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Score central */}
          <div className="flex items-center gap-8 flex-wrap">
            <div className="bg-gradient-to-br from-indigo-600/30 to-violet-600/20 border border-indigo-500/20 rounded-[24px] p-8 text-center flex-shrink-0">
              <p className="text-7xl font-black tabular-nums" style={{ color: RATING_COLOR[selectedClient.rating] }}>
                {selectedClient.score}
              </p>
              <p className="text-2xl font-black text-white mt-1">{selectedClient.rating}</p>
              <p className="text-[10px] text-slate-500 mt-2">Score / 100</p>
            </div>

            <div className="flex-1 min-w-[280px]">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Évolution 6 mois</p>
              <ScoreEvolutionChart data={selectedClient.evolution} color={RATING_COLOR[selectedClient.rating]} height={110} />
              <div className="flex items-center gap-2 mt-3">
                {selectedClient.trend > 0
                  ? <span className="text-emerald-400 text-xs font-black">▲ +{selectedClient.trend} pts/mois — Tendance haussière</span>
                  : <span className="text-rose-400 text-xs font-black">▼ {selectedClient.trend} pts/mois — Tendance baissière</span>
                }
              </div>
            </div>
          </div>

          {/* Indicateurs */}
          <div>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Indicateurs Clés de Performance
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Liquidité générale", value: String(selectedClient.metrics.liquidite), good: selectedClient.metrics.liquidite >= 1.2 },
                { label: "Solvabilité", value: `${(selectedClient.metrics.solvabilite * 100).toFixed(0)}%`, good: selectedClient.metrics.solvabilite >= 0.5 },
                { label: "Rentabilité", value: `${selectedClient.metrics.rentabilite}%`, good: selectedClient.metrics.rentabilite >= 5 },
                { label: "BFR (jours)", value: `${selectedClient.metrics.bfr}j`, good: selectedClient.metrics.bfr <= 15 },
                { label: "Conformité TVA", value: `${selectedClient.metrics.tvaConformity}%`, good: selectedClient.metrics.tvaConformity >= 90 },
                { label: "Régularité saisie", value: `${selectedClient.metrics.regularite}%`, good: selectedClient.metrics.regularite >= 80 },
              ].map((m, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${m.good ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/5 border-rose-500/10"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {m.good
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    }
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{m.label}</span>
                  </div>
                  <p className={`text-2xl font-black tabular-nums ${m.good ? "text-emerald-400" : "text-rose-400"}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandation */}
          <div className={`p-6 rounded-2xl border ${selectedClient.eligible ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
            <p className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: selectedClient.eligible ? "#10b981" : "#f59e0b" }}>
              <Shield className="w-4 h-4" /> Recommandation du cabinet
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{selectedClient.recommendation}</p>
          </div>

          {/* Éligibilité */}
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${selectedClient.eligible ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
            <Award className={`w-6 h-6 ${selectedClient.eligible ? "text-emerald-400" : "text-rose-400"}`} />
            <div>
              <p className={`font-black text-sm ${selectedClient.eligible ? "text-emerald-400" : "text-rose-400"}`}>
                {selectedClient.eligible ? "Éligible au crédit bancaire" : "Non éligible au crédit bancaire"}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {selectedClient.eligible
                  ? "Un dossier de crédit automatique peut être généré depuis la plateforme."
                  : "Un accompagnement renforcé est recommandé pour améliorer les indicateurs."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs transition-colors shadow-lg shadow-indigo-500/20">
          <Printer className="w-4 h-4" /> Imprimer / Exporter PDF
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white rounded-2xl font-black text-xs transition-colors">
          <Download className="w-4 h-4" /> Télécharger
        </button>
        <button onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white rounded-2xl font-black text-xs transition-colors">
          <Eye className="w-4 h-4" /> {showPreview ? "Masquer aperçu" : "Aperçu pleine page"}
        </button>
      </div>
    </div>
  );
}
