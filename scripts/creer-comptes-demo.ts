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
 * mots de passe. Ce script est réservé aux environnements hors production.
 */
import { readFileSync } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { prismaSystem as prisma } from '../src/lib/prisma';

type Role = 'ADMIN' | 'EXPERT' | 'COLLABORATOR' | 'ASSISTANT';
interface Compte { email: string; prenom: string; nom: string; role: Role; motDePasse: string }

const ROLES: Role[] = ['ADMIN', 'EXPERT', 'COLLABORATOR', 'ASSISTANT'];

async function main() {
    if (process.env.NODE_ENV === 'production') throw new Error('Ce script de démonstration ne peut pas être exécuté en production.');
    if (process.env.ALLOW_DEMO_DATA_WRITES !== 'true') throw new Error('Définissez ALLOW_DEMO_DATA_WRITES=true pour autoriser explicitement la création des comptes de démonstration.');
    const cabinetId = process.env.CABINET_ID?.trim();
    if (!cabinetId) throw new Error('Définissez CABINET_ID pour cibler le cabinet des comptes de démonstration.');
    const cabinet = await prisma.cabinet.findUnique({ where: { id: cabinetId }, select: { id: true } });
    if (!cabinet) throw new Error('CABINET_ID ne correspond à aucun cabinet.');
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
        const existing = await prisma.user.findUnique({ where: { email: c.email.toLowerCase() }, select: { cabinetId: true } });
        if (existing?.cabinetId && existing.cabinetId !== cabinetId) throw new Error(`Le compte ${c.email} appartient déjà à un autre cabinet.`);
        const password = await bcrypt.hash(c.motDePasse, 12);
        await prisma.user.upsert({
            where: { email: c.email.toLowerCase() },
            update: { cabinetId, password, firstName: c.prenom, lastName: c.nom, role: c.role, isActive: true },
            create: { cabinetId, email: c.email.toLowerCase(), password, firstName: c.prenom, lastName: c.nom, role: c.role, isActive: true },
        });
        console.log(`✅ ${c.role.padEnd(12)} ${c.email}`);
    }
    console.log(`\n${comptes.length} compte(s) prêt(s). Connexion : https://expert-pi.vercel.app/login`);
    await prisma.$disconnect();
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
