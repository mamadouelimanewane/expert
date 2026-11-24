import { describe, expect, it, vi } from "vitest";

const { workspaceFindMany, workspaceFindFirst, workspaceCreate, activityFindMany, clientFindFirst, memberFindFirst, userFindFirst } = vi.hoisted(() => ({
  workspaceFindMany: vi.fn(), workspaceFindFirst: vi.fn(), workspaceCreate: vi.fn(), activityFindMany: vi.fn(), clientFindFirst: vi.fn(), memberFindFirst: vi.fn(), userFindFirst: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
  workspace: { findMany: workspaceFindMany, findFirst: workspaceFindFirst, create: workspaceCreate },
  workspaceActivity: { findMany: activityFindMany },
  workspaceMember: { findFirst: memberFindFirst },
  client: { findFirst: clientFindFirst },
  user: { findFirst: userFindFirst },
} }));

import { GET as listWorkspaces, POST as createWorkspace } from "@/app/api/workspaces/route";
import { GET as getWorkspace, PATCH as updateWorkspace } from "@/app/api/workspaces/[id]/route";

const cabinetId = "507f1f77bcf86cd799439011";
const foreignId = "507f1f77bcf86cd799439099";

describe("espaces de travail isolés par cabinet", () => {
  it("filtre la liste des espaces et activités par cabinet", async () => {
    workspaceFindMany.mockResolvedValueOnce([]);
    activityFindMany.mockResolvedValueOnce([]);
    const response = await listWorkspaces();
    expect(response.status).toBe(200);
    expect(workspaceFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId } }));
    expect(activityFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId } }));
  });

  it("ne révèle pas le détail d’un espace étranger", async () => {
    workspaceFindFirst.mockResolvedValueOnce(null);
    const response = await getWorkspace(new Request("http://localhost") as never, { params: Promise.resolve({ id: foreignId }) });
    expect(response.status).toBe(404);
    expect(userFindFirst).not.toHaveBeenCalled();
  });

  it("refuse de lier un client étranger à un workspace", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await createWorkspace(new Request("http://localhost/api/workspaces", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Mission client", clientId: foreignId }) }) as never);
    expect(response.status).toBe(404);
    expect(workspaceCreate).not.toHaveBeenCalled();
  });

  it("refuse de modifier un espace étranger avant de consulter ses membres", async () => {
    workspaceFindFirst.mockResolvedValueOnce(null);
    const response = await updateWorkspace(new Request("http://localhost", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Modifié" }) }) as never, { params: Promise.resolve({ id: foreignId }) });
    expect(response.status).toBe(404);
    expect(memberFindFirst).not.toHaveBeenCalled();
  });
});
