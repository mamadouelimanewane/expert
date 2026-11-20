import { describe, expect, it } from "vitest";
import {
  decideTenantGate,
  isObjectId,
  isTenantPublicPath,
  tenantIsolationIsReady,
} from "@/lib/tenant-security";

describe("identifiants et garde d'isolation des cabinets", () => {
  it("accepte seulement les identifiants Mongo ObjectId de 24 caractères hexadécimaux", () => {
    expect(isObjectId("507f1f77bcf86cd799439011")).toBe(true);
    expect(isObjectId("507F1F77BCF86CD799439011")).toBe(true);
    expect(isObjectId("507f1f77bcf86cd79943901g")).toBe(false);
    expect(isObjectId("507f1f77bcf86cd79943901")).toBe(false);
    expect(isObjectId(null)).toBe(false);
  });

  it("ne considère que la valeur exacte true comme une activation de production", () => {
    expect(tenantIsolationIsReady(undefined)).toBe(false);
    expect(tenantIsolationIsReady("TRUE")).toBe(false);
    expect(tenantIsolationIsReady("1")).toBe(false);
    expect(tenantIsolationIsReady("true")).toBe(true);
  });

  it("laisse accessibles les seuls parcours explicitement publics pendant le verrouillage", () => {
    const publics = [
      "/",
      "/login",
      "/cabinet-indisponible",
      "/api/health",
      "/api/auth/callback/credentials",
      "/portal/abc",
      "/onboarding/digital",
      "/api/portal/abc",
    ];
    for (const path of publics) {
      expect(isTenantPublicPath(path), path).toBe(true);
      expect(decideTenantGate({ pathname: path, isolationReady: false, hasTenantContext: false })).toEqual({
        allowed: true,
      });
    }
  });

  it("ferme les routes métier sans preuve de préparation de l'isolation", () => {
    for (const pathname of ["/dashboard", "/api/clients", "/api/payments/webhook", "/api/saas/subscribe"]) {
      expect(decideTenantGate({ pathname, isolationReady: false, hasTenantContext: true })).toEqual({
        allowed: false,
        reason: "isolation_not_ready",
      });
    }
  });

  it("refuse une route métier activée quand la session n'apporte pas de contexte cabinet", () => {
    expect(
      decideTenantGate({ pathname: "/api/clients", isolationReady: true, hasTenantContext: false }),
    ).toEqual({ allowed: false, reason: "tenant_context_missing" });
    expect(
      decideTenantGate({ pathname: "/api/clients", isolationReady: true, hasTenantContext: true }),
    ).toEqual({ allowed: true });
  });
});
