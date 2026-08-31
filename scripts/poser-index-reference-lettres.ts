/**
 * Pose l'index unique manquant sur `engagement_letters.reference`.
 *
 * Pourquoi pas `prisma db push` : sur MongoDB, `db push` synchronise TOUS les
 * index de TOUTES les collections et peut supprimer ceux qui ne figurent pas au
 * schéma. Ici, une seule contrainte manque — `MissionOrder.reference` porte déjà
 * la sienne (`mission_orders_reference_key`). On crée donc exactement cet
 * index-là, sous le nom qu'emploie Prisma, pour que le schéma et la base
 * restent alignés et qu'un futur `db push` n'ait rien à faire.
 *
 * Le script refuse d'agir s'il trouve des doublons : l'index échouerait, et
 * corriger des références de documents contractuels est une décision métier,
 * pas une opération automatique.
 *
 * Réversible :
 *   db.engagement_letters.dropIndex("engagement_letters_reference_key")
 *
 *   npx tsx scripts/poser-index-reference-lettres.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COLLECTION = "engagement_letters";
const NOM_INDEX = "engagement_letters_reference_key";

type IndexMongo = { name: string; key: Record<string, number>; unique?: boolean };

async function listerIndex(): Promise<IndexMongo[]> {
    const res = (await prisma.$runCommandRaw({ listIndexes: COLLECTION })) as {
        cursor?: { firstBatch?: IndexMongo[] };
    };
    return res.cursor?.firstBatch ?? [];
}

async function main() {
    const dejaLa = (await listerIndex()).find((i) => i.name === NOM_INDEX);
    if (dejaLa) {
        console.log(`✔ L'index ${NOM_INDEX} existe déjà${dejaLa.unique ? " (unique)" : " SANS contrainte d'unicité !"}.`);
        if (!dejaLa.unique) {
            console.log("  Supprimez-le manuellement avant de relancer ce script.");
            process.exitCode = 1;
        }
        return;
    }

    const dupes = (await prisma.$runCommandRaw({
        aggregate: COLLECTION,
        pipeline: [
            { $group: { _id: "$reference", n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
            { $limit: 50 },
        ],
        cursor: {},
    })) as { cursor?: { firstBatch?: { _id: string; n: number }[] } };

    const doublons = dupes.cursor?.firstBatch ?? [];
    if (doublons.length > 0) {
        console.error(`✖ ${doublons.length} référence(s) en double : l'index unique échouerait.`);
        for (const d of doublons) console.error(`   « ${d._id} » présent ${d.n} fois`);
        console.error("  Corrigez ces lettres de mission avant de relancer.");
        process.exitCode = 1;
        return;
    }

    await prisma.$runCommandRaw({
        createIndexes: COLLECTION,
        indexes: [{ key: { reference: 1 }, name: NOM_INDEX, unique: true }],
    });

    const pose = (await listerIndex()).find((i) => i.name === NOM_INDEX);
    if (pose?.unique) {
        console.log(`✔ Index unique ${NOM_INDEX} posé sur ${COLLECTION}.reference.`);
    } else {
        console.error("✖ L'index n'apparaît pas après création — vérifiez manuellement.");
        process.exitCode = 1;
    }
}

main()
    .catch((e) => {
        console.error("Échec :", e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
