const AUDIT_LOG_ALLOWED_OPERATIONS = new Set([
  "findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow",
  "findMany", "count", "aggregate", "groupBy", "create", "createMany",
]);

export function auditLogOperationAllowed(operation: string): boolean {
  return AUDIT_LOG_ALLOWED_OPERATIONS.has(operation);
}

export function auditReviewEventOperationAllowed(operation: string): boolean {
  return AUDIT_LOG_ALLOWED_OPERATIONS.has(operation);
}
