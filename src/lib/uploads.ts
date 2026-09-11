import { existsSync, mkdirSync, accessSync, constants } from "fs";
import { join } from "path";
import { tmpdir } from "os";

/**
 * Dossier de stockage des pièces déposées.
 *
 * Ordre : UPLOAD_DIR (variable d'environnement), sinon `uploads/` à la
 * racine du projet, sinon un dossier temporaire du système. Sur Vercel le
 * système de fichiers est en lecture seule hors /tmp : sans ce repli, tout
 * dépôt de pièce échouait en production (EROFS). Le stockage y est éphémère :
 * c'est pourquoi la relecture par IA renvoie le fichier depuis le navigateur
 * plutôt que de compter sur le disque.
 */
let cache: string | null = null;

export function dossierUploads(): string {
    if (cache) return cache;
    const candidats = [process.env.UPLOAD_DIR, join(process.cwd(), "uploads"), join(tmpdir(), "cabinet360-uploads")].filter(Boolean) as string[];
    for (const dir of candidats) {
        try {
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            accessSync(dir, constants.W_OK);
            cache = dir;
            return dir;
        } catch {
            // dossier non inscriptible : candidat suivant
        }
    }
    cache = tmpdir();
    return cache;
}

/** Chemin disque d'une pièce à partir de son nom de fichier enregistré. */
export function cheminPiece(fileName: string): string {
    return join(dossierUploads(), fileName);
}
