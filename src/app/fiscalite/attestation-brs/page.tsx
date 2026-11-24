"use client";

import { useState, useCallback, useEffect } from "react";
import type { DonneesCertificatBRS } from "@/lib/ohada/attestation-brs";
import {
    FileCheck2, Plus, Trash2, Printer, CheckCircle2,
    AlertCircle, ShieldCheck, Hash, Building2, UserCheck, Calendar
} from "lucide-react";

interface FactureInput {
    numeroFacture: string;
    dateFacture: string;
    description: string;
    montantBrutHT: number | "";
    tauxRetenue?: number;
}

interface AttestationItem {
    id: string;
    numeroCertificat: string;
    dateEmission: string;
    fileUrl: string;
    metadata?: {
        typeRetenue?: string;
        totalRetenu?: number;
        totalBrutHT?: number;
        beneficiaire?: string;
        cleControle?: string;
    };
}

export default function AttestationBRSPage() {
    const [clientId, setClientId] = useState("");
    const [pays, setPays] = useState<"" | "sn" | "ci" | "cm" | "bj">("");
    const [typeRetenue, setTypeRetenue] = useState<string>("");

    // Bénéficiaire
    const [beneficiaireNom, setBeneficiaireNom] = useState("");
    const [beneficiaireIdentifiant, setBeneficiaireIdentifiant] = useState("");
    const [beneficiaireAdresse, setBeneficiaireAdresse] = useState("");
    const [beneficiaireVille, setBeneficiaireVille] = useState("");
    const [beneficiairePays, setBeneficiairePays] = useState("");

    // Signataire
    const [signataireNom, setSignataireNom] = useState("");
    const [signataireQualite, setSignataireQualite] = useState("");

    // Factures
    const [factures, setFactures] = useState<FactureInput[]>([]);

    // État
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successCertificat, setSuccessCertificat] = useState<(DonneesCertificatBRS & { documentUrl?: string }) | null>(null);
    const [historique, setHistorique] = useState<AttestationItem[]>([]);
    const [loadingHisto, setLoadingHisto] = useState(false);

    const chargerHistorique = useCallback(async (cId: string) => {
        if (!cId.trim()) return;
        setLoadingHisto(true);
        try {
            const res = await fetch(`/api/fiscalite/attestation-brs?clientId=${encodeURIComponent(cId)}`);
            const data = await res.json();
            if (res.ok && data.attestations) {
                setHistorique(data.attestations);
            }
        } catch {
            // Ignorer silencieusement pour l'historique
        } finally {
            setLoadingHisto(false);
        }
    }, []);

    useEffect(() => {
        if (clientId.trim().length >= 12) {
            chargerHistorique(clientId.trim());
        }
    }, [clientId, chargerHistorique]);

    const ajouterFacture = () => {
        setFactures([
            ...factures,
            {
                numeroFacture: "",
                dateFacture: "",
                description: "",
                montantBrutHT: "",
            },
        ]);
    };

    const supprimerFacture = (index: number) => {
        if (factures.length === 1) return;
        setFactures(factures.filter((_, i) => i !== index));
    };

    const modifierFacture = (index: number, champ: keyof FactureInput, val: string | number) => {
        const copy = [...factures];
        copy[index] = { ...copy[index], [champ]: val } as FactureInput;
        setFactures(copy);
    };

    const totalFacturesBrut = factures.reduce((sum, f) => sum + (Number(f.montantBrutHT) || 0), 0);

    const genererAttestation = async () => {
        if (!clientId.trim()) {
            setError("Veuillez saisir un identifiant client (MongoDB ObjectId).");
            return;
        }
        if (!pays || !typeRetenue || !beneficiaireNom.trim() || !beneficiaireIdentifiant.trim() || !beneficiaireAdresse.trim() || !beneficiaireVille.trim() || !beneficiairePays.trim() || !signataireNom.trim() || !signataireQualite.trim()) {
            setError("Choisissez le pays et la retenue, puis renseignez les coordonnées du prestataire et du signataire.");
            return;
        }
        if (factures.length === 0 || factures.some((f) => !f.numeroFacture.trim() || !f.dateFacture || !f.description.trim() || typeof f.montantBrutHT !== "number" || !Number.isFinite(f.montantBrutHT) || f.montantBrutHT <= 0)) {
            setError("Ajoutez au moins une facture réelle avec numéro, date, description et montant HT supérieur à zéro.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccessCertificat(null);

        try {
            const res = await fetch("/api/fiscalite/attestation-brs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: clientId.trim(),
                    pays,
                    typeRetenue,
                    beneficiaire: {
                        raisonSociale: beneficiaireNom,
                        identifiantFiscal: beneficiaireIdentifiant,
                        adresse: beneficiaireAdresse,
                        ville: beneficiaireVille,
                        pays: beneficiairePays,
                    },
                    factures: factures.map((f) => ({
                        numeroFacture: f.numeroFacture,
                        dateFacture: f.dateFacture,
                        description: f.description,
                        montantBrutHT: Number(f.montantBrutHT),
                        ...(f.tauxRetenue ? { tauxRetenue: Number(f.tauxRetenue) } : {}),
                    })),
                    signataireNom,
                    signataireQualite,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Erreur lors de la génération de l'attestation.");
            }

            setSuccessCertificat({ ...data.certificat, documentUrl: data.documentUrl });
            chargerHistorique(clientId.trim());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <FileCheck2 className="w-6 h-6 text-primary" />
                    Attestations de Retenue à la Source (BRS / BNC)
                </h2>
                <p className="page-subtitle">
                    Générez, scellez et archivez les certificats officiels de retenue à la source conformes au Code Général des Impôts (Sénégal CGI art. 200, UEMOA).
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Certificat Généré en Succès */}
            {successCertificat && (
                <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            <div>
                                <h3 className="text-lg font-bold text-emerald-200">
                                    Attestation générée : {successCertificat.numeroCertificat}
                                </h3>
                                <p className="text-xs text-emerald-400/80">
                                    Document enregistré en GED. La clé de contrôle est calculée sur les données saisies : <span className="font-mono font-bold">{successCertificat.cleControle}</span>. Vérifiez les textes officiels avant émission.
                                </p>
                                {successCertificat.documentUrl && <a href={successCertificat.documentUrl} target="_blank" rel="noreferrer" className="inline-flex mt-1 text-xs text-emerald-300 hover:underline">Télécharger l’archive JSON</a>}
                            </div>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-2 transition"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimer le certificat
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 bg-card/60 rounded-xl border border-border">
                            <span className="text-xs text-muted-foreground block">Bénéficiaire</span>
                            <span className="font-semibold text-foreground">{successCertificat.beneficiaire.raisonSociale}</span>
                            <span className="text-xs text-muted-foreground block">ID: {successCertificat.beneficiaire.identifiantFiscal}</span>
                        </div>
                        <div className="p-3 bg-card/60 rounded-xl border border-border">
                            <span className="text-xs text-muted-foreground block">Total Brut HT</span>
                            <span className="font-bold text-foreground text-base">
                                {Number(successCertificat.totalBrutHT).toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div className="p-3 bg-card/60 rounded-xl border border-border">
                            <span className="text-xs text-muted-foreground block">Retenue à la Source</span>
                            <span className="font-bold text-rose-400 text-base">
                                -{Number(successCertificat.totalRetenu).toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div className="p-3 bg-card/60 rounded-xl border border-border">
                            <span className="text-xs text-muted-foreground block">Net Réglé Prestataire</span>
                            <span className="font-bold text-emerald-400 text-base">
                                {Number(successCertificat.totalNetPaye).toLocaleString("fr-FR")} F
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-lg font-mono">
                        Réf légale : {successCertificat.referenceLegale} | Signataire : {successCertificat.signataireNom} ({successCertificat.signataireQualite})
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonne Formulaire (2 tiers) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 1 : Dossier & Régime */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            1. Entreprise déclarante & Régime
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Identifiant Client (MongoDB ID) *
                                </label>
                                <input
                                    type="text"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    placeholder="ex: 60c72b2f9b1d8b2bad592a88"
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Juridiction fiscale
                                </label>
                                <select
                                    value={pays}
                                    onChange={(e) => setPays(e.target.value as typeof pays)}
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Choisir le pays</option>
                                    <option value="sn">Sénégal (CGI art. 200)</option>
                                    <option value="ci">Côte d&apos;Ivoire (CGI art. 92)</option>
                                    <option value="cm">Cameroun (CGI art. 90)</option>
                                    <option value="bj">Bénin (CGI art. 192)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Type de retenue
                                </label>
                                <select
                                    value={typeRetenue}
                                    onChange={(e) => setTypeRetenue(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Choisir le type applicable après vérification</option>
                                    <option value="BRS_PRESTATIONS_SERVICES_LOCALES">BRS Prestations Locales (5 % / 7.5 %)</option>
                                    <option value="RETENUE_BNC_HONORAIRES">Honoraires BNC (10 % à 25 %)</option>
                                    <option value="RETENUE_NON_RESIDENTS_ETRANGERS">Non-Résidents Étrangers (20 %)</option>
                                    <option value="RETENUE_REVENUS_CAPITAUX_MOBILIERS">IRVM Dividendes / Intérêts (10 %)</option>
                                    <option value="RETENUE_LOYERS_FONCIERS">Loyers & Baux (5 % à 15 %)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 : Bénéficiaire du paiement */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-primary" />
                            2. Bénéficiaire de la rémunération (Prestataire)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Raison Sociale / Nom du Consultant *
                                </label>
                                <input
                                    type="text"
                                    value={beneficiaireNom}
                                    onChange={(e) => setBeneficiaireNom(e.target.value)}
                                    placeholder="ex: Cabinet Audit & Conseils SARL"
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Identifiant Fiscal (NINEA / IFU / NIF) *
                                </label>
                                <input
                                    type="text"
                                    value={beneficiaireIdentifiant}
                                    onChange={(e) => setBeneficiaireIdentifiant(e.target.value)}
                                    placeholder="ex: 00458921 2V2"
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Adresse du bénéficiaire
                                </label>
                                <input
                                    type="text"
                                    value={beneficiaireAdresse}
                                    onChange={(e) => setBeneficiaireAdresse(e.target.value)}
                                    placeholder="ex: Rue Aimé Césaire, Fann Résidence"
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Ville
                                    </label>
                                    <input
                                        type="text"
                                        value={beneficiaireVille}
                                        onChange={(e) => setBeneficiaireVille(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Pays
                                    </label>
                                    <input
                                        type="text"
                                        value={beneficiairePays}
                                        onChange={(e) => setBeneficiairePays(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 : Factures soumises à retenue */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Hash className="w-4 h-4 text-primary" />
                                3. Factures associées ({factures.length})
                            </h3>
                            <button
                                type="button"
                                onClick={ajouterFacture}
                                className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition"
                            >
                                <Plus className="w-3.5 h-3.5 text-primary" />
                                Ajouter une facture
                            </button>
                        </div>

                        <div className="space-y-3">
                            {factures.map((facture, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-background/60 rounded-xl border border-border/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                                >
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={facture.numeroFacture}
                                            onChange={(e) => modifierFacture(index, "numeroFacture", e.target.value)}
                                            placeholder="N° Facture"
                                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <input
                                            type="date"
                                            value={facture.dateFacture}
                                            onChange={(e) => modifierFacture(index, "dateFacture", e.target.value)}
                                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={facture.description}
                                            onChange={(e) => modifierFacture(index, "description", e.target.value)}
                                            placeholder="Libellé prestation"
                                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input
                                            type="number"
                                            value={facture.montantBrutHT}
                                            onChange={(e) => modifierFacture(index, "montantBrutHT", e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder="Montant HT"
                                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded font-mono font-medium"
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => supprimerFacture(index)}
                                            disabled={factures.length === 1}
                                            className="p-1.5 text-muted-foreground hover:text-rose-400 disabled:opacity-30 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-border/50 text-sm">
                            <span className="text-muted-foreground font-medium">Total Brut Soumis :</span>
                            <span className="font-mono font-bold text-foreground">
                                {totalFacturesBrut.toLocaleString("fr-FR")} FCFA
                            </span>
                        </div>
                    </div>

                    {/* Section 4 : Signataire */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            4. Signature & Certification
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Nom du signataire qualifié *
                                </label>
                                <input
                                    type="text"
                                    value={signataireNom}
                                    onChange={(e) => setSignataireNom(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Qualité / Fonction
                                </label>
                                <input
                                    type="text"
                                    value={signataireQualite}
                                    onChange={(e) => setSignataireQualite(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={genererAttestation}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <>Génération et scellement en cours...</>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Générer et Sceller l&apos;Attestation Officielle
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Colonne Historique (1 tiers) */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Historique des attestations
                            </h3>
                            {clientId && (
                                <button
                                    onClick={() => chargerHistorique(clientId)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Actualiser
                                </button>
                            )}
                        </div>

                        {!clientId ? (
                            <p className="text-xs text-muted-foreground">
                                Renseignez un identifiant client pour consulter ses attestations délivrées.
                            </p>
                        ) : loadingHisto ? (
                            <p className="text-xs text-muted-foreground">Chargement des attestations...</p>
                        ) : historique.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                                Aucune attestation générée pour ce dossier.
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {historique.map((att) => (
                                    <div
                                        key={att.id}
                                        className="p-3 bg-background rounded-xl border border-border text-xs space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-foreground">
                                                {att.numeroCertificat}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {new Date(att.dateEmission).toLocaleDateString("fr-FR")}
                                            </span>
                                        </div>
                                        {att.metadata?.beneficiaire && (
                                            <p className="text-muted-foreground">
                                                Bénéficiaire : <strong className="text-foreground">{att.metadata.beneficiaire}</strong>
                                            </p>
                                        )}
                                        {att.fileUrl && <a href={att.fileUrl} target="_blank" rel="noreferrer" className="inline-flex text-primary hover:underline pt-1">Ouvrir l’attestation archivée</a>}
                                        {att.metadata?.totalRetenu !== undefined && (
                                            <div className="flex justify-between items-center pt-1 border-t border-border/40 font-mono">
                                                <span className="text-muted-foreground">Retenue :</span>
                                                <span className="font-semibold text-rose-400">
                                                    {Number(att.metadata.totalRetenu).toLocaleString("fr-FR")} F
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
