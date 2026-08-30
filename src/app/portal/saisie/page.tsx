"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, Plus, FileSpreadsheet, Save, ScanLine, Smartphone, Loader2, XCircle, Info } from "lucide-react";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";
import { MobileMoneySync } from "@/components/portal/MobileMoneySync";

interface ClientData {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  healthScore?: number | null;
  rating?: string | null;
}

function SaisieSimplifieeInner() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"form" | "upload" | "ocr">("form");
  const [entries, setEntries] = useState([
    { date: "", libelle: "", entree: "", sortie: "" }
  ]);
  const [showMobileSync, setShowMobileSync] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`/api/portal/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setClient(data.client);
      })
      .catch(() => setError("Impossible de charger votre espace."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAddRow = () => {
    setEntries([...entries, { date: "", libelle: "", entree: "", sortie: "" }]);
  };

  const handleUpdateRow = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    (newEntries[index] as any)[field] = value;
    setEntries(newEntries);
  };

  const handleSubmitForm = async () => {
    const validEntries = entries.filter((e) => e.libelle && (e.entree || e.sortie));
    if (validEntries.length === 0) {
      setSubmitMessage("Renseignez au moins une ligne (libellé + montant) avant d'envoyer.");
      return;
    }
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await fetch("/api/portal/upload-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": token },
        body: JSON.stringify({ entries: validEntries }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitMessage(data.error || "Erreur lors de l'envoi.");
      } else {
        setSubmitMessage(`${data.count} écriture(s) envoyée(s) au cabinet avec succès.`);
        setEntries([{ date: "", libelle: "", entree: "", sortie: "" }]);
      }
    } catch {
      setSubmitMessage("Erreur réseau lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-8">
        <div className="max-w-md w-full bg-slate-900/60 border border-white/5 rounded-[28px] p-10 text-center space-y-4">
          <Upload className="w-14 h-14 text-slate-600 mx-auto" />
          <h2 className="page-title-dark mb-0">Accès requis</h2>
          <p className="page-subtitle-dark mb-0">
            Cet espace de saisie s'ouvre uniquement via le lien personnel fourni par votre cabinet comptable.
          </p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-8">
        <div className="max-w-md w-full bg-slate-900/60 border border-rose-500/20 rounded-[28px] p-10 text-center space-y-4">
          <XCircle className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="page-title-dark mb-0">Espace inaccessible</h2>
          <p className="page-subtitle-dark mb-0">{error || "Lien invalide."}</p>
        </div>
      </div>
    );
  }

  const clientName = client.companyName || `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Client";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Hero avec Score */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center space-y-3">
          <div>
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Portail Client — Cabinet 360</p>
            <h2 className="page-title-dark mb-0">Votre Cahier<br />de Caisse Digital</h2>
          </div>
          <p className="page-subtitle-dark mb-0 max-w-md">
            Transmettez vos dépenses et recettes simplement. Pas de numéros de compte, pas de jargon comptable.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setShowMobileSync(!showMobileSync)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-purple-300 text-xs font-bold transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" /> Sync Mobile Money
            </button>
          </div>
        </div>

        {/* Score de Santé Financière — réel */}
        <div>
          <FinancialHealthGauge
            score={client.healthScore ?? 0}
            rating={client.rating || "—"}
            clientName={clientName}
          />
        </div>
      </div>

      {/* Mobile Money Sync (Option) */}
      {showMobileSync && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <MobileMoneySync />
        </div>
      )}

      {/* Tabs Saisie */}
      <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
        {[
          { id: "form", label: "Saisie Rapide", icon: Plus },
          { id: "upload", label: "Import Excel", icon: FileSpreadsheet },
          { id: "ocr", label: "Scan / Photo (OCR)", icon: ScanLine },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      {activeTab === "form" && (
        <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse apix-table">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Libellé (Description)</th>
                  <th className="p-4 text-xs font-black text-emerald-400 uppercase tracking-widest">Entrée (Recette)</th>
                  <th className="p-4 text-xs font-black text-rose-400 uppercase tracking-widest">Sortie (Dépense)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-2">
                      <input type="date" value={entry.date} onChange={(e) => handleUpdateRow(idx, "date", e.target.value)} className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none" />
                    </td>
                    <td className="p-2">
                      <input type="text" placeholder="Ex: Achat fournitures..." value={entry.libelle} onChange={(e) => handleUpdateRow(idx, "libelle", e.target.value)} className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none" />
                    </td>
                    <td className="p-2">
                      <input type="number" placeholder="0" value={entry.entree} onChange={(e) => handleUpdateRow(idx, "entree", e.target.value)} className="w-full bg-emerald-900/20 border-none rounded-lg p-3 text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </td>
                    <td className="p-2">
                      <input type="number" placeholder="0" value={entry.sortie} onChange={(e) => handleUpdateRow(idx, "sortie", e.target.value)} className="w-full bg-rose-900/20 border-none rounded-lg p-3 text-rose-400 focus:ring-2 focus:ring-rose-500 outline-none" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {submitMessage && (
            <p className="mt-4 text-xs font-bold text-primary-foreground/70 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">{submitMessage}</p>
          )}

          <div className="flex justify-between items-center mt-6">
            <button onClick={handleAddRow} className="px-4 py-2 text-primary hover:text-primary-foreground/70 font-bold flex items-center gap-2 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Ajouter une ligne
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={submitting}
              className="px-8 py-3 bg-primary hover:brightness-110 disabled:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/30 flex items-center gap-2 active:scale-95"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Envoyer au Cabinet
            </button>
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="glass-card rounded-[32px] p-4 sm:p-8 lg:p-12 border border-white/5 bg-slate-900/40 text-center">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Import de fichier Excel ou CSV</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto text-sm">
            L'import automatique de fichiers n'est pas encore disponible sur ce portail.
          </p>
          <div className="max-w-md mx-auto flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200 leading-relaxed">
              En attendant, utilisez l'onglet <strong>Saisie Rapide</strong> pour transmettre vos écritures ligne par ligne,
              ou envoyez votre fichier directement à votre cabinet comptable.
            </p>
          </div>
        </div>
      )}

      {activeTab === "ocr" && (
        <div className="glass-card rounded-[32px] p-4 sm:p-8 lg:p-12 border border-dashed border-primary/30 bg-slate-900/40 text-center">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-primary/10">
            <ScanLine className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Scan de reçus et factures (OCR)</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto text-sm">
            L'extraction automatique par OCR n'est pas encore disponible sur ce portail.
          </p>
          <div className="max-w-md mx-auto flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200 leading-relaxed">
              En attendant, saisissez le montant et le libellé manuellement dans l'onglet <strong>Saisie Rapide</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SaisieSimplifiee() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0c10]"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>}>
      <SaisieSimplifieeInner />
    </Suspense>
  );
}
