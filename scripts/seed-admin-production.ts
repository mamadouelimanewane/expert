/**
 * Crée (ou réactive) le compte ADMIN sur la base de PRODUCTION (MongoDB Atlas).
 *
 * Aucun mot de passe n'est codé en dur : ADMIN_PASSWORD est OBLIGATOIRE ici
 * (contrairement au script de développement, on n'accepte pas de valeur générée
 * implicitement en production — l'opérateur doit fournir un secret choisi et
 * conservé dans son gestionnaire de mots de passe).
 *
 * Usage :
 *   1. DATABASE_URL doit pointer vers MongoDB Atlas dans .env
 *   2. ADMIN_PASSWORD='<secret fort>' npm run seed:admin:prod
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@cabinet360.com';

async function main() {
    const cabinetId = process.env.CABINET_ID?.trim();
    if (!cabinetId) throw new Error('CABINET_ID est requis en production.');
    const cabinet = await prisma.cabinet.findUnique({ where: { id: cabinetId }, select: { id: true } });
    if (!cabinet) throw new Error('CABINET_ID ne correspond à aucun cabinet.');
    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL }, select: { cabinetId: true } });
    if (existing?.cabinetId && existing.cabinetId !== cabinetId) throw new Error('Cet administrateur appartient déjà à un autre cabinet.');
    const password = process.env.ADMIN_PASSWORD?.trim();

    if (!password) {
        console.error(
            "❌ ADMIN_PASSWORD est requis pour la production.\n" +
            "   Exemple : ADMIN_PASSWORD='<secret fort>' npm run seed:admin:prod"
        );
        process.exit(1);
    }
    if (password.length < 16) {
        console.error('❌ ADMIN_PASSWORD doit faire au moins 16 caractères en production.');
        process.exit(1);
    }

    console.log('🌱 Création du compte administrateur sur la base de PRODUCTION…');
    console.log('📍 Base :', process.env.DATABASE_URL?.replace(/:\/\/[^@]+@/, '://***@').slice(0, 60) + '…');

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { cabinetId, password: hashedPassword, isActive: true },
        create: {
            cabinetId,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            firstName: 'Expert',
            lastName: 'Principal',
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log('✅ Compte administrateur de production prêt :', {
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        role: admin.role,
    });
    console.log('\n🔐 Le mot de passe est celui fourni via ADMIN_PASSWORD — il n\'est jamais affiché ni stocké en clair.\n');
}

main()
    .catch((e) => {
        console.error('❌ Échec :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
