"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, FileText } from "lucide-react";

type ReportData = {
  generatedAt: string;
  mission: { id: string; title: string; status: string; startDate: string; deadline: string | null; client: string; country: string };
  équipe: { responsable: string | null; créateur: string };
  préalables: { acceptation: string; motifAcceptation: string | null; indépendance: string; motifIndépendance: string | null; évaluéPar: string | null; dateÉvaluation: string } | null;
  sectionsValidées: Array<{ name: string; conclusion: string; note: string | null; reviewNote: string | null; reviewedAt: string | null; reviewedBy: string | null; diligences: Array<{ description: string; assertion: string | null; status: string; reference: string | null; commentaire: string | null }> }>;
  testsValidés: Array<{ procedureReference: string; populationDescription: string; populationSize: number; method: string; sampleSize: number; selectedItems: unknown; exceptionsCount: number; exceptionDetails: string | null; conclusion: string; reviewedAt: string | null }>;
  sectionsEnAttente: Array<{ name: string; progress: number; conclusion: string | null; reviewStatus: string }>;
  testsEnAttente: Array<{ id: string; procedureReference: string; conclusion: string }>;
  pointsDeRevueOuverts: Array<{ title: string; referenceType: string; referenceId: string; referenceVersion: string; initialComment: string; createdBy: string; assignedTo: string | null; createdAt: string }>;
  statutRapport: string;
  nature: string;
};

