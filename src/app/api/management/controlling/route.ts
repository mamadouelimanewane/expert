import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [invoicesYTD, missions, staff] = await Promise.all([
      prisma.invoice.findMany({ where: { issueDate: { gte: startOfYear } } }),
      prisma.mission.findMany({ include: { timeEntries: { select: { duration: true } } } }),
      prisma.user.findMany({ where: { role: { in: ["EXPERT", "COLLABORATOR", "ASSISTANT"] }, isActive: true } }),
    ]);

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
      const hours = assigned.reduce((s, m) => s + m.timeEntries.reduce((s2, t) => s2 + t.duration, 0), 0);
      const valeur = assigned.reduce((s, m) => s + (m.fixedPrice || (m.hourlyRate ? m.hourlyRate * (m.estimatedHours || 0) : 0)), 0);
      // Occupation estimée sur une base de 160h/mois (hypothèse temps plein), faute de capacité contractuelle en base.
      const occupation = Math.min(100, Math.round((hours / 160) * 100));
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
