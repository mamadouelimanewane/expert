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
    if (process.env.NODE_ENV === 'production') throw new Error('Utilisez seed-admin-production.ts pour créer un administrateur en production.');
    console.log('🌱 Création du compte administrateur…');

    const cabinetId = process.env.CABINET_ID?.trim();
    if (!cabinetId) throw new Error('CABINET_ID est requis pour rattacher l’administrateur à un cabinet.');
    const cabinet = await prisma.cabinet.findUnique({ where: { id: cabinetId }, select: { id: true } });
    if (!cabinet) throw new Error('CABINET_ID ne correspond à aucun cabinet.');
    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL }, select: { cabinetId: true } });
    if (existing?.cabinetId && existing.cabinetId !== cabinetId) throw new Error('Cet administrateur appartient déjà à un autre cabinet.');

    const { value: password, generated } = resolvePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { cabinetId, password: hashedPassword, isActive: true },
        create: {
            cabinetId,
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
