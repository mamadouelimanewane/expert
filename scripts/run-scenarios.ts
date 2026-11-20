import { PrismaClient } from '@prisma/client';
import { ClientType, MissionStatus, InvoiceStatus, FiscalRegime, MissionType, DeclarationType, DeclarationStatus } from '../src/types/prisma';
import { installerPorteeSeed, type PrismaSeedScopeClient } from './tenant-seed-scope';

let prisma: PrismaSeedScopeClient = new PrismaClient() as PrismaSeedScopeClient;

async function runScenarios() {
    prisma = await installerPorteeSeed(prisma as unknown as PrismaClient);
    console.log('🏁 --- STARTING FULL END-TO-END SCENARIO TESTING --- 🏁\n');

    const testEmail = 'contact@senegaldigital.sn';

    // Cleanup existing test client if present
    const existingClient = await prisma.client.findFirst({
        where: { email: testEmail }
    });
    if (existingClient) {
        await prisma.invoice.deleteMany({ where: { clientId: existingClient.id } });
        await prisma.mission.deleteMany({ where: { clientId: existingClient.id } });
        await prisma.taxDeclaration.deleteMany({ where: { clientId: existingClient.id } });
        await prisma.client.delete({ where: { id: existingClient.id } });
    }

    // ==========================================
    // SCENARIO 1: Client Creation & Management
    // ==========================================
    console.log('🔹 SCENARIO 1: Client Creation & Management');
    const newClient = await prisma.client.create({
        data: {
            type: ClientType.ENTREPRISE,
            companyName: 'Sénégal Digital SA',
            firstName: 'Moussa',
            lastName: 'Gaye',
            email: testEmail,
            phone: '+221 77 123 45 67',
            address: 'Vdn Extension, Dakar',
            city: 'Dakar',
            country: 'SN',
            sector: 'Services Numériques',
            rccm: 'SN-DKR-2026-B-10293',
            ninea: '109283720',
            fiscalRegime: FiscalRegime.REEL_NORMAL,
            isActive: true
        }
    });
    console.log(`✅ Client "Sénégal Digital SA" created successfully. ID: ${newClient.id}`);
    
    // Verify client query
    const queriedClient = await prisma.client.findUnique({
        where: { id: newClient.id }
    });
    if (queriedClient && queriedClient.companyName === 'Sénégal Digital SA') {
        console.log('✅ Verification: Database query matches inputs.');
    } else {
        throw new Error('❌ Verification failed: Client mismatch.');
    }
    console.log('\n');

    // ==========================================
    // SCENARIO 2: Mission Creation & Assignment
    // ==========================================
    console.log('🔹 SCENARIO 2: Mission Creation & Assignment');
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });
    const staff = await prisma.user.findFirst({
        where: { role: 'COLLABORATOR' }
    });

    const mission = await prisma.mission.create({
        data: {
            title: 'Audit de Conformité SYSCOHADA 2026',
            description: 'Audit légal de fin d\'exercice pour Sénégal Digital SA',
            status: MissionStatus.IN_PROGRESS,
            type: MissionType.AUDIT,
            startDate: new Date(),
            deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
            clientId: newClient.id,
            assignedToId: staff ? staff.id : undefined,
            createdById: admin ? admin.id : (staff ? staff.id : 'system')
        }
    });
    console.log(`✅ Mission "${mission.title}" created & assigned. ID: ${mission.id}`);
    console.log(`✅ Status: ${mission.status}, Assigned to: ${staff ? staff.firstName + ' ' + staff.lastName : 'None'}`);
    console.log('\n');

    // ==========================================
    // SCENARIO 3: Invoicing & Payment Processing
    // ==========================================
    console.log('🔹 SCENARIO 3: Invoicing & Payment (Mobile Money Sim)');
    const amount = 850000; // 850,000 FCFA
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber: `FACT-2026-TEST-${Math.floor(Math.random() * 1000)}`,
            status: InvoiceStatus.SENT,
            issueDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
            subtotal: amount,
            taxRate: 18,
            taxAmount: amount * 0.18,
            total: amount * 1.18,
            clientId: newClient.id
        }
    });
    console.log(`✅ Invoice generated. Invoice No: ${invoice.invoiceNumber}, Total: ${invoice.total} FCFA`);
    console.log(`✅ Current Invoice Status: ${invoice.status}`);

    // Simulating Payment Webhook (Fintech payment simulation)
    console.log('⚡ Simulating Wave/Mobile Money payment callback...');
    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
            status: InvoiceStatus.PAID,
            paidDate: new Date(),
        }
    });
    console.log(`✅ Payment received via Webhook simulation.`);
    console.log(`✅ Updated Invoice Status: ${updatedInvoice.status}, Paid At: ${updatedInvoice.paidDate}`);
    console.log('\n');

    // ==========================================
    // SCENARIO 4: Tax Obligation Tracking
    // ==========================================
    console.log('🔹 SCENARIO 4: Tax Obligation & Compliance Tracking');
    const taxDeclaration = await prisma.taxDeclaration.create({
        data: {
            type: DeclarationType.TVA,
            period: '08-2026',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
            status: DeclarationStatus.PENDING,
            amount: 153000,
            clientId: newClient.id
        }
    });
    console.log(`✅ Tax Declaration (TVA) created for ${taxDeclaration.period}. Status: ${taxDeclaration.status}, Due Date: ${taxDeclaration.dueDate.toLocaleDateString()}`);
    
    // Simulate validation and filing
    const filedTax = await prisma.taxDeclaration.update({
        where: { id: taxDeclaration.id },
        data: {
            status: DeclarationStatus.SUBMITTED,
            submittedDate: new Date()
        }
    });
    console.log(`✅ Tax Declaration submitted successfully. New Status: ${filedTax.status}`);
    console.log('\n');

    // ==========================================
    // SCENARIO 5: Activity Audit Logging
    // ==========================================
    console.log('🔹 SCENARIO 5: Activity Audit Log Verification');
    const log = await prisma.auditLog.create({
        data: {
            userId: admin ? admin.id : 'system-admin',
            action: 'VALIDATE_CLIENT_FOLDER',
            entity: 'CLIENT',
            details: `Folder verified for Sénégal Digital SA. ID: ${newClient.id}`,
            createdAt: new Date()
        }
    });
    console.log(`✅ Audit Log entry recorded: "${log.action}" on "${log.entity}". Details: ${log.details}`);
    console.log('\n');

    console.log('🏁 --- END-TO-END SCENARIO TESTING COMPLETED SUCCESSFULLY --- 🏁');
}

runScenarios()
    .catch((e) => {
        console.error('❌ Error during scenario execution:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
