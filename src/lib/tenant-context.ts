import { AsyncLocalStorage } from "node:async_hooks";

export type PortalTenantContext = { cabinetId: string; clientId: string };

const portalContext = new AsyncLocalStorage<PortalTenantContext>();

export function runWithPortalTenantContext<T>(context: PortalTenantContext, callback: () => T): T {
  return portalContext.run(context, callback);
}

export function getPortalTenantContext(): PortalTenantContext | undefined {
  return portalContext.getStore();
}
