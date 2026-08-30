"use client";

import { useEffect, useState } from "react";
import { Leaf, Save, Users, ShieldCheck, Droplets } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Reporting RSE/ESG.
//
// Cette page affichait auparavant un score ESG fixe (82/100, "Niveau Gold")
// présenté comme "auto-calculé via FEC" — aucun modèle ne suit d'indicateur
// environnemental, social ou de gouvernance, et la comptabilité SYSCOHADA
// seule ne permet pas de les dériver. Elle devient un module de saisie
// manuelle réel, par client et par année, persisté (modèle WorkPaper,
// type RSE_ESG) : les seuls chiffres affichés sont ceux effectivement
// saisis, et les seuls ratios calculés (part de femmes, taux de recyclage)
// le sont à partir de cette saisie — jamais un score global inventé.
// ─────────────────────────────────────────────────────────────────────────────

type Indicateurs = {
  consommationElectriciteKwh: string;
  consommationEauM3: string;
  volumeDechetsKg: string;
  volumeDechetsRecyclesKg: string;
  effectifTotal: string;
  effectifFemmes: string;
  nombreAccidentsTravail: string;
  heuresFormation: string;
  nombreMembresConseil: string;
  nombreFemmesConseil: string;
  charteEthique: boolean;
  dispositifAlerte: boolean;
};

const VIDE: Indicateurs = {
  consommationElectriciteKwh: "",
  consommationEauM3: "",
  volumeDechetsKg: "",
  volumeDechetsRecyclesKg: "",
  effectifTotal: "",
  effectifFemmes: "",
  nombreAccidentsTravail: "",
  heuresFormation: "",
  nombreMembresConseil: "",
  nombreFemmesConseil: "",
  charteEthique: false,
  dispositifAlerte: false,
};

type ChampNumerique = Exclude<keyof Indicateurs, "charteEthique" | "dispositifAlerte">;

const CHAMPS_NUMERIQUES: ChampNumerique[] = [
  "consommationElectriciteKwh", "consommationEauM3", "volumeDechetsKg", "volumeDechetsRecyclesKg",
  "effectifTotal", "effectifFemmes", "nombreAccidentsTravail", "heuresFormation",
  "nombreMembresConseil", "nombreFemmesConseil",
];

function num(v: string): number | null {
  const n = parseFloat(v);
  return v.trim() !== "" && !isNaN(n) ? n : null;
}

