import { describe, expect, it, vi } from "vitest";

const { journalFindMany, clientFindFirst, employeeFindMany } = vi.hoisted(() => ({
    journalFindMany: vi.fn(), clientFindFirst: vi.fn(), employeeFindMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { id: "user", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { id: "user", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => {
    const db = {
        tpeJournal: { findMany: journalFindMany },
        client: { findFirst: clientFindFirst },
        employee: { findMany: employeeFindMany },
    };
    return { default: db, prisma: db };
});

import { GET as getJournal } from "@/app/api/comptabilite/tpe-journal/route";
import { GET as getEmployees } from "@/app/api/payroll/employes/route";

describe("journal et paie cloisonnés par cabinet", () => {
    it("filtre le journal TPE sur le cabinet connecté", async () => {
        journalFindMany.mockResolvedValueOnce([]);
        const response = await getJournal();
        expect(response.status).toBe(200);
        expect(journalFindMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { cabinetId: "507f1f77bcf86cd799439011", source: { not: "WHATSAPP_TEST" } },
        }));
    });

    it("vérifie la propriété du client avant de retourner ses salariés", async () => {
        clientFindFirst.mockResolvedValueOnce({ id: "507f1f77bcf86cd799439099", country: "SN" });
        employeeFindMany.mockResolvedValueOnce([]);
        const response = await getEmployees(new Request("http://localhost/api/payroll/employes?clientId=507f1f77bcf86cd799439099"));
        expect(response.status).toBe(200);
        expect(clientFindFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" },
        }));
        expect(employeeFindMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { clientId: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" },
        }));
    });
});
