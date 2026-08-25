"use client";

import { useEffect, useState } from "react";
import { FileDown, Loader2, AlertTriangle } from "lucide-react";

// Export FEC (Fichier des Écritures Comptables, norme française A47 A-1).
// Génère un vrai fichier à partir des écritures réellement enregistrées
// dans TpeJournal pour le client et la période choisis.

export default function FecExportPage() {
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [clientId, setClientId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [exportEnCours, setExportEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const debutAnnee = new Date(today.getFullYear(), 0, 1);
    setDateDebut(debutAnnee.toISOString().slice(0, 10));
    setDateFin(today.toISOString().slice(0, 10));

    fetch("/api/clients?limit=200&isActive=true")
      .then((r) => r.json())
      .then((d) =>
        setClients(
          (d.clients ?? []).map((c: Record<string, unknown>) => ({
            id: String(c.id),
            nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
          }))
        )
      )
      .catch((e) => console.error("Chargement du portefeuille :", e));
  }, []);

  const exporter = async () => {
    if (!clientId || !dateDebut || !dateFin) return;
    setExportEnCours(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/fec-export?clientId=${clientId}&dateDebut=${dateDebut}&dateFin=${dateFin}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error || "Échec de l'export.");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const nomFichier = match ? match[1] : "export-fec.txt";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nomFichier;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export FEC :", e);
      setErreur("Impossible de générer le fichier.");
    } finally {
      setExportEnCours(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tighter">Export FEC</h1>
        <p className="text-slate-400 mt-2">
          Génère un Fichier des Écritures Comptables (norme française A47 A-1, 18 colonnes) à partir des écritures
          réellement enregistrées pour le client sur la période choisie.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200">
          Le modèle de journal du cabinet ne distingue pas de code journal classique (achats/ventes/banque/OD) : il est
          dérivé ici du sens du flux (recette/dépense). Vérifiez la conformité de l&apos;export avant transmission à
          l&apos;administration.
        </p>
      </div>

      <div className="glass-card p-8 rounded-[32px] border border-white/5 bg-slate-900/40 space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          >
            <option value="">Sélectionner un client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Début de période</label>
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Fin de période</label>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>
        </div>

        {erreur && <p className="text-sm text-red-400">{erreur}</p>}

        <button
          onClick={exporter}
          disabled={!clientId || exportEnCours}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
        >
          {exportEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          {exportEnCours ? "Génération…" : "Télécharger le FEC"}
        </button>
      </div>
    </div>
  );
}
