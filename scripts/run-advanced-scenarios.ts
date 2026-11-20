import { calculateComplianceScore } from '../src/lib/compliance-engine';
import { calculateDCF, calculateEBITDAMultiple, calculateANR } from '../src/lib/valuation-engine';
import { AuditService } from '../src/lib/audit';
import { PrismaClient } from '@prisma/client';
import { installerPorteeSeed, type PrismaSeedScopeClient } from './tenant-seed-scope';

let prisma: PrismaSeedScopeClient = new PrismaClient() as PrismaSeedScopeClient;

async function runAdvancedScenarios() {
    prisma = await installerPorteeSeed(prisma as unknown as PrismaClient);
    console.log('🏁 --- RUNNING ADVANCED MODULES & ENGINES TESTING --- 🏁\n');

    // ==========================================
    // TEST 1: Compliance Score Engine
    // ==========================================
    console.log('🔹 TEST 1: Compliance Score Engine (SYSCOHADA & UEMOA)');
    
    // Scenario A: Full compliance
    const answersConforme: Record<string, 'conforme' | 'attention' | 'non_conforme'> = {};
    const UEMOA_IDS = ["C1", "C2", "C3", "C4", "C5", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "J1", "J2", "J3", "J4", "J5", "B1", "B2", "B3", "B4", "S1", "S2", "S3", "S4", "S5", "G1", "G2", "G3", "G4"];
    UEMOA_IDS.forEach(id => { answersConforme[id] = 'conforme'; });
    const resultConforme = calculateComplianceScore(answersConforme);
    console.log(`✅ Scenario A (Full Compliance) -> Score: ${resultConforme.score}%, Rating: ${resultConforme.rating}`);

    // Scenario B: Critical failures
    const answersDeficit: Record<string, 'conforme' | 'attention' | 'non_conforme'> = {};
    UEMOA_IDS.forEach((id, idx) => {
        // Fail some high-weight items (weight 5) to trigger critical items
        answersDeficit[id] = idx % 5 === 0 ? 'non_conforme' : 'conforme';
    });
    const resultDeficit = calculateComplianceScore(answersDeficit);
    console.log(`✅ Scenario B (With Failures)   -> Score: ${resultDeficit.score}%, Rating: ${resultDeficit.rating}`);
    console.log(`🔍 Critical items failed count: ${resultDeficit.criticals.length}`);
    resultDeficit.criticals.forEach(c => {
        console.log(`   🚨 [${c.id}] ${c.category}: ${c.description} (Poids: ${c.weight})`);
    });
    console.log('\n');

    // ==========================================
    // TEST 2: Valuation Engine (Conseil / M&A)
    // ==========================================
    console.log('🔹 TEST 2: M&A / Valuation Engine (DCF, EBITDA Multiple, ANR)');
    
    // DCF valuation test
    const ca = 500000000; // 500M FCFA
    const tauxCroissance = 5; // 5% growth
    const tauxActualisation = 10; // 10% discount rate
    const annees = 5;
    const dcf = calculateDCF(ca, tauxCroissance, tauxActualisation, annees);
    console.log(`✅ DCF Valuation for CA ${ca.toLocaleString()} FCFA over ${annees} years:`);
    console.log(`   - Enterprise Value (DCF): ${Math.round(dcf.enterpriseValue).toLocaleString()} FCFA`);
    console.log(`   - Terminal Value (Gordon): ${Math.round(dcf.terminalValue).toLocaleString()} FCFA`);

    // EBITDA Multiple test
    const ebitda = 75000000; // 75M FCFA ebitda
    const multiple = 6.5; // 6.5x ebitda
    const valMultiple = calculateEBITDAMultiple(ebitda, multiple);
    console.log(`✅ EBITDA Multiple Valuation (${multiple}x): ${valMultiple.toLocaleString()} FCFA`);

    // ANR test
    const actif = 450000000; // 450M FCFA
    const dettes = 200000000; // 200M FCFA
    const ajustements = 25000000; // 25M FCFA adjustments
    const valANR = calculateANR(actif, dettes, ajustements);
    console.log(`✅ Adjusted Net Asset Value (ANR): ${valANR.toLocaleString()} FCFA`);
    console.log('\n');

    // ==========================================
    // TEST 3: Dynamic Risk Score Calculation
    // ==========================================
    console.log('🔹 TEST 3: Dynamic Client Risk Scoring');
    const client = await prisma.client.findFirst({
        where: { email: 'contact@senegaldigital.sn' }
    });
    if (client) {
        const risk = await AuditService.calculateRiskScore(client.id);
        console.log(`✅ Risk Score calculated for ${client.companyName}:`);
        console.log(`   - Global Risk Score: ${risk.globalScore} / 10`);
        risk.breakdown.forEach(b => {
            console.log(`   - [${b.category}] Score: ${b.score}/100. Observations: ${b.observations}`);
        });
    } else {
        console.log('⚠️ Test client contact@senegaldigital.sn not found. Skip risk calculation.');
    }
    console.log('\n');

    console.log('🏁 --- ADVANCED ENGINES TESTING COMPLETED SUCCESSFULLY --- 🏁');
}

runAdvancedScenarios()
    .catch((e) => {
        console.error('❌ Error during advanced scenario execution:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
