
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database User Check ---');
    const users = await prisma.user.findMany({
        select: {
            email: true,
            isActive: true,
            role: true,
            firstName: true,
            lastName: true
        }
    });
    console.log('Users found:', users);
}

main()
    .catch((e) => {
        console.error('Error:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
