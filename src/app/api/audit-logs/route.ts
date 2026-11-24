import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/audit';
import { requireStaff } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
    try {
        const { session, denied } = await requireStaff();
        if (denied) return denied;

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const logs = await AuditService.getRecentLogs(limit, session.cabinetId!);

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('❌ Error fetching audit logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
}
