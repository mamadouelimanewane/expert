import { describe, expect, it, vi } from "vitest";

const { sectionFindFirst, itemFindFirst } = vi.hoisted(() => ({ sectionFindFirst: vi.fn(), itemFindFirst: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({ requireStaff: vi.fn(async () => ({ session: { id: "user", name: "Expert", role: "EXPERT", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })) }));
vi.mock("@/lib/prisma", () => ({ default: { auditSection: { findFirst: sectionFindFirst }, auditChecklistItem: { findFirst: itemFindFirst } } }));

import { POST, PATCH } from "@/app/api/audit/dossier/route";

describe("dossier d’audit isolé par cabinet", () => {
    it("refuse la mutation d’une section appartenant à un autre cabinet", async () => {
        sectionFindFirst.mockResolvedValueOnce({ mission: { cabinetId: "507f1f77bcf86cd799439022", type: "AUDIT" } });
        const response = await POST(new Request("http://localhost/api/audit/dossier", {
            method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sectionId: "507f1f77bcf86cd799439099", note: "Test" }),
        }));
        expect(response.status).toBe(404);
    });

    it("refuse la mutation d’une diligence liée à une mission étrangère", async () => {
        itemFindFirst.mockResolvedValueOnce({ section: { mission: { cabinetId: "507f1f77bcf86cd799439022" } } });
        const response = await PATCH(new Request("http://localhost/api/audit/dossier", {
            method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId: "507f1f77bcf86cd799439099", comment: "Test" }),
        }));
        expect(response.status).toBe(404);
    });
});
