"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { type InputESG, type RapportESG } from "@/lib/ohada/reporting-esg";

const EMPTY_INPUT: InputESG = {
  raisonSociale: "", exercice: new Date().getFullYear(), pays: "",
  ca_XOF: 0, effectifTotal: 0, consommationCarburantLitres: 0,
  consommationElectriciteKWh: 0, achatEnergieMWh: 0, nbContratsFormels: 0,
  nbFemmes: 0, nbAffiliesSante: 0, accidentsWork: 0, masseSalariale_XOF: 0,
  lcbftConforme: false, registreBeneficiairesEffectifs: false,
  administrateursIndependants_pct: 0, comiteAudit: false, codeEthiqueAdopte: false,
};

type ClientOption = { id: string; companyName: string | null; firstName: string | null; lastName: string | null; country: string };
type Assessment = { id: string; clientId: string; createdById: string; periodYear: number; version: number; country: string; dataQuality: string; evidenceNotes: string; methodologyVersion: string; emissionFactorVersion: string; status: string; reviewComment: string | null; createdAt: string; input: InputESG; report: RapportESG; client: ClientOption };
const nomClient = (client: ClientOption) => client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client";

const deviseClient = (country: string) => ["CM", "GA", "CG", "TD", "CF", "GQ"].includes(country.toUpperCase()) ? "XAF" : "XOF";

