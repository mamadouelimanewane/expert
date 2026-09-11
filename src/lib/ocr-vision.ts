/**
 * Lecture d'un document comptable manuscrit ou dégradé par un modèle de
 * vision (Claude), en complément de Tesseract qui ne lit que l'imprimé.
 *
 * Périmètre : balances générales et cahiers de caisse (journal manuscrit
 * date / libellé / entrée / sortie), en photo, scan ou PDF.
 *
 * Règles non négociables, reprises dans la consigne au modèle :
 *  - ne transcrire que ce qui est écrit ; une case illisible est marquée
 *    `illisible`, jamais devinée ni complétée par déduction ;
 *  - un montant douteux reste tel quel avec une confiance « faible » ;
 *  - les totaux imprimés sont transcrits séparément pour contrôle, jamais
 *    utilisés pour corriger les lignes.
 *
 * Le document quitte le poste vers l'API Anthropic : cette voie n'est
 * activée que par un clic explicite de l'utilisateur (voir l'écran d'import)
 * et exige ANTHROPIC_API_KEY côté serveur. Sans clé, la fonction le dit.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
// Le helper zodOutputFormat du SDK attend l'API Zod v4 ; zod 3.25 l'expose sous « zod/v4 ».
import { z } from "zod/v4";
import sharp from "sharp";

export const MODELE_VISION = "claude-opus-5";
const TAILLE_IMAGE_MAX = 1800; // px, plus grand côté — au-delà l'API redimensionne elle-même

const LigneBalanceSchema = z.object({
    numero: z.string().describe("Numéro de compte tel qu'écrit, chiffres uniquement ; vide si illisible"),
    intitule: z.string().describe("Intitulé tel qu'écrit ; vide si absent"),
    debit: z.number().describe("Montant au débit (ou solde débiteur) en unités, 0 si vide ou tiret"),
    credit: z.number().describe("Montant au crédit (ou solde créditeur) en unités, 0 si vide ou tiret"),
    confiance: z.enum(["haute", "moyenne", "faible"]).describe("faible si un chiffre est douteux"),
    illisible: z.boolean().describe("true si une partie de la ligne n'a pas pu être lue"),
    remarque: z.string().describe("Ce qui pose problème sur cette ligne, sinon chaîne vide"),
});

const LigneJournalSchema = z.object({
    date: z.string().describe("Date telle qu'écrite (JJ/MM/AAAA si lisible), vide si absente"),
    libelle: z.string().describe("Libellé de l'opération tel qu'écrit"),
    entree: z.number().describe("Encaissement / recette en unités, 0 si vide"),
    sortie: z.number().describe("Décaissement / dépense en unités, 0 si vide"),
    confiance: z.enum(["haute", "moyenne", "faible"]),
    illisible: z.boolean(),
    remarque: z.string(),
});

export const LectureVisionSchema = z.object({
    document: z.enum(["balance", "journal", "autre"]).describe("balance = comptes avec débit/crédit ; journal = cahier de caisse ou d'opérations datées ; autre = ni l'un ni l'autre"),
    titre: z.string().describe("Titre ou en-tête du document tel qu'écrit, sinon vide"),
    periode: z.string().describe("Période ou date de clôture lisible sur le document (ex. 31/12/2025, juin 2026), sinon vide"),
    devise: z.string().describe("Devise si indiquée (FCFA, XOF, EUR…), sinon vide"),
    lignesBalance: z.array(LigneBalanceSchema).describe("Lignes de comptes, dans l'ordre du document ; vide si document ≠ balance"),
    lignesJournal: z.array(LigneJournalSchema).describe("Opérations, dans l'ordre du document ; vide si document ≠ journal"),
    totauxEcrits: z.object({
        debit: z.number().describe("Total débit / entrées écrit sur le document, 0 si absent"),
        credit: z.number().describe("Total crédit / sorties écrit sur le document, 0 si absent"),
        present: z.boolean(),
    }),
    remarques: z.array(z.string()).describe("Observations générales : qualité de l'écriture, ratures, colonnes ambiguës, pages manquantes"),
});

export type LectureVision = z.infer<typeof LectureVisionSchema>;

const CONSIGNE = `Tu es un assistant de saisie comptable pour un cabinet d'expertise comptable en zone OHADA (Sénégal, Côte d'Ivoire…). On te montre un document manuscrit ou imprimé : une balance générale (comptes, intitulés, débit, crédit — parfois mouvements et soldes) ou un cahier de caisse / journal (date, libellé, entrées, sorties).

Transcris-le en respectant strictement ces règles :
1. Ne transcris QUE ce qui est écrit. N'invente, ne déduis, ne complète et ne corrige rien : pas de numéro de compte déduit d'un intitulé, pas de montant reconstitué à partir d'un total.
2. Si un chiffre, un compte ou un libellé est illisible ou raturé, marque la ligne illisible=true et explique dans remarque ; laisse le champ vide ou 0.
3. Les montants sont écrits en francs CFA sans décimales le plus souvent ; « 1 250 000 », « 1.250.000 » et « 1250000 » valent 1250000. Un tiret, un blanc ou « néant » vaut 0.
4. Balance à plusieurs colonnes de montants (mouvements débit/crédit puis soldes débiteur/créditeur) : reporte les SOLDES dans debit/credit et signale-le dans remarques.
5. Les lignes TOTAL, sous-totaux de classe et reports ne sont pas des lignes de comptes : mets le total général dans totauxEcrits et ignore les sous-totaux.
6. Une confiance « faible » vaut mieux qu'un montant faux : signale tout doute.
7. Si le document n'est ni une balance ni un journal, réponds document="autre" avec une remarque.`;

export type ResultatVision = {
    ok: true;
    lecture: LectureVision;
    modele: string;
    usage: { input: number; output: number; coutEstimeUSD: number };
} | {
    ok: false;
    raison: "non_configure" | "refus" | "illisible" | "erreur";
    message: string;
};

/** Réduit une image aux dimensions utiles et la convertit en JPEG (les scans PNG en A4 pèsent 10 Mo). */
async function preparerImage(fichier: Buffer): Promise<{ data: string; media_type: "image/jpeg" }> {
    const buffer = await sharp(fichier)
        .rotate()
        .resize({ width: TAILLE_IMAGE_MAX, height: TAILLE_IMAGE_MAX, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 88 })
        .toBuffer();
    return { data: buffer.toString("base64"), media_type: "image/jpeg" };
}

