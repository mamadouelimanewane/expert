"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    Users,
    Wallet,
    ScrollText,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Landmark,
    Fingerprint,
    Trash2,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Guichet de création de société.
//
// Cette page simulait un assistant complet : un associé fixe « Mamadou
// Ouattara » apparaissait quel que soit le dossier, le curseur de capital
// n'était relié à rien (la barre latérale affichait toujours 1 000 000 XOF),
// quatre documents « Générés par IA » (Statuts, DSV, Acte de Nomination,
// Bénéficiaires effectifs) affichaient un statut Ready/Draft/Pending fabriqué
// sans qu'aucune génération n'ait eu lieu, et l'étape finale
// (« finalization ») n'avait tout simplement aucun rendu JSX : le bouton
// « Finaliser le Dossier » menait à un écran vide. Aucun appel réseau
// n'existait dans le fichier.
//
// Cette version : associés réellement ajoutables, capital et valeur nominale
// calculés depuis l'état réel, projet de statuts rédigé via /api/nexus/chat
// (le même point d'entrée IA honnête utilisé ailleurs dans l'application,
// qui répond explicitement si aucune clé n'est configurée), et une
// finalisation qui crée réellement le client via POST /api/clients.
// ─────────────────────────────────────────────────────────────────────────────

type Step = "project" | "partners" | "capital" | "documents" | "finalization";

type Partner = { id: string; name: string; role: string; percent: number };

const COMPANY_FORMS = [
    { id: "sarl", label: "SARL", desc: "Société à Responsabilité Limitée", minCapital: 1_000_000 },
    { id: "sas", label: "SAS", desc: "Société par Actions Simplifiée", minCapital: 10_000_000 },
    { id: "sa", label: "SA", desc: "Société Anonyme", minCapital: 10_000_000 },
    { id: "suarl", label: "SUARL", desc: "SARL Unipersonnelle", minCapital: 1_000_000 },
];

const PAYS = [
    { code: "CI", label: "Côte d'Ivoire" },
    { code: "SN", label: "Sénégal" },
    { code: "BJ", label: "Bénin" },
    { code: "TG", label: "Togo" },
    { code: "ML", label: "Mali" },
    { code: "BF", label: "Burkina Faso" },
    { code: "NE", label: "Niger" },
    { code: "GW", label: "Guinée-Bissau" },
];

const STEPS: Step[] = ["project", "partners", "capital", "documents", "finalization"];
const STEP_LABELS = ["Identité", "Associés", "Apports", "Statuts", "Dépôt"];

