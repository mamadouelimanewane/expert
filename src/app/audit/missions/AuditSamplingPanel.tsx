"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";

type Sample = {
  id: string; procedureReference: string; populationDescription: string; populationSize: number; method: string;
  sampleSize: number; selectedItems: string[]; exceptionsCount: number; exceptionDetails: string | null;
  conclusion: string; status: string; createdAt: string; reviewedAt: string | null;
};

export default function AuditSamplingPanel({ missionId }: { missionId: string }) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [procedureReference, setProcedureReference] = useState("");
  const [populationDescription, setPopulationDescription] = useState("");
  const [populationSize, setPopulationSize] = useState("");
  const [method, setMethod] = useState("RANDOM");
  const [sampleSize, setSampleSize] = useState("");
  const [selectedItems, setSelectedItems] = useState("");
  const [exceptionsCount, setExceptionsCount] = useState("0");
  const [exceptionDetails, setExceptionDetails] = useState("");
  const [conclusion, setConclusion] = useState("PENDING");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/audit/samples?missionId=${encodeURIComponent(missionId)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Chargement des tests impossible.");
    setSamples(data.samples ?? []);
  }, [missionId]);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/audit/samples", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, procedureReference, populationDescription, populationSize, method, sampleSize, selectedItems, exceptionsCount, exceptionDetails, conclusion }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      setSamples((current) => [data.sample, ...current]);
      setProcedureReference(""); setPopulationDescription(""); setPopulationSize(""); setSampleSize("");
      setSelectedItems(""); setExceptionsCount("0"); setExceptionDetails(""); setConclusion("PENDING");
    } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible."); }
    finally { setBusy(false); }
  };

  const review = async (sampleId: string) => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/audit/samples", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sampleId, action: "REVIEW" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Revue impossible.");
      setSamples((current) => current.map((sample) => sample.id === sampleId ? data.sample : sample));
    } catch (e) { setError(e instanceof Error ? e.message : "Revue impossible."); }
    finally { setBusy(false); }
  };

  return <section className="apix-card space-y-5">
    <div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-primary" /><div><h3 className="font-bold text-white">Échantillonnage et tests</h3><p className="text-xs text-slate-400">Population, méthode, éléments sélectionnés, exceptions et conclusion.</p></div></div>
    <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
      <input required minLength={2} maxLength={200} value={procedureReference} onChange={(e) => setProcedureReference(e.target.value)} placeholder="Référence de procédure ou assertion testée" className="rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" />
      <input required minLength={5} maxLength={2000} value={populationDescription} onChange={(e) => setPopulationDescription(e.target.value)} placeholder="Description de la population" className="rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" />
      <label className="text-xs text-slate-400">Taille de la population<input required type="number" min="1" value={populationSize} onChange={(e) => setPopulationSize(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" /></label>
      <label className="text-xs text-slate-400">Méthode<select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white"><option value="RANDOM">Aléatoire</option><option value="SYSTEMATIC">Systématique</option><option value="TARGETED">Ciblée</option></select></label>
      <label className="text-xs text-slate-400">Taille de l’échantillon<input required type="number" min="1" max={populationSize || undefined} value={sampleSize} onChange={(e) => setSampleSize(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" /></label>
      <label className="text-xs text-slate-400">Exceptions constatées<input required type="number" min="0" max={sampleSize || undefined} value={exceptionsCount} onChange={(e) => setExceptionsCount(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" /></label>
      <label className="text-xs text-slate-400 md:col-span-2">Éléments sélectionnés (un identifiant par ligne)<textarea value={selectedItems} onChange={(e) => setSelectedItems(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" /></label>
      <label className="text-xs text-slate-400 md:col-span-2">Détail des exceptions<textarea value={exceptionDetails} onChange={(e) => setExceptionDetails(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" /></label>
      <label className="text-xs text-slate-400">Conclusion<select value={conclusion} onChange={(e) => setConclusion(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white"><option value="PENDING">À conclure</option><option value="NO_EXCEPTION">Aucune exception</option><option value="EXCEPTION">Exception</option><option value="INCONCLUSIVE">Non concluant</option></select></label>
      <div className="flex items-end"><button disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Enregistrer le test</button></div>
    </form>
    {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
    <div className="space-y-3">{samples.map((sample) => <article key={sample.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="font-semibold text-white">{sample.procedureReference}</h4><p className="text-xs text-slate-400">{sample.populationDescription} · population {sample.populationSize} · échantillon {sample.sampleSize} · {sample.method}</p></div><span className="rounded bg-white/5 px-2 py-1 text-xs text-slate-300">{sample.status === "REVIEWED" ? "Revu" : "Brouillon"} · {sample.conclusion}</span></div>
      <p className="mt-2 text-xs text-slate-300">{sample.exceptionsCount} exception(s) · éléments sélectionnés : {sample.selectedItems.join(", ") || "non détaillés"}</p>{sample.exceptionDetails && <p className="mt-1 whitespace-pre-wrap text-xs text-amber-200">{sample.exceptionDetails}</p>}
      {sample.status === "DRAFT" && <button disabled={busy} onClick={() => void review(sample.id)} className="mt-3 rounded-lg border border-emerald-500/20 px-3 py-2 text-xs text-emerald-300 disabled:opacity-40">Marquer comme revu</button>}
    </article>)}</div>
  </section>;
}
