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
                    cabinetId: session?.cabinetId ?? null,
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

    static async getRecentLogs(limit = 10, cabinetId = "") {
        return await prisma.auditLog.findMany({
            where: { cabinetId },
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
    static async calculateRiskScore(clientId: string, cabinetId: string) {
        const [declarations, missions, journals] = await Promise.all([
            prisma.taxDeclaration.findMany({ where: { clientId, cabinetId } }),
            prisma.mission.findMany({ where: { clientId, cabinetId } }),
            prisma.tpeJournal.findMany({ where: { clientId, cabinetId } })
        ]);

        const now = new Date();

        // 1. Risque de Conformité (Déclarations en retard)
        const lateDeclarations = declarations.filter(d =>
            d.status === 'PENDING' && new Date(d.dueDate) < now
        ).length;
        const complianceScore = declarations.length > 0 ? Math.min(10, (lateDeclarations / declarations.length) * 10) : null;

        // 2. Risque opérationnel : retards d'échéance, pas simple présence d'une mission en cours.
        const missionsEnRetard = missions.filter(m =>
            m.deadline && m.deadline < now && m.status !== 'COMPLETED' && m.status !== 'CANCELLED'
        ).length;
        const operationalScore = missions.length > 0 ? Math.min(10, (missionsEnRetard / missions.length) * 10) : null;

        // 3. Risque Fraude / Audit — écritures passées un dimanche ou montants suspicieusement ronds
        const suspiciousEntries = journals.filter(j => {
            const day = new Date(j.date).getDay();
            const isSunday = day === 0;
            const amount = j.entree || j.sortie || 0;
            const isRoundAmount = amount > 0 && amount % 100000 === 0;
            return isSunday || isRoundAmount;
        }).length;
        const fraudScore = journals.length > 0 ? Math.min(10, (suspiciousEntries / journals.length) * 10) : null;

        // 4. Risque Comptable — proportion d'écritures encore en attente de validation/export
        const pendingJournals = journals.filter(j => j.status === 'PENDING').length;
        const pendingRatio = journals.length > 0 ? pendingJournals / journals.length : 0;
        const accountingScore = journals.length > 0 ? Math.min(10, pendingRatio * 10) : null;

        const scoresDisponibles = [complianceScore, operationalScore, fraudScore, accountingScore].filter((score): score is number => score !== null);
        const scoreGlobal = scoresDisponibles.length > 0
            ? (scoresDisponibles.reduce((sum, score) => sum + score, 0) / scoresDisponibles.length).toFixed(1)
            : 'ND';
        const echelle = (score: number | null) => score === null ? 0 : Math.round(score * 10);

        return {
            globalScore: scoreGlobal,
            donneesDisponibles: scoresDisponibles.length,
            breakdown: [
                { category: "Opérationnel", score: echelle(operationalScore), disponible: operationalScore !== null, label: "Missions hors délai", observations: operationalScore === null ? "Données mission indisponibles." : `${missionsEnRetard} mission(s) échue(s) non clôturée(s) sur ${missions.length}.` },
                { category: "Conformité", score: echelle(complianceScore), disponible: complianceScore !== null, label: "Déclarations en retard", observations: complianceScore === null ? "Aucune déclaration analysable pour ce dossier." : `${lateDeclarations} déclaration(s) fiscale(s) échue(s) en attente sur ${declarations.length}.` },
                { category: "Contrôles à examiner", score: echelle(fraudScore), disponible: fraudScore !== null, label: "Signaux de revue", observations: fraudScore === null ? "Aucune écriture à examiner." : `${suspiciousEntries} signal(aux) de date ou de montant sur ${journals.length}; ces signaux ne constituent pas une preuve de fraude.` },
                { category: "Comptable", score: echelle(accountingScore), disponible: accountingScore !== null, label: "Écritures en attente", observations: accountingScore === null ? "Aucune écriture comptable disponible." : `${pendingJournals} écriture(s) sur ${journals.length} en attente de validation.` },
            ]
        };
    }
}
