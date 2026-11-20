/**
 * Mise en état de la base pour une démonstration client.
 *
 *   npx tsx scripts/prepare-demo.ts            # simulation : affiche ce qui serait fait
 *   npx tsx scripts/prepare-demo.ts --apply    # applique
 *
 * Idempotent : peut être relancé sans dupliquer. Ne supprime rien : les
 * dossiers gênants sont archivés (isActive=false), les factures orphelines
 * annulées, les factures anciennes complétées d'une ligne d'honoraires.
 *
 * Actions :
 *  1. archive les clients de test (« Test » dans le nom) ;
 *  2. archive les doublons de raison sociale (garde le plus ancien, celui qui
 *     porte le plus de missions/factures) ;
 *  3. annule les factures dont le client n'existe plus ;
 *  4. ajoute une ligne « Honoraires » aux factures sans détail (montant = HT) ;
 *  5. crée deux lettres de mission (une signée, une envoyée) si aucune n'existe ;
 *  6. importe une balance de clôture 2025-12 pour le premier dossier actif
 *     sénégalais sans balance, pour montrer le bilan depuis une balance.
 */
import { PrismaClient } from "@prisma/client";
import { installerPorteeSeed, type PrismaSeedScopeClient } from "./tenant-seed-scope";

let prisma: PrismaSeedScopeClient = new PrismaClient() as PrismaSeedScopeClient;
const APPLY = process.argv.includes("--apply");
const log = (msg: string) => console.log(`${APPLY ? "✔" : "·"} ${msg}`);

const BALANCE_DEMO = [
    { numero: "101000", intitule: "Capital social", debit: 0, credit: 10_000_000 },
    { numero: "121000", intitule: "Report à nouveau", debit: 0, credit: 2_150_000 },
    { numero: "162000", intitule: "Emprunt bancaire", debit: 0, credit: 6_000_000 },
    { numero: "241000", intitule: "Matériel et outillage", debit: 9_500_000, credit: 0 },
    { numero: "244100", intitule: "Matériel informatique", debit: 3_200_000, credit: 0 },
    { numero: "284100", intitule: "Amortissements matériel", debit: 0, credit: 3_800_000 },
    { numero: "311000", intitule: "Stocks de marchandises", debit: 4_100_000, credit: 0 },
    { numero: "411100", intitule: "Clients", debit: 10_250_000, credit: 0 },
    { numero: "401100", intitule: "Fournisseurs", debit: 0, credit: 4_600_000 },
    { numero: "421000", intitule: "Personnel — rémunérations dues", debit: 0, credit: 1_150_000 },
    { numero: "431000", intitule: "CSS / IPRES", debit: 0, credit: 640_000 },
    { numero: "443000", intitule: "TVA facturée", debit: 0, credit: 1_260_000 },
    { numero: "445000", intitule: "TVA récupérable", debit: 780_000, credit: 0 },
    { numero: "521000", intitule: "Banque CBAO", debit: 5_940_000, credit: 0 },
    { numero: "571000", intitule: "Caisse", debit: 430_000, credit: 0 },
    { numero: "601000", intitule: "Achats de marchandises", debit: 28_400_000, credit: 0 },
    { numero: "603000", intitule: "Variation de stocks", debit: 0, credit: 600_000 },
    { numero: "605000", intitule: "Autres achats", debit: 2_150_000, credit: 0 },
    { numero: "622000", intitule: "Locations", debit: 3_600_000, credit: 0 },
    { numero: "624000", intitule: "Entretien et réparations", debit: 940_000, credit: 0 },
    { numero: "627000", intitule: "Publicité", debit: 1_200_000, credit: 0 },
    { numero: "631000", intitule: "Frais bancaires", debit: 380_000, credit: 0 },
    { numero: "641000", intitule: "Impôts et taxes", debit: 720_000, credit: 0 },
    { numero: "661000", intitule: "Rémunérations du personnel", debit: 9_600_000, credit: 0 },
    { numero: "664000", intitule: "Charges sociales", debit: 2_100_000, credit: 0 },
    { numero: "671000", intitule: "Intérêts des emprunts", debit: 540_000, credit: 0 },
    { numero: "681000", intitule: "Dotations aux amortissements", debit: 1_900_000, credit: 0 },
    { numero: "701000", intitule: "Ventes de marchandises", debit: 0, credit: 52_300_000 },
    { numero: "706000", intitule: "Services vendus", debit: 0, credit: 4_600_000 },
    { numero: "891000", intitule: "Impôt sur les bénéfices", debit: 1_370_000, credit: 0 },
];

