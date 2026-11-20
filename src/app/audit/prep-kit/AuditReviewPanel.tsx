"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquareText, RefreshCw, Send } from "lucide-react";
import { tpeJournalReviewVersion } from "@/lib/audit-review-policy";

type Mission = { id: string; title: string; status: string };
type Evidence = { id: string; label: string; updatedAt: string };
type Reviewer = { id: string; nom: string; role: string };
type ReviewEvent = { id: string; eventType: string; content: string | null; createdAt: string; user?: { firstName: string; lastName: string } };
type ReviewComment = {
  id: string; title: string; initialComment: string; referenceType: string; referenceId: string;
  referenceVersion: string; status: string; assignedToId: string | null; createdAt: string;
  createdBy: { firstName: string; lastName: string }; assignedTo?: { firstName: string; lastName: string } | null;
  events: ReviewEvent[];
};

const TYPES = ["DOCUMENT", "WORK_PAPER", "TPE_JOURNAL"] as const;

export default function AuditReviewPanel({ clientId }: { clientId: string }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionId, setMissionId] = useState("");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [referenceType, setReferenceType] = useState<(typeof TYPES)[number]>("DOCUMENT");
  const [referenceId, setReferenceId] = useState("");
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [assignedToId, setAssignedToId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<Record<string, string>>({});
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    Promise.all([
      fetch(`/api/missions?clientId=${encodeURIComponent(clientId)}&type=AUDIT`).then((r) => r.json()),
      fetch("/api/annuaire").then((r) => r.json()),
    ]).then(([missionData, teamData]) => {
      if (!live) return;
      const rows = (missionData.missions ?? []) as Mission[];
      setMissions(rows);
      setMissionId((prev) => rows.some((m) => m.id === prev) ? prev : rows[0]?.id ?? "");
      setReviewers((teamData.membres ?? []) as Reviewer[]);
    }).catch(() => live && setError("Impossible de charger les missions ou l’équipe du cabinet."));
    return () => { live = false; };
  }, [clientId]);

  const loadComments = useCallback(async () => {
    if (!missionId) { setComments([]); return; }
    const response = await fetch(`/api/audit/review-comments?missionId=${encodeURIComponent(missionId)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Chargement des points de revue impossible.");
    setComments(data.comments ?? []);
    setRole(data.currentRole ?? "");
  }, [missionId]);

  useEffect(() => {
    let live = true;
    if (!missionId) { setEvidence([]); setComments([]); return; }
    setError("");
    Promise.all([
      fetch(`/api/documents?clientId=${encodeURIComponent(clientId)}`).then((r) => r.json()),
      fetch(`/api/audit/work-papers?clientId=${encodeURIComponent(clientId)}&type=PREP_KIT`).then((r) => r.json()),
      fetch("/api/comptabilite/tpe-journal").then((r) => r.json()),
      loadComments(),
    ]).then(([documentsData, workPaperData, journalsData]) => {
      if (!live) return;
      const docs = (documentsData.documents ?? []).map((d: { id: string; fileName?: string; name?: string; updatedAt: string }) => ({ id: d.id, label: d.fileName ?? d.name ?? `Document ${d.id.slice(-6)}`, updatedAt: d.updatedAt }));
      const works = workPaperData.data && workPaperData.id && workPaperData.updatedAt ? [{ id: workPaperData.id, label: "Cahier de préparation d’audit", updatedAt: workPaperData.updatedAt }] : [];
      const journals = (Array.isArray(journalsData) ? journalsData : []).filter((j: { clientId?: string }) => j.clientId === clientId).map((j: Parameters<typeof tpeJournalReviewVersion>[0] & { id: string }) => ({ id: j.id, label: `Journal TPE ${j.periode ?? j.id.slice(-6)}`, updatedAt: tpeJournalReviewVersion(j) }));
      const map = { DOCUMENT: docs, WORK_PAPER: works, TPE_JOURNAL: journals };
      setEvidence(map[referenceType]);
      setReferenceId((prev) => map[referenceType].some((item: Evidence) => item.id === prev) ? prev : map[referenceType][0]?.id ?? "");
    }).catch((e) => live && setError(e instanceof Error ? e.message : "Chargement des preuves impossible."));
    return () => { live = false; };
  }, [clientId, missionId, referenceType, loadComments]);

  const submit = async (url: string, body: unknown, method = "POST") => {
    setBusy(true); setError("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      await loadComments();
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible."); return false; }
    finally { setBusy(false); }
  };

  const createComment = async () => {
    const selected = evidence.find((item) => item.id === referenceId);
    if (!selected) return;
    const saved = await submit("/api/audit/review-comments", { missionId, referenceType, referenceId, referenceVersion: selected.updatedAt, title, comment: message, assignedToId: assignedToId || null });
    if (saved) { setTitle(""); setMessage(""); }
  };

  const changeAssignee = (comment: ReviewComment, value: string) => submit(`/api/audit/review-comments/${comment.id}`, { action: "assign", assignedToId: value || null }, "PATCH");
  const resolveAllowed = role === "EXPERT" || role === "ADMIN";

  return <section className="apix-card space-y-5">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3"><MessageSquareText className="h-5 w-5 text-primary" /><div><h3 className="font-bold text-white">Revue de mission</h3><p className="text-xs text-slate-400">Commentaires liés à une preuve et à sa version.</p></div></div>
      <button onClick={() => loadComments().catch((e) => setError(e.message))} className="rounded-lg p-2 text-slate-400 hover:bg-white/5" aria-label="Actualiser les commentaires"><RefreshCw className="h-4 w-4" /></button>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-xs text-slate-400">Mission d’audit<select value={missionId} onChange={(e) => setMissionId(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white"><option value="">Choisir une mission</option>{missions.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
      <label className="text-xs text-slate-400">Type de preuve<select value={referenceType} onChange={(e) => setReferenceType(e.target.value as typeof referenceType)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white">{TYPES.map((t) => <option key={t} value={t}>{t === "DOCUMENT" ? "Document" : t === "WORK_PAPER" ? "Cahier de travail" : "Journal TPE"}</option>)}</select></label>
      <label className="text-xs text-slate-400">Preuve<select value={referenceId} onChange={(e) => setReferenceId(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white"><option value="">Choisir une preuve</option>{evidence.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className="text-xs text-slate-400">Assigner à<select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white"><option value="">Sans assignation</option>{reviewers.map((person) => <option key={person.id} value={person.id}>{person.nom} · {person.role}</option>)}</select></label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du point de revue" className="rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Constat ou question à documenter" className="min-h-10 rounded-lg border border-white/10 bg-slate-950 p-2 text-sm text-white" />
    </div>
    <button disabled={busy || !missionId || !referenceId || title.trim().length < 3 || message.trim().length < 5} onClick={createComment} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-40"><Send className="h-4 w-4" />Créer le point</button>
    {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
    {!missions.length && <p className="text-sm text-slate-400">Aucune mission de type audit pour ce client.</p>}
    <div className="space-y-3">{comments.map((comment) => <article key={comment.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="font-semibold text-white">{comment.title}</h4><p className="mt-1 text-xs text-slate-400">{comment.referenceType} · {comment.referenceId} · version {new Date(comment.referenceVersion.split("#")[0]).toLocaleString("fr-FR")}{comment.referenceVersion.includes("#") ? ` · empreinte ${comment.referenceVersion.split("#")[1]}` : ""}</p></div><span className={`rounded px-2 py-1 text-[10px] font-bold ${comment.status === "OPEN" ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}>{comment.status === "OPEN" ? "Ouvert" : "Résolu"}</span></div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{comment.initialComment}</p><p className="mt-1 text-xs text-slate-500">Par {comment.createdBy.firstName} {comment.createdBy.lastName} · {new Date(comment.createdAt).toLocaleString("fr-FR")}</p>
      <div className="mt-3 space-y-2 border-l border-white/10 pl-3">{comment.events.slice(1).map((event) => <p key={event.id} className="text-xs text-slate-300"><span className="text-slate-500">{event.user?.firstName} {event.user?.lastName} · {event.eventType} :</span> {event.content}</p>)}</div>
      {comment.status === "OPEN" && <div className="mt-4 flex flex-wrap gap-2"><input value={reply[comment.id] ?? ""} onChange={(e) => setReply((prev) => ({ ...prev, [comment.id]: e.target.value }))} placeholder="Répondre au point" className="min-w-48 flex-1 rounded-lg border border-white/10 bg-slate-900 p-2 text-xs text-white" /><button disabled={busy || (reply[comment.id] ?? "").trim().length < 5} onClick={async () => { if (await submit(`/api/audit/review-comments/${comment.id}`, { action: "reply", message: reply[comment.id] }, "PATCH")) setReply((prev) => ({ ...prev, [comment.id]: "" })); }} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Répondre</button>
      {resolveAllowed && <button disabled={busy} onClick={() => { const reason = window.prompt("Motif de résolution (5 caractères minimum)"); if (reason) void submit(`/api/audit/review-comments/${comment.id}`, { action: "resolve", message: reason }, "PATCH"); }} className="rounded-lg border border-emerald-500/20 px-3 py-2 text-xs text-emerald-300">Résoudre</button>}</div>}
      <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-slate-500">Assigné à</span><select value={comment.assignedToId ?? ""} onChange={(e) => void changeAssignee(comment, e.target.value)} disabled={busy} className="rounded-lg border border-white/10 bg-slate-900 p-2 text-xs text-white"><option value="">Personne</option>{reviewers.map((person) => <option key={person.id} value={person.id}>{person.nom}</option>)}</select>
      {comment.status === "RESOLVED" && resolveAllowed && <button disabled={busy} onClick={() => { const reason = window.prompt("Motif de réouverture (5 caractères minimum)"); if (reason) void submit(`/api/audit/review-comments/${comment.id}`, { action: "reopen", message: reason }, "PATCH"); }} className="rounded-lg border border-amber-500/20 px-3 py-2 text-xs text-amber-300">Rouvrir</button>}</div>
    </article>)}</div>
  </section>;
}
