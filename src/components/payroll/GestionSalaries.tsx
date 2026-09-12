"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { MODES_PAIEMENT } from "@/lib/payroll/declarations";

/**
 * Salariés et paramètres de paie d'un dossier client.
 *
 * Tous les champs exploités par les moteurs de paie (src/lib/payroll/engines)
 * sont saisissables ici : situation familiale et sexe (règle de la femme
 * mariée au Sénégal), enfants à charge, conjoint sans revenu (parts TRIMF),
 * statut cadre (IPRES complémentaire), indemnité de transport, avantages en
 * nature ; côté employeur, la classe de risque accident du travail et la
 * cotisation maladie IPM.
 */

interface Salarie {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  baseSalary: number;
  maritalStatus: string | null;
  sexe: string | null;
  childrenCount: number;
  conjointsSansRevenu: number;
  isCadre: boolean;
  transportAllowance: number;
  avantagesNature: number;
  modePaiement: string | null;
  banque: string | null;
  iban: string | null;
  numeroMobileMoney: string | null;
}

interface ParametresEmployeur {
  country: string;
  paieAccidentRate: number | null;
  paieIpmSalarial: number | null;
  paieIpmPatronal: number | null;
}

const SALARIE_VIDE = {
  firstName: "",
  lastName: "",
  position: "",
  baseSalary: 0,
  maritalStatus: "CELIBATAIRE",
  sexe: "M",
  childrenCount: 0,
  conjointsSansRevenu: 0,
  isCadre: false,
  transportAllowance: 0,
  avantagesNature: 0,
  modePaiement: "VIREMENT",
  banque: "",
  iban: "",
  numeroMobileMoney: "",
};

type Formulaire = typeof SALARIE_VIDE;

