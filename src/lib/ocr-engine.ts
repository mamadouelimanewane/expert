import Tesseract from 'tesseract.js';
import { tmpdir } from 'os';

const OCR_TIMEOUT_MS = 45_000;
import sharp from 'sharp';
import { analyserMontant } from "./validation";

export interface OCRResult {
    success: boolean;
    text: string;
    confidence: number;
    data?: InvoiceData;
    error?: string;
}

export interface InvoiceData {
    invoiceNumber?: string;
    date?: string;
    supplier?: string;
    totalHT?: number;
    totalTTC?: number;
    tva?: number;
    items?: InvoiceItem[];
}

export interface InvoiceItem {
    description: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
}

const normalizeePourRecherche = (value: string) => value.toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

/** Extraits OCR courts à comparer avec la pièce affichée avant validation humaine. */
export function buildInvoiceFieldEvidence(text: string, invoiceData: InvoiceData, confidence: number) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const fields: Array<{ key: keyof InvoiceData; value: string | number | undefined; labels: RegExp }> = [
        { key: "supplier", value: invoiceData.supplier, labels: /fournisseur|emetteur|vendeur|societe|raison sociale/i },
        { key: "invoiceNumber", value: invoiceData.invoiceNumber, labels: /facture|invoice|n[°ºo]|numero/i },
        { key: "date", value: invoiceData.date, labels: /date|emise? le|\bdu\b/i },
        { key: "totalHT", value: invoiceData.totalHT, labels: /total\s*ht|montant\s*ht|sous[-\s]total/i },
        { key: "totalTTC", value: invoiceData.totalTTC, labels: /total\s*ttc|montant\s*(total|a payer)/i },
        { key: "tva", value: invoiceData.tva, labels: /tva|taxe/i },
    ];
    return Object.fromEntries(fields.map(({ key, value, labels }) => {
        if (value === undefined || value === "") return [key, { value: null, sourceText: null, confidence: 0, needsReview: true }];
        const expected = normalizeePourRecherche(String(value));
        const sourceText = lines.find((line) => {
            const normalizedLine = normalizeePourRecherche(line);
            if (normalizedLine.includes(expected)) return true;
            if (typeof value === "number") {
                const digits = String(value).replace(/\D/g, "");
                return labels.test(line) && digits.length > 0 && line.replace(/\D/g, "").includes(digits);
            }
            return labels.test(line);
        }) ?? null;
        return [key, { value, sourceText: sourceText?.slice(0, 300) ?? null, confidence: sourceText ? confidence : 0, needsReview: true }];
    }));
}

/**
 * OCR Engine pour extraire le texte des images/PDF
 */
