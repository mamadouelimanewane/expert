/** Shared fail-closed rules for routes that depend on tenant-owned data. */

const OBJECT_ID = /^[a-f0-9]{24}$/i;

export function isObjectId(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID.test(value);
}

export function isTenantPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/cabinet-indisponible" ||
    pathname === "/api/health" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/portal" || pathname.startsWith("/portal/") ||
    pathname === "/onboarding/digital" ||
    pathname === "/api/portal" || pathname.startsWith("/api/portal/")
  );
}

export type TenantGateDecision =
  | { allowed: true }
  | { allowed: false; reason: "isolation_not_ready" | "tenant_context_missing" };

/**
 * Decide whether the request may reach a tenant-backed route. HTTP callers
 * still choose the response shape (503 for a closed rollout, 403 for a stale
 * session); keeping the decision pure makes the security boundary testable.
 */
export function decideTenantGate(input: {
  pathname: string;
  isolationReady: boolean;
  hasTenantContext: boolean;
}): TenantGateDecision {
  if (isTenantPublicPath(input.pathname)) return { allowed: true };
  if (!input.isolationReady) return { allowed: false, reason: "isolation_not_ready" };
  if (!input.hasTenantContext) return { allowed: false, reason: "tenant_context_missing" };
  return { allowed: true };
}

export function tenantIsolationIsReady(value: string | undefined): boolean {
  return value === "true";
}