export default function ESGReportingPage() {
  const [form, setForm] = useState<InputESG>(EMPTY_INPUT);
  const [rapport, setRapport] = useState<RapportESG | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [dataQuality, setDataQuality] = useState("MIXED");
  const [savedAssessment, setSavedAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function loadAssessments() {
    const response = await fetch("/api/advisory/esg");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Impossible de charger les évaluations ESG.");
    setAssessments(data.assessments || []);
  }

  useEffect(() => {
    Promise.all([fetch("/api/clients?limit=200&isActive=true"), fetch("/api/advisory/esg")])
      .then(async ([clientsResponse, assessmentResponse]) => {
        const [clientsData, assessmentData] = await Promise.all([clientsResponse.json(), assessmentResponse.json()]);
        if (!clientsResponse.ok) throw new Error(clientsData.error || "Portefeuille clients indisponible.");
        if (!assessmentResponse.ok) throw new Error(assessmentData.error || "Registre ESG indisponible.");
        setClients((clientsData.clients || []) as ClientOption[]);
        setAssessments((assessmentData.assessments || []) as Assessment[]);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Chargement ESG impossible."));
  }, []);

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSavedAssessment(null);
    try {
      const res = await fetch("/api/advisory/esg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, input: form, evidenceNotes, dataQuality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enregistrement ESG impossible.");
      setRapport(data.report);
      setSavedAssessment(data.assessment);
      await loadAssessments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement ESG impossible.");
    } finally {
      setLoading(false);
    }
  };

  const choisirClient = (id: string) => {
    setClientId(id);
    const client = clients.find((item) => item.id === id);
    if (client) setForm((current) => ({ ...current, raisonSociale: nomClient(client), pays: client.country }));
    setRapport(null); setSavedAssessment(null);
  };

  const chargerVersion = (assessment: Assessment) => {
    setClientId(assessment.clientId); setForm(assessment.input); setEvidenceNotes(assessment.evidenceNotes);
    setDataQuality(assessment.dataQuality); setRapport(assessment.report); setSavedAssessment(assessment);
  };

  async function revoir(assessment: Assessment) {
    const reviewComment = window.prompt("Notez les contrôles effectués, les limites et les points restant à confirmer :") || "";
    if (!reviewComment.trim()) return;
    const response = await fetch("/api/advisory/esg", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: assessment.id, reviewComment }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Revue ESG impossible."); return; }
    await loadAssessments();
    if (savedAssessment?.id === assessment.id) setSavedAssessment(data.assessment);
  }

  const getMaturiteBadge = (maturite: string) => {
    switch (maturite) {
      case "LEADER":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "AVANCE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "EN_PROGRESSION":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
            <span>Analyse interne indicative</span>
            <span>•</span>
            <span>Référentiel à confirmer selon le pays</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Rapport ESG & Durabilité Extra-Financière
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Données liées au client, sources documentées, versions conservées et revue par un expert.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/advisory/due-diligence"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Due Diligence M&A
          </Link>
          <Link
            href="/advisory/evaluation"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Évaluation DCF →
          </Link>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}

      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div><h2 className="font-semibold text-slate-100">Registre des évaluations</h2><p className="text-xs text-slate-400 mt-1">Chaque correction crée une nouvelle version ; les versions revues restent figées.</p></div>
        {assessments.length === 0 ? <p className="text-sm text-slate-500">Aucune évaluation enregistrée.</p> : <div className="space-y-2">{assessments.slice(0, 12).map((assessment) => <div key={assessment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3"><div><p className="text-sm font-semibold">{nomClient(assessment.client)} · {assessment.periodYear} · v{assessment.version}</p><p className="text-xs text-slate-400">{assessment.dataQuality} · {assessment.status === "REVIEWED" ? "Revu" : "Brouillon à revoir"} · {new Date(assessment.createdAt).toLocaleDateString("fr-FR")}</p><p className="text-[10px] text-slate-500">Méthode {assessment.methodologyVersion} · Facteurs {assessment.emissionFactorVersion}</p>{assessment.reviewComment && <p className="mt-1 text-xs text-slate-400">Revue : {assessment.reviewComment}</p>}</div><div className="flex gap-2"><button type="button" onClick={() => chargerVersion(assessment)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">Ouvrir</button>{assessment.status === "DRAFT" && assessment.createdById !== String((session?.user as { id?: string } | undefined)?.id) && ["ADMIN", "EXPERT"].includes(String((session?.user as { role?: string } | undefined)?.role)) && <button type="button" onClick={() => revoir(assessment)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs">Revue indépendante</button>}</div></div>)}</div>}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de saisie */}
        <form onSubmit={handleCalculer} className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <label className="block text-xs text-slate-400">Client du portefeuille *</label>
            <select required value={clientId} onChange={(e) => choisirClient(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm">
              <option value="">Sélectionner un client</option>{clients.map((client) => <option key={client.id} value={client.id}>{nomClient(client)}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate-400">Qualité des données<select value={dataQuality} onChange={(e) => setDataQuality(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"><option value="MEASURED">Mesurées</option><option value="ESTIMATED">Estimées</option><option value="MIXED">Mixtes</option></select></label><p className="self-end text-xs text-slate-500">À préciser avec les preuves ci-dessous.</p></div>
            <label className="block text-xs text-slate-400">Sources, pièces consultées, méthode et limites *<textarea required minLength={20} maxLength={5000} value={evidenceNotes} onChange={(e) => setEvidenceNotes(e.target.value)} placeholder="Ex. factures d'énergie 01–12/2025, registre RH arrêté au 31/12, indicateurs auto-déclarés par le client ; facteur d'émission à confirmer…" className="mt-1 min-h-24 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200" /></label>
            {savedAssessment && <p className="text-xs text-emerald-400">Version v{savedAssessment.version} enregistrée · {savedAssessment.status === "REVIEWED" ? "revue" : "à revoir"}</p>}
          </div>
          {/* Identité */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              1. Périmètre & Profil Entité
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={form.raisonSociale}
                  onChange={(e) => setForm({ ...form, raisonSociale: e.target.value })}
                  readOnly
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Exercice</label>
                  <input
                    type="number"
                    value={form.exercice}
                    onChange={(e) => setForm({ ...form, exercice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Pays enregistré sur le dossier client</label>
                  <input
                    type="text"
                    value={form.pays}
                    readOnly
                    aria-label="Pays du client"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Chiffre d&apos;affaires ({deviseClient(form.pays)})</label>
                  <input
                    type="number"
                    value={form.ca_XOF}
                    onChange={(e) => setForm({ ...form, ca_XOF: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Effectif Total</label>
                  <input
                    type="number"
                    value={form.effectifTotal}
                    onChange={(e) => setForm({ ...form, effectifTotal: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pilier Environnemental */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>2. Pilier E — Climat & Carbone</span>
              <span className="text-xs text-slate-500 font-normal">Estimation indicative</span>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Carburant déclaré (litres, Scope 1 estimé)
                </label>
                <input
                  type="number"
                  value={form.consommationCarburantLitres}
                  onChange={(e) => setForm({ ...form, consommationCarburantLitres: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Électricité réseau (kWh)</label>
                  <input
                    type="number"
                    value={form.consommationElectriciteKWh}
                    onChange={(e) => setForm({ ...form, consommationElectriciteKWh: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Électricité achetée en MWh (hors compteur kWh)</label>
                  <input
                    type="number"
                    value={form.achatEnergieMWh || 0}
                    onChange={(e) => setForm({ ...form, achatEnergieMWh: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pilier Social */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
              3. Pilier S — Social & Capital Humain
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Contrats écrits formels</label>
                <input
                  type="number"
                  value={form.nbContratsFormels}
                  onChange={(e) => setForm({ ...form, nbContratsFormels: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Femmes dans effectif</label>
                <input
                  type="number"
                  value={form.nbFemmes}
                  onChange={(e) => setForm({ ...form, nbFemmes: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Affiliés aux organismes sociaux (selon le pays)</label>
                <input
                  type="number"
                  value={form.nbAffiliesSante}
                  onChange={(e) => setForm({ ...form, nbAffiliesSante: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Accidents du travail (AT)</label>
                <input
                  type="number"
                  value={form.accidentsWork}
                  onChange={(e) => setForm({ ...form, accidentsWork: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Masse salariale annuelle ({deviseClient(form.pays)})</label>
                <input type="number" min="0" value={form.masseSalariale_XOF} onChange={(e) => setForm({ ...form, masseSalariale_XOF: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          {/* Pilier Gouvernance */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
              4. Pilier G — Gouvernance & Éthique
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.lcbftConforme}
                  onChange={(e) => setForm({ ...form, lcbftConforme: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Dispositif LCB-FT déclaré en place (à vérifier selon les obligations locales)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.registreBeneficiairesEffectifs}
                  onChange={(e) => setForm({ ...form, registreBeneficiairesEffectifs: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Registre des Bénéficiaires Effectifs tenu à jour</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.comiteAudit}
                  onChange={(e) => setForm({ ...form, comiteAudit: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Comité d&apos;audit / Administrateur référent actif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.codeEthiqueAdopte}
                  onChange={(e) => setForm({ ...form, codeEthiqueAdopte: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Code d&apos;éthique &amp; politique anti-corruption validée</span>
              </label>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Administrateurs Indépendants</span>
                  <span>{form.administrateursIndependants_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.administrateursIndependants_pct}
                  onChange={(e) => setForm({ ...form, administrateursIndependants_pct: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !clientId}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
          >
            {loading ? "Enregistrement..." : "Calculer et enregistrer une version ESG"}
          </button>
        </form>

        {/* Dashboard de Restitution */}
        <div className="lg:col-span-7 space-y-6">
          {!rapport && <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">Sélectionnez un client, documentez les sources, puis enregistrez une version pour afficher son estimation.</div>}
          {rapport && (
            <>
              {/* Score Global Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left space-y-1">
                    <span className="text-xs uppercase font-medium text-slate-400">Score interne indicatif</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">{rapport.scoreESG.global}</span>
                    <span className="text-lg text-slate-500 font-semibold">/ 100 · {savedAssessment?.dataQuality || dataQuality}</span>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getMaturiteBadge(rapport.niveauMaturite)}`}>
                      Maturité : {rapport.niveauMaturite}
                    </span>
                  </div>

                  {/* Détail E-S-G */}
                  <div className="w-full md:w-64 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-emerald-400">Environnement (E)</span>
                        <span>{rapport.scoreESG.E}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${rapport.scoreESG.E}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-blue-400">Social (S)</span>
                        <span>{rapport.scoreESG.S}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${rapport.scoreESG.S}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-purple-400">Gouvernance (G)</span>
                        <span>{rapport.scoreESG.G}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${rapport.scoreESG.G}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimation interne des émissions Scopes 1 & 2 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-semibold text-slate-200 text-sm">
                    Estimation des émissions de gaz à effet de serre
                  </h3>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    Facteur indicatif à confirmer
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1">Scope 1 (Carburant)</span>
                    <span className="text-lg font-bold text-white">{rapport.bilanCarbone.scope1Carburant_tCO2}</span>
                    <span className="text-[10px] text-slate-500 block">tCO2e</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1">Scope 2 (Réseau électrique)</span>
                    <span className="text-lg font-bold text-white">{rapport.bilanCarbone.scope2Electricite_tCO2}</span>
                    <span className="text-[10px] text-slate-500 block">tCO2e</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1">Autres achats Scope 2</span>
                    <span className="text-lg font-bold text-white">{rapport.bilanCarbone.scope2Achats_tCO2}</span>
                    <span className="text-[10px] text-slate-500 block">tCO2e</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-emerald-400 block mb-1">Intensité Carbone</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {rapport.bilanCarbone.intensiteCarbone_tCO2parM_XOF}
                    </span>
                    <span className="text-[10px] text-slate-500 block">tCO2 / M {deviseClient(rapport.pays)} CA</span>
                  </div>
                </div>
              </div>

              {/* Indicateurs Sociaux & Gouvernance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                    Indicateurs sociaux déclarés
                  </h4>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Contrats formels</span>
                    <span className="font-semibold text-white">{rapport.indicateursSociaux.tauxContratsFormels_pct}%</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Taux parité F/H</span>
                    <span className="font-semibold text-white">{rapport.indicateursSociaux.tauxPariteHF_pct}%</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Affiliation sociale déclarée</span>
                    <span className="font-semibold text-white">{rapport.indicateursSociaux.tauxCouvertureSante_pct}%</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Accidents de travail</span>
                    <span className={`font-semibold ${rapport.indicateursSociaux.accidentsWork > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {rapport.indicateursSociaux.accidentsWork}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                    Gouvernance & Conformité
                  </h4>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">LCB-FT déclaré en place</span>
                    <span className={rapport.indicateursGouvernance.lcbftConforme ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                      {rapport.indicateursGouvernance.lcbftConforme ? "Déclaré en place" : "Non déclaré"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Bénéficiaires Effectifs</span>
                    <span className={rapport.indicateursGouvernance.registreBeneficiairesEffectifs ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                      {rapport.indicateursGouvernance.registreBeneficiairesEffectifs ? "Déclaré tenu" : "Non déclaré"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Comité d&apos;audit</span>
                    <span className={rapport.indicateursGouvernance.comiteAudit ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                      {rapport.indicateursGouvernance.comiteAudit ? "Déclaré actif" : "Non déclaré actif"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Administrateurs indép.</span>
                    <span className="font-semibold text-white">{rapport.indicateursGouvernance.administrateursIndependants_pct}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                Masse salariale annuelle déclarée : <strong>{new Intl.NumberFormat("fr-FR").format(rapport.indicateursSociaux.masseSalariale_XOF)} {deviseClient(rapport.pays)}</strong>
              </div>

              {/* Recommandations Stratégiques */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <span>Recommandations d&apos;amélioration &amp; feuille de route</span>
                  <span className="text-xs text-slate-500 font-normal">({rapport.referentielIFRS})</span>
                </h3>
                {rapport.recommandations.length === 0 ? (
                  <p className="text-xs text-emerald-400">
                    Excellente conformité ! Aucun écart critique relevé sur les 3 piliers.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {rapport.recommandations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">Cette estimation utilise des coefficients génériques et des informations saisies par le cabinet. Elle n’est ni une mesure vérifiée, ni une attestation de conformité IFRS S1/S2. Les facteurs d’émission, périmètres et exigences doivent être vérifiés pour le pays, le secteur et l’exercice concernés.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
