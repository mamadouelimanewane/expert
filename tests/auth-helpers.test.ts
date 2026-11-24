import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireStaffSession } = vi.hoisted(() => ({ requireStaffSession: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({ requireStaff: requireStaffSession }));

import { requireStaff } from "@/lib/auth-helpers";

describe("compatibilité du contrôle d'accès API", () => {
  beforeEach(() => requireStaffSession.mockReset());

  it("retourne la réponse de refus produite par le contrôle centralisé", async () => {
    const denied = new Response("Forbidden", { status: 403 });
    requireStaffSession.mockResolvedValue({ denied, session: null });
    await expect(requireStaff()).resolves.toBe(denied);
  });

  it("laisse passer une session déjà validée par le contrôle centralisé", async () => {
    requireStaffSession.mockResolvedValue({ denied: null, session: { id: "user" } });
    await expect(requireStaff()).resolves.toBeNull();
  });
});
