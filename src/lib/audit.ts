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
}
