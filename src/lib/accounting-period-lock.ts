import { prisma } from "@/lib/prisma";

export async function getAccountingPeriodLock(clientId: string, periode: string) {
  return prisma.accountingPeriodLock.findUnique({
    where: { clientId_periode: { clientId, periode } },
    select: { id: true, clientId: true, periode: true, lockedAt: true, lockedById: true, reason: true },
  });
}

export async function ensureAccountingPeriodOpen(clientId: string, periode: string) {
  const lock = await getAccountingPeriodLock(clientId, periode);
  return lock ? { open: false as const, lock } : { open: true as const, lock: null };
}
