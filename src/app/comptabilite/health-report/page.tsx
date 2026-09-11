"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScoreEvolutionChart } from "@/components/portal/ScoreEvolutionChart";
import {
    AlertTriangle,
    Award,
    BarChart2,
    Building2,
    CheckCircle,
    Download,
    Eye,
    FileText,
    Printer,
    RefreshCw,
    Shield,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Rapport de santé financière — document imprimable pour le client.
//
// Trois clients fabriqués, chacun avec des ratios financiers inventés
// (liquidité, solvabilité, rentabilité, BFR, conformité TVA) et une
// recommandation affirmant une éligibilité à un crédit chiffré précisément
// (« jusqu'à 50M FCFA »). Le document imprimé portait un tampon « CERTIFIÉ »
// et un « visa du cabinet » alors qu'aucun collaborateur n'avait rien validé.
// Remis à un client ou une banque, ce rapport aurait engagé le cabinet sur des
// chiffres sans rapport avec sa situation réelle.
//
// Le score de santé existe déjà réellement (CreditScore, calculé par
// /api/clients/[id]/health-score à partir de la régularité de saisie, de la
// trésorerie du journal, de la croissance et du KYC). Cette page l'utilise
// tel quel, sans ajouter d'indicateur non calculé. La recommandation ne cite
// plus de montant : seule l'éligibilité binaire, réellement calculée, est
// affichée.
// ─────────────────────────────────────────────────────────────────────────────

type ClientListe = {
    id: string;
    name: string;
    sector: string | null;
    country: string | null;
    rccm: string | null;
    healthScore: number | null;
    rating: string | null;
};

type Facteurs = {
    regularite: number;
    tresorerie: number;
    croissance: number;
    conformite: number;
    detail?: { nbEcritures: number; totalEntrees: number; totalSorties: number };
} | null;

type ScoreDetail = {
    healthScore: number | null;
    rating: string | null;
    factors: Facteurs;
    history: { month: string; score: number }[];
};

const RATING_COLOR: Record<string, string> = {
    AAA: "#10b981",
    AA: "#6366f1",
    A: "#3b82f6",
    B: "#f59e0b",
    C: "#ef4444",
};

const LIBELLE_FACTEUR: Record<string, { label: string; max: number }> = {
    regularite: { label: "Régularité de saisie", max: 40 },
    tresorerie: { label: "Santé de trésorerie", max: 30 },
    croissance: { label: "Croissance", max: 20 },
    conformite: { label: "Conformité KYC", max: 10 },
};

function valeurFacteur(facteurs: Facteurs, cle: string): number {
    if (!facteurs) return 0;
    const valeur = (facteurs as unknown as Record<string, unknown>)[cle];
    return typeof valeur === "number" ? valeur : 0;
}

export default function HealthReportPage() {
    const [clients, setClients] = useState<ClientListe[]>([]);
    const [clientId, setClientId] = useState<string | null>(null);
    const [detail, setDetail] = useState<ScoreDetail | null>(null);

    const [chargementListe, setChargementListe] = useState(true);
    const [chargementScore, setChargementScore] = useState(false);
    const [calcul, setCalcul] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);

    const [showPreview, setShowPreview] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const today = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/clients?limit=200&isActive=true");
                if (!res.ok) throw new Error(`Réponse ${res.status}`);
                const data = await res.json();
                const liste: ClientListe[] = (data.clients ?? []).map((c: Record<string, unknown>) => ({
                    id: String(c.id),
                    name:
                        (c.companyName as string) ||
                        [c.firstName, c.lastName].filter(Boolean).join(" ") ||
                        "Client sans nom",
                    sector: (c.sector as string) ?? null,
                    country: (c.country as string) ?? null,
                    rccm: (c.rccm as string) ?? null,
                    healthScore: (c.healthScore as number) ?? null,
                    rating: (c.rating as string) ?? null,
                }));
                setClients(liste);
                setClientId((prev) => prev ?? liste[0]?.id ?? null);
            } catch (e) {
                console.error("Chargement du portefeuille :", e);
                setErreur("Impossible de charger le portefeuille clients.");
            } finally {
                setChargementListe(false);
            }
        })();
    }, []);

    const chargerScore = useCallback(async (id: string) => {
        setChargementScore(true);
        setErreur(null);
        try {
            const res = await fetch(`/api/clients/${id}/health-score`);
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            const data = await res.json();
            setDetail(data);
        } catch (e) {
            console.error("Chargement du score :", e);
            setErreur("Impossible de charger le score de santé.");
            setDetail(null);
        } finally {
            setChargementScore(false);
        }
    }, []);

    useEffect(() => {
        if (clientId) chargerScore(clientId);
    }, [clientId, chargerScore]);

    const recalculer = async () => {
        if (!clientId) return;
        setCalcul(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/health-score`, { method: "POST" });
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            await chargerScore(clientId);
            setClients((prev) =>
                prev.map((c) => (c.id === clientId ? { ...c, healthScore: detail?.healthScore ?? c.healthScore } : c))
            );
        } catch (e) {
            console.error("Calcul du score :", e);
            setErreur("Échec du calcul du score.");
        } finally {
            setCalcul(false);
        }
    };

    const selectedClient = clients.find((c) => c.id === clientId) ?? null;
    const score = detail?.healthScore ?? null;
    const rating = detail?.rating ?? null;
    const couleur = rating ? (RATING_COLOR[rating] ?? "#64748b") : "#64748b";
    const eligible = score !== null && score >= 60;

    const historique = detail?.history ?? [];
    const tendance =
        historique.length >= 2 ? historique[historique.length - 1].score - historique[historique.length - 2].score : null;

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow || !reportRef.current || !selectedClient) return;
        printWindow.document.write(`
      <html><head><title>Rapport Santé - ${selectedClient.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', 'Segoe UI', sans-serif; background: white; color: #1e293b; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #006B3F; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #006B3F; }
        .date { color: #94a3b8; font-size: 12px; }
        .title { font-size: 22px; font-weight: 900; margin: 20px 0; }
        .section { margin: 24px 0; }
        .section-title { font-size: 14px; font-weight: 800; color: #006B3F; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; border-left: 4px solid #006B3F; padding-left: 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .metric { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
        .metric-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .metric-value { font-size: 24px; font-weight: 900; margin-top: 4px; }
        .score-box { text-align: center; background: linear-gradient(135deg, #006B3F, #009639); color: white; border-radius: 20px; padding: 32px; margin: 24px 0; }
        .score-number { font-size: 64px; font-weight: 900; }
        .rating { font-size: 28px; font-weight: 900; margin-top: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <div class="header">
          <div class="logo">CABINET 360 — OHADA</div>
          <div class="date">Rapport généré le ${today}</div>
        </div>
        <div class="title">Rapport de Santé Financière</div>
        <p style="color:#64748b;font-size:13px;margin-bottom:8px;">${selectedClient.name} · ${selectedClient.sector ?? "Secteur non renseigné"} · ${selectedClient.country ?? ""} ${selectedClient.rccm ? "· " + selectedClient.rccm : ""}</p>

        <div class="score-box">
          <div class="score-number">${score ?? "—"}</div>
          <div class="rating">${rating ? `Notation ${rating}` : "Non évalué"}</div>
          <p style="opacity:0.7;font-size:12px;margin-top:8px;">Score de santé financière sur 100 points</p>
        </div>

        <div class="section">
          <div class="section-title">Facteurs du score</div>
          <div class="grid">
            ${
                detail?.factors
                    ? Object.entries(LIBELLE_FACTEUR)
                          .map(
                              ([cle, { label, max }]) =>
                                  `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${valeurFacteur(detail.factors, cle)} / ${max}</div></div>`
                          )
                          .join("")
                    : `<p style="color:#94a3b8;font-size:13px;">Score non encore calculé pour ce client.</p>`
            }
          </div>
        </div>

        <div class="section">
          <div class="section-title">Éligibilité crédit</div>
          <p style="font-size:14px;font-weight:700;color:${eligible ? "#059669" : "#dc2626"}">
            ${score === null ? "Score non calculé — éligibilité indéterminée" : eligible ? "Éligible — score supérieur ou égal à 60/100" : "Non éligible — score inférieur à 60/100"}
          </p>
        </div>

        <div class="footer">
          <p>Document généré automatiquement par Cabinet 360 à partir des données réellement enregistrées — à valider par un expert du cabinet avant diffusion.</p>
          <p>Document confidentiel — Ne pas diffuser sans autorisation du cabinet</p>
        </div>
      </body></html>
    `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        Rapport de Santé Financière
                    </h2>
                    <p className="page-subtitle">Score calculé à partir des données réellement enregistrées</p>
                </div>
            </div>

            {erreur && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-sm text-rose-300">{erreur}</div>
            )}

            <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Sélectionner un client
                </p>
                {chargementListe ? (
                    <p className="text-sm text-slate-500">Chargement…</p>
                ) : clients.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun client actif.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {clients.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    setClientId(c.id);
                                    setShowPreview(false);
                                }}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                    clientId === c.id
                                        ? "bg-primary/20 border-primary/30 ring-2 ring-primary/20"
                                        : "bg-slate-800/40 border-white/5 hover:border-white/10"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white"
                                        style={{
                                            background: (c.rating ? RATING_COLOR[c.rating] : "#64748b") + "33",
                                            color: c.rating ? RATING_COLOR[c.rating] : "#94a3b8",
                                        }}
                                    >
                                        {c.rating ?? "—"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{c.name}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {c.sector ?? "Secteur non renseigné"} · {c.country ?? "—"} ·{" "}
                                            {c.healthScore !== null ? `Score ${c.healthScore}` : "Non évalué"}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedClient && (
                <div ref={reportRef} className="bg-slate-900/40 border border-white/5 rounded-[28px] overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/20 to-violet-600/10 p-8 border-b border-white/5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2">
                                    Rapport de Santé Financière
                                </p>
                                <h3 className="text-2xl font-black text-white">{selectedClient.name}</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    {selectedClient.sector ?? "Secteur non renseigné"} · {selectedClient.country ?? "—"}
                                    {selectedClient.rccm ? ` · ${selectedClient.rccm}` : ""}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">{today}</p>
                                <button
                                    onClick={recalculer}
                                    disabled={calcul}
                                    className="mt-2 flex items-center gap-1.5 text-[10px] text-primary hover:text-primary-foreground/70 font-bold uppercase disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3 h-3 ${calcul ? "animate-spin" : ""}`} />
                                    {calcul ? "Calcul…" : "Recalculer le score"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {chargementScore ? (
                            <p className="text-sm text-slate-500">Chargement du score…</p>
                        ) : score === null ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-sm text-amber-200">
                                Aucun score n&apos;a encore été calculé pour ce client. Cliquez sur « Recalculer le
                                score » pour le générer à partir des données enregistrées.
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-8 flex-wrap">
                                    <div className="bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/20 rounded-[24px] p-8 text-center shrink-0">
                                        <p className="text-5xl sm:text-7xl font-black tabular-nums" style={{ color: couleur }}>
                                            {score}
                                        </p>
                                        <p className="text-2xl font-black text-white mt-1">{rating}</p>
                                        <p className="text-[10px] text-slate-500 mt-2">Score / 100</p>
                                    </div>

                                    <div className="flex-1 min-w-[280px]">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                            Évolution
                                        </p>
                                        {historique.length >= 2 ? (
                                            <>
                                                <ScoreEvolutionChart data={historique} color={couleur} height={110} />
                                                {tendance !== null && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        {tendance >= 0 ? (
                                                            <span className="text-emerald-400 text-xs font-black">
                                                                ▲ +{tendance} pt — dernière évaluation
                                                            </span>
                                                        ) : (
                                                            <span className="text-rose-400 text-xs font-black">
                                                                ▼ {tendance} pt — dernière évaluation
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-xs text-slate-500">
                                                Une seule évaluation enregistrée : pas d&apos;historique à afficher.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <BarChart2 className="w-4 h-4" /> Facteurs du score
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {Object.entries(LIBELLE_FACTEUR).map(([cle, { label, max }]) => {
                                            const valeur = valeurFacteur(detail?.factors ?? null, cle);
                                            const bon = valeur >= max * 0.6;
                                            return (
                                                <div
                                                    key={cle}
                                                    className={`p-4 rounded-2xl border ${bon ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/5 border-rose-500/10"}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {bon ? (
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                        ) : (
                                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                                        )}
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                            {label}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className={`text-2xl font-black tabular-nums ${bon ? "text-emerald-400" : "text-rose-400"}`}
                                                    >
                                                        {valeur}
                                                        <span className="text-sm text-slate-500"> / {max}</span>
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div
                                    className={`p-5 rounded-2xl border flex items-center gap-4 ${eligible ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}
                                >
                                    <Award className={`w-6 h-6 ${eligible ? "text-emerald-400" : "text-rose-400"}`} />
                                    <div>
                                        <p className={`font-black text-sm ${eligible ? "text-emerald-400" : "text-rose-400"}`}>
                                            {eligible ? "Éligible au crédit bancaire" : "Non éligible au crédit bancaire"}
                                        </p>
                                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" />
                                            Seuil d&apos;éligibilité : 60/100. Aucun montant n&apos;est calculé
                                            automatiquement — l&apos;instruction d&apos;un dossier de crédit relève
                                            du jugement du cabinet.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {selectedClient && score !== null && (
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3.5 bg-primary hover:brightness-110 text-white rounded-2xl font-black text-xs transition-colors shadow-lg shadow-primary/20"
                    >
                        <Printer className="w-4 h-4" /> Imprimer / Exporter PDF
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white rounded-2xl font-black text-xs transition-colors"
                    >
                        <Download className="w-4 h-4" /> Télécharger
                    </button>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white rounded-2xl font-black text-xs transition-colors"
                    >
                        <Eye className="w-4 h-4" /> {showPreview ? "Masquer aperçu" : "Aperçu pleine page"}
                    </button>
                </div>
            )}
        </div>
    );
}
