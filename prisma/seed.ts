import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { scopedPrismaForCabinet, type PrismaSeedScopeClient } from '../scripts/tenant-seed-scope';

let prisma: PrismaSeedScopeClient = new PrismaClient() as PrismaSeedScopeClient;

// Aucun mot de passe n'est codé en dur dans ce fichier versionné : chaque compte
// de démonstration reçoit un secret aléatoire, affiché une seule fois en fin de
// seed. Renseignez SEED_<ROLE>_PASSWORD pour imposer une valeur connue.
const issued: { email: string; password: string }[] = [];

async function hashFor(email: string, envVar: string): Promise<string> {
    const password = process.env[envVar]?.trim() || randomBytes(15).toString('base64url');
    issued.push({ email, password });
    return bcrypt.hash(password, 12);
}

async function main() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            "Ce seed supprime des données (deleteMany) et ne doit jamais être exécuté en production."
        );
    }

    console.log('🌱 Starting database seed...');

    const cabinet = await prisma.cabinet.upsert({
        where: { slug: 'cabinet-360-local-seed' },
        update: { statut: 'ACTIVE', trialExpiresAt: null },
        create: {
            slug: 'cabinet-360-local-seed',
            nom: 'Cabinet 360 — environnement local',
            plan: 'STARTER',
            statut: 'ACTIVE',
            pays: 'CI',
        },
    });
    const cabinetId = cabinet.id;
    prisma = scopedPrismaForCabinet(prisma as unknown as PrismaClient, cabinetId);

    // Cleanup existing data for demo repeatability
    await prisma.invoice.deleteMany();
    await prisma.financialData.deleteMany();
    await prisma.taxDeclaration.deleteMany();

    // Create Admin User
    const adminPassword = await hashFor('admin@cabinet360.com', 'SEED_ADMIN_PASSWORD');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@cabinet360.com' },
        update: {},
        create: {
            email: 'admin@cabinet360.com',
            password: adminPassword,
            firstName: 'Expert',
            lastName: 'Principal',
            role: 'ADMIN',
            phone: '+225 07 00 00 00 00',
            isActive: true,
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create Expert User
    const expertPassword = await hashFor('expert@cabinet360.com', 'SEED_EXPERT_PASSWORD');
    const expert = await prisma.user.upsert({
        where: { email: 'expert@cabinet360.com' },
        update: {},
        create: {
            email: 'expert@cabinet360.com',
            password: expertPassword,
            firstName: 'Jean',
            lastName: 'Kouassi',
            role: 'EXPERT',
            phone: '+225 07 11 22 33 44',
            isActive: true,
        },
    });
    console.log('✅ Expert user created:', expert.email);

    // Create Collaborator
    const collabPassword = await hashFor('collaborator@cabinet360.com', 'SEED_COLLABORATOR_PASSWORD');
    const collaborator = await prisma.user.upsert({
        where: { email: 'collaborator@cabinet360.com' },
        update: {},
        create: {
            email: 'collaborator@cabinet360.com',
            password: collabPassword,
            firstName: 'Marie',
            lastName: 'Traoré',
            role: 'COLLABORATOR',
            phone: '+225 07 55 66 77 88',
            isActive: true,
        },
    });
    console.log('✅ Collaborator created:', collaborator.email);

    // Create Sample Clients
    const client1 = await prisma.client.upsert({
        where: { cabinetId_email: { cabinetId, email: 'contact@sib-ci.com' } },
        update: {},
        create: {
            type: 'ENTREPRISE',
            companyName: 'Société Ivoirienne de Banque',
            email: 'contact@sib-ci.com',
            phone: '+225 27 20 12 34 56',
            rccm: 'CI-ABJ-2020-B-12345',
            ninea: null,
            ifu: '1234567890123',
            fiscalRegime: 'REEL_NORMAL',
            sector: 'Banque et Finance',
            country: 'CI',
            address: 'Avenue Chardy, Plateau',
            city: 'Abidjan',
            postalCode: '01 BP 1234',
            isActive: true,
        },
    });
    console.log('✅ Client created:', client1.companyName);

    const client2 = await prisma.client.upsert({
        where: { cabinetId_email: { cabinetId, email: 'traore@import-export.sn' } },
        update: {},
        create: {
            type: 'ENTREPRISE',
            companyName: 'Traoré Import-Export SARL',
            email: 'traore@import-export.sn',
            phone: '+221 33 123 45 67',
            rccm: 'SN-DKR-2019-B-54321',
            ninea: '987654321',
            ifu: null,
            fiscalRegime: 'REEL_SIMPLIFIE',
            sector: 'Commerce International',
            country: 'SN',
            address: 'Rue 10, Almadies',
            city: 'Dakar',
            postalCode: 'BP 5678',
            isActive: true,
        },
    });
    console.log('✅ Client created:', client2.companyName);

    const client3 = await prisma.client.upsert({
        where: { cabinetId_email: { cabinetId, email: 'contact@boulangerie-plateau.ci' } },
        update: {},
        create: {
            type: 'ENTREPRISE',
            companyName: 'Boulangerie du Plateau',
            email: 'contact@boulangerie-plateau.ci',
            phone: '+225 07 98 76 54 32',
            rccm: 'CI-ABJ-2021-B-98765',
            ninea: null,
            ifu: '9876543210987',
            fiscalRegime: 'CME',
            sector: 'Boulangerie / Pâtisserie',
            country: 'CI',
            address: 'Rue du Commerce, Plateau',
            city: 'Abidjan',
            postalCode: '08 BP 9876',
            isActive: true,
        },
    });
    console.log('✅ Client created:', client3.companyName);

    // Create Sample Mission
    const mission1 = await prisma.mission.create({
        data: {
            title: 'Audit Annuel 2024',
            description: 'Audit des comptes annuels exercice 2024',
            type: 'AUDIT',
            status: 'IN_PROGRESS',
            startDate: new Date('2024-05-01'),
            deadline: new Date('2024-06-30'),
            estimatedHours: 120,
            hourlyRate: 25000, // 25,000 FCFA/heure
            clientId: client1.id,
            assignedToId: expert.id,
            createdById: admin.id,
        },
    });
    console.log('✅ Mission created:', mission1.title);

    // Create Sample Time Entries
    await prisma.timeEntry.create({
        data: {
            date: new Date('2024-05-24'),
            duration: 4.0,
            category: 'AUDIT',
            status: 'SUBMITTED',
            description: 'Revue des comptes d\'attente',
            userId: expert.id,
            clientId: client1.id,
            missionId: mission1.id,
        },
    });

    await prisma.timeEntry.create({
        data: {
            date: new Date('2024-05-24'),
            duration: 1.5,
            category: 'PRODUCTION',
            status: 'APPROVED',
            description: 'Déclaration TVA mensuelle',
            userId: collaborator.id,
            clientId: client2.id,
        },
    });
    console.log('✅ Time entries created');

    // Create Sample Meeting
    await prisma.meeting.create({
        data: {
            title: 'Revue mensuelle Comptable',
            description: 'Point sur les comptes du mois',
            type: 'VIRTUELLE',
            status: 'PLANIFIE',
            startTime: new Date('2024-05-25T10:00:00'),
            endTime: new Date('2024-05-25T11:00:00'),
            meetingUrl: 'https://meet.google.com/abc-defg-hij',
            clientId: client1.id,
            organizerId: expert.id,
        },
    });
    console.log('✅ Meeting created');

    // Create Sample Tax Declaration
    await prisma.taxDeclaration.create({
        data: {
            type: 'TVA',
            status: 'PENDING',
            period: '2024-05',
            dueDate: new Date('2024-06-15'),
            amount: 2500000, // 2,500,000 FCFA
            clientId: client1.id,
        },
    });
    console.log('✅ Tax declaration created');
    
    // Create Sample Invoices for Banking Demo
    await prisma.invoice.create({
        data: {
            invoiceNumber: 'INV-2024-001',
            issueDate: new Date('2024-05-15'),
            dueDate: new Date('2024-06-15'),
            status: 'SENT',
            subtotal: 1000000,
            taxRate: 18,
            taxAmount: 180000,
            total: 1180000,
            clientId: client1.id,
        },
    });

    await prisma.invoice.create({
        data: {
            invoiceNumber: 'INV-2024-002',
            issueDate: new Date('2024-05-20'),
            dueDate: new Date('2024-06-20'),
            status: 'SENT',
            subtotal: 500000,
            taxRate: 18,
            taxAmount: 90000,
            total: 590000,
            clientId: client1.id,
        },
    });
    console.log('✅ Invoices created for banking demo');

    // Create Sample Financial Data for Diagnostic Demo
    console.log('📊 Seeding Financial Data for Diagnostic...');
    await prisma.financialData.create({
        data: {
            year: 2023,
            ca: 450000000,
            ebitda: 85000000,
            netResult: 35000000,
            totalBilan: 500000000,
            equity: 210000000,
            netCash: 27000000,
            bfr: 38000000,
            clientId: client1.id,
        }
    });

    await prisma.financialData.create({
        data: {
            year: 2024,
            ca: 520000000,
            ebitda: 92000000,
            netResult: 42000000,
            totalBilan: 580000000,
            equity: 261000000,
            netCash: 22000000,
            bfr: 45000000,
            clientId: client1.id,
        }
    });

    await prisma.financialData.create({
        data: {
            year: 2025,
            ca: 595000000,
            ebitda: 110000000,
            netResult: 51000000,
            totalBilan: 650000000,
            equity: 312000000,
            netCash: 28000000,
            bfr: 42000000,
            clientId: client1.id,
            isProjected: true
        }
    });
    console.log('✅ Financial data seeded for Diagnostic');

    // Create Sample Documents for Data Center Demo
    console.log('📄 Seeding Documents for Data Center...');
    await prisma.document.create({
        data: {
            fileName: 'FEC_2023_SIB_SENEGAL.xml',
            originalName: 'FEC_2023_SIB_SENEGAL.xml',
            fileSize: 14889984, // ~14.2 MB
            mimeType: 'text/xml',
            fileUrl: 'https://storage.google.com/cabinet360/fec_2023.xml',
            type: 'FACTURE', // Used as FEC proxy
            status: 'PROCESSED',
            clientId: client1.id,
            uploadedById: admin.id,
            ocrData: { entries: 124500 }
        }
    });

    await prisma.document.create({
        data: {
            fileName: 'Balance_Générale_May24_Orange.xlsx',
            originalName: 'Balance_Générale_May24_Orange.xlsx',
            fileSize: 1258291, // ~1.2 MB
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            fileUrl: 'https://storage.google.com/cabinet360/bal_2024.xlsx',
            type: 'RAPPORT', // Used as Balance proxy
            status: 'PROCESSED',
            clientId: client2.id,
            uploadedById: admin.id,
            ocrData: { entries: 450 }
        }
    });

    console.log('🎉 Database seeded successfully!');
    console.log('\n🔐 Identifiants générés (affichés une seule fois — notez-les maintenant) :');
    for (const { email, password } of issued) {
        console.log(`   ${email} / ${password}`);
    }
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
