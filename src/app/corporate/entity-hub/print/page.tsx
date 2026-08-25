"use client";

import { useEffect, useState } from "react";

// Registre global imprimable des entites juridiques. Recharge la meme liste
// reelle que /corporate/entity-hub (aucune donnee inventee : les champs non
// renseignes en base sont affiches comme tels).

interface Entity {
  id: string;
  name: string;
  legalForm: string | null;
  governance: string;
  lastAG: string | null;
  nextAG: string | null;
  kycStatus: string | null;
}

export default function PrintEntityRegistry() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/corporate/entity-hub")
      .then((r) => r.json())
      .then((d) => setEntities(d.entities ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) return <div className="p-8 text-sm">Chargement…</div>;

  return (
    <div className="font-serif text-sm p-8 max-w-5xl mx-auto text-slate-900">
      <header className="border-b-2 border-black pb-4 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-slate-500">Cabinet 360 — Document produit par le cabinet</p>
        <h1 className="text-2xl font-bold uppercase mt-2">Registre Global des Entités</h1>
        <p className="text-xs mt-1">Portefeuille filiales — {new Date().toLocaleDateString("fr-FR")}</p>
      </header>

      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black px-2 py-1 text-left">Entité</th>
            <th className="border border-black px-2 py-1 text-left">Forme juridique</th>
            <th className="border border-black px-2 py-1 text-left">Gouvernance</th>
            <th className="border border-black px-2 py-1 text-left">Dernière AG</th>
            <th className="border border-black px-2 py-1 text-left">Prochaine AG</th>
            <th className="border border-black px-2 py-1 text-left">Statut KYC</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((e) => (
            <tr key={e.id}>
              <td className="border border-black px-2 py-1">{e.name}</td>
              <td className="border border-black px-2 py-1">{e.legalForm || "Non renseigné"}</td>
              <td className="border border-black px-2 py-1">{e.governance || "—"}</td>
              <td className="border border-black px-2 py-1">{e.lastAG || "—"}</td>
              <td className="border border-black px-2 py-1">{e.nextAG || "—"}</td>
              <td className="border border-black px-2 py-1">{e.kycStatus === "valid" ? "Conforme" : "À vérifier"}</td>
            </tr>
          ))}
          {entities.length === 0 && (
            <tr><td colSpan={6} className="border border-black px-2 py-4 text-center text-slate-500">Aucune entité enregistrée.</td></tr>
          )}
        </tbody>
      </table>

      <p className="text-[10px] text-slate-500 mt-6 italic">
        Registre généré le {new Date().toLocaleDateString("fr-FR")}. Les champs non renseignés dans le dossier client apparaissent comme « Non renseigné » ou « — » plutôt que d&apos;être estimés.
      </p>
    </div>
  );
}
