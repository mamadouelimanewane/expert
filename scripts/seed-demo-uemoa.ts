
import { PrismaClient, ClientType, MissionStatus, InvoiceStatus, FiscalRegime, MissionType, DeclarationType, DeclarationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Données de référence UEMOA
const INDUSTRIES = ['BTP & Construction', 'Négoce International', 'Services Numériques', 'Agro-Industrie', 'Transport & Logistique', 'Commerce Général', 'Santé & Pharma'];
const CITIES = [
    { city: 'Dakar', country: 'SN' },
    { city: 'Abidjan', country: 'CI' },
    { city: 'Bamako', country: 'ML' },
    { city: 'Ouagadougou', country: 'BF' },
    { city: 'Thiès', country: 'SN' },
    { city: 'Saint-Louis', country: 'SN' },
    { city: 'Lomé', country: 'TG' }
];

const EXPERTS = [
    { firstName: 'Aminata', lastName: 'Sow', email: 'aminata.sow@cabinet360.com' },
    { firstName: 'Moussa', lastName: 'Diop', email: 'moussa.diop@cabinet360.com' },
    { firstName: 'Jean-Luc', lastName: 'Koffi', email: 'jl.koffi@cabinet360.com' }
];

const COMPANIES = [
    { name: 'Sahel Construction SA', type: 'ENTREPRISE', sector: 'BTP & Construction' },
    { name: 'Teranga Tech Solutions', type: 'ENTREPRISE', sector: 'Services Numériques' },
    { name: 'Négoce Ouest Africain', type: 'ENTREPRISE', sector: 'Négoce International' },
    { name: 'Pharmacie du Plateau', type: 'ENTREPRISE', sector: 'Santé & Pharma' },
    { name: 'Ivoire Logistique', type: 'ENTREPRISE', sector: 'Transport & Logistique' },
    { name: 'Baobab Agri-Business', type: 'ENTREPRISE', sector: 'Agro-Industrie' },
    { name: 'Cabinet Architecture Faye', type: 'ENTREPRISE', sector: 'BTP & Construction' },
    { name: 'Dr. Cheikh Ndiaye', type: 'PARTICULIER', sector: 'Santé' },
    { name: 'Mme. Fatou Bintou Lo', type: 'PARTICULIER', sector: 'Consulting' }
];

async function main() {
    console.log('🚀 Démarrage de l\'injection des données DEMO UEMOA...');

    // 1. Création des Collaborateurs
    console.log('👤 Création des collaborateurs...');
    const users = [];
    const password = await bcrypt.hash('password123', 10);

    for (const expert of EXPERTS) {
        const user = await prisma.user.upsert({
            where: { email: expert.email },
            update: {},
            create: {
                ...expert,
                password,
                role: 'COLLABORATOR',
                isActive: true
            }
        });
        users.push(user);
    }
    // Ajouter l'admin existant à la liste
    const admin = await prisma.user.findUnique({ where: { email: 'admin@cabinet360.com' } });
    if (admin) users.push(admin);

    const creatorId = admin ? admin.id : users[0].id;

    // 2. Création des Clients
    console.log('🏢 Création du portefeuille clients...');
    const clients = [];

    for (const company of COMPANIES) {
        const location = CITIES[Math.floor(Math.random() * CITIES.length)];
        const rccm = `${location.country}-${location.city.substring(0, 3).toUpperCase()}-202${Math.floor(Math.random() * 5)}-B-${Math.floor(Math.random() * 10000)}`;
        const email = `contact@${company.name.toLowerCase().replace(/[^a-z]/g, '')}.com`;

        const client = await prisma.client.upsert({
            where: { email: email },
            update: {},
            create: {
                type: company.type as ClientType,
                companyName: company.type === 'ENTREPRISE' ? company.name : undefined,
                firstName: company.type === 'ENTREPRISE' ? 'M. Directeur' : company.name.split(' ')[1],
                lastName: company.type === 'ENTREPRISE' ? 'Général' : company.name.split(' ').slice(2).join(' '),
                email: email,
                phone: `+221 77 ${Math.floor(Math.random() * 999)} ${Math.floor(Math.random() * 99)} ${Math.floor(Math.random() * 99)}`,
                address: 'Avenue de la République',
                city: location.city,
                country: location.country,
                sector: company.sector,
                rccm: rccm,
                ninea: `${Math.floor(Math.random() * 10000000)}0`,
                fiscalRegime: Math.random() > 0.5 ? FiscalRegime.REEL_NORMAL : FiscalRegime.REEL_SIMPLIFIE,
                isActive: true
            }
        });
        clients.push(client);
    }

    // 3. Création des Missions & Factures & Déclarations
    console.log('💼 Génération des missions, factures et déclarations...');

    const missionTitles = ['Tenue Comptable 2026', 'Audit Légal', 'Déclarations Fiscales Mensuelles', 'Montage Business Plan', 'Assistance Juridique'];

    for (const client of clients) {
        // --- Missions ---
        const assignedUser = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;

        const existingMissions = await prisma.mission.count({ where: { clientId: client.id } });

        if (existingMissions === 0) {
            const nbMissions = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < nbMissions; i++) {
                await prisma.mission.create({
                    data: {
                        title: missionTitles[Math.floor(Math.random() * missionTitles.length)],
                        description: `Mission de suivi régulier pour ${client.companyName || client.lastName}`,
                        status: ([MissionStatus.IN_PROGRESS, MissionStatus.PENDING_REVIEW, MissionStatus.COMPLETED, MissionStatus.DRAFT] as MissionStatus[])[Math.floor(Math.random() * 4)],
                        type: ([MissionType.TENUE_COMPTABLE, MissionType.AUDIT, MissionType.CONSEIL, MissionType.DECLARATION_FISCALE] as MissionType[])[Math.floor(Math.random() * 4)],
                        startDate: new Date(),
                        deadline: new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 60))),
                        clientId: client.id,
                        assignedToId: assignedUser ? assignedUser.id : undefined,
                        createdById: creatorId
                    }
                });
            }
        }

        // --- Factures ---
        const existingInvoices = await prisma.invoice.count({ where: { clientId: client.id } });

        if (existingInvoices === 0) {
            const nbInvoices = Math.floor(Math.random() * 5); // 0 à 4 factures
            for (let i = 0; i < nbInvoices; i++) {
                const amount = Math.floor(Math.random() * 500000) + 100000;
                const status = ([InvoiceStatus.PAID, InvoiceStatus.SENT, InvoiceStatus.OVERDUE, InvoiceStatus.DRAFT] as InvoiceStatus[])[Math.floor(Math.random() * 4)];

                await prisma.invoice.create({
                    data: {
                        invoiceNumber: `FACT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                        status: status,
                        issueDate: new Date(),
                        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                        subtotal: amount,
                        taxRate: 18,
                        taxAmount: amount * 0.18,
                        total: amount * 1.18,
                        clientId: client.id
                    }
                });
            }
        }

        // --- Déclarations Fiscales ---
        const existingDecls = await prisma.taxDeclaration.count({ where: { clientId: client.id } });

        if (existingDecls === 0) {
            const declTypes = [DeclarationType.TVA, DeclarationType.COTISATION_SOCIALE, DeclarationType.IS, DeclarationType.AUTRE];
            const declType = declTypes[Math.floor(Math.random() * declTypes.length)];

            await prisma.taxDeclaration.create({
                data: {
                    type: declType,
                    period: `0${Math.floor(Math.random() * 3) + 1}-2026`, // Jan-Mars 2026
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
                    status: ([DeclarationStatus.PENDING, DeclarationStatus.VALIDATED, DeclarationStatus.SUBMITTED] as DeclarationStatus[])[Math.floor(Math.random() * 3)],
                    amount: Math.floor(Math.random() * 50000),
                    clientId: client.id
                }
            });
        }
    }

    // 4. Audit Logs
    console.log('📊 Génération des logs d\'activité...');
    const actions = ['LOGIN', 'CREATE_CLIENT', 'UPDATE_MISSION', 'VALIDATE_INVOICE', 'EXPORT_REPORT'];

    for (let i = 0; i < 20; i++) {
        const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
        if (user) {
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: actions[Math.floor(Math.random() * actions.length)],
                    entity: 'SYSTEM',
                    details: 'Action effectuée lors de la démonstration',
                    createdAt: new Date(new Date().getTime() - Math.floor(Math.random() * 100000000))
                }
            });
        }
    }

    console.log('✅ Base de données UEMOA peuplée avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
