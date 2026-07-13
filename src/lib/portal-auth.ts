import prisma from "./prisma";

/**
 * Résout le client propriétaire d'un portalToken opaque, transmis soit via
 * le header `x-portal-token`, soit via `?token=` en query string.
 * Retourne `null` si le token est absent, invalide, ou si le portail a été
 * désactivé par le cabinet — dans tous les cas le caller doit répondre 401/403.
 */
export async function getPortalClient(req: Request) {
  const url = new URL(req.url);
  const token =
    req.headers.get("x-portal-token") || url.searchParams.get("token");

  if (!token) return null;

  const client = await prisma.client.findFirst({ where: { portalToken: token } });
  if (!client || !client.portalEnabled) return null;

  return client;
}
