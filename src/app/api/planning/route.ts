import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

// Normalise n'importe quelle date vers le lundi 00:00:00 de sa semaine,
// pour que toutes les allocations d'une même semaine partagent le même
// `weekStart` en base.
function getMonday(d: Date) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get("weekStart");
    const weekStart = getMonday(weekParam ? new Date(weekParam) : new Date());

    const [allocations, users, tasks] = await Promise.all([
      prisma.resourceAllocation.findMany({
        where: { weekStart },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, role: true } },
          task: { select: { id: true, title: true, status: true } },
          mission: {
            select: {
              id: true,
              title: true,
              client: { select: { companyName: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { dayOfWeek: "asc" },
      }),
      prisma.user.findMany({
        where: { isActive: true, role: { in: ["ADMIN", "EXPERT", "COLLABORATOR", "ASSISTANT"] } },
        select: { id: true, firstName: true, lastName: true, role: true },
        orderBy: { firstName: "asc" },
      }),
      prisma.task.findMany({
        where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
        include: {
          mission: {
            select: {
              id: true,
              title: true,
              client: { select: { companyName: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { dueDate: "asc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({ weekStart: weekStart.toISOString(), allocations, users, tasks });
  } catch (error) {
    console.error("Erreur GET planning:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { id, weekStart, dayOfWeek, durationHours, capacityHours, userId, taskId, missionId } = body;

    if (id) {
      const allocation = await prisma.resourceAllocation.update({
        where: { id },
        data: {
          ...(durationHours !== undefined && { durationHours: parseFloat(durationHours) }),
          ...(capacityHours !== undefined && { capacityHours: parseFloat(capacityHours) }),
          ...(taskId !== undefined && { taskId: taskId || null }),
          ...(missionId !== undefined && { missionId: missionId || null }),
        },
      });
      return NextResponse.json({ allocation });
    }

    if (!weekStart || dayOfWeek === undefined || !durationHours || !userId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const allocation = await prisma.resourceAllocation.create({
      data: {
        weekStart: getMonday(new Date(weekStart)),
        dayOfWeek: parseInt(dayOfWeek, 10),
        durationHours: parseFloat(durationHours),
        capacityHours: capacityHours ? parseFloat(capacityHours) : 8,
        userId,
        taskId: taskId || null,
        missionId: missionId || null,
      },
    });

    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST planning:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    await prisma.resourceAllocation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE planning:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
