/**
 * Script pour créer l'utilisateur admin en production (MongoDB Atlas)
 * 
 * Usage:
 * 1. Assurez-vous que DATABASE_URL pointe vers MongoDB Atlas dans .env
 * 2. Exécutez: npm run seed:admin:prod
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding admin user to PRODUCTION database...');
    console.log('📍 Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

    // Hash du mot de passe "admin2026"
    const hashedPassword = await bcrypt.hash('admin2026', 12);

    // Créer ou mettre à jour l'utilisateur admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@cabinet360.com' },
        update: {
            password: hashedPassword,
            isActive: true
        },
        create: {
            email: 'admin@cabinet360.com',
            password: hashedPassword,
            firstName: 'Expert',
            lastName: 'Principal',
            role: 'ADMIN',
            isActive: true
        }
    });

    console.log('✅ Admin user created/updated in PRODUCTION:', {
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        role: admin.role
    });

    console.log('\n📝 Production Credentials:');
    console.log('   Email: admin@cabinet360.com');
    console.log('   Password: admin2026');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding admin to production:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