export function visionConfiguree(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function lireDocumentParVision(fichier: Buffer, mimeType: string, nomFichier: string): Promise<ResultatVision> {
    if (!visionConfiguree()) {
        return { ok: false, raison: "non_configure", message: "Lecture par IA non configurée : renseignez ANTHROPIC_API_KEY sur le serveur." };
    }
    const client = new Anthropic();
    const estPdf = mimeType === "application/pdf" || /\.pdf$/i.test(nomFichier);

    const piece: Anthropic.ContentBlockParam = estPdf
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: fichier.toString("base64") } }
        : { type: "image", source: { type: "base64", ...(await preparerImage(fichier)) } };

    try {
        const response = await client.messages.parse({
            model: MODELE_VISION,
            max_tokens: 16000,
            system: CONSIGNE,
            output_config: { format: zodOutputFormat(LectureVisionSchema), effort: "high" },
            messages: [
                {
                    role: "user",
                    content: [
                        piece,
                        { type: "text", text: `Fichier : ${nomFichier}. Transcris ce document selon les règles.` },
                    ],
                },
            ],
        });

        if (response.stop_reason === "refusal") {
            return { ok: false, raison: "refus", message: `Le modèle a refusé de traiter ce document${response.stop_details?.explanation ? ` : ${response.stop_details.explanation}` : "."}` };
        }
        const lecture = response.parsed_output;
        if (!lecture) {
            return { ok: false, raison: "illisible", message: "Le modèle n'a pas produit de transcription exploitable." };
        }
        const input = response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0);
        const output = response.usage.output_tokens;
        // Tarif Claude Opus 5 : 5 $ / M entrée, 25 $ / M sortie
        const coutEstimeUSD = Math.round((input * 5 + output * 25) / 1_000_000 * 10_000) / 10_000;
        return { ok: true, lecture, modele: response.model, usage: { input, output, coutEstimeUSD } };
    } catch (error) {
        if (error instanceof Anthropic.AuthenticationError) {
            return { ok: false, raison: "non_configure", message: "Clé ANTHROPIC_API_KEY refusée par l'API." };
        }
        if (error instanceof Anthropic.RateLimitError) {
            return { ok: false, raison: "erreur", message: "Quota de l'API IA atteint : réessayez dans quelques instants." };
        }
        if (error instanceof Anthropic.APIError) {
            console.error("Vision — erreur API:", error.status, error.message);
            return { ok: false, raison: "erreur", message: `Lecture par IA impossible (erreur ${error.status}).` };
        }
        console.error("Vision — erreur:", error);
        return { ok: false, raison: "erreur", message: "Lecture par IA impossible." };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalisation de la transcription (pure, testable sans réseau)
// ─────────────────────────────────────────────────────────────────────────────
export type LectureNormalisee = {
    document: LectureVision["document"];
    lignes: { numero: string; intitule: string; debit: number; credit: number; confiance: "haute" | "moyenne" | "faible"; source: string; colonnes: number }[];
    rejets: { ligne: number; texte: string; raison: string }[];
    totauxDetectes: { debit: number; credit: number } | null;
    totauxCalcules: { debit: number; credit: number; equilibree: boolean; ecart: number };
    controleTotaux: "concordant" | "ecart" | "absent";
    journal: { date: string; libelle: string; entree: number; sortie: number; confiance: "haute" | "moyenne" | "faible"; illisible: boolean; remarque: string }[];
};

const COMPTE_RE = /^\d{3,13}$/;

/**
 * Ramène la transcription à la forme attendue par l'écran d'import (même
 * contrat que la voie OCR) : lignes de balance exploitables d'un côté,
 * rejets de l'autre (illisibles, compte absent), totaux recalculés et
 * confrontés aux totaux écrits, opérations de caisse telles quelles.
 */
export function normaliserLecture(L: LectureVision): LectureNormalisee {
    const lignes: LectureNormalisee["lignes"] = [];
    const rejets: LectureNormalisee["rejets"] = [];
    L.lignesBalance.forEach((l, i) => {
        const numero = l.numero.replace(/\s+/g, "");
        const texte = [l.numero, l.intitule, l.debit || "", l.credit || ""].filter(Boolean).join("  ") || "(ligne vide)";
        if (l.illisible || !COMPTE_RE.test(numero)) {
            rejets.push({ ligne: i + 1, texte, raison: l.remarque || (l.illisible ? "illisible" : "numéro de compte absent ou illisible") });
            return;
        }
        lignes.push({
            numero,
            intitule: l.intitule || numero,
            debit: Math.max(0, l.debit),
            credit: Math.max(0, l.credit),
            confiance: l.confiance,
            source: l.remarque ? `${texte}  — ${l.remarque}` : texte,
            colonnes: 2,
        });
    });
    const totalDebit = lignes.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lignes.reduce((s, l) => s + l.credit, 0);
    const ecart = Math.round((totalDebit - totalCredit) * 100) / 100;
    const totauxDetectes = L.totauxEcrits.present ? { debit: L.totauxEcrits.debit, credit: L.totauxEcrits.credit } : null;
    const controleTotaux: LectureNormalisee["controleTotaux"] = !totauxDetectes
        ? "absent"
        : Math.abs(totauxDetectes.debit - totalDebit) <= 1 && Math.abs(totauxDetectes.credit - totalCredit) <= 1 ? "concordant" : "ecart";
    const journal = L.lignesJournal.map((l) => ({
        date: l.date,
        libelle: l.libelle,
        entree: Math.max(0, l.entree),
        sortie: Math.max(0, l.sortie),
        confiance: l.confiance,
        illisible: l.illisible,
        remarque: l.remarque,
    }));
    return {
        document: L.document,
        lignes, rejets, totauxDetectes,
        totauxCalcules: { debit: totalDebit, credit: totalCredit, equilibree: Math.abs(ecart) <= 1, ecart },
        controleTotaux, journal,
    };
}
