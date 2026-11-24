import { describe, expect, it, vi } from "vitest";

const { commentFindFirst } = vi.hoisted(() => ({ commentFindFirst: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({ requireWriteAccess: vi.fn(async () => ({ session: { id: "user", cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })) }));
vi.mock("@/lib/prisma", () => ({ default: { auditReviewComment: { findFirst: commentFindFirst } } }));

import { PATCH } from "@/app/api/audit/review-comments/[id]/route";

describe("commentaires de revue isolés par cabinet", () => {
    it("ne permet pas de répondre à un point d’un autre cabinet", async () => {
        commentFindFirst.mockResolvedValueOnce(null);
        const response = await PATCH(new Request("http://localhost/api/audit/review-comments/507f1f77bcf86cd799439099", {
            method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "reply", message: "Réponse test" }),
        }), { params: Promise.resolve({ id: "507f1f77bcf86cd799439099" }) });
        expect(response.status).toBe(404);
        expect(commentFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" } }));
    });
});
