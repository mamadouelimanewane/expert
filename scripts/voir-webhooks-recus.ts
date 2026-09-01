/**
 * Affiche les dernières livraisons de webhooks enregistrées dans le journal
 * d'audit — lecture seule.
 *
 * Sert à répondre à la question « le fournisseur a-t-il appelé, et sa signature
 * a-t-elle été acceptée ? » sans dépendre des logs runtime de l'hébergeur.
 *
 *   npx tsx scripts/voir-webhooks-recus.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const lignes = await prisma.auditLog.findMany({
        where: { entity: "WEBHOOK" },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { createdAt: true, action: true, details: true, entityId: true },
    });

    if (lignes.length === 0) {
        console.log("Aucune livraison de webhook enregistrée.");
        console.log("");
        console.log("Cela signifie qu'aucune notification n'a atteint l'application depuis");
        console.log("la mise en place de la traçabilité — ni acceptée, ni refusée.");
        return;
    }

    console.log(`${lignes.length} dernière(s) livraison(s) :\n`);
    for (const l of lignes) {
        const horodatage = l.createdAt.toISOString().replace("T", " ").substring(0, 19);
        const marque = l.action === "WEBHOOK_RECU" ? "✔ ACCEPTE" : "✖ REFUSE ";
        console.log(`  ${horodatage}  ${marque}  ${l.details ?? ""}`);
    }

    // Écritures comptables réellement produites par WhatsApp (hors simulations).
    const ecritures = await prisma.tpeJournal.count({ where: { source: "WHATSAPP" } });
    console.log(`\nÉcritures comptables créées via WhatsApp (hors tests) : ${ecritures}`);
}

main()
    .catch((e) => {
        console.error("Échec :", e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