export default function CreationMissionPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("project");
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        form: "sarl",
        country: "CI",
        activity: "",
        email: "",
        phone: "",
        partners: [] as Partner[],
        capital: 1_000_000,
    });

    const [nouvelAssocie, setNouvelAssocie] = useState({ name: "", role: "Gérant", percent: 100 });

    const [statuts, setStatuts] = useState<string | null>(null);
    const [statutsChargement, setStatutsChargement] = useState(false);
    const [statutsErreur, setStatutsErreur] = useState<string | null>(null);

    const [clientCree, setClientCree] = useState<{ id: string; nom: string } | null>(null);

    const formeChoisie = COMPANY_FORMS.find((f) => f.id === formData.form) ?? COMPANY_FORMS[0];
    const valeurNominale = 10_000;
    const nombreParts = Math.floor(formData.capital / valeurNominale);
    const totalParts = formData.partners.reduce((s, p) => s + p.percent, 0);

    const currentIdx = STEPS.indexOf(step);

    const ajouterAssocie = () => {
        if (!nouvelAssocie.name.trim()) return;
        setFormData({
            ...formData,
            partners: [...formData.partners, { id: crypto.randomUUID(), ...nouvelAssocie }],
        });
        setNouvelAssocie({ name: "", role: "Associé", percent: 0 });
    };

    const supprimerAssocie = (id: string) => {
        setFormData({ ...formData, partners: formData.partners.filter((p) => p.id !== id) });
    };

    const genererStatuts = async () => {
        setStatutsChargement(true);
        setStatutsErreur(null);
        try {
            const associesTexte = formData.partners.length
                ? formData.partners.map((p) => `${p.name} (${p.role}, ${p.percent}%)`).join(", ")
                : "[à compléter]";
            const prompt = `Rédige un projet de statuts pour une société ${formeChoisie.label} nommée "${formData.name || "[à compléter]"}", objet social : ${formData.activity || "[à compléter]"}, capital social de ${formData.capital.toLocaleString("fr-FR")} XOF divisé en ${nombreParts} parts de ${valeurNominale.toLocaleString("fr-FR")} XOF, associés : ${associesTexte}. Utilise la mention [à compléter] pour toute information manquante. Ceci est un projet à faire relire par un professionnel, pas un acte définitif.`;
            const res = await fetch("/api/nexus/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: prompt }),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatutsErreur(data.error || "La génération a échoué.");
                return;
            }
            setStatuts(data.reponse || data.response || null);
        } catch {
            setStatutsErreur("Impossible de contacter le service de rédaction.");
        } finally {
            setStatutsChargement(false);
        }
    };

    const finaliser = async () => {
        setLoading(true);
        setErreur(null);
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "ENTREPRISE",
                    companyName: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    sector: formData.activity || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErreur(data.error || "La création du dossier a échoué.");
                return;
            }
            setClientCree({ id: data.client?.id ?? data.id, nom: formData.name });
        } catch {
            setErreur("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === "project") setStep("partners");
        else if (step === "partners") setStep("capital");
        else if (step === "capital") setStep("documents");
        else if (step === "documents") setStep("finalization");
    };

    const peutAvancer =
        step !== "project" ||
        (formData.name.trim().length > 0 && formData.email.trim().length > 0 && formData.phone.trim().length > 0);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        Mission Juridique
                    </div>
                    <h1 className="page-title-dark flex items-center gap-4">
                        <Building2 className="w-10 h-10 text-primary" />
                        Guichet de Création
                    </h1>
                    <p className="page-subtitle-dark max-w-2xl">
                        Constitution de sociétés en zone OHADA : identité, associés, capital et projet de statuts.
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="w-full bg-[#13161c] border border-white/5 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-800 -z-0" />
                {STEP_LABELS.map((label, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2 bg-[#13161c] px-4">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2",
                                    isCompleted
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : isCurrent
                                          ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(0, 107, 63,0.5)]"
                                          : "bg-slate-900 border-slate-700 text-slate-500"
                                )}
                            >
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-bold uppercase tracking-wider",
                                    isCurrent ? "text-white" : isCompleted ? "text-emerald-400" : "text-slate-600"
                                )}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {step === "project" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Fingerprint className="w-6 h-6 text-primary" />
                                    Identité de la Société
                                </h2>
                                <p className="text-slate-400">Définissez la forme juridique et les caractéristiques principales.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {COMPANY_FORMS.map((form) => (
                                    <div
                                        key={form.id}
                                        onClick={() => setFormData({ ...formData, form: form.id, capital: Math.max(formData.capital, form.minCapital) })}
                                        className={cn(
                                            "cursor-pointer p-4 rounded-xl border transition-all hover:scale-[1.02]",
                                            formData.form === form.id
                                                ? "bg-primary/20 border-primary ring-1 ring-primary"
                                                : "bg-slate-800/30 border-white/5 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-black text-lg text-white">{form.label}</span>
                                            {formData.form === form.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{form.desc}</p>
                                        <div className="inline-block px-2 py-1 bg-slate-950 rounded text-[10px] text-slate-500 font-mono">
                                            Min: {form.minCapital.toLocaleString("fr-FR")} XOF
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Dénomination Sociale</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: GLOBAL TECH SOLUTIONS"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-300">Pays</label>
                                        <select
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        >
                                            {PAYS.map((p) => (
                                                <option key={p.code} value={p.code}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-300">Téléphone du contact</label>
                                        <input
                                            type="tel"
                                            placeholder="Ex: +225 07 00 00 00 00"
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Email du contact</label>
                                    <input
                                        type="email"
                                        placeholder="Ex: contact@societe.com"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Objet Social (Résumé)</label>
                                    <textarea
                                        placeholder="Ex: Conseil en informatique, développement de logiciels..."
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors h-32 resize-none"
                                        value={formData.activity}
                                        onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "partners" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Users className="w-6 h-6 text-primary" />
                                    Associés & Dirigeants
                                </h2>
                                <p className="text-slate-400">Ajoutez les personnes physiques ou morales participant au capital.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                <input
                                    type="text"
                                    placeholder="Nom complet"
                                    className="bg-slate-900 border border-white/10 rounded-lg p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
                                    value={nouvelAssocie.name}
                                    onChange={(e) => setNouvelAssocie({ ...nouvelAssocie, name: e.target.value })}
                                />
                                <select
                                    className="bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                    value={nouvelAssocie.role}
                                    onChange={(e) => setNouvelAssocie({ ...nouvelAssocie, role: e.target.value })}
                                >
                                    <option>Gérant</option>
                                    <option>Associé</option>
                                    <option>Président</option>
                                    <option>Administrateur</option>
                                </select>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="%"
                                    className="w-24 bg-slate-900 border border-white/10 rounded-lg p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
                                    value={nouvelAssocie.percent}
                                    onChange={(e) => setNouvelAssocie({ ...nouvelAssocie, percent: Number(e.target.value) })}
                                />
                                <button
                                    onClick={ajouterAssocie}
                                    className="px-4 py-2 bg-primary hover:brightness-110 text-white rounded-lg font-bold transition-colors"
                                >
                                    Ajouter
                                </button>
                            </div>

                            {formData.partners.length === 0 ? (
                                <p className="text-center text-sm text-slate-500 py-6">Aucun associé ajouté pour l&apos;instant.</p>
                            ) : (
                                <div className="space-y-2">
                                    {formData.partners.map((p) => (
                                        <div key={p.id} className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                                {p.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-white">{p.name}</p>
                                                <p className="text-xs text-slate-500">{p.role} • {p.percent}% des parts</p>
                                            </div>
                                            <button onClick={() => supprimerAssocie(p.id)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {totalParts !== 100 && (
                                        <p className="text-xs text-amber-400">Total des parts : {totalParts}% (devrait être 100%).</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === "capital" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Landmark className="w-6 h-6 text-primary" />
                                    Capital & Dépôt
                                </h2>
                                <p className="text-slate-400">Configuration du capital social. Le dépôt réel s&apos;effectue auprès d&apos;un notaire ou d&apos;une banque.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4 p-6 bg-slate-950 rounded-2xl border border-white/5">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Montant du Capital</label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">{formData.capital.toLocaleString("fr-FR")}</span>
                                        <span className="text-xl font-bold text-slate-500">FCFA</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="w-full accent-primary"
                                        min={formeChoisie.minCapital}
                                        max={100_000_000}
                                        step={100_000}
                                        value={formData.capital}
                                        onChange={(e) => setFormData({ ...formData, capital: Number(e.target.value) })}
                                    />
                                    <p
                                        className={cn(
                                            "text-xs flex items-center gap-2",
                                            formData.capital >= formeChoisie.minCapital ? "text-emerald-400" : "text-red-400"
                                        )}
                                    >
                                        <CheckCircle2 className="w-3 h-3" />
                                        {formData.capital >= formeChoisie.minCapital
                                            ? `Minimum légal respecté (${formeChoisie.label})`
                                            : `En dessous du minimum légal (${formeChoisie.minCapital.toLocaleString("fr-FR")} XOF)`}
                                    </p>
                                </div>

                                <div className="space-y-4 p-6 bg-slate-950 rounded-2xl border border-white/5">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Valeur Nominale</label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">{valeurNominale.toLocaleString("fr-FR")}</span>
                                        <span className="text-xl font-bold text-slate-500">FCFA / part</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400 pt-4 border-t border-white/5">
                                        <span>Nombre de parts :</span>
                                        <span className="font-bold text-white">{nombreParts}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-lg">
                                    <Wallet className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Attestation de Dépôt de Capital</h4>
                                    <p className="text-sm text-slate-400">
                                        Le dépôt effectif du capital doit être réalisé auprès d&apos;un notaire ou d&apos;une banque ; aucune intégration automatisée n&apos;existe ici.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "documents" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <ScrollText className="w-6 h-6 text-primary" />
                                    Projet de Statuts
                                </h2>
                                <p className="text-slate-400">
                                    Génère un projet de statuts à partir des informations saisies, à faire relire et compléter par un professionnel — ce n&apos;est pas un acte définitif.
                                </p>
                            </div>

                            <button
                                onClick={genererStatuts}
                                disabled={statutsChargement}
                                className="px-6 py-3 bg-primary hover:brightness-110 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                            >
                                {statutsChargement ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Rédaction en cours...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" /> Générer le projet de statuts
                                    </>
                                )}
                            </button>

                            {statutsErreur && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">{statutsErreur}</p>
                            )}

                            {statuts && (
                                <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
                                    {statuts}
                                </div>
                            )}
                        </div>
                    )}

                    {step === "finalization" && (
                        <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                    Finalisation
                                </h2>
                                <p className="text-slate-400">Créer le dossier client à partir des informations saisies.</p>
                            </div>

                            {erreur && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">{erreur}</p>
                            )}

                            {clientCree ? (
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4">
                                    <p className="text-emerald-300 font-bold flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> Dossier créé pour {clientCree.nom}
                                    </p>
                                    <button
                                        onClick={() => router.push(`/clients/${clientCree.id}`)}
                                        className="px-6 py-3 bg-primary hover:brightness-110 text-white rounded-xl font-bold transition-all"
                                    >
                                        Ouvrir le dossier client
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={finaliser}
                                    disabled={loading}
                                    className="px-8 py-3 bg-primary hover:brightness-110 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Création en cours...
                                        </>
                                    ) : (
                                        <>Créer le dossier client <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {step !== "finalization" && (
                        <div className="flex justify-between pt-6">
                            {step !== "project" && (
                                <button
                                    onClick={() => {
                                        if (step === "partners") setStep("project");
                                        if (step === "capital") setStep("partners");
                                        if (step === "documents") setStep("capital");
                                    }}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                >
                                    Retour
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={!peutAvancer}
                                className="ml-auto px-8 py-3 bg-primary hover:brightness-110 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
                            >
                                {step === "documents" ? "Finaliser le Dossier" : "Étape Suivante"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-white/10 sticky top-8">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            Récapitulatif
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Forme</span>
                                <span className="font-bold text-white uppercase">{formData.form}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Pays</span>
                                <span className="font-bold text-white">
                                    {PAYS.find((p) => p.code === formData.country)?.label ?? formData.country}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Capital</span>
                                <span className="font-bold text-emerald-400">{formData.capital.toLocaleString("fr-FR")} XOF</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Associés</span>
                                <span className="font-bold text-white">{formData.partners.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
