"use client";

import { useEffect, useState } from "react";

// Rapport de revision imprimable. Recharge le meme dossier reel que
// /comptabilite/revision (memes sections, memes taches, meme avancement).

interface ReviewTask { id: string; label: string; completed: boolean }
interface ReviewSection {
  id: string;
  title: string;
  description: string;
  status: "done" | "pending" | "alert";
  tasks: ReviewTask[];
}

const STATUS_LABEL: Record<string, string> = {
  done: "Vérifiée",
  alert: "En alerte",
  pending: "En cours",
};

export default function PrintRevisionReport() {
  const [sections, setSections] = useState<ReviewSection[]>([]);
  const [mission, setMission] = useState<{ name: string; client: string } | null>(null);
  const [avancement, setAvancement] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit/dossier?type=TENUE_COMPTABLE")
      .then((r) => r.json())
      .then((data) => {
        const checklists: Record<string, { id: string; description: string; status: string }[]> = data.checklists ?? {};
        setSections(
          (data.sections ?? []).map((sec: Record<string, unknown>) => {
            const items = checklists[String(sec.id)] ?? [];
            const progress = Number(sec.progress ?? 0);
            return {
              id: String(sec.id),
              title: String(sec.name),
              description: String(sec.note ?? "Aucune note de revue enregistrée."),
              status: progress === 100 ? "done" : progress === 0 ? "alert" : "pending",
              tasks: items.map((i) => ({ id: i.id, label: i.description, completed: i.status === "TERMINE" })),
            } as ReviewSection;
          })
        );
        setMission(data.mission ? { name: data.mission.name, client: data.mission.client } : null);
        setAvancement(Number(data.globalProgress ?? 0));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) return <div className="p-8 text-sm">Chargement…</div>;

  const alertes = sections.filter((s) => s.status === "alert").length;
  const verifiees = sections.filter((s) => s.status === "done").length;

  return (
    <div className="font-serif text-sm p-8 max-w-4xl mx-auto text-slate-900">
      <header className="border-b-2 border-black pb-4 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-slate-500">Cabinet 360 — Document produit par le cabinet</p>
        <h1 className="text-2xl font-bold uppercase mt-2">Rapport de Révision</h1>
        <p className="text-xs mt-1">
          {mission ? `${mission.name} — ${mission.client}` : "Dossier de révision"} — {new Date().toLocaleDateString("fr-FR")}
        </p>
      </header>

      <section className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="border border-black p-3">
          <p className="text-[10px] uppercase text-slate-500">Avancement global</p>
          <p className="text-xl font-bold">{avancement}%</p>
        </div>
        <div className="border border-black p-3">
          <p className="text-[10px] uppercase text-slate-500">Sections vérifiées</p>
          <p className="text-xl font-bold">{verifiees} / {sections.length}</p>
        </div>
        <div className="border border-black p-3">
          <p className="text-[10px] uppercase text-slate-500">Alertes</p>
          <p className="text-xl font-bold">{alertes}</p>
        </div>
      </section>

      {sections.length === 0 ? (
        <p className="text-xs text-slate-500">Aucune section dans ce dossier de révision.</p>
      ) : (
        sections.map((s) => (
          <div key={s.id} className="mb-6 break-inside-avoid">
            <h2 className="font-bold text-sm uppercase flex items-center justify-between border-b border-black pb-1">
              <span>{s.title}</span>
              <span className="text-xs font-normal">{STATUS_LABEL[s.status]} — {s.tasks.filter((t) => t.completed).length}/{s.tasks.length}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 mb-2">{s.description}</p>
            {s.tasks.length > 0 && (
              <table className="w-full border-collapse border border-black text-xs">
                <tbody>
                  {s.tasks.map((t) => (
                    <tr key={t.id}>
                      <td className="border border-black px-2 py-1 w-6 text-center">{t.completed ? "✓" : ""}</td>
                      <td className="border border-black px-2 py-1">{t.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}

      <p className="text-[10px] text-slate-500 mt-6 italic">
        Rapport généré le {new Date().toLocaleDateString("fr-FR")} à partir du dossier de travail de révision. Ce document ne constitue pas une certification des comptes.
      </p>
    </div>
  );
}
