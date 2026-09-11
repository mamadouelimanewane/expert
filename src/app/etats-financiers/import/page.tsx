"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Trash2, ArrowRight, X, ScanLine, Plus, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Import d'une balance générale (CSV / Excel).
//
// La balance est le document que le cabinet reçoit le plus souvent d'un client
// ou d'un confrère. Elle est lue ici, dans le navigateur (aucun fichier ne
// quitte le poste avant validation), ses colonnes sont reconnues
// automatiquement, puis les lignes normalisées sont enregistrées pour
// (client, période de clôture). Le moteur SYSCOHADA la préfère ensuite au
// journal pour produire bilan, résultat, TFT et liasse.
// ─────────────────────────────────────────────────────────────────────────────

type Ligne = { numero: string; intitule: string; debit: number; credit: number; confiance?: "haute" | "moyenne" | "faible"; source?: string };
type Mode = "fichier" | "scan";
type InfosOCR = { origine: string; pages: number; confianceOCR: number | null; controleTotaux: string; totauxDetectes: { debit: number; credit: number } | null; disposition: string; dureeMs: number; rejets: { ligne: number; texte: string; raison: string }[] };
type Colonnes = { numero: number; intitule: number; debit: number; credit: number; soldeDebit: number; soldeCredit: number; solde: number };
type BalanceExistante = { id: string; periode: string; fichier: string | null; nbLignes: number; totalDebit: number; totalCredit: number; equilibree: boolean; createdAt: string; importedBy?: { firstName: string; lastName: string } };

const normaliser = (v: unknown) => String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const nombre = (v: unknown): number => {
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const s = String(v ?? "").replace(/\s| /g, "").replace(/\./g, (m, i, str) => (str.indexOf(",") > -1 ? "" : m)).replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
};
const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

/** Reconnaît les colonnes d'une balance à partir de la ligne d'en-tête. */
function detecterColonnes(entete: unknown[]): Colonnes {
    const h = entete.map(normaliser);
    const trouver = (...motifs: RegExp[]) => h.findIndex((c) => motifs.some((m) => m.test(c)));
    return {
        numero: trouver(/^(n|no|num|numero)?\s*(de\s*)?compte$/, /^compte/, /^n[°o]?\s*compte/, /^cpt/, /^code/),
        intitule: trouver(/intitule/, /libelle/, /designation/, /nom\s*du\s*compte/),
        debit: trouver(/^(total\s*|mouvement\s*|mvt\s*)?debit$/, /^debit/),
        credit: trouver(/^(total\s*|mouvement\s*|mvt\s*)?credit$/, /^credit/),
        soldeDebit: trouver(/solde\s*deb/, /sd$/),
        soldeCredit: trouver(/solde\s*cred/, /sc$/),
        solde: trouver(/^solde$/, /^solde\s*(net|final)/),
    };
}

