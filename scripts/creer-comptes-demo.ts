/**
 * Crée ou met à jour les comptes de démonstration (admin + collaborateurs)
 * à partir d'un fichier local NON versionné : scripts/comptes-demo.local.json
 *
 *   [
 *     { "email": "admin@cabinet360.com", "prenom": "Mamadou", "nom": "Dia", "role": "ADMIN", "motDePasse": "…" },
 *     { "email": "expert@cabinet360.com", "prenom": "Awa", "nom": "Ndiaye", "role": "EXPERT", "motDePasse": "…" },
 *     { "email": "collab@cabinet360.com", "prenom": "Ibrahima", "nom": "Fall", "role": "COLLABORATOR", "motDePasse": "…" }
 *   ]
 *
 * Usage : npx tsx scripts/creer-comptes-demo.ts
 *
 * Les mots de passe ne sont jamais affichés ni journalisés ; ils sont hachés
 * (bcrypt) avant écriture. Le fichier JSON reste sur votre disque (ignoré par
 * git) — supprimez-le après usage ou gardez-le dans votre gestionnaire de
 * mots de passe. ATTENTION : .env pointe sur la base de PRODUCTION.
 */
import { readFileSync } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

type Role = 'ADMIN' | 'EXPERT' | 'COLLABORATOR' | 'ASSISTANT';
interface Compte { email: string; prenom: string; nom: string; role: Role; motDePasse: string }

const ROLES: Role[] = ['ADMIN', 'EXPERT', 'COLLABORATOR', 'ASSISTANT'];

async function main() {
    const fichier = path.join(__dirname, 'comptes-demo.local.json');
    let comptes: Compte[];
    try {
        comptes = JSON.parse(readFileSync(fichier, 'utf-8'));
    } catch {
        console.error(`Fichier introuvable ou invalide : ${fichier}\nCréez-le d'après le modèle en tête de ce script.`);
        process.exit(1);
    }
    if (!Array.isArray(comptes) || comptes.length === 0) throw new Error('Le fichier doit contenir une liste de comptes.');

    for (const c of comptes) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) throw new Error(`E-mail invalide : ${c.email}`);
        if (!ROLES.includes(c.role)) throw new Error(`Rôle invalide pour ${c.email} : ${c.role} (attendu : ${ROLES.join(', ')})`);
        if (!c.motDePasse || c.motDePasse.length < 12) throw new Error(`Mot de passe trop court pour ${c.email} (12 caractères minimum).`);
    }

    for (const c of comptes) {
        const password = await bcrypt.hash(c.motDePasse, 12);
        await prisma.user.upsert({
            where: { email: c.email.toLowerCase() },
            update: { password, firstName: c.prenom, lastName: c.nom, role: c.role, isActive: true },
            create: { email: c.email.toLowerCase(), password, firstName: c.prenom, lastName: c.nom, role: c.role, isActive: true },
        });
        console.log(`✅ ${c.role.padEnd(12)} ${c.email}`);
    }
    console.log(`\n${comptes.length} compte(s) prêt(s). Connexion : https://expert-pi.vercel.app/login`);
    await prisma.$disconnect();
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
