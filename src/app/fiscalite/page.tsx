"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar, Flag, Zap, Bell, CheckCircle2, AlertTriangle, Clock,
  ChevronLeft, ChevronRight, FileText, Download, Send, Loader2,
  Globe, BarChart3, RefreshCw, ShieldCheck, ArrowRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { simulateCorporateTax, type PaysFiscal } from "@/lib/tax-simulator";

const STATUT_STYLE: Record<string, string> = {
  VALIDE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  EN_ATTENTE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  BROUILLON: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};
const URGENCE_STYLE: Record<string, string> = {
  DEPASSEE: "text-rose-300 bg-rose-600/20 border-rose-500/40",
  IMMINENTE: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  PROCHE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  NORMALE: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

/** Obligation telle qu'affichée, issue de /api/fiscalite/obligations. */
type ObligationVue = {
  id: string;
  titre: string;
  description: string;
  type: string;
  pays: string[];
  reference: string;
  echeance: string;
  echeanceDate: Date;
  urgence: string;
  statut: string;
  montantEstime: number;
  nbDossiers: number;
  nbRestants: number;
  echeancesParDate: { date: string; dossiers: number }[];
};

type Synthese = {
  clientsActifs: number;
  declarationsPeriode: number;
  montantADeclarer: number;
  obligationsImminentes: number;
  obligationsDepassees: number;
  dossiersRestants: number;
};
type EcheanceAnnuelleVue = { id: string; clientId: string; client: string; titre: string; categorie: string; period: string; echeance: string; reference: string; source: string; statut: string; montant: number | null; nbRestants: number; urgence: string };
const TYPE_COLOR: Record<string, string> = {
  TVA: "text-violet-400", IS: "text-primary", SOCIAL: "text-emerald-400",
  BIC: "text-blue-400", RAS: "text-amber-400",
};

export default function FiscaliteOhada() {
  const [activeTab, setActiveTab] = useState<"calendrier" | "obligations" | "simulation">("obligations");
  const [paysCible, setPaysCible] = useState("SN");
  const [simulCA, setSimulCA] = useState(50000000);
  const [simulCharges, setSimulCharges] = useState(30000000);

  // Le calendrier reglementaire est une donnee de reference (src/lib/ohada) ;
  // les volumes et les montants viennent des declarations reellement saisies.
  const [obligations, setObligations] = useState<ObligationVue[]>([]);
  const [echeancesAnnuelles, setEcheancesAnnuelles] = useState<EcheanceAnnuelleVue[]>([]);
  const [synthese, setSynthese] = useState<Synthese | null>(null);
  const [periode, setPeriode] = useState<string>("");
  const [aucuneDonnee, setAucuneDonnee] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const charger = useCallback(async (pays: string) => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/fiscalite/obligations?pays=${encodeURIComponent(pays)}`);
      if (!res.ok) throw new Error(`Reponse ${res.status}`);
      const data = await res.json();

      const vues: ObligationVue[] = (data.obligations ?? []).map((o: Record<string, unknown>) => ({
        id: String(o.id),
        titre: String(o.titre),
        description: String(o.description),
        type: String(o.categorie),
        pays: (o.pays as string[]) ?? [],
        reference: String(o.reference ?? ""),
        echeance: new Date(String(o.echeance)).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
        echeanceDate: new Date(String(o.echeance)),
        urgence: String(o.urgence),
        statut:
          o.statut === "VALIDE" ? "VALIDE" : o.statut === "EN_COURS" ? "EN_ATTENTE" : "BROUILLON",
        montantEstime: Number(o.montantADeclarer ?? 0),
        nbDossiers: Number(o.nbDossiers ?? 0),
        nbRestants: Number(o.nbRestants ?? 0),
        echeancesParDate: Array.isArray(o.echeancesParDate) ? (o.echeancesParDate as { echeance: string; dossiers: number }[]).map((e) => ({ date: e.echeance, dossiers: e.dossiers })) : [],
      }));

      setObligations(vues);
      setEcheancesAnnuelles(Array.isArray(data.echeancesAnnuelles) ? data.echeancesAnnuelles : []);
      setSynthese(data.synthese ?? null);
      setPeriode(String(data.periode ?? ""));
      setAucuneDonnee(Boolean(data.aucuneDonnee));
      setSelectedId((actuel) => (vues.some((v) => v.id === actuel) ? actuel : (vues[0]?.id ?? null)));
    } catch (e) {
      console.error("Chargement des obligations fiscales:", e);
      setErreur("Impossible de charger les obligations fiscales.");
      setObligations([]);
      setEcheancesAnnuelles([]);
      setSynthese(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(paysCible); }, [charger, paysCible]);

  const selected = obligations.find((o) => o.id === selectedId) ?? null;

  const totalADeclarer = synthese?.montantADeclarer ?? 0;
  const nbImminentes = synthese?.obligationsImminentes ?? 0;
  const dossiersCibles = synthese?.dossiersRestants ?? 0;

  // Ce bouton affichait "Déclaration générée et transmise ... PDF archivé ·
  // Accusé DGI enregistré · Dossiers clients notifiés" après un simple
  // setTimeout — une fausse confirmation de télétransmission à
  // l'administration fiscale. Aucune intégration de télétransmission DGI
  // n'existe dans l'application (voir /declarations/e-depot, qui le signale
  // honnêtement). Le bouton ne doit donc rien affirmer de tel.

  // Le moteur commun n'accepte que les pays dont les paramètres sont définis.
  // Les autres choix restent disponibles pour le calendrier, mais sans chiffre
  // fiscal présenté comme fiable.
  const beneficeNet = simulCA - simulCharges;
  const paysMoteur = paysCible.toLowerCase() as PaysFiscal;
  const resultatSimulation = (["sn", "ci", "cm", "bj"] as string[]).includes(paysMoteur)
    ? simulateCorporateTax({ baseImposable: beneficeNet, chiffreAffaires: simulCA, pays: paysMoteur, regime: "reel", secteur: "services" })
    : null;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">


      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500/20 to-orange-600/10 border border-rose-500/20 flex items-center justify-center shadow-xl shadow-rose-500/10">
            <Flag className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="page-title">Fiscalité — {paysCible}</h2>
            <p className="page-subtitle">Suivi des obligations indicatives et des déclarations saisies par le cabinet. Le dépôt s’effectue sur le portail fiscal officiel.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={paysCible}
            onChange={e => setPaysCible(e.target.value)}
            className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="SN">🇸🇳 Sénégal</option>
            <option value="CI">🇨🇮 Côte d'Ivoire</option>
            <option value="CM">🇨🇲 Cameroun</option>
            <option value="BJ">🇧🇯 Bénin</option>
          </select>
        </div>
      </div>

      {erreur && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {erreur}
        </div>
      )}

      <div role="note" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
        Calendrier indicatif : l’assujettissement, le régime, les échéances et les taux ne sont pas encore vérifiés par pays et par exercice. Confirmez les règles dans les textes officiels avant tout dépôt.
      </div>

      {/* Une base sans declaration donne des compteurs a zero : il faut
          distinguer « cabinet a jour » de « rien n'a encore ete saisi ». */}
      {!chargement && !erreur && aucuneDonnee && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <span className="font-bold">Aucune déclaration enregistrée pour la période {periode}.</span>{" "}
          Les obligations applicables restent à traiter ou à vérifier pour chaque client ; l’absence
          de déclaration enregistrée ne vaut pas conformité.
        </div>
      )}

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: "Échéances proches", val: nbImminentes, sub: "Selon dates indicatives", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
          { icon: Clock, label: "Montant total à déclarer", val: (totalADeclarer / 1_000_000).toFixed(1) + " M FCFA", sub: "Sur le mois", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { icon: FileText, label: "Dossiers impactés", val: dossiersCibles, sub: "à traiter", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { icon: CheckCircle2, label: "Déclarations validées", val: obligations.filter(o => o.statut === "VALIDE").length, sub: "Ce mois", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        ].map((k, i) => (
          <div key={i} className={cn("rounded-[24px] border p-5", k.color)}>
            <k.icon className="w-5 h-5 mb-4" />
            <p className="text-2xl font-black tabular-nums">{k.val}</p>
            <p className="text-xs font-bold mt-1 opacity-70">{k.label}</p>
            <p className="text-[10px] mt-1 opacity-50">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-scroll flex gap-2 p-1.5 bg-slate-900/40 border border-white/5 rounded-2xl w-fit">
        {([
          { key: "obligations", label: "Obligations du Mois", icon: Bell },
          { key: "simulation", label: "Simulateur IS / TVA", icon: Sparkles },
          { key: "calendrier", label: "Calendrier Fiscal", icon: Calendar },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === t.key ? "bg-rose-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== OBLIGATIONS DU MOIS ===== */}
      {activeTab === "obligations" && (
        <>
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Liste */}
          <div className="lg:col-span-5 space-y-3">
            {obligations.map(ob => (
              <div
                key={ob.id}
                onClick={() => setSelectedId(ob.id)}
                className={cn(
                  "cursor-pointer p-5 rounded-2xl border transition-all",
                  selected?.id === ob.id ? "bg-rose-600/10 border-rose-500/30" : "bg-slate-900/40 border-white/5 hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className={cn("font-bold text-sm", selected?.id === ob.id ? "text-rose-300" : "text-white")}>{ob.titre}</p>
                  <span className={cn("text-[9px] px-2 py-1 rounded-lg border font-black uppercase shrink-0", URGENCE_STYLE[ob.urgence])}>
                    {ob.urgence}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-black", TYPE_COLOR[ob.type])}>{ob.type}</span>
                    <span className="text-[10px] text-slate-500">· {ob.pays.join(", ")}</span>
                  </div>
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-lg border font-black uppercase", STATUT_STYLE[ob.statut])}>
                    {ob.statut.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {ob.echeance}</p>
                  <p className="text-sm font-black text-white tabular-nums">{ob.montantEstime.toLocaleString()} F</p>
                </div>
              </div>
            ))}
          </div>

          {/* Détail + Action */}
          <div className="lg:col-span-7 space-y-5">
            {!selected ? (
              <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8 text-center text-slate-400">
                {chargement
                  ? "Chargement des obligations…"
                  : "Sélectionnez une obligation pour en afficher le détail."}
              </div>
            ) : (
            <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className={cn("text-xs font-black uppercase tracking-widest mb-1", TYPE_COLOR[selected.type])}>{selected.type} — {selected.pays.join(", ")}</p>
                  <h3 className="text-xl font-black text-white">{selected.titre}</h3>
                  <p className="text-slate-400 text-sm mt-2">{selected.description}</p>
                  {selected.echeancesParDate.length > 1 && <div className="mt-3 space-y-1 rounded-xl border border-white/5 bg-black/10 p-3 text-xs text-slate-400">Échéances différentes selon le profil fiscal :{selected.echeancesParDate.map((e) => <p key={e.date}>{new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} · {e.dossiers} dossier(s)</p>)}</div>}
                </div>
              </div>

              {/* Détails */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Échéance</p>
                  <p className="font-black text-rose-400 text-lg flex items-center gap-2"><Calendar className="w-4 h-4" /> {selected.echeance}</p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Montant Estimé</p>
                  <p className="font-black text-white text-lg tabular-nums">{selected.montantEstime.toLocaleString()} F</p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Dossiers</p>
                  <p className="font-black text-white text-lg">{selected.nbDossiers} clients</p>
                </div>
              </div>

              {/* Aucune télétransmission DGI n'est intégrée à l'application */}
              <div className="w-full p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-300">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-xs leading-relaxed">
                  La télétransmission automatique à la DGI n&apos;est pas connectée. Préparez la déclaration puis
                  déposez-la manuellement via le portail officiel (voir{" "}
                  <Link href="/declarations/e-depot" className="underline font-bold">e-dépôt</Link>).
                </p>
              </div>
            </div>
            )}

            {/* Lien liasse */}
            <Link href="/comptabilite/liasse-fiscale" className="flex items-center justify-between p-5 bg-primary/10 border border-primary/20 rounded-2xl hover:brightness-110/20 transition-all group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-black text-white text-sm">Générer la Liasse Fiscale OHADA</p>
                  <p className="text-[10px] text-slate-400">Bilan + Compte de Résultat + États annexés</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-black text-white">Échéances annuelles calculées par client</h3><p className="mt-1 text-xs text-slate-400">Les lignes dépendent du pays, du centre fiscal et des paramètres du dossier.</p></div><span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300">{new Date().getFullYear()}</span></div>
          {echeancesAnnuelles.length === 0 ? <p className="text-sm text-slate-500">Aucune échéance annuelle générée pour ce pays et ces profils clients.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-[10px] uppercase text-slate-500"><tr><th className="p-3">Client</th><th className="p-3">Obligation</th><th className="p-3">Période</th><th className="p-3">Date limite</th><th className="p-3">Suivi</th></tr></thead><tbody>{echeancesAnnuelles.map(task => <tr key={`${task.clientId}-${task.id}`} className="border-t border-white/5"><td className="p-3 text-white">{task.client}</td><td className="p-3 text-slate-300">{task.titre}<a href={task.source} target="_blank" rel="noreferrer" className="ml-2 text-[10px] text-primary underline">source</a></td><td className="p-3 text-slate-400">{task.period}</td><td className="p-3 text-slate-300">{new Date(task.echeance).toLocaleDateString("fr-FR")}</td><td className={cn("p-3 font-semibold", task.nbRestants ? "text-amber-300" : "text-emerald-300")}>{task.nbRestants ? "À préparer / vérifier" : "Déposé"}</td></tr>)}</tbody></table></div>}
        </section>
        </>
      )}

      {/* ===== SIMULATEUR IS / TVA ===== */}
      {activeTab === "simulation" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="font-black text-white text-lg">Simulateur Fiscal — {paysCible === "SN" ? "Sénégal 🇸🇳" : paysCible}</h3>
            </div>
            <p className="text-slate-400 text-sm">Estimation indicative fondée sur les paramètres actuellement intégrés pour le pays choisi. À confirmer selon le régime et la loi de finances applicable.</p>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Chiffre d'Affaires HT (FCFA)</label>
                <input type="number" value={simulCA} onChange={e => setSimulCA(Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Charges Déductibles Totales (FCFA)</label>
                <input type="number" value={simulCharges} onChange={e => setSimulCharges(Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8 space-y-5">
              <h3 className="font-black text-white text-sm uppercase tracking-widest">Résultat Simulation</h3>
              {resultatSimulation && <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500"><span>{resultatSimulation.editionReglementaire} · couverture partielle</span><a href={resultatSimulation.sourceReglementaire} target="_blank" rel="noreferrer" className="underline text-primary">Source officielle</a></div>}

              {resultatSimulation ? [
                { label: "Bénéfice Net Avant Impôt", val: beneficeNet, color: beneficeNet >= 0 ? "text-emerald-400" : "text-rose-400" },
                { label: `IS théorique (${(resultatSimulation.tauxIS * 100).toFixed(2)} %)`, val: resultatSimulation.is, color: "text-orange-400", sub: "Hors retraitements fiscaux" },
                { label: "Impôt minimum estimé", val: resultatSimulation.impotMinimum, color: "text-amber-400", sub: resultatSimulation.minimumApplique ? "Minimum supérieur à l’IS" : "À vérifier selon le régime" },
                { label: "IS estimé dû", val: resultatSimulation.isDu, color: "text-orange-400", bold: true },
                { label: `TVA brute indicative (${(resultatSimulation.tauxTVA * 100).toFixed(2)} %)`, val: resultatSimulation.tvaMoyenne, color: "text-violet-400", sub: "Hors TVA déductible, exonérations et régularisations" },
              ].map((item, i) => (
                <div key={i} className={cn("flex items-center justify-between p-4 rounded-xl border", item.bold ? "bg-rose-500/5 border-rose-500/20" : "bg-slate-800/30 border-white/5")}>
                  <div>
                    <p className={cn("text-xs font-bold", item.bold ? "text-white" : "text-slate-400")}>{item.label}</p>
                    {item.sub && <p className="text-[10px] text-amber-400 mt-0.5">{item.sub}</p>}
                  </div>
                  <p className={cn("font-black text-lg tabular-nums", item.color)}>{item.val.toLocaleString()} F</p>
                </div>
              )) : <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">Aucun barème indicatif intégré pour ce pays. La simulation est désactivée pour éviter de présenter un taux d’un autre pays.</div>}
            </div>

            <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-primary-foreground/70 font-black text-xs">Limites du calcul</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Simulation indicative seulement : elle ne tient pas compte des retraitements fiscaux, crédits d’impôt, exonérations, retenues ni de toutes les taxes sectorielles. Faites valider le calcul avant toute déclaration ou provision comptable.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CALENDRIER ===== */}
      {activeTab === "calendrier" && (() => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const today = new Date();
        const firstOfMonth = new Date(year, month, 1);
        // getDay() : 0=dimanche..6=samedi -> decalage pour une semaine commençant lundi
        const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return (
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-white text-xl capitalize">
                {calendarMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3 mb-4">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: leadingBlanks }, (_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const evts = obligations.filter(o =>
                  o.echeanceDate.getFullYear() === year &&
                  o.echeanceDate.getMonth() === month &&
                  o.echeanceDate.getDate() === day
                );
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div key={day} className={cn(
                    "min-h-[80px] rounded-2xl border p-2 transition-all",
                    isToday ? "bg-primary/20 border-primary/40" :
                    evts.length > 0 ? "bg-slate-800/50 border-white/10" : "bg-slate-900/20 border-white/5"
                  )}>
                    <span className={cn("text-sm font-black", isToday ? "text-primary" : evts.length > 0 ? "text-white" : "text-slate-600")}>{day}</span>
                    <div className="mt-1 space-y-1">
                      {evts.map((ev, idx) => (
                        <div key={idx} className={cn(
                          "text-[8px] px-1.5 py-1 rounded font-black truncate",
                          ev.urgence === "IMMINENTE" ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-300"
                        )}>
                          {ev.type}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
