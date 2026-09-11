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
        validation,
        warnings: validation.missing.length > 0
            ? `Données manquantes : ${validation.missing.join(', ')}`
            : null,
    };
}
