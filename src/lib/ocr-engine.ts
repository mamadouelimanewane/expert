import Tesseract from 'tesseract.js';
import sharp from 'sharp';

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

            // OCR avec Tesseract
            const { data } = await Tesseract.recognize(processedImageBuffer, 'fra', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                },
            });

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

        // Extraction du numéro de facture
        const invoiceNumberMatch = text.match(/(?:facture|invoice|n°|no|#)\s*:?\s*([A-Z0-9\-\/]+)/i);
        if (invoiceNumberMatch) {
            data.invoiceNumber = invoiceNumberMatch[1].trim();
        }

        // Extraction de la date
        const dateMatch = text.match(/(?:date|du)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        if (dateMatch) {
            data.date = dateMatch[1];
        }

        // Extraction du fournisseur (première ligne souvent)
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
            data.supplier = lines[0].trim();
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
     * Parse un montant en enlevant les espaces et en convertissant en nombre
     */
    private static parseAmount(amountStr: string): number {
        // Enlever les espaces, remplacer virgule par point
        const cleaned = amountStr.replace(/\s/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
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