async function main() {
    prisma = await installerPorteeSeed(prisma as unknown as PrismaClient, { willWrite: APPLY });
    console.log(APPLY ? "Application des changements…" : "SIMULATION — ajoutez --apply pour appliquer.\n");

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
    if (!admin) throw new Error("Aucun administrateur en base.");

    // 1. clients de test
    const tests = await prisma.client.findMany({ where: { isActive: true, companyName: { contains: "test", mode: "insensitive" } }, select: { id: true, companyName: true } });
    for (const c of tests) {
        log(`Archiver le client de test « ${c.companyName} »`);
        if (APPLY) await prisma.client.update({ where: { id: c.id }, data: { isActive: false, portalEnabled: false } });
    }

    // 2. doublons de raison sociale
    const actifs = await prisma.client.findMany({
        where: { isActive: true, companyName: { not: null } },
        select: { id: true, companyName: true, createdAt: true, _count: { select: { missions: true, invoices: true } } },
        orderBy: { createdAt: "asc" },
    });
    const cle = (n: string) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\b(sa|sarl|suarl|sas)\b/g, "").replace(/[^a-z0-9]/g, "");
    const groupes = new Map<string, typeof actifs>();
    for (const c of actifs) { const k = cle(c.companyName!); groupes.set(k, [...(groupes.get(k) ?? []), c]); }
    for (const [, g] of groupes) {
        if (g.length < 2) continue;
        const garde = [...g].sort((a, b) => (b._count.missions + b._count.invoices) - (a._count.missions + a._count.invoices) || a.createdAt.getTime() - b.createdAt.getTime())[0];
        for (const c of g) {
            if (c.id === garde.id) continue;
            log(`Archiver le doublon « ${c.companyName} » (${c._count.missions} missions, ${c._count.invoices} factures) — conservé : ${garde.id}`);
            if (APPLY) await prisma.client.update({ where: { id: c.id }, data: { isActive: false, portalEnabled: false } });
        }
    }

    // 3. factures orphelines
    const clientIds = new Set((await prisma.client.findMany({ select: { id: true } })).map((c) => c.id));
    const factures = await prisma.invoice.findMany({ select: { id: true, invoiceNumber: true, clientId: true, status: true, subtotal: true, lines: true } });
    for (const f of factures) {
        if (!clientIds.has(f.clientId) && f.status !== "CANCELLED") {
            log(`Annuler la facture orpheline ${f.invoiceNumber} (client inexistant)`);
            if (APPLY) await prisma.invoice.update({ where: { id: f.id }, data: { status: "CANCELLED", notes: "Annulée : dossier client supprimé (mise en état démo)" } });
        }
    }

    // 4. lignes manquantes
    const sansLignes = factures.filter((f) => !f.lines);
    if (sansLignes.length) {
        log(`Compléter ${sansLignes.length} factures sans détail par une ligne « Honoraires » égale au HT`);
        if (APPLY) for (const f of sansLignes) {
            await prisma.invoice.update({ where: { id: f.id }, data: { lines: [{ designation: "Honoraires de mission", quantity: 1, unitPrice: f.subtotal, amount: f.subtotal }] } });
        }
    }

    // 5. lettres de mission
    const nbLettres = await prisma.engagementLetter.count();
    const cibles = await prisma.client.findMany({ where: { isActive: true, country: "SN" }, orderBy: { createdAt: "asc" }, take: 2, select: { id: true, companyName: true } });
    if (nbLettres === 0 && cibles.length >= 1) {
        const modeles = [
            { scope: "Tenue de la comptabilité, établissement des états financiers SYSCOHADA et des déclarations fiscales mensuelles (TVA, retenues) — exercice 2026.", fees: 2_400_000, status: "SIGNEE" as const, signatoryName: "Le Gérant", signedAt: new Date("2026-01-15") },
            { scope: "Mission de commissariat aux comptes — exercice clos le 31 décembre 2025 : audit légal, rapport général et rapport spécial.", fees: 3_500_000, status: "ENVOYEE" as const, signatoryName: null, signedAt: null },
        ];
        const annee = new Date().getFullYear();
        for (let i = 0; i < Math.min(2, cibles.length); i++) {
            const m = modeles[i]; const c = cibles[i];
            log(`Créer la lettre LM-${annee}-00${i + 1} (${m.status}) pour « ${c.companyName} »`);
            if (APPLY) await prisma.engagementLetter.create({ data: { reference: `LM-${annee}-00${i + 1}`, scope: m.scope, fees: m.fees, status: m.status, signatoryName: m.signatoryName, signedAt: m.signedAt, clientId: c.id, createdById: admin.id } });
        }
    } else log(`Lettres de mission : ${nbLettres} déjà présentes, rien à créer`);

    // 6. balance de démonstration
    const dejaDemo = await prisma.balanceImportee.count({ where: { fichier: "balance-2025-demo.xlsx" } });
    const candidat = dejaDemo > 0 ? null : await prisma.client.findFirst({ where: { isActive: true, country: "SN", balancesImportees: { none: {} } }, orderBy: { createdAt: "asc" }, select: { id: true, companyName: true } });
    if (candidat) {
        const totalDebit = BALANCE_DEMO.reduce((s, l) => s + l.debit, 0);
        const totalCredit = BALANCE_DEMO.reduce((s, l) => s + l.credit, 0);
        log(`Importer la balance 2025-12 (${BALANCE_DEMO.length} comptes, débit ${totalDebit.toLocaleString("fr-FR")} / crédit ${totalCredit.toLocaleString("fr-FR")}) pour « ${candidat.companyName} »`);
        if (Math.abs(totalDebit - totalCredit) > 1) throw new Error("Balance de démo déséquilibrée : corriger BALANCE_DEMO.");
        if (APPLY) await prisma.balanceImportee.upsert({
            where: { clientId_periode: { clientId: candidat.id, periode: "2025-12" } },
            create: { clientId: candidat.id, periode: "2025-12", fichier: "balance-2025-demo.xlsx", lignes: BALANCE_DEMO, nbLignes: BALANCE_DEMO.length, totalDebit, totalCredit, equilibree: true, importedById: admin.id },
            update: { lignes: BALANCE_DEMO, nbLignes: BALANCE_DEMO.length, totalDebit, totalCredit, equilibree: true },
        });
    } else log("Balance de démo : déjà présente ou aucun dossier SN actif");

    console.log(APPLY ? "\nTerminé." : "\nAucune modification effectuée (simulation).");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