export default function ImportBalancePage() {
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    const [clientId, setClientId] = useState("");
    const [periode, setPeriode] = useState(`${new Date().getFullYear() - 1}-12`);
    const [fichier, setFichier] = useState<File | null>(null);
    const [lignes, setLignes] = useState<Ligne[]>([]);
    const [entete, setEntete] = useState<string[]>([]);
    const [colonnes, setColonnes] = useState<Colonnes | null>(null);
    const [rejets, setRejets] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [envoi, setEnvoi] = useState(false);
    const [existantes, setExistantes] = useState<BalanceExistante[]>([]);
    const [resultat, setResultat] = useState<{ periode: string; nbLignes: number; equilibree: boolean } | null>(null);
    const [mode, setMode] = useState<Mode>("fichier");
    const [ocr, setOcr] = useState<InfosOCR | null>(null);
    const [ocrEnCours, setOcrEnCours] = useState(false);

    useEffect(() => {
        fetch("/api/clients?limit=200&isActive=true").then((r) => r.json()).then((d) => {
            setClients((d.clients ?? []).map((c: { id: string; companyName?: string; firstName?: string; lastName?: string }) => ({ id: c.id, nom: c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() })));
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!clientId) { setExistantes([]); return; }
        fetch(`/api/comptabilite/balance?clientId=${clientId}`).then((r) => r.json()).then((d) => setExistantes(d.balances ?? [])).catch(() => {});
    }, [clientId, resultat]);

    const totaux = useMemo(() => {
        const debit = lignes.reduce((s, l) => s + l.debit, 0);
        const credit = lignes.reduce((s, l) => s + l.credit, 0);
        return { debit, credit, ecart: debit - credit, equilibree: Math.abs(debit - credit) <= 1 };
    }, [lignes]);

    // Balance scannée (image ou PDF) : le serveur lit le document (tableau ou
    // texte du PDF, sinon OCR) et renvoie des lignes à vérifier. Rien n'est
    // enregistré avant que l'utilisateur ait validé l'aperçu.
    const scannerFichier = async (f: File) => {
        setFichier(f); setLignes([]); setRejets([]); setResultat(null); setColonnes(null); setOcr(null);
        setOcrEnCours(true);
        try {
            const fd = new FormData(); fd.append("file", f);
            const r = await fetch("/api/comptabilite/balance/ocr", { method: "POST", body: fd });
            const d = await r.json();
            if (!r.ok) { setRejets([d.error || "Lecture impossible."]); return; }
            setLignes((d.lignes ?? []).map((l: Ligne) => ({ numero: l.numero, intitule: l.intitule, debit: l.debit, credit: l.credit, confiance: l.confiance, source: l.source })));
            setOcr({ origine: d.origine, pages: d.pages, confianceOCR: d.confianceOCR, controleTotaux: d.controleTotaux, totauxDetectes: d.totauxDetectes, disposition: d.disposition, dureeMs: d.dureeMs, rejets: d.rejets ?? [] });
            setRejets((d.rejets ?? []).map((x: { ligne: number; texte: string; raison: string }) => `Ligne ${x.ligne} : ${x.raison} — « ${x.texte.slice(0, 80)} »`));
            if ((d.lignes ?? []).length === 0) setRejets((x) => [...x, "Aucune ligne de balance reconnue. Vérifiez que le document est une balance (compte, intitulé, débit, crédit) et qu'il est net et droit."]);
            else toast.success(`${d.lignes.length} comptes reconstitués — vérifiez les lignes surlignées avant d'enregistrer`);
        } catch {
            setRejets(["Lecture du document impossible."]);
        } finally { setOcrEnCours(false); }
    };

    const lireFichier = async (f: File) => {
        if (mode === "scan" || /\.(pdf|png|jpe?g|webp|tiff?|bmp)$/i.test(f.name)) { await scannerFichier(f); return; }
        setFichier(f); setLignes([]); setRejets([]); setResultat(null); setColonnes(null); setOcr(null);
        try {
            // CSV : Excel en français sépare par « ; » — on détecte le séparateur
            // sur la première ligne plutôt que de laisser tout tomber dans une
            // seule colonne.
            let wb: XLSX.WorkBook;
            if (/\.(csv|txt)$/i.test(f.name)) {
                const texte = await f.text();
                const premiere = texte.split(/\r?\n/)[0] ?? "";
                const sep = [";", "\t", ",", "|"].map((c) => ({ c, n: premiere.split(c).length })).sort((a, b) => b.n - a.n)[0].c;
                wb = XLSX.read(texte, { type: "string", FS: sep, raw: true });
            } else {
                wb = XLSX.read(await f.arrayBuffer(), { type: "array", raw: false });
            }
            const feuille = wb.Sheets[wb.SheetNames[0]];
            const brut: unknown[][] = XLSX.utils.sheet_to_json(feuille, { header: 1, blankrows: false, raw: true });
            // Ligne d'en-tête = première ligne qui contient « compte » ou « débit »
            const iEntete = brut.findIndex((r) => r.some((c) => /compte|debit|débit|solde/i.test(String(c ?? ""))));
            if (iEntete < 0) { setRejets(["Impossible de trouver la ligne d'en-tête (attendu : Compte, Intitulé, Débit, Crédit)."]); return; }
            const cols = detecterColonnes(brut[iEntete]);
            setEntete(brut[iEntete].map((c) => String(c ?? "")));
            setColonnes(cols);
            if (cols.numero < 0) { setRejets(["Colonne « Compte » introuvable dans l'en-tête."]); return; }
            const modeMouvements = cols.debit >= 0 && cols.credit >= 0;
            const modeSoldes = cols.soldeDebit >= 0 || cols.soldeCredit >= 0 || cols.solde >= 0;
            if (!modeMouvements && !modeSoldes) { setRejets(["Colonnes Débit / Crédit (ou Solde) introuvables."]); return; }
            const out: Ligne[] = []; const rej: string[] = [];
            brut.slice(iEntete + 1).forEach((r, i) => {
                const numero = String(r[cols.numero] ?? "").replace(/\s+/g, "");
                if (!numero) return;
                if (/^total|^sous-total/i.test(numero) || /total/i.test(String(r[cols.intitule] ?? "")) && !/^\d/.test(numero)) return;
                if (!/^\d{1,13}$/.test(numero)) { rej.push(`Ligne ${iEntete + i + 2} : compte « ${numero} » ignoré (non numérique).`); return; }
                let debit = 0, credit = 0;
                if (modeMouvements) { debit = nombre(r[cols.debit]); credit = nombre(r[cols.credit]); }
                else if (cols.soldeDebit >= 0 || cols.soldeCredit >= 0) { debit = cols.soldeDebit >= 0 ? nombre(r[cols.soldeDebit]) : 0; credit = cols.soldeCredit >= 0 ? nombre(r[cols.soldeCredit]) : 0; }
                else { const s = nombre(r[cols.solde]); if (s >= 0) debit = s; else credit = -s; }
                if (debit < 0 || credit < 0) { rej.push(`Ligne ${iEntete + i + 2} (${numero}) : montant négatif.`); return; }
                out.push({ numero, intitule: String(r[cols.intitule] ?? "").trim(), debit, credit });
            });
            setLignes(out); setRejets(rej);
            if (out.length === 0) setRejets((x) => [...x, "Aucune ligne exploitable."]);
        } catch {
            setRejets(["Fichier illisible. Formats acceptés : .xlsx, .xls, .csv"]);
        }
    };

    const enregistrer = async () => {
        if (!clientId) { toast.warning("Sélectionnez le dossier client."); return; }
        if (lignes.length === 0) return;
        setEnvoi(true);
        try {
            const r = await fetch("/api/comptabilite/balance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId, periode, fichier: fichier?.name, lignes }) });
            const d = await r.json();
            if (!r.ok) { toast.error(d.error || "Import refusé"); if (d.rejets?.length) setRejets(d.rejets); return; }
            setResultat({ periode: d.balance.periode, nbLignes: d.balance.nbLignes, equilibree: d.balance.equilibree });
            (d.avertissements ?? []).forEach((a: string) => toast.warning(a, { duration: 9000 }));
            toast.success(`Balance ${d.balance.periode} enregistrée : ${d.balance.nbLignes} comptes`);
        } finally { setEnvoi(false); }
    };

    const modifierLigne = (i: number, champ: keyof Ligne, valeur: string) => {
        setLignes((ls) => ls.map((l, k) => {
            if (k !== i) return l;
            if (champ === "debit" || champ === "credit") return { ...l, [champ]: nombre(valeur), confiance: "haute" as const };
            return { ...l, [champ]: valeur, confiance: "haute" as const };
        }));
    };
    const supprimerLigne = (i: number) => setLignes((ls) => ls.filter((_, k) => k !== i));
    const ajouterLigne = () => setLignes((ls) => [...ls, { numero: "", intitule: "", debit: 0, credit: 0, confiance: "haute" }]);

    const supprimer = async (p: string) => {
        if (!window.confirm(`Supprimer la balance ${p} ? Les états financiers de cette période reviendront au journal d'écritures.`)) return;
        const r = await fetch(`/api/comptabilite/balance?clientId=${clientId}&periode=${p}`, { method: "DELETE" });
        if (r.ok) { toast.success("Balance supprimée"); setExistantes((x) => x.filter((b) => b.periode !== p)); }
        else toast.error("Suppression impossible");
    };

    const drag = (e: React.DragEvent, actif: boolean) => { e.preventDefault(); e.stopPropagation(); setDragActive(actif); };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="page-title">Import d&apos;une balance générale</h2>
                <p className="page-subtitle">Déposez la balance (Excel ou CSV) d&apos;un dossier : elle alimente directement le bilan, le compte de résultat, le TFT et la liasse SYSCOHADA de la période choisie.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Paramètres + dépôt */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="apix-card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Dossier client</span>
                            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
                                <option value="">Sélectionner un client…</option>
                                {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Période de clôture</span>
                            <input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm" />
                            <span className="block mt-1 text-[11px] text-muted-foreground">Balance annuelle : indiquez le mois de clôture (ex. décembre 2025).</span>
                        </label>
                    </div>

                    <div className="tabs-scroll flex gap-1 p-1 rounded-xl bg-muted/40 border border-border w-fit">
                        {([["fichier", "Fichier Excel / CSV", FileSpreadsheet], ["scan", "Balance scannée (PDF / image)", ScanLine]] as const).map(([k, l, I]) => (
                            <button key={k} type="button" onClick={() => { setMode(k); setFichier(null); setLignes([]); setRejets([]); setOcr(null); setColonnes(null); }} className={cn("inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-colors", mode === k ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted")}>
                                <I className="w-4 h-4" /> {l}
                            </button>
                        ))}
                    </div>

                    <div
                        onDragEnter={(e) => drag(e, true)} onDragOver={(e) => drag(e, true)} onDragLeave={(e) => drag(e, false)}
                        onDrop={(e) => { drag(e, false); const f = e.dataTransfer.files?.[0]; if (f) lireFichier(f); }}
                        className={cn("relative apix-card p-8 border-2 border-dashed text-center transition-colors", dragActive ? "border-primary bg-primary/5" : "border-border")}
                    >
                        <input type="file" accept={mode === "scan" ? ".pdf,.png,.jpg,.jpeg,.webp,.tif,.tiff" : ".xlsx,.xls,.csv"} onChange={(e) => { const f = e.target.files?.[0]; if (f) lireFichier(f); }} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Choisir un fichier de balance" />
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                            {ocrEnCours ? <Loader2 className="w-7 h-7 animate-spin" /> : fichier ? (mode === "scan" ? <ScanLine className="w-7 h-7" /> : <FileSpreadsheet className="w-7 h-7" />) : <UploadCloud className="w-7 h-7" />}
                        </div>
                        {fichier ? (
                            <>
                                <p className="font-bold">{fichier.name}</p>
                                <p className="text-xs text-muted-foreground">{(fichier.size / 1024).toFixed(1)} Ko · {ocrEnCours ? "lecture en cours (10 à 40 s)…" : `${lignes.length} comptes lus`}</p>
                                <button type="button" onClick={(e) => { e.preventDefault(); setFichier(null); setLignes([]); setRejets([]); setColonnes(null); }} className="relative z-10 mt-3 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-rose-600"><X className="w-3.5 h-3.5" /> Retirer</button>
                            </>
                        ) : (
                            <>
                                <p className="font-bold">Glissez la balance ici ou cliquez pour choisir</p>
                                <p className="text-xs text-muted-foreground mt-1">{mode === "scan" ? "PDF (natif ou scanné), PNG, JPEG · une balance imprimée nette et droite, 2 à 6 colonnes de montants" : "Excel (.xlsx, .xls) ou CSV · colonnes reconnues : Compte, Intitulé, Débit, Crédit (ou Solde débiteur / créditeur)"}</p>
                            </>
                        )}
                    </div>

                    {colonnes && (
                        <div className="text-xs text-muted-foreground px-1">
                            Colonnes reconnues :{" "}
                            {(["numero", "intitule", "debit", "credit", "soldeDebit", "soldeCredit", "solde"] as const).filter((k) => colonnes[k] >= 0).map((k) => (
                                <span key={k} className="inline-block mr-2 px-1.5 py-0.5 rounded bg-muted font-mono">{k} ← « {entete[colonnes[k]]} »</span>
                            ))}
                        </div>
                    )}

                    {ocr && (
                        <div className="apix-card p-4 text-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Lecture</p><p className="font-bold">{{ PDF_TABLEAU: "Tableau PDF", PDF_TEXTE: "Texte PDF", OCR_IMAGE: "OCR image", OCR_PDF_SCANNE: "OCR PDF scanné" }[ocr.origine] ?? ocr.origine}</p><p className="text-xs text-muted-foreground">{ocr.pages} page{ocr.pages > 1 ? "s" : ""} · {(ocr.dureeMs / 1000).toFixed(1)} s</p></div>
                            <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Confiance OCR</p><p className={cn("font-bold", ocr.confianceOCR == null ? "" : ocr.confianceOCR >= 85 ? "text-emerald-600" : ocr.confianceOCR >= 65 ? "text-amber-600" : "text-rose-600")}>{ocr.confianceOCR == null ? "n/a (texte natif)" : `${ocr.confianceOCR} %`}</p></div>
                            <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Colonnes</p><p className="font-bold">{{ "debit-credit": "Débit / Crédit", "debit-credit-solde": "Débit / Crédit / Solde", "mouvements-soldes": "Mouvements + soldes", "anouveaux-mouvements-soldes": "À-nouveaux + mouvements + soldes", "solde-signe": "Solde signé", inconnue: "Non déterminées" }[ocr.disposition] ?? ocr.disposition}</p></div>
                            <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Totaux imprimés</p><p className={cn("font-bold", ocr.controleTotaux === "concordant" ? "text-emerald-600" : ocr.controleTotaux === "ecart" ? "text-rose-600" : "")}>{ocr.controleTotaux === "concordant" ? "Concordants" : ocr.controleTotaux === "ecart" ? "Écart avec les lignes lues" : "Non trouvés"}</p>{ocr.totauxDetectes && <p className="text-xs text-muted-foreground tabular-nums">{ocr.totauxDetectes.debit.toLocaleString("fr-FR")} / {ocr.totauxDetectes.credit.toLocaleString("fr-FR")}</p>}</div>
                        </div>
                    )}

                    {rejets.length > 0 && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm">
                            <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {rejets.length} ligne{rejets.length > 1 ? "s" : ""} non retenue{rejets.length > 1 ? "s" : ""}</p>
                            <ul className="mt-2 list-disc pl-5 space-y-0.5 text-amber-800/90 dark:text-amber-200 max-h-40 overflow-auto">{rejets.slice(0, 20).map((r, i) => <li key={i}>{r}</li>)}</ul>
                        </div>
                    )}

                    {lignes.length > 0 && (
                        <div className="apix-card overflow-hidden">
                            <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-bold">Aperçu — {lignes.length} comptes</p>
                                    <p className="text-xs text-muted-foreground">Total débit {fcfa(totaux.debit)} · total crédit {fcfa(totaux.credit)}</p>
                                </div>
                                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", totaux.equilibree ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                                    {totaux.equilibree ? <><CheckCircle2 className="w-3.5 h-3.5" /> Balance équilibrée</> : <><AlertTriangle className="w-3.5 h-3.5" /> Écart {fcfa(totaux.ecart)}</>}
                                </span>
                            </div>
                            <div className="overflow-x-auto max-h-80">
                                <table className="apix-table w-full text-sm">
                                    <thead><tr><th className="text-left">Compte</th><th className="text-left">Intitulé</th><th className="text-right">Débit</th><th className="text-right">Crédit</th><th></th></tr></thead>
                                    <tbody>
                                        {lignes.slice(0, 300).map((l, i) => (
                                            <tr key={i} className={cn(l.confiance === "faible" && "bg-rose-50 dark:bg-rose-900/20", l.confiance === "moyenne" && "bg-amber-50 dark:bg-amber-900/20")} title={l.source}>
                                                <td className="font-mono"><input value={l.numero} onChange={(e) => modifierLigne(i, "numero", e.target.value)} className="w-24 bg-transparent border-b border-transparent focus:border-primary outline-none font-mono" aria-label="Compte" /></td>
                                                <td><input value={l.intitule} onChange={(e) => modifierLigne(i, "intitule", e.target.value)} className="w-full min-w-40 bg-transparent border-b border-transparent focus:border-primary outline-none" aria-label="Intitulé" /></td>
                                                <td className="text-right"><input value={l.debit ? l.debit.toLocaleString("fr-FR") : ""} onChange={(e) => modifierLigne(i, "debit", e.target.value)} inputMode="decimal" className="w-28 text-right tabular-nums bg-transparent border-b border-transparent focus:border-primary outline-none" aria-label="Débit" /></td>
                                                <td className="text-right"><input value={l.credit ? l.credit.toLocaleString("fr-FR") : ""} onChange={(e) => modifierLigne(i, "credit", e.target.value)} inputMode="decimal" className="w-28 text-right tabular-nums bg-transparent border-b border-transparent focus:border-primary outline-none" aria-label="Crédit" /></td>
                                                <td className="w-8 text-right"><button type="button" onClick={() => supprimerLigne(i)} className="p-1 text-muted-foreground hover:text-rose-600" aria-label="Supprimer la ligne"><X className="w-3.5 h-3.5" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {lignes.length > 300 && <p className="p-3 text-xs text-muted-foreground">… et {lignes.length - 300} autres comptes.</p>}
                                <div className="p-2 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                                    <button type="button" onClick={ajouterLigne} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary px-2 py-1"><Plus className="w-3.5 h-3.5" /> Ajouter un compte</button>
                                    {ocr && <p className="text-[11px] text-muted-foreground">Lignes <span className="px-1 rounded bg-amber-100 text-amber-800">ambre</span> : caractères corrigés (O→0, l→1), <span className="px-1 rounded bg-rose-100 text-rose-800">rouge</span> : montants incomplets — à vérifier. Survolez une ligne pour voir le texte lu.</p>}
                                </div>
                            </div>
                            <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                                {!totaux.equilibree && <p className="text-xs text-rose-600">La balance sera enregistrée telle quelle : l&apos;écart sera visible dans les contrôles du bilan.</p>}
                                <button onClick={enregistrer} disabled={envoi || !clientId} className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm">
                                    {envoi ? "Enregistrement…" : `Enregistrer la balance ${periode}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {resultat && (
                        <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 p-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Balance {resultat.periode} enregistrée ({resultat.nbLignes} comptes{resultat.equilibree ? "" : ", déséquilibrée"})</p>
                            <div className="flex gap-2">
                                <Link href={`/etats-financiers/bilan?clientId=${clientId}&periode=${resultat.periode}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold">Voir le bilan <ArrowRight className="w-3.5 h-3.5" /></Link>
                                <Link href={`/comptabilite/liasse-fiscale?clientId=${clientId}&periode=${resultat.periode}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-xs font-bold">Liasse fiscale</Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Balances déjà importées */}
                <div className="apix-card p-5">
                    <h3 className="font-bold mb-3">Balances enregistrées</h3>
                    {!clientId ? <p className="text-sm text-muted-foreground">Choisissez un dossier pour voir ses balances.</p>
                        : existantes.length === 0 ? <p className="text-sm text-muted-foreground">Aucune balance importée pour ce dossier. Les états financiers se calculent à partir du journal d&apos;écritures.</p>
                        : (
                            <ul className="divide-y divide-border">
                                {existantes.map((b) => (
                                    <li key={b.id} className="py-3 flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm">{b.periode} <span className={cn("ml-1 text-[11px] px-1.5 py-0.5 rounded-full", b.equilibree ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>{b.equilibree ? "équilibrée" : "écart"}</span></p>
                                            <p className="text-xs text-muted-foreground truncate">{b.nbLignes} comptes · {b.fichier || "saisie"} · {new Date(b.createdAt).toLocaleDateString("fr-FR")}{b.importedBy ? ` · ${b.importedBy.firstName}` : ""}</p>
                                            <Link href={`/etats-financiers/bilan?clientId=${clientId}&periode=${b.periode}`} className="text-xs font-bold text-primary">Bilan {b.periode} →</Link>
                                        </div>
                                        <button onClick={() => supprimer(b.periode)} className="p-1.5 text-muted-foreground hover:text-rose-600" title="Supprimer cette balance"><Trash2 className="w-4 h-4" /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                        <p><b>Priorité :</b> quand une balance existe pour une période, elle remplace le journal d&apos;écritures dans les états financiers de cette période.</p>
                        <p><b>Exercice N-1 :</b> importez aussi la balance de clôture précédente (ex. 2024-12) pour obtenir le comparatif N / N-1 et le TFT.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
