/**
 * Test de bout en bout du traitement d'un message WhatsApp entrant.
 *
 * Exerce `processIncomingWhatsAppMessage` exactement comme le fait le webhook
 * Meta, mais en mode `simulate: true` :
 *   - aucun message n'est envoyé au client (garde explicite du processeur) ;
 *   - les écritures créées portent source="WHATSAPP_TEST" et le préfixe
 *     "[SIMULATION TEST]", et sont exclues de l'export FEC.
 *
 * Le script supprime à la fin les écritures qu'il a créées, et elles seules :
 * un deleteMany sur source="WHATSAPP_TEST" emporterait aussi celles laissées
 * par d'autres passages.
 *
 *   npx tsx scripts/test-whatsapp-pipeline.ts
 */
import { PrismaClient } from "@prisma/client";
import { processIncomingWhatsAppMessage, chiffresTelephone } from "../src/lib/whatsapp-processor";
import { installerPorteeSeed, type PrismaSeedScopeClient } from "./tenant-seed-scope";

let prisma: PrismaSeedScopeClient = new PrismaClient() as PrismaSeedScopeClient;

const CAS = [
    {
        titre: "Montant en fin de message, precede d'une quantite",
        message: "Vente 3 sacs de riz 45000",
        attendu: "montant = 45000 (l'ancienne extraction retenait 3)",
    },
    {
        titre: "Date en debut de message",
        message: "Le 15/03 vente 50000",
        attendu: "montant = 50000 (l'ancienne extraction retenait 15)",
    },
    {
        titre: "Montant avec separateurs de milliers",
        message: "Achat carburant 1 250 000",
        attendu: "montant = 1250000",
    },
    {
        titre: "Aucun montant identifiable",
        message: "Bonjour, tout va bien chez vous ?",
        attendu: "aucune ecriture creee (status montant_absent)",
    },
];

async function main() {
    prisma = await installerPorteeSeed(prisma as unknown as PrismaClient);
    // Un numero partage par plusieurs clients est volontairement refuse par le
    // processeur (imputer l'ecriture serait un pari) : le test doit donc porter
    // sur un client dont le numero est unique.
    const candidats = await prisma.client.findMany({
        where: { phone: { not: "" } },
        orderBy: { createdAt: "desc" },
        select: { id: true, phone: true, companyName: true, firstName: true, lastName: true },
    });

    const occurrences = new Map<string, number>();
    for (const c of candidats) {
        const cle = chiffresTelephone(c.phone);
        occurrences.set(cle, (occurrences.get(cle) ?? 0) + 1);
    }

    const client = candidats.find((c) => occurrences.get(chiffresTelephone(c.phone)) === 1);

    if (!client) {
        console.error("Aucun client avec un numero de telephone unique : test impossible.");
        process.exitCode = 1;
        return;
    }

    const nom = client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ");
    console.log(`Client de test : ${nom}\n`);

    // Bornes du nettoyage : seules les ecritures creees par CE passage seront
    // supprimees. Un deleteMany sur source="WHATSAPP_TEST" emporterait aussi
    // les ecritures de test laissees par d'autres passages.
    const debut = new Date();

    for (const cas of CAS) {
        const resultat = await processIncomingWhatsAppMessage({
            senderPhone: client.phone,
            messageType: "text",
            textBody: cas.message,
            simulate: true,
        });

        console.log(`— ${cas.titre}`);
        console.log(`  message  : « ${cas.message} »`);
        console.log(`  attendu  : ${cas.attendu}`);
        console.log(
            `  obtenu   : status=${resultat.status}` +
            ("montant" in resultat ? ` montant=${resultat.montant}` : "") +
            ("lignesJournal" in resultat ? ` lignes=${resultat.lignesJournal}` : "") +
            ("requiresReview" in resultat ? ` aQualifier=${resultat.requiresReview}` : "") +
            ("replySent" in resultat ? ` messageEnvoye=${resultat.replySent}` : "")
        );
        console.log("");
    }

    // Photo de facture : aucun OCR n'est branche sur les pieces jointes.
    const image = await processIncomingWhatsAppMessage({
        senderPhone: client.phone,
        messageType: "image",
        simulate: true,
    });
    console.log("— Photo de facture");
    console.log("  attendu  : aucune ecriture creee (status image_non_traitee)");
    console.log(`  obtenu   : status=${image.status}\n`);

    // Numero inconnu du portefeuille.
    const inconnu = await processIncomingWhatsAppMessage({
        senderPhone: "+000000000000",
        messageType: "text",
        textBody: "Vente 10000",
        simulate: true,
    });
    console.log("— Numero inconnu du portefeuille");
    console.log("  attendu  : status unknown_client, aucune ecriture");
    console.log(`  obtenu   : status=${inconnu.status}\n`);

    const creees = await prisma.tpeJournal.findMany({
        where: { source: "WHATSAPP_TEST", createdAt: { gte: debut } },
        select: {
            id: true, libelle: true, montant: true,
            debitCompte: true, debitIntitule: true,
            creditCompte: true, creditIntitule: true,
            entree: true, sortie: true, date: true, status: true,
        },
        orderBy: { createdAt: "asc" },
    });

    console.log(`Ecritures creees par ce passage : ${creees.length}`);
    for (const e of creees) {
        console.log(`  ${e.date} | ${e.libelle}`);
        console.log(
            `     debit  ${e.debitCompte} ${e.debitIntitule}` +
            `  /  credit ${e.creditCompte} ${e.creditIntitule}` +
            `  =  ${e.montant.toLocaleString("fr-FR")} FCFA` +
            `  [entree ${e.entree} / sortie ${e.sortie}, statut ${e.status}]`
        );
    }

    const supprimees = await prisma.tpeJournal.deleteMany({
        where: { id: { in: creees.map((e) => e.id) } },
    });
    console.log("");
    console.log(`Ecritures de ce passage supprimees : ${supprimees.count}`);

    const resteTest = await prisma.tpeJournal.count({ where: { source: "WHATSAPP_TEST" } });
    console.log(`Ecritures WHATSAPP_TEST restant en base : ${resteTest}`);
}

main()
    .catch((e) => {
        console.error("Echec du test :", e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
