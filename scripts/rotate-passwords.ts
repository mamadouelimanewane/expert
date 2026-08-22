/**
 * Rotation d'urgence des mots de passe des comptes staff.
 *
 * À exécuter après toute exposition d'identifiants (dépôt public, capture
 * d'écran, doc partagée…). Génère un secret aléatoire fort par compte, le
 * hash en bcrypt(12) et l'affiche UNE SEULE FOIS. Rien n'est stocké en clair.
 *
 * Usage :
 *   npx tsx scripts/rotate-passwords.ts                      # tous les comptes actifs
 *   npx tsx scripts/rotate-passwords.ts a@x.com b@x.com      # comptes ciblés
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const targets = process.argv.slice(2).filter((a) => a.includes('@'));

    const users = await prisma.user.findMany({
        where: targets.length > 0 ? { email: { in: targets } } : {},
        select: { id: true, email: true, role: true },
        orderBy: { email: 'asc' },
    });

    if (users.length === 0) {
        console.error('❌ Aucun compte trouvé.');
        process.exit(1);
    }

    console.log(`🔄 Rotation de ${users.length} mot(s) de passe…\n`);

    const results: { email: string; role: string; password: string }[] = [];

    for (const user of users) {
        const password = randomBytes(18).toString('base64url');
        await prisma.user.update({
            where: { id: user.id },
            data: { password: await bcrypt.hash(password, 12) },
        });
        results.push({ email: user.email, role: user.role, password });
    }

    console.log('✅ Rotation terminée. Nouveaux mots de passe (affichés une seule fois) :\n');
    for (const r of results) {
        console.log(`   [${r.role.padEnd(12)}] ${r.email.padEnd(32)} ${r.password}`);
    }
    console.log(
        '\n⚠️  Transmettez chaque secret à son titulaire par un canal sécurisé ' +
        '(gestionnaire de mots de passe partagé), jamais par email ni messagerie.\n'
    );
}

main()
    .catch((e) => {
        console.error('❌ Échec de la rotation :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
