
import { PrismaClient } from '@prisma/client';
import { installerPorteeSeed, type PrismaSeedScopeClient } from './tenant-seed-scope';

let prisma: PrismaSeedScopeClient = new PrismaClient() as PrismaSeedScopeClient;

async function main() {
    prisma = await installerPorteeSeed(prisma as unknown as PrismaClient);
    console.log('💎 Démarrage de l\'injection de la HAUTE EXPERTISE (Données Réelles)...');

    // 1. Nettoyage partiel (Optionnel mais recommandé pour les tests)
    // await prisma.communication.deleteMany({});
    // await prisma.newsBrief.deleteMany({});

    // 2. Clients Stratégiques avec Métadonnées de Gouvernance Réelles
    const clientsData = [
        {
            companyName: "Dakar Digital City SA",
            email: "contact@ddc.sn",
            phone: "+221 33 800 00 00",
            rccm: "SN-DKR-2024-B-1234",
            country: "SN",
            sector: "Technology / Fintech",
            agStatus: "valid",
            mandatStatus: "valid",
            depotComptesStatus: "valid",
            kycStatus: "valid",
            healthScore: 92,
            rating: "AAA"
        },
        {
            companyName: "SOGECOM Côte d'Ivoire",
            email: "direction@sogecom.ci",
            phone: "+225 07 00 00 00 00",
            rccm: "CI-ABJ-2023-B-5678",
            country: "CI",
            sector: "Import / Export",
            agStatus: "valid",
            mandatStatus: "expiring",
            depotComptesStatus: "valid",
            kycStatus: "valid",
            healthScore: 78,
            rating: "AA"
        },
        {
            companyName: "Traoré Import-Export SARL",
            email: "traore@business.ml",
            phone: "+223 20 00 00 00",
            rccm: "ML-BKO-2022-B-9012",
            country: "ML",
            sector: "Logistics",
            agStatus: "late",
            mandatStatus: "late",
            depotComptesStatus: "late",
            kycStatus: "invalid",
            healthScore: 42,
            rating: "C"
        },
        {
            companyName: "BIDC (Banque d'Investissement)",
            email: "info@bidc.tg",
            phone: "+228 22 00 00 00",
            rccm: "TG-LOM-2020-B-4321",
            country: "TG",
            sector: "Banking",
            agStatus: "valid",
            mandatStatus: "valid",
            depotComptesStatus: "late",
            kycStatus: "valid",
            healthScore: 88,
            rating: "AAA"
        },
        {
            companyName: "Boulangerie du Plateau SA",
            email: "admin@plateau-bread.sn",
            phone: "+221 77 000 00 00",
            rccm: "SN-DKR-2021-B-8888",
            country: "SN",
            sector: "Retail / Food",
            agStatus: "expiring",
            mandatStatus: "valid",
            depotComptesStatus: "valid",
            kycStatus: "valid",
            healthScore: 65,
            rating: "B"
        }
    ];

    console.log('📦 Mise à jour des clients stratégiques...');
    const clients = [];
    for (const data of clientsData) {
        const clientExistant = await prisma.client.findFirst({ where: { email: data.email } });
        const client = clientExistant
            ? await prisma.client.update({ where: { id: clientExistant.id }, data })
            : await prisma.client.create({ data });
        clients.push(client);
    }

    // 3. News Briefs Réels (Morning Brief)
    const newsData = [
        {
            title: "Réforme de la TVA 2026 au Sénégal",
            type: "FISCAL",
            content: "Le nouveau Projet de Loi de Finances prévoit une harmonisation des taux de TVA sur les services numériques. Impact direct pour vos clients tech.",
            summary: "Impact significatif sur les marges des startups SN.",
            source: "Journal Officiel SN",
            relevance: 9,
            date: new Date()
        },
        {
            title: "Nouvel Acte Uniforme OHADA : Arbitrage",
            type: "LEGAL",
            content: "Le Conseil des Ministres de l'OHADA a adopté une révision de l'acte relatif à l'arbitrage pour accélérer les contentieux commerciaux.",
            summary: "Opportunité de sécurisation des contrats exports.",
            source: "Secrétariat Permanent OHADA",
            relevance: 8,
            date: new Date()
        },
        {
            title: "Contrôle Douanes : Zone UEMOA",
            type: "URGENT",
            content: "Alerte sur le renforcement des contrôles aux frontières terrestres entre le Mali et le Sénégal. Documents d'origine requis sans délai.",
            summary: "Risque de blocage logistique pour Traoré Import.",
            source: "Direction des Douanes",
            relevance: 10,
            date: new Date()
        }
    ];

    console.log('🗞️ Injection des briefings IA...');
    for (const news of newsData) {
        await prisma.newsBrief.create({ data: news });
    }

    // 4. Communications Réelles (Hub Communication)
    const communicationsData = [
        {
            type: "email",
            sender: "M. Ibrahima Kane (Dakar Digital)",
            avatar: "IK",
            subject: "Questions sur la liasse fiscale 2025",
            preview: "Bonjour, je viens de vous envoyer les justificatifs pour les amortissements...",
            content: "Madame, Monsieur, nous avons bien pris note de vos remarques sur les amortissements dérogatoires. Voici les pièces jointes manquantes.",
            read: false,
            tags: ["Fiscal", "Urgent"]
        },
        {
            type: "whatsapp",
            sender: "Directeur SOGECOM",
            avatar: "DS",
            subject: "Urgence Mandat",
            preview: "Le mandat de notre DG expire dans 3 jours. Que faisons-nous ?",
            content: "Bonjour Maître, pouvez-vous préparer le PV d'AG pour le renouvellement du mandat ? C'est très urgent.",
            read: true,
            tags: ["Légal", "Relance"]
        },
        {
            type: "portal",
            sender: "Service Comptable BIDC",
            avatar: "BC",
            subject: "Validation Dépôt Comptes",
            preview: "Les comptes ont été validés par l'audit. Prêt pour dépôt RCCM.",
            content: "Les commissaires aux comptes ont signé le rapport spécial. Nous pouvons procéder au dépôt légal.",
            read: true,
            tags: ["Compliance"]
        }
    ];

    console.log('💬 Initialisation du flux de communication centralisé...');
    for (const comm of communicationsData) {
        await prisma.communication.create({ data: comm });
    }

    console.log('✅ HAUTE EXPERTISE : Données Réelles injectées avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
