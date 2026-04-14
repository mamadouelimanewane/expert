import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding admin user...');

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
            firstName: 'Admin',
            lastName: 'Cabinet360',
            role: 'ADMIN',
            isActive: true
        }
    });

    console.log('✅ Admin user created/updated:', {
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        role: admin.role
    });

    console.log('\n📝 Credentials:');
    console.log('   Email: admin@cabinet360.com');
    console.log('   Password: admin2026');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
