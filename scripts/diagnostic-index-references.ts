/**
 * Diagnostic EN LECTURE SEULE avant la pose d'un index unique sur
 * `engagement_letters.reference`.
 *
 * Un index unique échoue si la collection contient déjà des doublons. Ce script
 * les liste et affiche les index existants, sans rien modifier.
 *
 *   npx tsx scripts/diagnostic-index-references.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type IndexMongo = { name: string; key: Record<string, number>; unique?: boolean };

async function indexes(collection: string): Promise<IndexMongo[]> {
    try {
        const res = (await prisma.$runCommandRaw({ listIndexes: collection })) as {
            cursor?: { firstBatch?: IndexMongo[] };
        };
        return res.cursor?.firstBatch ?? [];
    } catch (error) {
        console.log(`   (impossible de lire les index de ${collection} : ${(error as Error).message})`);
        return [];
    }
}

async function doublons(collection: string, champ: string) {
    const res = (await prisma.$runCommandRaw({
        aggregate: collection,
        pipeline: [
            { $group: { _id: `$${champ}`, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
            { $sort: { n: -1 } },
            { $limit: 50 },
        ],
        cursor: {},
    })) as { cursor?: { firstBatch?: { _id: string; n: number }[] } };

    return res.cursor?.firstBatch ?? [];
}

async function main() {
    for (const collection of ["engagement_letters", "mission_orders"]) {
        const total = (await prisma.$runCommandRaw({ count: collection })) as { n?: number };
        console.log(`\n=== ${collection} — ${total.n ?? 0} document(s) ===`);

        const liste = await indexes(collection);
        console.log("   Index existants :");
        for (const i of liste) {
            console.log(`     - ${i.name} sur ${JSON.stringify(i.key)}${i.unique ? " [UNIQUE]" : ""}`);
        }

        const dupes = await doublons(collection, "reference");
        if (dupes.length === 0) {
            console.log("   Doublons de `reference` : AUCUN — un index unique peut être posé.");
        } else {
            console.log(`   Doublons de \`reference\` : ${dupes.length} valeur(s) en double`);
            for (const d of dupes) console.log(`     - « ${d._id} » présent ${d.n} fois`);
        }
    }
}

main()
    .catch((e) => {
        console.error("Échec du diagnostic :", e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