export class OCREngine {
    /**
     * Extrait le texte d'une image
     */
    static async extractTextFromImage(imagePath: string): Promise<OCRResult> {
        try {
            console.log('🔍 Starting OCR processing for:', imagePath);

            // Prétraitement de l'image pour améliorer la qualité OCR
            const processedImageBuffer = await sharp(imagePath)
                .greyscale()
                .normalize()
                .sharpen()
                .toBuffer();

            // OCR avec Tesseract — borné dans le temps : sans limite, un worker
            // qui ne répond pas laissait la requête HTTP et le document en
            // PROCESSING indéfiniment. Sur Vercel, la fonction est de toute
            // façon coupée à 60 s.
            const { data } = await Promise.race([
                Tesseract.recognize(processedImageBuffer, 'fra', {
                    // Vercel : seul /tmp est inscriptible ; sans cachePath, le
                    // téléchargement de fra.traineddata échoue en production.
                    cachePath: tmpdir(),
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    },
                }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error(`OCR interrompu après ${OCR_TIMEOUT_MS / 1000} s`)), OCR_TIMEOUT_MS)
                ),
            ]);

            console.log('✅ OCR completed with confidence:', data.confidence);

            return {
                success: true,
                text: data.text,
                confidence: data.confidence,
            };
        } catch (error) {
            console.error('❌ OCR Error:', error);
            return {
                success: false,
                text: '',
                confidence: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Analyse le texte extrait pour identifier les données de facture
     */
    static parseInvoiceData(text: string): InvoiceData {
        const data: InvoiceData = {};

        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

        // Numéro de facture : « FACTURE N° 2026-117 », « Facture no : F-0042 »,
        // « Invoice # INV/2026/12 ». L'ancien motif capturait le « N » de « N° »
        // ou de « N 2026-117 » comme numéro.
        const invoiceNumberMatch = text.match(/(?:facture|invoice)\s*(?:n[°ºo]?\.?|#|num(?:[ée]ro)?)?\s*:?\s*([A-Z]{0,4}[-\/]?\d[A-Z0-9\-\/]{2,})/i)
            ?? text.match(/(?:^|\s)(?:n[°º]|no\.?|#)\s*:?\s*([A-Z]{0,4}[-\/]?\d[A-Z0-9\-\/]{2,})/im);
        if (invoiceNumberMatch) {
            data.invoiceNumber = invoiceNumberMatch[1].trim();
        }

        // Date : « Date : 12/09/2026 », « du 12-09-26 », « le 12/09/2026 »
        const dateMatch = text.match(/(?:date|du|le|émise?\s*le)\s*:?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i)
            ?? text.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4})\b/);
        if (dateMatch) {
            data.date = dateMatch[1];
        }

        // Fournisseur : ligne explicite « Fournisseur : X » / « Émetteur : X » /
        // « Vendeur : X », sinon la première ligne qui n'est ni un en-tête
        // « FACTURE … », ni une date, ni un montant. La première ligne d'une
        // facture est très souvent le mot « FACTURE » lui-même.
        const fournisseurMatch = text.match(/(?:fournisseur|émetteur|emetteur|vendeur|société|societe|raison\s*sociale)\s*:?\s*([^\n]{3,80})/i);
        if (fournisseurMatch) {
            data.supplier = fournisseurMatch[1].trim();
        } else {
            const candidate = lines.find((l) =>
                !/^(facture|invoice|proforma|devis|re[çc]u|quittance|bon\s+de)/i.test(l) &&
                !/^(date|du|le|total|montant|tva|ht|ttc|n[°º]|no\b)/i.test(l) &&
                !/^[\d\s.,\/\-:]+$/.test(l) &&
                /[A-Za-zÀ-ÿ]{3,}/.test(l)
            );
            if (candidate) data.supplier = candidate.slice(0, 80);
        }

        // Extraction des montants
        const totalHTMatch = text.match(/(?:total\s*ht|montant\s*ht|sous[-\s]total)\s*:?\s*([\d\s,.]+)/i);
        if (totalHTMatch) {
            data.totalHT = this.parseAmount(totalHTMatch[1]);
        }

        const totalTTCMatch = text.match(/(?:total\s*ttc|montant\s*total|total\s*à\s*payer)\s*:?\s*([\d\s,.]+)/i);
        if (totalTTCMatch) {
            data.totalTTC = this.parseAmount(totalTTCMatch[1]);
        }

        const tvaMatch = text.match(/(?:tva|taxe)\s*(?:\d+%)?\s*:?\s*([\d\s,.]+)/i);
        if (tvaMatch) {
            data.tva = this.parseAmount(tvaMatch[1]);
        }

        // Si on a TTC et TVA, calculer HT
        if (data.totalTTC && data.tva && !data.totalHT) {
            data.totalHT = data.totalTTC - data.tva;
        }

        // Si on a HT et TVA, calculer TTC
        if (data.totalHT && data.tva && !data.totalTTC) {
            data.totalTTC = data.totalHT + data.tva;
        }

        return data;
    }

    /**
     * Montant lu sur une facture numérisée.
     *
     * L'implémentation précédente faisait
     * `amountStr.replace(/\s/g, '').replace(',', '.')` puis `parseFloat(...) || 0`.
     * `.replace(',', '.')` ne remplace que la PREMIÈRE virgule : un montant
     * « 1,250,000 » devenait « 1.250,000 », soit 1,25 après parseFloat — et un
     * « 1.250.000,50 » devenait 1,25 également. Ces valeurs alimentent
     * Document.ocrData, donc l'export comptable : une facture de 1 250 000 FCFA
     * ressortait à 1,25 FCFA. Le `|| 0` transformait par ailleurs toute lecture
     * ratée en montant nul, sans distinction possible.
     *
     * `analyserMontant` gère les séparateurs de milliers et la décimale
     * française, et signale l'échec au lieu de renvoyer 0 : le champ reste alors
     * vide, et validateInvoiceData() le remonte dans les avertissements.
     */
    private static parseAmount(amountStr: string): number | undefined {
        // La capture du texte OCR emporte souvent une ponctuation finale
        // (« Total TTC : 1 250 000. ») : on la retire avant l'analyse.
        const nettoye = amountStr.trim().replace(/[.,\s]+$/, "");
        const resultat = analyserMontant(nettoye, { min: 0 });
        return resultat.ok ? resultat.valeur : undefined;
    }

    /**
     * Traite une facture complète : OCR + Parsing
     */
    static async processInvoice(imagePath: string): Promise<OCRResult> {
        const ocrResult = await this.extractTextFromImage(imagePath);

        if (!ocrResult.success) {
            return ocrResult;
        }

        // Parser les données de la facture
        const invoiceData = this.parseInvoiceData(ocrResult.text);

        return {
            ...ocrResult,
            data: invoiceData,
        };
    }

    /**
     * Valide si les données extraites sont suffisantes
     */
    static validateInvoiceData(data: InvoiceData): { valid: boolean; missing: string[] } {
        const missing: string[] = [];

        if (!data.invoiceNumber) missing.push('Numéro de facture');
        if (!data.date) missing.push('Date');
        if (!data.supplier) missing.push('Fournisseur');
        if (!data.totalTTC && !data.totalHT) missing.push('Montant total');

        return {
            valid: missing.length === 0,
            missing,
        };
    }
}

/**
 * Fonction helper pour traiter un fichier uploadé
 */
export async function processUploadedInvoice(filePath: string) {
    console.log('📄 Processing uploaded invoice:', filePath);

    const result = await OCREngine.processInvoice(filePath);

    if (!result.success) {
        return {
            success: false,
            error: result.error || 'OCR processing failed',
        };
    }

    const validation = OCREngine.validateInvoiceData(result.data || {});

    return {
        success: true,
        ocrText: result.text,
        confidence: result.confidence,
        invoiceData: result.data,
        fieldEvidence: buildInvoiceFieldEvidence(result.text, result.data ?? {}, result.confidence),
        validation,
        warnings: validation.missing.length > 0
            ? `Données manquantes : ${validation.missing.join(', ')}`
            : null,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reconstitution de balance générale depuis un document scanné (image ou PDF)
// ─────────────────────────────────────────────────────────────────────────────
import { createWorker, PSM } from 'tesseract.js';
import { parserBalanceTableau, parserBalanceTexte, type ResultatBalanceOCR } from './ocr-balance';

export type BalanceOCR = ResultatBalanceOCR & {
    /** D'où viennent les lignes : tableau ou texte d'un PDF natif, ou OCR d'une image. */
    origine: 'PDF_TABLEAU' | 'PDF_TEXTE' | 'OCR_IMAGE' | 'OCR_PDF_SCANNE';
    pages: number;
    /** Confiance moyenne Tesseract (0-100), absente pour un PDF natif. */
    confianceOCR: number | null;
    /** Texte brut, pour vérification à l'écran. */
    texte: string;
};

const OCR_BALANCE_TIMEOUT_MS = 50_000;
/** En-deçà, la couche texte d'un PDF est jugée absente (document scanné). */
const MIN_CARACTERES_PDF = 80;

/**
 * Prépare une page pour l'OCR de tableau : niveaux de gris, contraste,
 * agrandissement (Tesseract lit mal sous ~30 px de hauteur de caractère),
 * binarisation. Un PNG en sortie pour éviter les artefacts JPEG.
 */
async function preparerImageTableau(entree: Buffer): Promise<Buffer> {
    const meta = await sharp(entree).metadata();
    const largeur = meta.width ?? 0;
    let pipeline = sharp(entree).rotate().greyscale().normalize();
    if (largeur > 0 && largeur < 2200) pipeline = pipeline.resize({ width: 2200, kernel: 'lanczos3' });
    return pipeline.sharpen().threshold(165).png().toBuffer();
}

/** OCR d'une image de tableau : lignes préservées, espaces multiples conservés. */
async function ocrTableau(image: Buffer): Promise<{ text: string; confidence: number }> {
    const worker = await createWorker('fra', 1, { cachePath: tmpdir() });
    try {
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
            preserve_interword_spaces: '1',
        });
        const { data } = await Promise.race([
            worker.recognize(image),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`OCR interrompu après ${OCR_BALANCE_TIMEOUT_MS / 1000} s`)), OCR_BALANCE_TIMEOUT_MS)),
        ]);
        return { text: data.text, confidence: data.confidence };
    } finally {
        await worker.terminate();
    }
}

