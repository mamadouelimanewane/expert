import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { lireDocumentParVision, normaliserLecture, visionConfiguree, MODELE_VISION } from "@/lib/ocr-vision";

// Une page manuscrite prend 20 à 60 s de lecture par le modèle.
export const maxDuration = 120;

const TAILLE_MAX = 20 * 1024 * 1024;
const TYPES_ACCEPTES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"]);

/** GET : l'écran sait s'il peut proposer la lecture par IA. */
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;
    return NextResponse.json({ disponible: visionConfiguree(), modele: MODELE_VISION });
}

/**
 * POST multipart { file } → transcription structurée par le modèle de vision.
 *
 * Voie explicite « Lire avec l'IA » de l'écran d'import : le document est
 * transmis à l'API Anthropic (contrairement à Tesseract, qui tourne sur le
 * serveur). Rien n'est enregistré ici ; le résultat est relu et corrigé à
 * l'écran avant l'import ordinaire (balance) ou l'ingestion (journal).
 *
 * La réponse reprend la forme de /api/comptabilite/balance/ocr pour que
 * l'écran traite les deux origines de la même façon.
 */
export async function POST(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;
    if (!visionConfiguree()) {
        return NextResponse.json({ error: "Lecture par IA non configurée sur ce serveur (ANTHROPIC_API_KEY absente).", nonConfigure: true }, { status: 503 });
    }
    try {
        const form = await request.formData().catch(() => null);
        const file = form?.get("file");
        if (!(file instanceof File)) return NextResponse.json({ error: "Fichier requis (champ « file »)." }, { status: 400 });
        if (file.size === 0 || file.size > TAILLE_MAX) return NextResponse.json({ error: "Fichier vide ou supérieur à 20 Mo." }, { status: 400 });
        const type = file.type || (/\.pdf$/i.test(file.name) ? "application/pdf" : "");
        if (!TYPES_ACCEPTES.has(type)) return NextResponse.json({ error: "Format non pris en charge : PDF, PNG, JPEG ou WebP." }, { status: 415 });

        const debut = Date.now();
        const r = await lireDocumentParVision(Buffer.from(await file.arrayBuffer()), type, file.name);
        if (!r.ok) {
            const status = r.raison === "non_configure" ? 503 : r.raison === "refus" ? 422 : r.raison === "illisible" ? 422 : 502;
            return NextResponse.json({ error: r.message, raison: r.raison }, { status });
        }
        const L = r.lecture;
        const N = normaliserLecture(L);

        return NextResponse.json({
            origine: "IA_VISION",
            modele: r.modele,
            document: L.document,
            titre: L.titre,
            periodeLue: L.periode,
            devise: L.devise,
            pages: 1,
            confianceOCR: null,
            disposition: L.document === "balance" ? "debit-credit" : "inconnue",
            lignes: N.lignes,
            rejets: N.rejets,
            totauxDetectes: N.totauxDetectes,
            totauxCalcules: N.totauxCalcules,
            controleTotaux: N.controleTotaux,
            journal: N.journal,
            remarques: L.remarques,
            texte: L.remarques.join("\n"),
            usage: r.usage,
            fichier: file.name,
            dureeMs: Date.now() - debut,
        });
    } catch (error) {
        console.error("Erreur POST comptabilite/balance/ia:", error);
        return NextResponse.json({ error: "Lecture par IA impossible." }, { status: 500 });
    }
}