export default function AuditReportPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    fetch(`/api/audit/report?missionId=${encodeURIComponent(missionId)}`)
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Chargement du rapport impossible."); return data as ReportData; })
      .then((data) => live && setReport(data))
      .catch((e) => live && setError(e instanceof Error ? e.message : "Chargement du rapport impossible."));
    return () => { live = false; };
  }, [missionId]);

  if (error) return <main className="p-8 text-rose-300">{error}</main>;
  if (!report) return <main className="p-8 text-slate-300">Préparation de la synthèse…</main>;

  return <main className="audit-print mx-auto max-w-5xl space-y-6 p-6 text-slate-100 print:max-w-none print:p-0 print:text-black">
    <style jsx global>{`@media print { body { background: #fff !important; color: #111 !important; } .no-print { display: none !important; } .audit-print { max-width: none !important; padding: 0 !important; } .print-card { break-inside: avoid; border-color: #bbb !important; background: #fff !important; color: #111 !important; } .print-muted { color: #444 !important; } }`}</style>
    <div className="no-print flex items-center justify-between"><a href="/audit/dossier-travail" className="inline-flex items-center gap-2 text-sm text-slate-300"><ArrowLeft className="h-4 w-4" /> Retour au dossier</a><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"><Printer className="h-4 w-4" /> Imprimer / PDF</button></div>
    <header className="print-card rounded-2xl border border-white/10 bg-slate-900 p-7">
      <div className="flex items-start justify-between gap-5"><div><div className="flex items-center gap-2 text-primary"><FileText className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Synthèse du dossier d’audit</span></div><h1 className="mt-3 text-2xl font-black">{report.mission.title}</h1><p className="print-muted mt-1 text-sm text-slate-300">{report.mission.client} · {report.mission.country} · Responsable : {report.équipe.responsable ?? "Non assigné"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${report.statutRapport === "TRAVAUX_REVUS" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>{report.statutRapport === "TRAVAUX_REVUS" ? "Travaux revus" : "Provisoire · points en attente"}</span></div>
      <p className="print-muted mt-4 border-t border-white/10 pt-3 text-xs text-slate-400">Généré le {new Date(report.generatedAt).toLocaleString("fr-FR")} · {report.nature}</p>
    </header>

    <section className="print-card rounded-2xl border border-white/10 bg-slate-900 p-6"><h2 className="text-lg font-bold">Acceptation et indépendance</h2>{report.préalables ? <div className="mt-3 grid gap-3 md:grid-cols-2"><p>Acceptation : <strong>{report.préalables.acceptation}</strong><br /><span className="print-muted text-sm text-slate-400">{report.préalables.motifAcceptation}</span></p><p>Indépendance : <strong>{report.préalables.indépendance}</strong><br /><span className="print-muted text-sm text-slate-400">{report.préalables.motifIndépendance}</span></p></div> : <p className="print-muted mt-2 text-sm text-slate-400">Aucune évaluation préalable enregistrée.</p>}</section>

    <section className="space-y-3"><h2 className="text-lg font-bold">Conclusions de sections revues ({report.sectionsValidées.length})</h2>{report.sectionsValidées.length ? report.sectionsValidées.map((section) => <article key={section.name} className="print-card rounded-2xl border border-white/10 bg-slate-900 p-5"><div className="flex justify-between gap-3"><h3 className="font-bold">{section.name}</h3><span className="text-xs font-bold text-emerald-300">{section.conclusion}</span></div>{section.note && <p className="print-muted mt-2 text-sm text-slate-300">{section.note}</p>}<p className="print-muted mt-1 text-xs text-slate-400">Revue par {section.reviewedBy ?? "—"}{section.reviewedAt ? ` · ${new Date(section.reviewedAt).toLocaleDateString("fr-FR")}` : ""}{section.reviewNote ? ` · ${section.reviewNote}` : ""}</p><ul className="mt-3 space-y-1">{section.diligences.map((item, index) => <li key={`${item.description}-${index}`} className="print-muted text-sm">• {item.description}{item.reference ? ` · pièce ${item.reference}` : ""}{item.commentaire ? ` · ${item.commentaire}` : ""}</li>)}</ul></article>) : <p className="print-muted text-sm text-slate-400">Aucune section n’a encore été revue.</p>}</section>

    <section className="space-y-3"><h2 className="text-lg font-bold">Échantillonnages revus ({report.testsValidés.length})</h2>{report.testsValidés.length ? report.testsValidés.map((sample, index) => <article key={`${sample.procedureReference}-${index}`} className="print-card rounded-2xl border border-white/10 bg-slate-900 p-5"><h3 className="font-bold">{sample.procedureReference}</h3><p className="print-muted mt-1 text-sm text-slate-300">{sample.populationDescription} · population {sample.populationSize} · échantillon {sample.sampleSize} · {sample.method}</p><p className="print-muted mt-2 text-sm text-slate-300">Éléments : {Array.isArray(sample.selectedItems) ? sample.selectedItems.join(", ") : "—"} · exceptions : {sample.exceptionsCount} · conclusion : {sample.conclusion}</p>{sample.exceptionDetails && <p className="mt-1 text-sm">{sample.exceptionDetails}</p>}</article>) : <p className="print-muted text-sm text-slate-400">Aucun échantillonnage revu.</p>}</section>

    {(report.sectionsEnAttente.length > 0 || report.testsEnAttente.length > 0 || report.pointsDeRevueOuverts.length > 0) && <section className="print-card space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6"><h2 className="text-lg font-bold text-amber-300">Points en attente</h2>{report.sectionsEnAttente.map((section) => <p key={section.name} className="print-muted text-sm text-slate-300">Section « {section.name} » · {section.progress}% · {section.conclusion ?? "sans conclusion"} · {section.reviewStatus === "REVIEWED" ? "revue faite" : "revue à faire"}</p>)}{report.testsEnAttente.map((sample) => <p key={sample.id} className="print-muted text-sm text-slate-300">Test « {sample.procedureReference} » · {sample.conclusion} · en attente de revue</p>)}{report.pointsDeRevueOuverts.map((point, index) => <article key={`${point.referenceId}-${index}`} className="border-t border-white/10 pt-2"><p className="font-semibold">{point.title}</p><p className="print-muted text-sm text-slate-300">{point.referenceType} · {point.referenceId} · assigné à {point.assignedTo ?? "personne"}</p><p className="print-muted text-sm text-slate-300">{point.initialComment}</p></article>)}</section>}
  </main>;
}
