/**
 * Crée (ou réactive) le compte ADMIN initial.
 *
 * Aucun mot de passe n'est codé en dur : il est lu depuis ADMIN_PASSWORD, et à
 * défaut généré aléatoirement puis affiché UNE SEULE FOIS dans la console.
 * Ne jamais réintroduire de valeur littérale ici — ce fichier est versionné.
 *
 * Usage : ADMIN_PASSWORD='...' npm run seed:admin
 *         (ou simplement `npm run seed:admin` pour un mot de passe généré)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@cabinet360.com';

function resolvePassword(): { value: string; generated: boolean } {
    const fromEnv = process.env.ADMIN_PASSWORD?.trim();
    if (fromEnv) {
        if (fromEnv.length < 12) {
            throw new Error('ADMIN_PASSWORD doit faire au moins 12 caractères.');
        }
        return { value: fromEnv, generated: false };
    }
    return { value: randomBytes(18).toString('base64url'), generated: true };
}

async function main() {
    console.log('🌱 Création du compte administrateur…');

    const { value: password, generated } = resolvePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { password: hashedPassword, isActive: true },
        create: {
            email: ADMIN_EMAIL,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Cabinet360',
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log('✅ Compte administrateur prêt :', {
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        role: admin.role,
    });

    if (generated) {
        console.log('\n🔐 Mot de passe généré (affiché une seule fois, notez-le maintenant) :');
        console.log(`   ${password}\n`);
    } else {
        console.log('\n🔐 Mot de passe défini depuis ADMIN_PASSWORD.\n');
    }
}

main()
    .catch((e) => {
        console.error('❌ Échec de la création du compte administrateur :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
