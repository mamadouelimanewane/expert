import prisma from './prisma';
import { AuthService } from './auth';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'UPLOAD' | 'DOWNLOAD' | 'PROCESS';
export type AuditEntity = 'CLIENT' | 'MISSION' | 'INVOICE' | 'DOCUMENT' | 'TIME_ENTRY' | 'TAX_DECLARATION' | 'USER';

type AuditLogInput = {
    action: string;
    entity: string;
    entityId?: string;
    details?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    oldValue?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
};

export class AuditService {
    static async log(input: AuditLogInput): Promise<unknown>;
    /** Compatibilité avec les routes historiques : userId, action, entity, metadata. */
    static async log(userId: string, action: string, entity: string, metadata?: Record<string, unknown>): Promise<unknown>;
    static async log(inputOrUserId: AuditLogInput | string, legacyAction?: string, legacyEntity?: string, metadata?: Record<string, unknown>) {
        try {
            const session = await AuthService.getSession();
            const input: AuditLogInput = typeof inputOrUserId === 'string'
                ? {
                    action: legacyAction ?? 'PROCESS',
                    entity: legacyEntity ?? 'UNKNOWN',
                    details: metadata ? JSON.stringify(metadata) : undefined,
                }
                : inputOrUserId;
            const actorId = typeof inputOrUserId === 'string' && inputOrUserId === session?.id
                ? inputOrUserId
                : session?.id;

            return await prisma.auditLog.create({
                data: {
                    action: input.action,
                    entity: input.entity,
                    entityId: input.entityId,
                    details: input.details,
                    oldValue: input.oldValue,
                    newValue: input.newValue,
                    ipAddress: input.ipAddress,
                    userAgent: input.userAgent,
                    userId: actorId && /^[0-9a-fA-F]{24}$/.test(actorId) ? actorId : null
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
        const [declarations, missions, journals] = await Promise.all([
            prisma.taxDeclaration.findMany({ where: { clientId } }),
            prisma.mission.findMany({ where: { clientId } }),
            prisma.tpeJournal.findMany({ where: { clientId } })
        ]);

        const now = new Date();

        // 1. Risque de Conformité (Déclarations en retard)
        const lateDeclarations = declarations.filter(d =>
            d.status === 'PENDING' && new Date(d.dueDate) < now
        ).length;
        const complianceScore = Math.min(10, (lateDeclarations * 3) + 2); // Base 2/10 + 3 par retard

        // 2. Risque Opérationnel (Dérives sur les missions)
        const inProgressMissions = missions.filter(m => m.status === 'IN_PROGRESS').length;
        const operationalScore = Math.min(10, (inProgressMissions * 2) + 3);

        // 3. Risque Fraude / Audit — écritures passées un dimanche ou montants suspicieusement ronds
        const suspiciousEntries = journals.filter(j => {
            const day = new Date(j.date).getDay();
            const isSunday = day === 0;
            const amount = j.entree || j.sortie || 0;
            const isRoundAmount = amount > 0 && amount % 100000 === 0;
            return isSunday || isRoundAmount;
        }).length;
        const fraudScore = Math.min(10, 2 + suspiciousEntries * 1.5);

        // 4. Risque Comptable — proportion d'écritures encore en attente de validation/export
        const pendingJournals = journals.filter(j => j.status === 'PENDING').length;
        const pendingRatio = journals.length > 0 ? pendingJournals / journals.length : 0;
        const accountingScore = Math.min(10, 2 + pendingRatio * 8);

        return {
            globalScore: ((complianceScore + operationalScore + fraudScore + accountingScore) / 4).toFixed(1),
            breakdown: [
                { category: "Opérationnel", score: operationalScore * 10, label: "Cycle Ventes-Clients", observations: `${inProgressMissions} missions critiques en cours.` },
                { category: "Conformité", score: complianceScore * 10, label: "TVA & Retenues", observations: `${lateDeclarations} déclarations fiscales en souffrance.` },
                { category: "Fraude", score: fraudScore * 10, label: "Caisse & Espèces", observations: `${suspiciousEntries} écriture(s) suspecte(s) (dimanche ou montant rond) sur ${journals.length}.` },
                { category: "Comptable", score: accountingScore * 10, label: "Écritures en Attente", observations: `${pendingJournals} écriture(s) sur ${journals.length} encore en attente de validation.` },
            ]
        };
    }
}
