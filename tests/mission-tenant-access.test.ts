import { describe, expect, it, vi } from "vitest";

const { missionFindFirst, taskFindFirst } = vi.hoisted(() => ({ missionFindFirst: vi.fn(), taskFindFirst: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { id: "user", name: "Expert", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: { mission: { findFirst: missionFindFirst }, task: { findFirst: taskFindFirst } } }));

import { GET } from "@/app/api/missions/[id]/route";
import { PATCH } from "@/app/api/missions/[id]/tasks/[taskId]/route";

describe("missions et tâches isolées par cabinet", () => {
    it("ne retourne pas une mission appartenant à un autre cabinet", async () => {
        missionFindFirst.mockResolvedValueOnce(null);
        const response = await GET(new Request("http://localhost/api/missions/id"), { params: Promise.resolve({ id: "507f1f77bcf86cd799439099" }) });
        expect(response.status).toBe(404);
        expect(missionFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" } }));
    });

    it("refuse de modifier une tâche hors du cabinet et de la mission", async () => {
        taskFindFirst.mockResolvedValueOnce(null);
        const response = await PATCH(new Request("http://localhost/api/missions/id/tasks/task", {
            method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ completed: true }),
        }), { params: Promise.resolve({ id: "507f1f77bcf86cd799439099", taskId: "507f1f77bcf86cd799439098" }) });
        expect(response.status).toBe(404);
        expect(taskFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ cabinetId: "507f1f77bcf86cd799439011" }) }));
    });
});
