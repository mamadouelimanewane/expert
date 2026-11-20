import { describe, expect, it } from "vitest";
import { auditLogOperationAllowed } from "@/lib/audit-log-policy";

describe("politique append-only du journal d'audit", () => {
  it("autorise les lectures et les ajouts", () => {
    for (const operation of ["findUnique", "findFirst", "findMany", "count", "aggregate", "groupBy", "create", "createMany"]) {
      expect(auditLogOperationAllowed(operation)).toBe(true);
    }
  });

  it("refuse les modifications et suppressions", () => {
    for (const operation of ["update", "updateMany", "delete", "deleteMany", "upsert"]) {
      expect(auditLogOperationAllowed(operation)).toBe(false);
    }
  });
});
