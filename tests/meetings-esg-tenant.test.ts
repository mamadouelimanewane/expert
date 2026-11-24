import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, meetingFindMany, assessmentFindMany, assessmentFindFirst } = vi.hoisted(() => ({
    clientFindFirst: vi.fn(), meetingFindMany: vi.fn(), assessmentFindMany: vi.fn(), assessmentFindFirst: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { id: "user", role: "EXPERT", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
    client: { findFirst: clientFindFirst },
    meeting: { findMany: meetingFindMany },
    esgAssessment: { findMany: assessmentFindMany, findFirst: assessmentFindFirst },
} }));

import { GET as getMeetings } from "@/app/api/meetings/route";
import { GET as getEsg, PATCH as reviewEsg } from "@/app/api/advisory/esg/route";

describe("réunions et évaluations ESG isolées par cabinet", () => {
    it("refuse la liste des réunions si le client n’appartient pas au cabinet", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await getMeetings(new Request("http://localhost/api/meetings?clientId=507f1f77bcf86cd799439099") as never);
        expect(response.status).toBe(404);
        expect(meetingFindMany).not.toHaveBeenCalled();
    });

    it("limite les évaluations ESG au cabinet connecté", async () => {
        assessmentFindMany.mockResolvedValueOnce([]);
        const response = await getEsg(new Request("http://localhost/api/advisory/esg"));
        expect(response.status).toBe(200);
        expect(assessmentFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId: "507f1f77bcf86cd799439011" } }));
    });

    it("refuse la revue d’une évaluation appartenant à un autre cabinet", async () => {
        assessmentFindFirst.mockResolvedValueOnce(null);
        const response = await reviewEsg(new Request("http://localhost/api/advisory/esg", {
            method: "PATCH", headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: "507f1f77bcf86cd799439099", reviewComment: "Revue motivée sur les sources." }),
        }));
        expect(response.status).toBe(404);
    });
});
