import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/audit';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const logs = await AuditService.getRecentLogs(limit);

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('❌ Error fetching audit logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
}
