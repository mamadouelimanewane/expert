"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderCheck, CheckSquare, MessageSquare, Link as LinkIcon, CheckCircle2, ChevronRight, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CYCLE = ["A_FAIRE", "EN_COURS", "TERMINE"] as const;
const STATUS_LABEL: Record<string, string> = { A_FAIRE: "À faire", EN_COURS: "En cours", TERMINE: "Terminé" };
const CONCLUSIONS = [
  { value: "SATISFAISANT", label: "Satisfaisant" },
  { value: "RESERVE", label: "Réserve" },
  { value: "NON_CONFORME", label: "Non conforme" },
];

export default function AuditDossierPage() {
  const [data, setData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [reviewNoteInput, setReviewNoteInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    fetch("/api/audit/dossier")
      .then(res => res.json())
      .then(d => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setData(d);
        setActiveSection(prev => prev || d.sections[0]?.id || null);
      });
  };

  useEffect(() => { loadData(); }, []);

  if (error) {
    return (
      <div className="p-8 text-center text-slate-400">
        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-amber-500" />
        {error}
      </div>
    );
  }

  if (!data) return <div className="text-white p-8">Chargement...</div>;

  const activeChecklist = data.checklists[activeSection || ""] || [];
  const sectionInfo = data.sections.find((s: any) => s.id === activeSection);

  const cycleStatus = async (itemId: string, current: string) => {
    const idx = STATUS_CYCLE.indexOf(current as any);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    await fetch("/api/audit/dossier", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, status: next }),
    });
    loadData();
  };

  const updateItemField = async (itemId: string, field: "ref" | "comment", value: string) => {
    await fetch("/api/audit/dossier", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, [field]: value }),
    });
  };

  const setConclusion = async (conclusion: string) => {
    if (!activeSection) return;
    await fetch("/api/audit/dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: activeSection, conclusion, note: noteInput || undefined }),
    });
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <FolderCheck className="w-6 h-6 text-primary" /> Dossier de Travail Numérique
          </h2>
          <div className="flex items-center gap-4 text-slate-400 text-sm font-medium mt-2">
            <span className="px-2 py-1 bg-slate-800 rounded-md text-white">{data.mission.name}</span>
            <span>Client : <strong className="text-white">{data.mission.client}</strong></span>
            <span>Auditeur : {data.mission.auditor}</span>
            {data.mission.date && <span>Clôture : {new Date(data.mission.date).toLocaleDateString("fr-FR")}</span>}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avancement Global</p>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${data.globalProgress}%` }}></div>
              </div>
              <span className="text-sm font-bold text-white">{data.globalProgress}%</span>
            </div>
          </div>
          <button
            onClick={() => setShowFinalReport(true)}
            className="px-6 py-3 bg-primary hover:brightness-110 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <FileText className="w-4 h-4" /> Aperçu du dossier
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Sidebar: Sections Nav */}
        <div className="w-72 flex-shrink-0 flex flex-col bg-slate-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl overflow-y-auto">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Sections d'Audit</h3>
          <div className="space-y-1">
            {data.sections.map((sec: any) => (
              <button
                key={sec.id}
                onClick={() => { setActiveSection(sec.id); setNoteInput(""); setReviewNoteInput(""); }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm",
                  activeSection === sec.id
                    ? "bg-primary/20 border border-primary/30 text-primary font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                )}
              >
                <span>{sec.name}</span>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full",
                  sec.progress === 100 ? "bg-emerald-500/20 text-emerald-400" :
                  sec.progress > 0 ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-500"
                )}>{sec.progress}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Area: Checklist */}
        <div className="flex-1 flex flex-col bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl relative">
          {/* Section Header */}
          <div className="px-8 py-6 border-b border-white/5 bg-slate-900/50 shrink-0">
            <h3 className="text-xl font-black text-white">{sectionInfo?.name}</h3>
            <p className="text-sm text-slate-400 mt-1">Programme de travail détaillé</p>
          </div>

          {/* Checklist Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {activeChecklist.length > 0 ? (
              activeChecklist.map((item: any) => (
                <div key={item.id} className="bg-slate-950/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => cycleStatus(item.id, item.status)}
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors border",
                        item.status === 'TERMINE' ? "bg-emerald-500 border-emerald-500 text-white" :
                        item.status === 'EN_COURS' ? "bg-amber-500/20 border-amber-500 text-amber-500" :
                        "bg-slate-800 border-slate-600 text-transparent hover:text-slate-500"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <p className={cn("text-sm font-medium", item.status === 'TERMINE' ? "text-slate-300 line-through opacity-70" : "text-white")}>{item.description}</p>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-[10px] font-black uppercase tracking-widest shrink-0">{STATUS_LABEL[item.status]}</span>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1 flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 border border-white/5 focus-within:border-primary transition-colors">
                          <LinkIcon className="w-4 h-4 text-slate-500" />
                          <input type="text" defaultValue={item.ref} onBlur={e => updateItemField(item.id, "ref", e.target.value)} placeholder="Ref. pièce justificative" className="bg-transparent border-none text-xs text-white focus:outline-none w-full" />
                        </div>
                        <div className="flex-[2] flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 border border-white/5 focus-within:border-primary transition-colors">
                          <MessageSquare className="w-4 h-4 text-slate-500" />
                          <input type="text" defaultValue={item.comment} onBlur={e => updateItemField(item.id, "comment", e.target.value)} placeholder="Commentaire d'audit" className="bg-transparent border-none text-xs text-white focus:outline-none w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <CheckSquare className="w-12 h-12 mb-4 opacity-20" />
                <p>Programme de travail non défini pour cette section.</p>
              </div>
            )}
          </div>

          {/* Conclusion Panel */}
          <div className="p-6 bg-slate-800/50 border-t border-white/5 shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Conclusion de la section</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                {CONCLUSIONS.map(c => (
                  <button key={c.value} onClick={() => setConclusion(c.value)} className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    c.value === 'SATISFAISANT' ? "hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400" :
                    c.value === 'RESERVE' ? "hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400" :
                    "hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400",
                    sectionInfo?.conclusion === c.value ? (
                      c.value === 'SATISFAISANT' ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                      c.value === 'RESERVE' ? "bg-amber-500/20 border-amber-500/50 text-amber-400" :
                      "bg-red-500/20 border-red-500/50 text-red-400"
                    ) : "bg-slate-900 border-white/5 text-slate-500"
                  )}>
                    {c.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Note de synthèse globale..."
                className="min-w-48 flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button onClick={() => setConclusion(sectionInfo?.conclusion || "SATISFAISANT")} className="px-6 py-2 bg-primary hover:brightness-110 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                Enregistrer
              </button>
              {sectionInfo?.reviewStatus === "REVIEWED" ? (
                <span className="self-center text-xs text-emerald-300">Revue validée par {sectionInfo.reviewedBy?.firstName} {sectionInfo.reviewedBy?.lastName}</span>
              ) : (data.currentRole === "EXPERT" || data.currentRole === "ADMIN") && (
                <>
                  <input type="text" value={reviewNoteInput} onChange={(e) => setReviewNoteInput(e.target.value)} placeholder="Note de revue hiérarchique (10 caractères min.)" className="min-w-56 flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm text-white" />
                  <button disabled={!sectionInfo?.conclusion || sectionInfo?.progress !== 100 || reviewNoteInput.trim().length < 10} onClick={async () => {
                    const response = await fetch("/api/audit/dossier", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionId: activeSection, action: "REVIEW", reviewNote: reviewNoteInput }) });
                    const result = await response.json();
                    if (!response.ok) { setError(result.error ?? "Revue impossible."); return; }
                    setReviewNoteInput(""); loadData();
                  }} className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Valider la revue</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Rapport Final */}
      <AnimatePresence>
        {showFinalReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-3xl w-full shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" /> Synthèse des travaux d'audit
                </h3>
                <div className="flex items-center gap-2"><button onClick={() => window.open(`/audit/rapports/${encodeURIComponent(data.mission.id)}`, "_blank", "noopener,noreferrer")} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">Ouvrir la version imprimable</button><button onClick={() => setShowFinalReport(false)} className="text-slate-400 hover:text-white p-2">✕</button></div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <p className="text-sm text-slate-300 mb-6">Aperçu de supervision des travaux saisis. Ce récapitulatif n’est pas un rapport d’opinion et ne remplace pas la validation professionnelle.</p>

                {data.sections.map((sec: any) => (
                  <div key={sec.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold text-white">{sec.name}</span>
                    {sec.conclusion ? (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        sec.conclusion === 'SATISFAISANT' ? "bg-emerald-500/10 text-emerald-400" :
                        sec.conclusion === 'RESERVE' ? "bg-amber-500/10 text-amber-400" :
                        "bg-red-500/10 text-red-400"
                      )}>{CONCLUSIONS.find(c => c.value === sec.conclusion)?.label}</span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Non conclu ({sec.progress}%)</span>
                    )}
                    <span className={cn("ml-3 text-[10px] font-bold", sec.reviewStatus === "REVIEWED" ? "text-emerald-300" : "text-amber-300")}>{sec.reviewStatus === "REVIEWED" ? "Revu" : "À revoir"}</span>
                  </div>
                ))}

                {(data.sections.some((s: any) => !s.conclusion || s.reviewStatus !== "REVIEWED") || data.openReviewPoints > 0 || data.unreviewedSamples > 0) && (
                  <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-400 mb-1">Dossier incomplet</h4>
                      <p className="text-xs text-amber-400/80">Diligences à terminer : {data.sections.filter((s: any) => !s.conclusion || s.reviewStatus !== "REVIEWED").length} section(s) à conclure ou revoir, {data.openReviewPoints ?? 0} point(s) de revue ouvert(s), {data.unreviewedSamples ?? 0} test(s) d’échantillonnage non revu(s). La clôture de la mission reste bloquée tant qu’ils ne sont pas résolus.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