/**
 * Reconstitue une balance depuis un fichier déposé.
 *
 * PDF : on tente d'abord le tableau (cellules), puis le texte ; si le PDF n'a
 * pas de couche texte (scan), chaque page est rendue en image puis lue par
 * l'OCR. Image : prétraitement puis OCR. Dans tous les cas, l'analyse des
 * lignes est faite par `parserBalanceTexte`, qui ne complète jamais rien.
 */
export async function reconstituerBalance(fichier: Buffer, mimeType: string, nomFichier: string): Promise<BalanceOCR> {
    const estPdf = mimeType === 'application/pdf' || /\.pdf$/i.test(nomFichier);

    if (estPdf) {
        const { PDFParse } = await import('pdf-parse');
        const pdf = new PDFParse({ data: new Uint8Array(fichier) });
        try {
            // 1. Tableau extrait de la couche texte
            try {
                const table = await pdf.getTable();
                const lignes = table.pages.flatMap((p) => p.tables.flatMap((t) => t));
                if (lignes.length >= 3) {
                    const r = parserBalanceTableau(lignes);
                    if (r.lignes.length >= 3) {
                        return { ...r, origine: 'PDF_TABLEAU', pages: table.pages.length, confianceOCR: null, texte: lignes.map((l) => l.join(' | ')).join('\n') };
                    }
                }
            } catch (e) {
                console.warn('Balance PDF : extraction de tableau impossible, repli sur le texte.', e instanceof Error ? e.message : e);
            }
            // 2. Texte de la couche texte
            const texte = await pdf.getText();
            const contenu = texte.text ?? '';
            if (contenu.replace(/\s/g, '').length >= MIN_CARACTERES_PDF) {
                const r = parserBalanceTexte(contenu);
                if (r.lignes.length >= 1) return { ...r, origine: 'PDF_TEXTE', pages: texte.pages?.length ?? 1, confianceOCR: null, texte: contenu };
            }
            // 3. PDF scanné : rendu image page par page puis OCR (5 pages max)
            const captures = await pdf.getScreenshot({ scale: 2, imageBuffer: true, first: 5 });
            let texteOCR = ''; const confiances: number[] = [];
            for (const page of captures.pages) {
                const image = await preparerImageTableau(Buffer.from(page.data));
                const { text, confidence } = await ocrTableau(image);
                texteOCR += text + '\n'; confiances.push(confidence);
            }
            const r = parserBalanceTexte(texteOCR);
            const conf = confiances.length ? Math.round(confiances.reduce((a, b) => a + b, 0) / confiances.length) : null;
            return { ...r, origine: 'OCR_PDF_SCANNE', pages: captures.pages.length, confianceOCR: conf, texte: texteOCR };
        } finally {
            await pdf.destroy().catch(() => {});
        }
    }

    const image = await preparerImageTableau(fichier);
    const { text, confidence } = await ocrTableau(image);
    const r = parserBalanceTexte(text);
    return { ...r, origine: 'OCR_IMAGE', pages: 1, confianceOCR: Math.round(confidence), texte: text };
}
