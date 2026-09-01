/**
 * Contrôle EN LECTURE SEULE des numéros de téléphone des fiches clients, du
 * point de vue de la réception WhatsApp.
 *
 * Meta identifie l'expéditeur par son numéro. Deux situations empêchent le
 * rattachement d'un message à un dossier :
 *   - deux clients partagent le même numéro : imputer l'écriture serait un pari,
 *     le message est donc ignoré ;
 *   - le numéro est trop court pour être exploitable.
 *
 * Aucune donnée n'est modifiée.
 *
 *   npx tsx scripts/controler-telephones-clients.ts
 */
import { PrismaClient } from "@prisma/client";
import { chiffresTelephone } from "../src/lib/whatsapp-processor";

const prisma = new PrismaClient();

function nommer(c: { companyName: string | null; firstName: string | null; lastName: string | null }) {
    return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom";
}

async function main() {
    const clients = await prisma.client.findMany({
        select: { id: true, phone: true, companyName: true, firstName: true, lastName: true },
    });

    const parNumero = new Map<string, typeof clients>();
    const sansNumero: typeof clients = [];
    const tropCourts: typeof clients = [];

    for (const c of clients) {
        const chiffres = chiffresTelephone(c.phone);
        if (chiffres === "") {
            sansNumero.push(c);
            continue;
        }
        if (chiffres.length < 8) {
            tropCourts.push(c);
            continue;
        }
        const liste = parNumero.get(chiffres) ?? [];
        liste.push(c);
        parNumero.set(chiffres, liste);
    }

    const doublons = [...parNumero.entries()].filter(([, liste]) => liste.length > 1);

    console.log(`${clients.length} client(s) au total.\n`);

    console.log(`Joignables par WhatsApp : ${parNumero.size - doublons.length}`);
    console.log(`Sans numero de telephone : ${sansNumero.length}`);
    console.log(`Numero trop court pour etre exploitable : ${tropCourts.length}`);
    console.log(`Numeros partages par plusieurs clients : ${doublons.length}\n`);

    for (const c of tropCourts) {
        console.log(`   ⚠ numero trop court — ${nommer(c)} : « ${c.phone} »`);
    }

    for (const [numero, liste] of doublons) {
        console.log(`   ⚠ ${numero} est porte par ${liste.length} clients :`);
        for (const c of liste) console.log(`        - ${nommer(c)} (« ${c.phone} »)`);
        console.log("     Un message venant de ce numero ne sera rattache a aucun dossier.");
    }

    if (doublons.length === 0 && tropCourts.length === 0) {
        console.log("   Aucune anomalie : tous les numeros renseignes sont exploitables.");
    }
}

main()
    .catch((e) => {
        console.error("Echec :", e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
