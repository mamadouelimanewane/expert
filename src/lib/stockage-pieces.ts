/**
 * Stockage durable des pièces justificatives (factures scannées, relevés…).
 *
 * Le disque du serveur ne convient pas : sur Vercel il est en lecture seule
 * hors /tmp, et /tmp disparaît entre deux invocations — une pièce déposée
 * n'était plus rouvrable quelques minutes plus tard. Les fichiers vont donc
 * dans MongoDB Atlas via GridFS (déjà en place, aucune clé supplémentaire),
 * dans le bucket `pieces` de la base de l'application.
 *
 * Sans DATABASE_URL (CI, tests), on retombe sur le disque local.
 */
import { GridFSBucket, MongoClient, ObjectId } from "mongodb";
import { readFile, writeFile, unlink } from "fs/promises";
import { cheminPiece } from "./uploads";

const BUCKET = "pieces";
const TAILLE_MAX = 25 * 1024 * 1024;

let clientPromise: Promise<MongoClient> | null = null;

function obtenirClient(): Promise<MongoClient> | null {
    const url = process.env.DATABASE_URL;
    if (!url) return null;
    if (!clientPromise) {
        // Un seul client par processus (Next.js recharge les modules en dev :
        // on l'accroche à globalThis pour ne pas ouvrir une connexion par rechargement).
        const g = globalThis as unknown as { __piecesMongo?: Promise<MongoClient> };
        clientPromise = g.__piecesMongo ?? (g.__piecesMongo = new MongoClient(url, { maxPoolSize: 5 }).connect());
    }
    return clientPromise;
}

async function bucket(): Promise<GridFSBucket | null> {
    const client = await obtenirClient();
    if (!client) return null;
    return new GridFSBucket(client.db(), { bucketName: BUCKET });
}

export type PieceStockee = { cle: string; support: "gridfs" | "disque" };

/** Enregistre une pièce et renvoie sa clé (ObjectId GridFS ou nom de fichier local). */
export async function stockerPiece(contenu: Buffer, nom: string, mimeType: string, metadata: Record<string, unknown> = {}): Promise<PieceStockee> {
    if (contenu.length === 0 || contenu.length > TAILLE_MAX) throw new Error("Pièce vide ou supérieure à 25 Mo.");
    const b = await bucket();
    if (!b) {
        await writeFile(cheminPiece(nom), contenu);
        return { cle: nom, support: "disque" };
    }
    const id = await new Promise<ObjectId>((resolve, reject) => {
        const flux = b.openUploadStream(nom, { contentType: mimeType, metadata });
        flux.on("error", reject);
        flux.on("finish", () => resolve(flux.id as ObjectId));
        flux.end(contenu);
    });
    return { cle: id.toHexString(), support: "gridfs" };
}

/** Relit une pièce ; null si elle n'existe plus. */
export async function lirePiece(cle: string, support: "gridfs" | "disque" = /^[0-9a-f]{24}$/i.test(cle) ? "gridfs" : "disque"): Promise<{ contenu: Buffer; mimeType: string; nom: string } | null> {
    if (support === "disque") {
        try {
            const contenu = await readFile(cheminPiece(cle));
            return { contenu, mimeType: "application/octet-stream", nom: cle };
        } catch {
            return null;
        }
    }
    const b = await bucket();
    if (!b) return null;
    const id = new ObjectId(cle);
    const [info] = await b.find({ _id: id }).limit(1).toArray();
    if (!info) return null;
    const morceaux: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
        b.openDownloadStream(id).on("data", (c: Buffer) => morceaux.push(c)).on("error", reject).on("end", () => resolve());
    });
    return { contenu: Buffer.concat(morceaux), mimeType: info.contentType ?? "application/octet-stream", nom: info.filename };
}

export async function supprimerPiece(cle: string): Promise<void> {
    if (!/^[0-9a-f]{24}$/i.test(cle)) {
        await unlink(cheminPiece(cle)).catch(() => {});
        return;
    }
    const b = await bucket();
    if (!b) return;
    await b.delete(new ObjectId(cle)).catch(() => {});
}
