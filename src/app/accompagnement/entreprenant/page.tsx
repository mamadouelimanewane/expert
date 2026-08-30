"use client";

import { useState } from "react";
import { FolderPlus, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Le tracker à 3 étapes affichait l'étape 1 "terminée" et l'étape 2 "active"
// dès le chargement de la page, quel que soit l'état réel d'un dossier — une
// progression fictive avant même toute saisie. Le bouton "Générer la
// Déclaration" n'avait aucun gestionnaire. L'étape 1 (identification) crée
// désormais réellement un client via POST /api/clients ; les étapes 2 et 3
// (formulaires RCCM, immatriculation NINEA) n'ont pas d'automatisation dans
// l'application et restent donc marquées comme non démarrées.
// ─────────────────────────────────────────────────────────────────────────────

export default function EntreprenantPage() {
    const [nom, setNom] = useState("");
    const [activite, setActivite] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [creation, setCreation] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);
    const [clientCree, setClientCree] = useState(false);

    const soumettre = async () => {
        if (!nom.trim() || !phone.trim() || !email.trim()) {
            setErreur("Nom, téléphone et email sont requis.");
            return;
        }
        setCreation(true);
        setErreur(null);
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "ENTREPRISE",
                    companyName: nom,
                    sector: activite || undefined,
                    phone,
                    email,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErreur(data.error || "La création du dossier a échoué.");
                return;
            }
            setClientCree(true);
        } catch {
            setErreur("Impossible de contacter le serveur.");
        } finally {
            setCreation(false);
        }
    };

    const steps = [
        { step: "1", title: "Identification", desc: "Recueil des pièces d'identité et description de l'activité.", done: clientCree, active: true },
        { step: "2", title: "Dossier RCCM", desc: "Formulaires pour le greffe — à préparer manuellement, non automatisé.", done: false, active: clientCree },
        { step: "3", title: "Immatriculation", desc: "Réception du numéro NINEA/RCCM et déclaration d'existence fiscale.", done: false, active: false },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                        <FolderPlus className="w-6 h-6" />
                    </div>
                    <h1 className="page-title">Statut de l&apos;Entreprenant OHADA</h1>
                </div>
                <p className="page-subtitle">Accompagnez les acteurs de l&apos;informel vers la formalisation.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((s, i) => (
                    <div key={i} className={`glass-card p-6 rounded-3xl border relative overflow-hidden transition-all ${s.active ? (s.done ? 'border-emerald-500/50' : 'border-primary/50 ring-2 ring-primary/20') : 'border-border/30 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${s.done ? 'bg-emerald-500 text-white' : s.active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                {s.done ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                ))}
            </div>

            <div className="apix-card">
                <h2 className="text-xl font-bold mb-6">Nouveau Dossier Client</h2>

                {erreur && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 max-w-lg">{erreur}</p>}

                {clientCree ? (
                    <p className="text-emerald-400 font-bold flex items-center gap-2 max-w-lg">
                        <CheckCircle2 className="w-5 h-5" /> Dossier client créé. Les formulaires RCCM restent à préparer manuellement.
                    </p>
                ) : (
                    <div className="space-y-4 max-w-lg">
                        <div>
                            <label className="text-sm font-bold text-muted-foreground mb-1 block">Nom ou Dénomination Commerciale</label>
                            <input value={nom} onChange={(e) => setNom(e.target.value)} type="text" className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Chez Fatou Restauration" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-muted-foreground mb-1 block">Activité Principale</label>
                            <input value={activite} onChange={(e) => setActivite(e.target.value)} type="text" className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Commerce de détail" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-muted-foreground mb-1 block">Téléphone</label>
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-muted-foreground mb-1 block">Email</label>
                                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                        </div>
                        <button onClick={soumettre} disabled={creation} className="flex items-center justify-center gap-2 w-full bg-primary hover:brightness-110 disabled:opacity-50 text-white rounded-xl py-3 font-bold mt-6 transition-colors">
                            {creation ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Créer le Dossier <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
