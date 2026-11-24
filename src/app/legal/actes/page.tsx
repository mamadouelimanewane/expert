"use client";

import { useState } from "react";
import { Scale, FileText, CheckCircle2, ShieldCheck, Copy, RefreshCw } from "lucide-react";
import type { PaysFiscal } from "@/lib/tax-simulator";
import type { TypeActeOHADA } from "@/lib/ohada/legal-document-generator";

export default function NexusLegalActesPage() {
    const [typeActe, setTypeActe] = useState<TypeActeOHADA>("PV_AGOA");
    const [pays, setPays] = useState<PaysFiscal | "">("");
    const [denomination, setDenomination] = useState("");
    const [siegeSocial, setSiegeSocial] = useState("");
    const [capitalSocial, setCapitalSocial] = useState<number | "">("");
    const [exerciceClos, setExerciceClos] = useState<number | "">(new Date().getFullYear() - 1);
    const [resultatNet, setResultatNet] = useState<number | "">("");
    const [dividendes, setDividendes] = useState<number | "">("");
    const [reserveLegale, setReserveLegale] = useState<number | "">("");
    const [rccm, setRccm] = useState("");
    const [dateAssemblee, setDateAssemblee] = useState("");
    const [heureAssemblee, setHeureAssemblee] = useState("");
    const [dateCloture, setDateCloture] = useState("");
    const [formeSociale, setFormeSociale] = useState<"SARL" | "SAS" | "SA">("SARL");
    const [voteApprobation, setVoteApprobation] = useState<"unanimite" | "majorite" | "rejetee">("unanimite");
    const [voteAffectation, setVoteAffectation] = useState<"unanimite" | "majorite" | "rejetee">("unanimite");
    const [voteFormalites, setVoteFormalites] = useState<"unanimite" | "majorite" | "rejetee">("unanimite");
    const [lieuAssemblee, setLieuAssemblee] = useState("");
    const [presencePct, setPresencePct] = useState<number | "">("");
    const [nomGerant, setNomGerant] = useState("");
    const [dureeAnnees, setDureeAnnees] = useState<number | "">("");
    const [objetSocial, setObjetSocial] = useState("");
    const [valeurPart, setValeurPart] = useState<number | "">("");
    const [nationaliteGerant, setNationaliteGerant] = useState("");
    const [associes, setAssocies] = useState([{ nom: "", parts: "" as number | "", apportMontant: "" as number | "" }, { nom: "", parts: "" as number | "", apportMontant: "" as number | "" }]);
    const [bailleurNom, setBailleurNom] = useState("");
    const [bailleurAdresse, setBailleurAdresse] = useState("");
    const [preneurRccm, setPreneurRccm] = useState("");
    const [locaux, setLocaux] = useState("");
    const [activiteAutorisee, setActiviteAutorisee] = useState("");
    const [loyerMensuel, setLoyerMensuel] = useState<number | "">("");
    const [depotMois, setDepotMois] = useState<number | "">("");
    const [dureeBail, setDureeBail] = useState<number | "">("");
    const [dateEffetBail, setDateEffetBail] = useState("");
    const [salarieNom, setSalarieNom] = useState("");
    const [salarieNationalite, setSalarieNationalite] = useState("");
    const [poste, setPoste] = useState("");
    const [categorie, setCategorie] = useState("");
    const [salaire, setSalaire] = useState<number | "">("");
    const [primes, setPrimes] = useState<number | "">("");
    const [periodeEssai, setPeriodeEssai] = useState<number | "">("");
    const [dateEmbauche, setDateEmbauche] = useState("");
    const [conventionCollective, setConventionCollective] = useState("");

    const [loading, setLoading] = useState(false);
    const [acte, setActe] = useState<{
        titre: string; texteIntegral: string; analyseConformite: { scoreConformite: number };
        mentionsObligatoiresVerifiees: string[]; disclaimerLegal: string;
    } | null>(null);
    const [copie, setCopie] = useState(false);
    const [error, setError] = useState("");

    const genererActe = async () => {
        setError("");
        if (!pays || !denomination.trim() || !siegeSocial.trim()) {
            setError("Renseignez le pays, la dénomination et le siège social à partir des pièces de la société.");
            return;
        }

        let params: Record<string, unknown>;
        if (typeActe === "PV_AGOA") {
            if (!nomGerant.trim() || !rccm.trim() || !dateAssemblee || !heureAssemblee || !dateCloture || !lieuAssemblee.trim() || exerciceClos === ""
                || capitalSocial === "" || capitalSocial <= 0 || resultatNet === "" || dividendes === "" || reserveLegale === ""
                || presencePct === "" || presencePct <= 0 || presencePct > 100
                || resultatNet >= 0 && reserveLegale + dividendes > resultatNet
                || resultatNet < 0 && (dividendes !== 0 || reserveLegale !== 0)) {
                setError("Pour le PV, complétez les informations d’assemblée et les chiffres issus des comptes approuvés. Les distributions ne peuvent dépasser le résultat disponible.");
                return;
            }
            params = {
                denomination: denomination.trim(),
                formeSociale,
                capitalSocial: Number(capitalSocial),
                siegeSocial: siegeSocial.trim(),
                rccm: rccm.trim(),
                dateAssemblee,
                heureAssemblee,
                dateCloture,
                lieuAssemblee: lieuAssemblee.trim(),
                exerciceClos: Number(exerciceClos),
                resultatNet: Number(resultatNet),
                affectationReserveLegale: Number(reserveLegale),
                dividendesDistribues: Number(dividendes),
                nomGerantOuPresident: nomGerant.trim(),
                presentsOuRepresentesPourcentage: Number(presencePct),
                voteApprobation,
                voteAffectation,
                voteFormalites,
            };
        } else if (typeActe === "STATUTS_SARL") {
            if (!nomGerant.trim() || !nationaliteGerant.trim() || !objetSocial.trim() || dureeAnnees === "" || dureeAnnees <= 0
                || capitalSocial === "" || capitalSocial <= 0 || valeurPart === "" || valeurPart <= 0
                || associes.length === 0 || associes.some((associe) => !associe.nom.trim() || associe.parts === "" || associe.parts <= 0 || associe.apportMontant === "" || associe.apportMontant < 0)
                || associes.reduce((sum, associe) => sum + Number(associe.apportMontant), 0) !== capitalSocial
                || associes.reduce((sum, associe) => sum + Number(associe.parts), 0) * valeurPart !== capitalSocial) {
                setError("Pour les statuts, renseignez le gérant, l’objet, la durée, la valeur des parts et chaque associé. Les apports et le nombre de parts doivent correspondre au capital.");
                return;
            }
            params = {
                denomination: denomination.trim(), siegeSocial: siegeSocial.trim(), dureeAnnees: Number(dureeAnnees),
                objetSocial: objetSocial.trim(), capitalSocial: Number(capitalSocial), valeurNominalePart: Number(valeurPart),
                gerantNom: nomGerant.trim(), gerantNationalite: nationaliteGerant.trim(),
                associes: associes.map((associe) => ({ nom: associe.nom.trim(), parts: Number(associe.parts), apportMontant: Number(associe.apportMontant) })),
            };
        } else if (typeActe === "BAIL_COMMERCIAL") {
            if (!bailleurNom.trim() || !bailleurAdresse.trim() || !preneurRccm.trim() || !locaux.trim() || !activiteAutorisee.trim()
                || loyerMensuel === "" || loyerMensuel <= 0 || depotMois === "" || depotMois < 0 || dureeBail === "" || dureeBail <= 0 || !dateEffetBail) {
                setError("Complétez l’identité des parties, les locaux, l’activité, le loyer, le dépôt de garantie, la durée et la date d’effet réels.");
                return;
            }
            params = {
                bailleurNom: bailleurNom.trim(), bailleurAdresse: bailleurAdresse.trim(), preneurDenomination: denomination.trim(),
                preneurRCCM: preneurRccm.trim(), designationLocaux: locaux.trim(), activiteAutorisee: activiteAutorisee.trim(),
                loyerMensuelHT: Number(loyerMensuel), depotGarantieMois: Number(depotMois), dureeBailAnnees: Number(dureeBail), datePriseEffet: dateEffetBail,
            };
        } else {
            if (!salarieNom.trim() || !salarieNationalite.trim() || !poste.trim() || !categorie.trim() || salaire === "" || salaire <= 0
                || primes === "" || primes < 0 || periodeEssai === "" || periodeEssai < 0 || !dateEmbauche || !conventionCollective.trim()) {
                setError("Complétez l’identité du salarié, le poste, la catégorie, la rémunération, l’essai, la date d’embauche et la convention applicable.");
                return;
            }
            params = {
                employeurDenomination: denomination.trim(), employeurSiege: siegeSocial.trim(), salarieNomPrenom: salarieNom.trim(),
                salarieNationalite: salarieNationalite.trim(), posteIntitule: poste.trim(), categorieProfessionnelle: categorie.trim(),
                salaireBaseMensuel: Number(salaire), primesMensuelles: Number(primes), periodeEssaiMois: Number(periodeEssai),
                dateEmbauche, conventionCollective: conventionCollective.trim(),
            };
        }

        setLoading(true);
        try {
            const res = await fetch("/api/legal/generate-act", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: typeActe, params, pays }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "La génération du projet d’acte a échoué.");
            if (data.acte) setActe(data.acte);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "La génération du projet d’acte a échoué.");
        } finally {
            setLoading(false);
        }
    };

    const copierTexte = () => {
        if (!acte) return;
        navigator.clipboard.writeText(acte.texteIntegral);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    const champTexte = (label: string, value: string, onChange: (value: string) => void, type = "text") => (
        <div>
            <label className="text-muted-foreground">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background" />
        </div>
    );
    const champNombre = (label: string, value: number | "", onChange: (value: number | "") => void, min = 0) => (
        <div>
            <label className="text-muted-foreground">{label}</label>
            <input type="number" min={min} value={value} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} required className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background" />
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Scale className="w-6 h-6 text-indigo-400" />
                    <h1 className="page-title text-2xl font-bold tracking-tight">Nexus-Legal v2 : Rédacteur d&apos;Actes OHADA</h1>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Préparez un projet à partir des informations du dossier. Les règles nationales et les pièces doivent être vérifiées par un professionnel.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Paramétrage de l'acte */}
                <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Type d&apos;acte &amp; Paramètres
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="text-muted-foreground">Juridiction de l’acte</label>
                            <select value={pays} onChange={(e) => setPays(e.target.value as PaysFiscal | "")} className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background" required>
                                <option value="">Choisir le pays</option>
                                <option value="sn">Sénégal</option><option value="ci">Côte d’Ivoire</option><option value="cm">Cameroun</option><option value="bj">Bénin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-muted-foreground">Sélection de l&apos;acte juridique</label>
                            <select
                                value={typeActe}
                                onChange={(e) => setTypeActe(e.target.value as TypeActeOHADA)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-medium"
                            >
                                <option value="PV_AGOA">PV d&apos;AGOA (Approbation des comptes)</option>
                                <option value="STATUTS_SARL">Statuts constitutifs de SARL</option>
                                <option value="BAIL_COMMERCIAL">Bail commercial (AUDCG art. 101+)</option>
                                <option value="CONTRAT_TRAVAIL_CDI">Contrat de travail CDI (CCNI)</option>
                            </select>
                        </div>

                        {champTexte("Dénomination sociale / Société", denomination, setDenomination)}
                        {champTexte("Siège social", siegeSocial, setSiegeSocial)}

                        {typeActe === "PV_AGOA" && (
                            <>
                                {champTexte("RCCM", rccm, setRccm)}
                                <div><label className="text-muted-foreground">Forme sociale</label><select value={formeSociale} onChange={(e) => setFormeSociale(e.target.value as typeof formeSociale)} className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"><option value="SARL">SARL</option><option value="SAS">SAS</option><option value="SA">SA</option></select></div>
                                {champTexte("Date de l’assemblée", dateAssemblee, setDateAssemblee, "date")}
                                {champTexte("Heure de l’assemblée", heureAssemblee, setHeureAssemblee, "time")}
                                {champTexte("Lieu de l’assemblée", lieuAssemblee, setLieuAssemblee)}
                                {champTexte("Gérant / président", nomGerant, setNomGerant)}
                                {champNombre("Exercice clos", exerciceClos, setExerciceClos, 1900)}
                                {champTexte("Date de clôture de l’exercice", dateCloture, setDateCloture, "date")}
                                {champNombre("Capital social (FCFA)", capitalSocial, setCapitalSocial, 1)}
                                {champNombre("Résultat net approuvé (FCFA)", resultatNet, setResultatNet)}
                                {champNombre("Dotation réserve légale votée (FCFA)", reserveLegale, setReserveLegale)}
                                {champNombre("Dividendes votés (FCFA)", dividendes, setDividendes)}
                                {champNombre("Capital présent ou représenté (%)", presencePct, setPresencePct, 0.01)}
                                {([ ["Vote approbation des comptes", voteApprobation, setVoteApprobation], ["Vote affectation du résultat", voteAffectation, setVoteAffectation], ["Vote formalités", voteFormalites, setVoteFormalites] ] as const).map(([label, value, setter]) => <div key={label}><label className="text-muted-foreground">{label}</label><select value={value} onChange={(e) => setter(e.target.value as typeof value)} className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"><option value="unanimite">Adoptée à l’unanimité</option><option value="majorite">Adoptée à la majorité</option><option value="rejetee">Rejetée</option></select></div>)}
                            </>
                        )}

                        {typeActe === "STATUTS_SARL" && <>
                            {champTexte("Gérant", nomGerant, setNomGerant)}
                            {champTexte("Nationalité du gérant", nationaliteGerant, setNationaliteGerant)}
                            {champTexte("Objet social", objetSocial, setObjetSocial)}
                            {champNombre("Durée (années)", dureeAnnees, setDureeAnnees, 1)}
                            {champNombre("Capital social (FCFA)", capitalSocial, setCapitalSocial, 1)}
                            {champNombre("Valeur nominale d’une part (FCFA)", valeurPart, setValeurPart, 1)}
                            <div className="space-y-2 border-t border-border pt-3">
                                <p className="font-semibold text-foreground">Associés et apports</p>
                                {associes.map((associe, index) => <div key={index} className="space-y-2 rounded-lg border border-border p-2">
                                    {champTexte(`Associé ${index + 1}`, associe.nom, (nom) => setAssocies((items) => items.map((item, i) => i === index ? { ...item, nom } : item)))}
                                    {champNombre("Nombre de parts", associe.parts, (parts) => setAssocies((items) => items.map((item, i) => i === index ? { ...item, parts } : item)), 1)}
                                    {champNombre("Apport numéraire (FCFA)", associe.apportMontant, (apportMontant) => setAssocies((items) => items.map((item, i) => i === index ? { ...item, apportMontant } : item)))}
                                </div>)}
                            </div>
                        </>}

                        {typeActe === "BAIL_COMMERCIAL" && <>
                            {champTexte("Bailleur", bailleurNom, setBailleurNom)}
                            {champTexte("Adresse du bailleur", bailleurAdresse, setBailleurAdresse)}
                            {champTexte("RCCM du preneur", preneurRccm, setPreneurRccm)}
                            {champTexte("Désignation précise des locaux", locaux, setLocaux)}
                            {champTexte("Activité autorisée", activiteAutorisee, setActiviteAutorisee)}
                            {champNombre("Loyer mensuel HT (FCFA)", loyerMensuel, setLoyerMensuel, 1)}
                            {champNombre("Dépôt de garantie (mois)", depotMois, setDepotMois)}
                            {champNombre("Durée du bail (années)", dureeBail, setDureeBail, 1)}
                            {champTexte("Date de prise d’effet", dateEffetBail, setDateEffetBail, "date")}
                        </>}

                        {typeActe === "CONTRAT_TRAVAIL_CDI" && <>
                            {champTexte("Nom et prénom du salarié", salarieNom, setSalarieNom)}
                            {champTexte("Nationalité du salarié", salarieNationalite, setSalarieNationalite)}
                            {champTexte("Intitulé du poste", poste, setPoste)}
                            {champTexte("Catégorie professionnelle", categorie, setCategorie)}
                            {champNombre("Salaire mensuel de base (FCFA)", salaire, setSalaire, 1)}
                            {champNombre("Primes mensuelles (FCFA)", primes, setPrimes)}
                            {champNombre("Période d’essai (mois)", periodeEssai, setPeriodeEssai)}
                            {champTexte("Date d’embauche", dateEmbauche, setDateEmbauche, "date")}
                            {champTexte("Convention collective applicable", conventionCollective, setConventionCollective)}
                        </>}

                        {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}

                        <button
                            onClick={genererActe}
                            disabled={loading}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-white transition flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                            Générer un projet d’acte à relire
                        </button>
                    </div>
                </div>

                {/* Prévisualisation & Audit de conformité */}
                <div className="md:col-span-2 space-y-4">
                    {acte ? (
                        <>
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40">
                                <div>
                                    <div className="text-xs text-muted-foreground">Contrôle automatisé du texte — indicatif uniquement</div>
                                    <div className="text-2xl font-bold mt-1 text-muted-foreground flex items-center gap-2">
                                        <ShieldCheck className="w-6 h-6" />
                                        {acte.analyseConformite.scoreConformite} / 100
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={copierTexte}
                                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary flex items-center gap-1.5 text-foreground"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        {copie ? "Copié !" : "Copier le texte"}
                                    </button>
                                </div>
                            </div>

                            {/* Mentions vérifiées */}
                            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Références et mentions incluses à contrôler ({acte.mentionsObligatoiresVerifiees.length})
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                                    {acte.mentionsObligatoiresVerifiees.map((m: string, i: number) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <span className="text-emerald-400">✓</span> {m}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Texte intégral de l'acte */}
                            <div className="p-5 rounded-xl border border-border bg-card/40 space-y-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
                                    <span>{acte.titre}</span>
                                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">Projet à valider</span>
                                </h3>
                                <pre className="p-4 rounded-lg bg-background border border-border font-mono text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto">
                                    {acte.texteIntegral}
                                </pre>
                                <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2">
                                    {acte.disclaimerLegal}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                            <Scale className="w-8 h-8 text-indigo-400/50 mb-3" />
                            <p>Choisissez le type d’acte et saisissez les informations exactes des parties et du dossier. Le document généré reste un projet à vérifier.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
