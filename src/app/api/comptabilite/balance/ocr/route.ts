import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { reconstituerBalance } from "@/lib/ocr-engine";

// L'OCR d'une page de balance prend 10 à 40 s ; rendu + OCR de plusieurs
// pages PDF davantage. Vercel coupe à 10 s par défaut.
export const maxDuration = 60;

const TAILLE_MAX = 12 * 1024 * 1024;
const TYPES_ACCEPTES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp", "image/tiff", "image/bmp"]);

/**
 * POST multipart { file } → lignes de balance reconstituées.
 *
 * Rien n'est enregistré : le résultat est proposé à l'écran, corrigé par
 * l'utilisateur, puis envoyé à POST /api/comptabilite/balance comme un
 * import ordinaire. Le fichier n'est pas conservé.
 */
export async function POST(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;
    try {
        const form = await request.formData().catch(() => null);
        const file = form?.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Fichier requis (champ « file »)." }, { status: 400 });
        }
        if (file.size === 0 || file.size > TAILLE_MAX) {
            return NextResponse.json({ error: "Fichier vide ou supérieur à 12 Mo." }, { status: 400 });
        }
        const type = file.type || (/\.pdf$/i.test(file.name) ? "application/pdf" : "");
        if (!TYPES_ACCEPTES.has(type)) {
            return NextResponse.json({ error: "Format non pris en charge : PDF, PNG, JPEG, WebP ou TIFF." }, { status: 415 });
        }
        const debut = Date.now();
        const resultat = await reconstituerBalance(Buffer.from(await file.arrayBuffer()), type, file.name);
        return NextResponse.json({
            ...resultat,
            fichier: file.name,
            dureeMs: Date.now() - debut,
            // Le texte brut peut être volumineux : borné pour l'affichage
            texte: resultat.texte.slice(0, 20_000),
        });
    } catch (error) {
        console.error("Erreur POST comptabilite/balance/ocr:", error);
        const message = error instanceof Error ? error.message : "Erreur serveur";
        const status = /interrompu/.test(message) ? 504 : 500;
        return NextResponse.json({ error: status === 504 ? message : "Lecture du document impossible." }, { status });
    }
}
