import { prismaSystem } from "./prisma";
import { runWithPortalTenantContext } from "./tenant-context";
import { isCabinetActif } from "./tenant";

/**
 * Resolve an opaque client token through the narrowly scoped system client,
 * then run the callback with a request-local context restricted to that one
 * client and its cabinet. App Prisma queries inside the callback are scoped
 * again by the tenant extension.
 */
export async function withPortalClient<T>(token: unknown, callback: (client: any) => Promise<T>): Promise<T | null> {
  if (typeof token !== "string" || token.length < 32 || token.length > 512) return null;

  const client = await prismaSystem.client.findFirst({ where: { portalToken: token } });
  if (!client || !client.portalEnabled || !client.cabinetId) return null;
  const cabinet = await prismaSystem.cabinet.findUnique({ where: { id: client.cabinetId } });
  if (!cabinet || !isCabinetActif(cabinet as any)) return null;

  return runWithPortalTenantContext(
    { cabinetId: client.cabinetId, clientId: client.id },
    () => callback(client),
  );
}

export function portalTokenFromRequest(req: Request): string | null {
  const url = new URL(req.url);
  return req.headers.get("x-portal-token") || url.searchParams.get("token");
}
