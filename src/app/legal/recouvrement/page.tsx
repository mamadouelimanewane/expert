"use client";

import { useState, useCallback } from "react";
import {
    Scale,
    FileText,
    Calculator,
    Calendar,
    Clock,
    PlusCircle,
    Trash2,
    Copy,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequeteIPParams, RequeteIPResult, PieceJustificativeIP, DelaisProcedurauxIP } from "@/lib/ohada/recouvrement-aupsrve";

const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

export default function RecouvrementAUPSRVEPage() {
    const [juridiction, setJuridiction] = useState("Tribunal de Commerce Hors Classe de Dakar");
    const [ville, setVille] = useState("Dakar");

    // Créancier
    const [creancierNom, setCreancierNom] = useState("Cabinet 360 Conseils SARL");
    const [creancierForme, setCreancierForme] = useState("SARL");
    const [creancierRccm, setCreancierRccm] = useState("SN-DKR-2022-B-1234");
    const [creancierAdresse, setCreancierAdresse] = useState("Almadies Zone 4");
    const [creancierVille, setCreancierVille] = useState("Dakar");
    const [creancierPays, setCreancierPays] = useState("Sénégal");
    const [creancierRep, setCreancierRep] = useState("Monsieur le Gérant");

    // Débiteur
    const [debiteurNom, setDebiteurNom] = useState("Société Commerciale Ouest-Africaine SA");
    const [debiteurForme, setDebiteurForme] = useState("SA");
    const [debiteurRccm, setDebiteurRccm] = useState("SN-DKR-2020-B-5678");
    const [debiteurAdresse, setDebiteurAdresse] = useState("Boulevard de la République");
    const [debiteurVille, setDebiteurVille] = useState("Dakar");
    const [debiteurPays, setDebiteurPays] = useState("Sénégal");

    // Créance
    const [creancePrincipale, setCreancePrincipale] = useState(12_500_000);
    const [tauxInteretLegal, setTauxInteretLegal] = useState(5.5);
    const [dateExigibilite, setDateExigibilite] = useState("2026-01-15");
    const [dateRequete, setDateRequete] = useState(new Date().toISOString().split("T")[0]);
    const [fraisPoursuite, setFraisPoursuite] = useState(200_000);
    const [natureCreance, setNatureCreance] = useState("Factures de révision comptable et assistance fiscale impayées");
    const [miseEnDemeureDate, setMiseEnDemeureDate] = useState("2026-03-01");
    const [miseEnDemeureHuissier, setMiseEnDemeureHuissier] = useState("Maître Babacar Diop, Huissier de Justice");

    // Pièces justificatives
    const [pieces, setPieces] = useState<PieceJustificativeIP[]>([
        {
            numero: 1,
            description: "Contrat de mission signé",
            referencePiece: "CM-2025-04",
            datePiece: "2025-01-10",
        },
        {
            numero: 2,
            description: "Facture impayée N° 2025-F-102",
            referencePiece: "FAC-102",
            datePiece: "2025-12-15",
            montantPiece: 12_500_000,
        },
    ]);

    // Délais significations calculés
    const [dateSignifTest, setDateSignifTest] = useState(new Date().toISOString().split("T")[0]);
    const [delaisCalcul, setDelaisCalcul] = useState<DelaisProcedurauxIP | null>(null);

    const [loading, setLoading] = useState(false);
    const [resultat, setResultat] = useState<RequeteIPResult | null>(null);
    const [error, setError] = useState("");
    const [copie, setCopie] = useState(false);

    const ajouterPiece = () => {
        setPieces(prev => [
            ...prev,
            {
                numero: prev.length + 1,
                description: "",
                referencePiece: "",
                datePiece: new Date().toISOString().split("T")[0],
            }
        ]);
    };

    const majPiece = (index: number, field: keyof PieceJustificativeIP, value: string | number) => {
        setPieces(prev => prev.map((p, idx) => idx === index ? { ...p, [field]: value } : p));
    };

    const supprimerPiece = (index: number) => {
        setPieces(prev => prev.filter((_, idx) => idx !== index).map((p, i) => ({ ...p, numero: i + 1 })));
    };

    const genererRequete = useCallback(async () => {
        setLoading(true);
        setError("");
        setResultat(null);

        const params: RequeteIPParams = {
            juridiction,
            ville,
            creancier: {
                denominationOuNom: creancierNom,
                formeJuridique: creancierForme,
                rccmOuNinea: creancierRccm,
                adresse: creancierAdresse,
                ville: creancierVille,
                pays: creancierPays,
                representantLegal: creancierRep,
            },
            debiteur: {
                denominationOuNom: debiteurNom,
                formeJuridique: debiteurForme,
                rccmOuNinea: debiteurRccm,
                adresse: debiteurAdresse,
                ville: debiteurVille,
                pays: debiteurPays,
            },
            creancePrincipale,
            tauxInteretLegalAnnuel: tauxInteretLegal,
            dateExigibilite,
            dateRequete,
            fraisPoursuiteEstimes: fraisPoursuite,
            natureCreance,
            miseEnDemeureDate: miseEnDemeureDate || undefined,
            miseEnDemeureHuissier: miseEnDemeureHuissier || undefined,
            piecesJustificatives: pieces,
        };

        try {
            const res = await fetch("/api/legal/recouvrement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur de génération");
            setResultat(data.resultat);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setLoading(false);
        }
    }, [juridiction, ville, creancierNom, creancierForme, creancierRccm, creancierAdresse, creancierVille, creancierPays, creancierRep, debiteurNom, debiteurForme, debiteurRccm, debiteurAdresse, debiteurVille, debiteurPays, creancePrincipale, tauxInteretLegal, dateExigibilite, dateRequete, fraisPoursuite, natureCreance, miseEnDemeureDate, miseEnDemeureHuissier, pieces]);

    const calculerDelais = async () => {
        try {
            const res = await fetch(`/api/legal/recouvrement?dateSignification=${dateSignifTest}`);
            const data = await res.json();
            if (data.ok) setDelaisCalcul(data.delais);
        } catch {}
    };

    const copierTexte = (texte: string) => {
        navigator.clipboard.writeText(texte);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="page-title text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Scale className="w-6 h-6 text-primary" />
                    Recouvrement & Injonction de Payer (AUPSRVE)
                </h1>
                <p className="page-subtitle text-xs text-muted-foreground mt-1">
                    Procédure simplifiée de recouvrement de créances certaines, liquides et exigibles conformément à l&apos;Acte Uniforme OHADA révisé.
                </p>
            </div>

            {/* Simulateur de délais légaux */}
            <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    Calculateur de Délais de Procédure (Signification d&apos;ordonnance)
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                        <label className="block text-muted-foreground mb-1 font-medium">Date de signification par huissier</label>
                        <input
                            type="date"
                            value={dateSignifTest}
                            onChange={(e) => setDateSignifTest(e.target.value)}
                            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                        />
                    </div>
                    <button
                        onClick={calculerDelais}
                        type="button"
                        className="mt-5 bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg text-xs font-medium border border-border"
                    >
                        Calculer les échéances
                    </button>
                    {delaisCalcul && (
                        <div className="flex flex-wrap gap-3 mt-5 text-xs">
                            <span className="px-3 py-1 bg-amber-950/50 border border-amber-800 text-amber-300 rounded-lg">
                                ⏳ Fin délai opposition (15j) : <strong>{delaisCalcul.dateLimiteOpposition}</strong>
                            </span>
                            <span className="px-3 py-1 bg-red-950/50 border border-red-800 text-red-300 rounded-lg">
                                ⛔ Caducité ordonnance (3 mois) : <strong>{delaisCalcul.dateCaduciteOrdonnance}</strong>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Formulaire des parties & de la créance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Juridiction & Créancier */}
                <div className="space-y-6">
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                            Juridiction Compétente
                        </h2>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <label className="block text-muted-foreground mb-1 font-medium">Intitulé du Tribunal</label>
                                <input
                                    type="text"
                                    value={juridiction}
                                    onChange={(e) => setJuridiction(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Ville de la juridiction</label>
                                <input
                                    type="text"
                                    value={ville}
                                    onChange={(e) => setVille(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Date de la requête</label>
                                <input
                                    type="date"
                                    value={dateRequete}
                                    onChange={(e) => setDateRequete(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                            Créancier (Requérant)
                        </h2>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <label className="block text-muted-foreground mb-1 font-medium">Dénomination sociale</label>
                                <input
                                    type="text"
                                    value={creancierNom}
                                    onChange={(e) => setCreancierNom(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Forme juridique</label>
                                <input
                                    type="text"
                                    value={creancierForme}
                                    onChange={(e) => setCreancierForme(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">RCCM / NINEA</label>
                                <input
                                    type="text"
                                    value={creancierRccm}
                                    onChange={(e) => setCreancierRccm(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-muted-foreground mb-1 font-medium">Adresse & Ville</label>
                                <input
                                    type="text"
                                    value={creancierAdresse}
                                    onChange={(e) => setCreancierAdresse(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Débiteur & Montants */}
                <div className="space-y-6">
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                            Débiteur Poursuivi
                        </h2>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <label className="block text-muted-foreground mb-1 font-medium">Nom / Raison sociale</label>
                                <input
                                    type="text"
                                    value={debiteurNom}
                                    onChange={(e) => setDebiteurNom(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Forme juridique</label>
                                <input
                                    type="text"
                                    value={debiteurForme}
                                    onChange={(e) => setDebiteurForme(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">RCCM (si connu)</label>
                                <input
                                    type="text"
                                    value={debiteurRccm}
                                    onChange={(e) => setDebiteurRccm(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-muted-foreground mb-1 font-medium">Adresse & Ville</label>
                                <input
                                    type="text"
                                    value={debiteurAdresse}
                                    onChange={(e) => setDebiteurAdresse(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">4</span>
                            Créance & Intérêts Légaux
                        </h2>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Principal (FCFA)</label>
                                <input
                                    type="number"
                                    value={creancePrincipale}
                                    onChange={(e) => setCreancePrincipale(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Taux intérêt (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={tauxInteretLegal}
                                    onChange={(e) => setTauxInteretLegal(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Date exigibilité</label>
                                <input
                                    type="date"
                                    value={dateExigibilite}
                                    onChange={(e) => setDateExigibilite(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-muted-foreground mb-1 font-medium">Frais prévisionnels huissier / greffe</label>
                                <input
                                    type="number"
                                    value={fraisPoursuite}
                                    onChange={(e) => setFraisPoursuite(Number(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pièces Justificatives */}
            <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Bordereau des Pièces Justificatives (art. 4 AUPSRVE)
                    </h2>
                    <button
                        onClick={ajouterPiece}
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                    >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Ajouter une pièce
                    </button>
                </div>

                <div className="space-y-2">
                    {pieces.map((p, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-background/50 border border-border p-2 rounded-lg text-xs">
                            <div className="col-span-1 text-center font-bold text-muted-foreground">#{p.numero}</div>
                            <div className="col-span-5">
                                <input
                                    type="text"
                                    placeholder="Description de la pièce"
                                    value={p.description}
                                    onChange={(e) => majPiece(idx, "description", e.target.value)}
                                    className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                                />
                            </div>
                            <div className="col-span-3">
                                <input
                                    type="text"
                                    placeholder="Référence pièce"
                                    value={p.referencePiece}
                                    onChange={(e) => majPiece(idx, "referencePiece", e.target.value)}
                                    className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                                />
                            </div>
                            <div className="col-span-2">
                                <input
                                    type="date"
                                    value={p.datePiece}
                                    onChange={(e) => majPiece(idx, "datePiece", e.target.value)}
                                    className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                                />
                            </div>
                            <div className="col-span-1 text-center">
                                <button
                                    type="button"
                                    onClick={() => supprimerPiece(idx)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bouton de génération */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={genererRequete}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
                    Générer la Requête & Ordonnance d&apos;Injonction de Payer
                </button>
                {error && <span className="text-xs text-red-400">{error}</span>}
            </div>

            {/* Résultat */}
            {resultat && (
                <div className="space-y-6 pt-4 border-t border-border">
                    {/* Totaux & Décompte */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Créance Principale</span>
                            <p className="text-xl font-bold text-foreground mt-1">{f(resultat.creancePrincipale)}</p>
                        </div>
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Intérêts ({resultat.nombreJoursRetard} j)</span>
                            <p className="text-xl font-bold text-amber-400 mt-1">{f(resultat.interetsCalcules)}</p>
                        </div>
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Frais de poursuite</span>
                            <p className="text-xl font-bold text-foreground mt-1">{f(resultat.fraisPoursuiteEstimes)}</p>
                        </div>
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Total Réclamé</span>
                            <p className="text-xl font-bold text-emerald-400 mt-1">{f(resultat.totalReclame)}</p>
                        </div>
                    </div>

                    {/* Actes Générés */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Requête */}
                        <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    Texte de la Requête au Président
                                </h3>
                                <button
                                    onClick={() => copierTexte(resultat.texteRequete)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copie ? "Copié !" : "Copier"}
                                </button>
                            </div>
                            <pre className="p-3 bg-background border border-border rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                                {resultat.texteRequete}
                            </pre>
                        </div>

                        {/* Projet d'ordonnance */}
                        <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    Projet d&apos;Ordonnance d&apos;Injonction
                                </h3>
                                <button
                                    onClick={() => copierTexte(resultat.projetOrdonnance)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copie ? "Copié !" : "Copier"}
                                </button>
                            </div>
                            <pre className="p-3 bg-background border border-border rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                                {resultat.projetOrdonnance}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