const CLASSES_AT: Record<string, { valeur: number; libelle: string }[]> = {
  SN: [
    { valeur: 0.01, libelle: "1 % — risque faible (bureaux, commerce)" },
    { valeur: 0.03, libelle: "3 % — risque moyen" },
    { valeur: 0.05, libelle: "5 % — risque élevé (BTP, industrie)" },
  ],
  CI: [
    { valeur: 0.02, libelle: "2 % — risque faible" },
    { valeur: 0.03, libelle: "3 % — risque moyen" },
    { valeur: 0.04, libelle: "4 % — risque notable" },
    { valeur: 0.05, libelle: "5 % — risque élevé" },
  ],
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

export function GestionSalaries({ clientId, onChange }: { clientId: string | null; onChange?: () => void }) {
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [params, setParams] = useState<ParametresEmployeur | null>(null);
  const [chargement, setChargement] = useState(false);
  const [edition, setEdition] = useState<{ id: string | null; form: Formulaire } | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    if (!clientId) { setSalaries([]); setParams(null); return; }
    setChargement(true);
    try {
      const res = await fetch(`/api/payroll/employes?clientId=${clientId}`);
      const data = await res.json();
      if (res.ok) { setSalaries(data.employees); setParams(data.client); }
      else toast.error(data.error || "Chargement des salariés impossible");
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setChargement(false);
    }
  }, [clientId]);

  useEffect(() => { void charger(); }, [charger]);

  const ouvrirCreation = () => setEdition({ id: null, form: { ...SALARIE_VIDE } });
  const ouvrirEdition = (s: Salarie) =>
    setEdition({
      id: s.id,
      form: {
        firstName: s.firstName,
        lastName: s.lastName,
        position: s.position ?? "",
        baseSalary: s.baseSalary,
        maritalStatus: s.maritalStatus ?? "CELIBATAIRE",
        sexe: s.sexe ?? "M",
        childrenCount: s.childrenCount,
        conjointsSansRevenu: s.conjointsSansRevenu,
        isCadre: s.isCadre,
        transportAllowance: s.transportAllowance,
        avantagesNature: s.avantagesNature,
        modePaiement: s.modePaiement ?? "VIREMENT",
        banque: s.banque ?? "",
        iban: s.iban ?? "",
        numeroMobileMoney: s.numeroMobileMoney ?? "",
      },
    });

  const enregistrer = async () => {
    if (!edition || !clientId) return;
    setEnregistrement(true);
    try {
      const corps = {
        ...edition.form,
        position: edition.form.position || undefined,
        banque: edition.form.banque || null,
        iban: edition.form.iban || null,
        numeroMobileMoney: edition.form.numeroMobileMoney || null,
      };
      const res = edition.id
        ? await fetch(`/api/payroll/employes/${edition.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) })
        : await fetch(`/api/payroll/employes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...corps, clientId }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Enregistrement impossible"); return; }
      toast.success(edition.id ? "Salarié mis à jour" : "Salarié ajouté");
      setEdition(null);
      await charger();
      onChange?.();
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setEnregistrement(false);
    }
  };

  const supprimer = async (s: Salarie) => {
    if (!confirm(`Supprimer ${s.firstName} ${s.lastName} ?`)) return;
    const res = await fetch(`/api/payroll/employes/${s.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Suppression impossible"); return; }
    toast.success("Salarié supprimé");
    await charger();
    onChange?.();
  };

  const majParametre = async (champ: keyof ParametresEmployeur, valeur: number | null) => {
    if (!clientId || !params) return;
    if (params[champ] === valeur) return; // blur sans changement : pas d'appel
    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [champ]: valeur }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Paramètre non enregistré"); return; }
    // Mise à jour fonctionnelle : plusieurs champs peuvent être enregistrés
    // coup sur coup, une fermeture obsolète écraserait le précédent.
    setParams((p) => (p ? { ...p, [champ]: valeur } : p));
    toast.success("Paramètre de paie enregistré");
    onChange?.();
  };

  if (!clientId) return null;

  const pays = params?.country ?? "SN";
  const champ = (label: string, input: React.ReactNode, aide?: string) => (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      {input}
      {aide && <span className="block text-[10px] text-slate-500 mt-1">{aide}</span>}
    </label>
  );
  const inputCls = "mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500";
  const f = edition?.form;
  const set = (patch: Partial<Formulaire>) => edition && setEdition({ ...edition, form: { ...edition.form, ...patch } });

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" /> Salariés & paramètres de paie
        </h3>
        <button type="button" onClick={ouvrirCreation} className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Ajouter un salarié
        </button>
      </div>

      {/* Paramètres employeur */}
      {params && (
        <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/40 border border-white/5">
          {champ(
            "Classe de risque accident du travail",
            <select
              className={inputCls}
              value={params.paieAccidentRate ?? ""}
              onChange={(e) => majParametre("paieAccidentRate", e.target.value === "" ? null : Number(e.target.value))}
            >
              <option value="">Défaut du moteur ({pays === "CI" ? "2 %" : "1 %"})</option>
              {(CLASSES_AT[pays] ?? CLASSES_AT.SN).map((c) => (
                <option key={c.valeur} value={c.valeur}>{c.libelle}</option>
              ))}
            </select>
          )}
          {pays === "SN" && champ(
            "IPM — part salariale (%)",
            <input type="number" step="0.5" min={0} max={7.5} className={inputCls}
              defaultValue={params.paieIpmSalarial != null ? params.paieIpmSalarial * 100 : ""}
              placeholder="ex. 3"
              onBlur={(e) => majParametre("paieIpmSalarial", e.target.value === "" ? null : Number(e.target.value) / 100)} />,
            "Cotisation maladie : 2 à 7,5 % au total, plafond 250 000 F"
          )}
          {pays === "SN" && champ(
            "IPM — part patronale (%)",
            <input type="number" step="0.5" min={0} max={7.5} className={inputCls}
              defaultValue={params.paieIpmPatronal != null ? params.paieIpmPatronal * 100 : ""}
              placeholder="ex. 3"
              onBlur={(e) => majParametre("paieIpmPatronal", e.target.value === "" ? null : Number(e.target.value) / 100)} />
          )}
          {pays === "CI" && (
            <p className="sm:col-span-2 text-xs text-slate-400 self-end pb-2">CMU 1 000 F/mois partagée et taxes FDFP (0,4 % + 1,2 %) appliquées automatiquement.</p>
          )}
        </div>
      )}

      {/* Liste */}
      {chargement ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
      ) : salaries.length === 0 ? (
        <p className="text-sm text-slate-400">Aucun salarié dans ce dossier. Ajoutez-en pour lancer la paie.</p>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                <th className="py-2 pr-3">Salarié</th>
                <th className="py-2 pr-3 text-right">Base</th>
                <th className="py-2 pr-3">Situation</th>
                <th className="py-2 pr-3 text-right">Transport</th>
                <th className="py-2 pr-3 text-right">Av. nature</th>
                <th className="py-2 pr-3">Règlement</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="py-2 pr-3">
                    <p className="font-bold text-white">{s.firstName} {s.lastName}{s.isCadre && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-black uppercase">Cadre</span>}</p>
                    <p className="text-[11px] text-slate-400">{s.position || "—"}</p>
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums text-white">{fmt(s.baseSalary)} F</td>
                  <td className="py-2 pr-3 text-slate-300 text-xs">
                    {(s.maritalStatus ?? "CELIBATAIRE").toLowerCase()}{s.sexe === "F" ? " (F)" : ""} · {s.childrenCount} enfant{s.childrenCount > 1 ? "s" : ""}
                    {s.conjointsSansRevenu > 0 && ` · ${s.conjointsSansRevenu} conjoint sans revenu`}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{fmt(s.transportAllowance)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{fmt(s.avantagesNature)}</td>
                  <td className="py-2 pr-3 text-slate-300 text-xs">
                    {s.modePaiement ? MODES_PAIEMENT[s.modePaiement] ?? s.modePaiement : <span className="text-amber-400">À préciser</span>}
                    {s.modePaiement === "VIREMENT" && s.iban && <span className="block text-[10px] text-slate-400">{s.banque ? `${s.banque} · ` : ""}{s.iban}</span>}
                    {["WAVE", "ORANGE_MONEY", "FREE_MONEY"].includes(s.modePaiement ?? "") && s.numeroMobileMoney && <span className="block text-[10px] text-slate-400">{s.numeroMobileMoney}</span>}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button type="button" onClick={() => ouvrirEdition(s)} aria-label="Modifier" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Pencil className="w-4 h-4" /></button>
                    <button type="button" onClick={() => supprimer(s)} aria-label="Supprimer" className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulaire */}
      {edition && f && (
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-blue-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-white text-sm">{edition.id ? "Modifier le salarié" : "Nouveau salarié"}</p>
            <button type="button" onClick={() => setEdition(null)} aria-label="Fermer" className="p-1.5 rounded-lg text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {champ("Prénom", <input className={inputCls} value={f.firstName} onChange={(e) => set({ firstName: e.target.value })} />)}
            {champ("Nom", <input className={inputCls} value={f.lastName} onChange={(e) => set({ lastName: e.target.value })} />)}
            {champ("Poste", <input className={inputCls} value={f.position} onChange={(e) => set({ position: e.target.value })} />)}
            {champ("Salaire de base mensuel (F)", <input type="number" min={0} className={inputCls} value={f.baseSalary} onChange={(e) => set({ baseSalary: Number(e.target.value) })} />)}
            {champ("Indemnité de transport (F)", <input type="number" min={0} className={inputCls} value={f.transportAllowance} onChange={(e) => set({ transportAllowance: Number(e.target.value) })} />,
              pays === "CI" ? "Exonérée jusqu'à 30 000 F" : "Exonérée jusqu'à 20 800 F")}
            {champ("Avantages en nature (F/mois)", <input type="number" min={0} className={inputCls} value={f.avantagesNature} onChange={(e) => set({ avantagesNature: Number(e.target.value) })} />,
              "Logement, véhicule… valeur imposable ; entrent dans les assiettes, non versés")}
            {champ("Situation familiale",
              <select className={inputCls} value={f.maritalStatus} onChange={(e) => set({ maritalStatus: e.target.value })}>
                <option value="CELIBATAIRE">Célibataire</option>
                <option value="MARIE">Marié(e)</option>
                <option value="VEUF">Veuf / veuve</option>
                <option value="DIVORCE">Divorcé(e)</option>
              </select>)}
            {champ("Sexe",
              <select className={inputCls} value={f.sexe} onChange={(e) => set({ sexe: e.target.value })}>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>,
              pays === "SN" ? "Femme mariée : 1 part (CGI art. 174), + 0,5 si conjoint sans revenu" : undefined)}
            {champ("Enfants à charge", <input type="number" min={0} max={20} className={inputCls} value={f.childrenCount} onChange={(e) => set({ childrenCount: Number(e.target.value) })} />)}
            {champ("Conjoints sans revenu", <input type="number" min={0} max={4} className={inputCls} value={f.conjointsSansRevenu} onChange={(e) => set({ conjointsSansRevenu: Number(e.target.value) })} />,
              pays === "SN" ? "Chacun ajoute une part TRIMF" : undefined)}
            <label className="flex items-center gap-2 mt-5 text-sm text-slate-200">
              <input type="checkbox" checked={f.isCadre} onChange={(e) => set({ isCadre: e.target.checked })} />
              Cadre{pays === "SN" ? " (régime complémentaire IPRES)" : ""}
            </label>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 pt-2 border-t border-white/5">Règlement du salaire (ordre de paiement)</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {champ("Mode de paiement",
              <select className={inputCls} value={f.modePaiement} onChange={(e) => set({ modePaiement: e.target.value })}>
                {Object.entries(MODES_PAIEMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>)}
            {f.modePaiement === "VIREMENT" && champ("Banque", <input className={inputCls} value={f.banque} onChange={(e) => set({ banque: e.target.value })} />)}
            {f.modePaiement === "VIREMENT" && champ("IBAN / RIB", <input className={inputCls} value={f.iban} onChange={(e) => set({ iban: e.target.value })} />)}
            {["WAVE", "ORANGE_MONEY", "FREE_MONEY"].includes(f.modePaiement) &&
              champ("Numéro Mobile Money", <input className={inputCls} value={f.numeroMobileMoney} onChange={(e) => set({ numeroMobileMoney: e.target.value })} placeholder="+221 77 000 00 00" />)}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEdition(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5">Annuler</button>
            <button type="button" onClick={enregistrer} disabled={enregistrement || !f.firstName || !f.lastName}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white flex items-center gap-1.5", enregistrement && "opacity-60")}>
              {enregistrement ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
