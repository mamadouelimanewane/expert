import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
const TYPE_LABELS: Record<string, string> = {
  AUDIT: "Audit & Commissariat",
  CONSEIL: "Conseil Financier",
  TENUE_COMPTABLE: "Tenue Comptable",
  DECLARATION_FISCALE: "Déclarations Fiscales",
  PAIE: "Social & Paie",
  EXPERTISE_JUDICIAIRE: "Expertise Judiciaire",
  AUTRE: "Autre",
};

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Le filtre de statut manquait : les factures DRAFT (jamais emises) et
    // CANCELLED (annulees) entraient dans le « CA realise » de l'annee et dans
    // la courbe mensuelle. Une facture de 10 M FCFA emise puis annulee restait
    // comptee. /api/invoices, lui, somme sur PAID puis SENT/OVERDUE : les deux
    // ecrans affichaient donc des CA divergents a partir des memes factures.
    const [invoicesYTD, missions, staff, tempsYTD] = await Promise.all([
      prisma.invoice.findMany({
        where: { issueDate: { gte: startOfYear }, status: { in: ["SENT", "OVERDUE", "PAID"] } },
      }),
      prisma.mission.findMany(),
      prisma.user.findMany({ where: { role: { in: ["EXPERT", "COLLABORATOR", "ASSISTANT"] }, isActive: true } }),
      // Les heures etaient additionnees depuis les missions ASSIGNEES au
      // collaborateur, et non depuis ses propres saisies : sur une mission
      // assignee a A, les 40 h saisies par B etaient portees au compte de A.
      // Elles n'etaient de plus bornees par aucune date, alors que le taux
      // d'occupation les rapporte a un mois type.
      prisma.timeEntry.groupBy({
        by: ["userId"],
        where: { date: { gte: startOfYear } },
        _sum: { duration: true },
      }),
    ]);

    const heuresParCollaborateur = new Map(
      tempsYTD.map(t => [t.userId, t._sum.duration ?? 0])
    );

    // Base de reference : 160 h par mois ecoule depuis le 1er janvier
    // (hypothese temps plein, faute de capacite contractuelle en base).
    const moisEcoules = now.getMonth() + 1;
    const capaciteYTD = moisEcoules * 160;

    const caRealise = invoicesYTD.reduce((s, i) => s + i.total, 0);

    // Regroupement par type de mission — pas de lien direct Invoice→Mission dans le schéma actuel,
    // donc "valeur" ici représente le portefeuille de missions valorisé (fixedPrice ou hourlyRate×heures
    // estimées), pas le chiffre d'affaires facturé réel par pôle.
    const byType = new Map<string, { valeur: number; count: number }>();
    for (const m of missions) {
      const valeur = m.fixedPrice || (m.hourlyRate ? m.hourlyRate * (m.estimatedHours || 0) : 0);
      const entry = byType.get(m.type) || { valeur: 0, count: 0 };
      entry.valeur += valeur;
      entry.count += 1;
      byType.set(m.type, entry);
    }
    const departments = Array.from(byType.entries()).map(([type, v]) => ({
      id: type,
      name: TYPE_LABELS[type] || type,
      valeur: v.valeur,
      missionsCount: v.count,
    }));

    const collaborators = staff.map(u => {
      const assigned = missions.filter(m => m.assignedToId === u.id);
      const hours = heuresParCollaborateur.get(u.id) ?? 0;
      const valeur = assigned.reduce((s, m) => s + (m.fixedPrice || (m.hourlyRate ? m.hourlyRate * (m.estimatedHours || 0) : 0)), 0);
      const occupation = capaciteYTD > 0 ? Math.min(100, Math.round((hours / capaciteYTD) * 100)) : 0;
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        initials: `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`,
        valeur,
        hours: Math.round(hours),
        occupation,
      };
    });

    // CA réel par mois de l'année en cours (uniquement les mois écoulés — pas de projection fabriquée)
    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const monthlyReal = Array(12).fill(0);
    for (const inv of invoicesYTD) {
      const m = new Date(inv.issueDate).getMonth();
      monthlyReal[m] += inv.total;
    }
    const currentMonth = now.getMonth();
    const monthly = monthLabels.map((mois, i) => ({
      mois,
      reel: i <= currentMonth ? monthlyReal[i] : null,
    }));

    return NextResponse.json({
      general: { caRealise },
      departments,
      collaborators,
      monthly,
    });
  } catch (error) {
    console.error("Erreur GET management/controlling:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
