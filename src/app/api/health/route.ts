
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Test DB connection
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: 'ok',
            version: '2.0.1', // J'incrémente pour vérifier que c'est bien cette version
            db_status: 'connected',
            user_count: userCount,
            env_check: {
                has_db_url: !!process.env.DATABASE_URL,
                has_jwt_secret: !!process.env.JWT_SECRET
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            version: '2.0.1',
            db_status: 'disconnected',
            error: error instanceof Error ? error.message : String(error),
            env_check: {
                has_db_url: !!process.env.DATABASE_URL,
                has_jwt_secret: !!process.env.JWT_SECRET
            }
        }, { status: 500 });
    }
}
