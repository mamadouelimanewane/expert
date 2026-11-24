import { requireStaff as requireStaffSession } from "@/lib/api-auth";

/**
 * Compatibility helper for API handlers that use the older `Response | null`
 * guard style. Keep the centralized role and tenant checks in api-auth.
 */
export async function requireStaff(): Promise<Response | null> {
  const { denied } = await requireStaffSession();
  return denied;
}
