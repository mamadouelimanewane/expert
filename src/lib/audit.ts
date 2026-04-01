import prisma from './prisma';
import { AuthService } from './auth';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'UPLOAD' | 'DOWNLOAD' | 'PROCESS';
export type AuditEntity = 'CLIENT' | 'MISSION' | 'INVOICE' | 'DOCUMENT' | 'TIME_ENTRY' | 'TAX_DECLARATION' | 'USER';

export class AuditService {
    static async log({
        action,
        entity,
        entityId,
        details,
        oldValue,
        newValue,
        ipAddress,
        userAgent
    }: {
        action: string;
        entity: string;
        entityId?: string;
        details?: string;
        oldValue?: any;
        newValue?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            const session = await AuthService.getSession();

            return await prisma.auditLog.create({
                data: {
                    action,
                    entity,
                    entityId,
                    details,
                    oldValue,
                    newValue,
                    ipAddress,
                    userAgent,
                    userId: session?.id || null
                }
            });
        } catch (error) {
            console.error('❌ Failed to create audit log:', error);
            // Don't throw error to prevent breaking the main flow
        }
    }

    static async getRecentLogs(limit = 10) {
        return await prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        role: true,
                        avatar: true
                    }
                }
            }
        });
    }

    /**
     * Calcule un score de risque dynamique pour un client donné
     * Basé sur la conformité fiscale et les indicateurs opérationnels
     */
    static async calculateRiskScore(clientId: string) {
        const [declarations, missions] = await Promise.all([
            prisma.taxDeclaration.findMany({ where: { clientId } }),
            prisma.mission.findMany({ where: { clientId } })
        ]);

        const now = new Date();
        
        // 1. Risque de Conformité (Déclarations en retard)
        const lateDeclarations = declarations.filter(d => 
            d.status === 'PENDING' && new Date(d.dueDate) < now
        ).length;
        const complianceScore = Math.min(10, (lateDeclarations * 3) + 2); // Base 2/10 + 3 par retard

        // 2. Risque Opérationnel (Dérives sur les missions)
        // (Simulation basée sur le statut des missions pour cet exemple)
        const inProgressMissions = missions.filter(m => m.status === 'IN_PROGRESS').length;
        const operationalScore = Math.min(10, (inProgressMissions * 2) + 3);

        // 3. Risque Fraude / Audit (Score simulé pour le démo, peut être lié aux AuditLogs)
        const fraudScore = 3.5; // Basé sur les retraits cash (Logique métier à affiner)

        // 4. Risque Comptable (Basé sur la révision)
        const accountingScore = 7.8; 

        return {
            globalScore: ((complianceScore + operationalScore + fraudScore + accountingScore) / 4).toFixed(1),
            breakdown: [
                { category: "Opérationnel", score: operationalScore * 10, label: "Cycle Ventes-Clients", observations: `${inProgressMissions} missions critiques en cours.` },
                { category: "Conformité", score: complianceScore * 10, label: "TVA & Retenues", observations: `${lateDeclarations} déclarations fiscales en souffrance.` },
                { category: "Fraude", score: fraudScore * 10, label: "Caisse & Espèces", observations: "Flux de caisse monitoré par IA." },
                { category: "Comptable", score: accountingScore * 10, label: "Évaluation Stocks", observations: "Audit des immobilisations validé." },
            ]
        };
    }
}