export default function SustainabilityHubPage() {
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [clientId, setClientId] = useState("");
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [chargement, setChargement] = useState(false);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [indicateurs, setIndicateurs] = useState<Indicateurs>(VIDE);
  const [donneesParAnnee, setDonneesParAnnee] = useState<Record<string, Indicateurs>>({});

  useEffect(() => {
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

  useEffect(() => {
    if (!clientId) { setDonneesParAnnee({}); setIndicateurs(VIDE); return; }
    setChargement(true);
    fetch(`/api/audit/work-papers?clientId=${clientId}&type=RSE_ESG`)
      .then((r) => r.json())
      .then((d) => {
        const parAnnee = d.data?.indicateursParAnnee ?? {};
        setDonneesParAnnee(parAnnee);
        setIndicateurs(parAnnee[annee] ?? VIDE);
      })
      .finally(() => setChargement(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    setIndicateurs(donneesParAnnee[annee] ?? VIDE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annee]);

  const enregistrer = async () => {
    if (!clientId) return;
    setSauvegarde(true);
    try {
      const misAJour = { ...donneesParAnnee, [annee]: indicateurs };
      setDonneesParAnnee(misAJour);
      await fetch("/api/audit/work-papers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, type: "RSE_ESG", data: { indicateursParAnnee: misAJour } }),
      });
    } finally {
      setSauvegarde(false);
    }
  };

  const champsRenseignes = CHAMPS_NUMERIQUES.filter((c) => num(indicateurs[c]) !== null).length;
  const tauxCompletude = Math.round((champsRenseignes / CHAMPS_NUMERIQUES.length) * 100);

  const effectifTotal = num(indicateurs.effectifTotal);
  const effectifFemmes = num(indicateurs.effectifFemmes);
  const partFemmes = effectifTotal && effectifFemmes !== null ? Math.round((effectifFemmes / effectifTotal) * 100) : null;

  const membresConseil = num(indicateurs.nombreMembresConseil);
  const femmesConseil = num(indicateurs.nombreFemmesConseil);
  const partFemmesConseil = membresConseil && femmesConseil !== null ? Math.round((femmesConseil / membresConseil) * 100) : null;

  const dechets = num(indicateurs.volumeDechetsKg);
  const dechetsRecycles = num(indicateurs.volumeDechetsRecyclesKg);
  const tauxRecyclage = dechets && dechetsRecycles !== null ? Math.round((dechetsRecycles / dechets) * 100) : null;

  const champ = (
    cle: ChampNumerique,
    label: string,
    unite: string
  ) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{label} ({unite})</label>
      <input
        type="number"
        min="0"
        value={indicateurs[cle]}
        onChange={(e) => setIndicateurs((prev) => ({ ...prev, [cle]: e.target.value }))}
        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title-dark flex items-center gap-3">
            <Leaf className="w-8 h-8 text-emerald-500" /> Reporting RSE / ESG
          </h2>
          <p className="page-subtitle-dark">Indicateurs environnementaux, sociaux et de gouvernance saisis manuellement, par client et par année.</p>
        </div>
        <div className="flex gap-2">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white">
            <option value="">Sélectionner un dossier client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <input type="number" value={annee} onChange={(e) => setAnnee(e.target.value)} className="w-24 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />
          <button
            onClick={enregistrer}
            disabled={!clientId || sauvegarde}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {sauvegarde ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {!clientId ? (
        <div className="max-w-lg mx-auto bg-slate-900/60 border border-white/5 rounded-[32px] p-10 text-center space-y-4">
          <Leaf className="w-14 h-14 text-emerald-500 mx-auto" />
          <p className="text-slate-400 text-sm leading-relaxed">
            Sélectionnez un dossier client pour saisir (ou consulter) ses indicateurs RSE/ESG.
          </p>
        </div>
      ) : chargement ? (
        <p className="text-sm text-slate-500 text-center py-10">Chargement…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <IndicateurCarte label="Complétude de la saisie" valeur={`${tauxCompletude}%`} sousTitre={`${champsRenseignes}/${CHAMPS_NUMERIQUES.length} champs renseignés`} />
            <IndicateurCarte label="Part de femmes dans l'effectif" valeur={partFemmes !== null ? `${partFemmes}%` : "—"} sousTitre="Calculé depuis la saisie" />
            <IndicateurCarte label="Part de femmes au conseil" valeur={partFemmesConseil !== null ? `${partFemmesConseil}%` : "—"} sousTitre="Calculé depuis la saisie" />
            <IndicateurCarte label="Taux de recyclage des déchets" valeur={tauxRecyclage !== null ? `${tauxRecyclage}%` : "—"} sousTitre="Calculé depuis la saisie" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Droplets className="w-4 h-4 text-sky-400" /> Environnement</h3>
              {champ("consommationElectriciteKwh", "Consommation électricité", "kWh/an")}
              {champ("consommationEauM3", "Consommation eau", "m³/an")}
              {champ("volumeDechetsKg", "Volume de déchets", "kg/an")}
              {champ("volumeDechetsRecyclesKg", "Dont recyclés", "kg/an")}
            </div>

            <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-amber-400" /> Social</h3>
              {champ("effectifTotal", "Effectif total", "personnes")}
              {champ("effectifFemmes", "Dont femmes", "personnes")}
              {champ("nombreAccidentsTravail", "Accidents du travail", "sur l'année")}
              {champ("heuresFormation", "Heures de formation", "sur l'année")}
            </div>

            <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Gouvernance</h3>
              {champ("nombreMembresConseil", "Membres du conseil/CODIR", "personnes")}
              {champ("nombreFemmesConseil", "Dont femmes", "personnes")}
              <label className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <input type="checkbox" checked={indicateurs.charteEthique} onChange={(e) => setIndicateurs((prev) => ({ ...prev, charteEthique: e.target.checked }))} className="rounded" />
                Charte éthique en place
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input type="checkbox" checked={indicateurs.dispositifAlerte} onChange={(e) => setIndicateurs((prev) => ({ ...prev, dispositifAlerte: e.target.checked }))} className="rounded" />
                Dispositif d&apos;alerte (lanceur d&apos;alerte) en place
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function IndicateurCarte({ label, valeur, sousTitre }: { label: string; valeur: string; sousTitre: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40">
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black text-white">{valeur}</p>
      <p className="text-[10px] text-slate-600 mt-1">{sousTitre}</p>
    </div>
  );
}
