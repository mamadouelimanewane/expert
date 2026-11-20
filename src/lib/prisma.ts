import { Prisma, PrismaClient } from "@prisma/client";
import { headers } from "next/headers";
import { isCabinetActif } from "./tenant";
import { getPortalTenantContext } from "./tenant-context";
import { auditLogOperationAllowed, auditReviewEventOperationAllowed } from "./audit-log-policy";
import { TENANT_MODEL_NAMES } from "./tenant-models";

const models = Prisma.dmmf.datamodel.models;
const tenantModels = TENANT_MODEL_NAMES;
const sharedModels = new Set([
  "TrainingCourse", "TrainingModule", "TrainingLesson", "Quiz",
  "QuizQuestion", "Masterclass", "LegalCitation",
]);
const lecturesScoped = new Set([
  "findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow",
  "findMany", "count", "aggregate", "groupBy",
]);
const scopedWriteOperations = new Set([
  "create", "createMany", "update", "updateMany", "delete", "deleteMany", "upsert",
]);
const scopedOperations = new Set([...lecturesScoped, ...scopedWriteOperations]);
const portalOperations: Record<string, Set<string>> = {
  Client: new Set(["findUnique", "findFirst", "update"]),
  AccountingPeriodLock: new Set(["findUnique"]),
  Document: new Set(["findUnique"]),
  TaxDeclaration: new Set(["findMany"]),
  Communication: new Set(["findMany", "create"]),
  TpeJournal: new Set(["createMany"]),
  WorkPaper: new Set(["findUnique", "upsert"]),
};
const sessionValidationCache = new Map<string, { expiresAt: number; valid: Promise<boolean> }>();

async function validateSessionOwner(
  client: PrismaClient,
  requestHeaders: Headers,
  cabinetId: string,
): Promise<void> {
  const userId = requestHeaders.get("x-c360-user-id");
  const role = requestHeaders.get("x-c360-role");
  const requestId = requestHeaders.get("x-c360-request-id");
  if (!userId || !role || !requestId) throw new Error("Session cabinet incomplète.");

  const key = `${requestId}:${userId}:${cabinetId}:${role}`;
  const now = Date.now();
  for (const [cachedKey, entry] of sessionValidationCache) {
    if (entry.expiresAt <= now) sessionValidationCache.delete(cachedKey);
  }
  if (sessionValidationCache.size > 2048) sessionValidationCache.clear();

  let entry = sessionValidationCache.get(key);
  if (!entry) {
    const valid = (async () => {
      const user = await client.user.findFirst({
        where: { id: userId, cabinetId, isActive: true },
        select: { id: true, role: true },
      });
      if (!user || user.role !== role) return false;
      const cabinet = await client.cabinet.findUnique({ where: { id: cabinetId } });
      return Boolean(cabinet && isCabinetActif(cabinet as any));
    })();
    entry = { expiresAt: now + 60_000, valid };
    sessionValidationCache.set(key, entry);
  }

  try {
    if (!(await entry.valid)) throw new Error("Session ou cabinet révoqué.");
  } catch (error) {
    sessionValidationCache.delete(key);
    throw error;
  }
}

function getModel(modelName: string) {
  return models.find((item) => item.name === modelName);
}

function getDelegate(modelName: string, client: any) {
  const name = modelName[0].toLowerCase() + modelName.slice(1);
  const delegate = client[name];
  if (!delegate) throw new Error("Modèle Prisma inconnu : " + modelName);
  return delegate;
}

function scopeSelection(modelName: string, selection: any, cabinetId: string): any {
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) return selection;
  const definition = getModel(modelName);
  if (!definition) throw new Error("Modèle Prisma inconnu dans une sélection relationnelle.");
  const result = { ...selection };

  for (const field of definition.fields) {
    if (field.kind !== "object" || !(field.name in result)) continue;
    const relationSelection = result[field.name];
    if (relationSelection === true) {
      if (field.isList && tenantModels.has(field.type)) {
        result[field.name] = { where: { cabinetId } };
      }
      continue;
    }
    if (!relationSelection || typeof relationSelection !== "object") continue;
    const nested = { ...relationSelection };
    if (field.isList && tenantModels.has(field.type)) {
      nested.where = { ...(nested.where ?? {}), cabinetId };
    } else if (field.isList && field.type === "Cabinet") {
      nested.where = { ...(nested.where ?? {}), id: cabinetId };
    }
    if (nested.include) nested.include = scopeSelection(field.type, nested.include, cabinetId);
    if (nested.select) nested.select = scopeSelection(field.type, nested.select, cabinetId);
    if (nested._count) nested._count = scopeCountSelection(field.type, nested._count, cabinetId);
    result[field.name] = nested;
  }

  if (result._count) result._count = scopeCountSelection(modelName, result._count, cabinetId);
  return result;
}

function scopeCountSelection(modelName: string, countSelection: any, cabinetId: string): any {
  const definition = getModel(modelName);
  if (!definition || !countSelection || typeof countSelection !== "object") return countSelection;
  const select = countSelection === true
    ? Object.fromEntries(definition.fields.filter((field) => field.kind === "object" && field.isList).map((field) => [field.name, true]))
    : { ...(countSelection.select ?? {}) };
  for (const field of definition.fields) {
    if (field.kind !== "object" || !field.isList || !(field.name in select) || !select[field.name]) continue;
    if (tenantModels.has(field.type)) select[field.name] = { where: { cabinetId } };
    else if (field.type === "Cabinet") select[field.name] = { where: { id: cabinetId } };
  }
  return { ...countSelection, select };
}

function scopeQuerySelections(modelName: string, args: Record<string, any>, cabinetId: string) {
  const scoped = { ...args };
  if (scoped.include) scoped.include = scopeSelection(modelName, scoped.include, cabinetId);
  if (scoped.select) scoped.select = scopeSelection(modelName, scoped.select, cabinetId);
  if (scoped._count) scoped._count = scopeCountSelection(modelName, scoped._count, cabinetId);
  return scoped;
}

function valeurScalar(value: any): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.set === "string") return value.set;
  return null;
}

async function verifyForeignKeys(modelName: string, data: any, cabinetId: string, client: any) {
  const definition = getModel(modelName);
  if (!definition || !data || typeof data !== "object") return;

  for (const field of definition.fields) {
    if (field.kind !== "object" || !field.relationFromFields?.length) continue;
    for (const foreignKey of field.relationFromFields) {
      if (!(foreignKey in data)) continue;
      const id = valeurScalar(data[foreignKey]);
      if (id === null) continue;

      let valide = false;
      if (field.type === "Cabinet") {
        valide = id === cabinetId;
      } else if (tenantModels.has(field.type)) {
        const record = await getDelegate(field.type, client).findFirst({
          where: { id, cabinetId },
          select: { id: true },
        });
        valide = Boolean(record);
      } else if (sharedModels.has(field.type)) {
        const record = await getDelegate(field.type, client).findUnique({
          where: { id },
          select: { id: true },
        });
        valide = Boolean(record);
      }
      if (!valide) throw new Error("Référence hors cabinet refusée.");
    }
  }
}

async function scopeNestedRelations(modelName: string, data: any, cabinetId: string, client: any) {
  const definition = getModel(modelName);
  if (!definition || !data || typeof data !== "object") return data;
  const result = { ...data, cabinetId };
  await verifyForeignKeys(modelName, result, cabinetId, client);

  for (const field of definition.fields) {
    if (field.kind !== "object" || !(field.name in result)) continue;
    const relation = result[field.name];
    if (!relation || typeof relation !== "object") continue;

    const nextRelation = { ...relation };
    for (const action of Object.keys(nextRelation)) {
      if (["create", "createMany"].includes(action)) continue;
      if (action === "connect") {
        const selectors = Array.isArray(nextRelation.connect) ? nextRelation.connect : [nextRelation.connect];
        for (const selector of selectors) {
          let record = null;
          if (field.type === "Cabinet") {
            record = selector?.id === cabinetId ? { id: cabinetId } : null;
          } else if (tenantModels.has(field.type)) {
            record = await getDelegate(field.type, client).findFirst({
              where: { ...selector, cabinetId }, select: { id: true },
            });
          } else if (sharedModels.has(field.type)) {
            record = await getDelegate(field.type, client).findFirst({ where: selector, select: { id: true } });
          }
          if (!record) throw new Error("Relation vers un enregistrement hors cabinet refusée.");
        }
        continue;
      }
      throw new Error("Écriture relationnelle imbriquée non prise en charge : " + action);
    }

    if ("create" in nextRelation) {
      if (!tenantModels.has(field.type)) throw new Error("Création imbriquée d'un modèle partagé refusée.");
      const rows = Array.isArray(nextRelation.create) ? nextRelation.create : [nextRelation.create];
      const scopedRows = [];
      for (const row of rows) scopedRows.push(await scopeNestedRelations(field.type, row, cabinetId, client));
      nextRelation.create = Array.isArray(nextRelation.create) ? scopedRows : scopedRows[0];
    }
    if ("createMany" in nextRelation) {
      if (!tenantModels.has(field.type)) throw new Error("Création imbriquée d'un modèle partagé refusée.");
      const payload = nextRelation.createMany;
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [payload?.data];
      const scopedRows = [];
      for (const row of rows) scopedRows.push(await scopeNestedRelations(field.type, row, cabinetId, client));
      nextRelation.createMany = Array.isArray(payload)
        ? scopedRows
        : { ...payload, data: Array.isArray(payload.data) ? scopedRows : scopedRows[0] };
    }
    result[field.name] = nextRelation;
  }
  return result;
}

async function prepareData(operation: string, args: any, cabinetId: string, modelName: string, client: any) {
  const next = { ...args };
  if (operation === "create") {
    next.data = await scopeNestedRelations(modelName, args.data, cabinetId, client);
  } else if (operation === "createMany") {
    const rows = Array.isArray(args.data) ? args.data : [args.data];
    const scopedRows = [];
    for (const row of rows) scopedRows.push(await scopeNestedRelations(modelName, row, cabinetId, client));
    next.data = Array.isArray(args.data) ? scopedRows : scopedRows[0];
  } else if (operation === "update" || operation === "updateMany") {
    next.data = await scopeNestedRelations(modelName, args.data, cabinetId, client);
  } else if (operation === "upsert") {
    next.create = await scopeNestedRelations(modelName, args.create, cabinetId, client);
    next.update = await scopeNestedRelations(modelName, args.update, cabinetId, client);
  }
  return next;
}

export function construireClient(clientSystem: PrismaClient) {
  return clientSystem.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        if (!model) throw new Error("Requêtes Prisma brutes désactivées pour les accès applicatifs.");
        if (model === "AuditLog" && !auditLogOperationAllowed(operation)) {
          throw new Error("Le journal d'audit est append-only : modification et suppression interdites.");
        }
        if (model === "AuditReviewCommentEvent" && !auditReviewEventOperationAllowed(operation)) {
          throw new Error("L'historique des commentaires de revue est append-only.");
        }
        if (model === "AuditReviewComment" && ["delete", "deleteMany"].includes(operation)) {
          throw new Error("Un commentaire de revue ne peut pas être supprimé; archivez-le en le résolvant.");
        }
        const entetes = await headers();
        const portal = getPortalTenantContext();
        const cabinetId = portal?.cabinetId ?? entetes.get("x-c360-cabinet-id");
        const contexte = entetes.get("x-c360-context");
        const input = args as Record<string, any>;

        if (portal) {
          const allowed = portalOperations[model];
          if (!allowed?.has(operation)) throw new Error("Opération non autorisée depuis le portail client.");
          if (!tenantModels.has(model)) throw new Error("Modèle non autorisé depuis le portail client.");
          const scoped = { ...input };
          if (operation !== "create" && operation !== "createMany") {
            if (model === "Client") scoped.where = { ...(input.where ?? {}), id: portal.clientId, cabinetId: portal.cabinetId };
            else scoped.where = { ...(input.where ?? {}), clientId: portal.clientId, cabinetId: portal.cabinetId };
          }

          if (operation === "create") {
            const data = { ...input.data, clientId: portal.clientId, cabinetId: portal.cabinetId };
            if (model === "Communication") {
              data.type = "portal";
              data.sender = "client";
            }
            scoped.data = data;
          } else if (operation === "createMany") {
            const rows = Array.isArray(input.data) ? input.data : [input.data];
            const safeRows = rows.map((row: any) => ({
              ...row, clientId: portal.clientId, cabinetId: portal.cabinetId,
              ...(model === "TpeJournal" ? { status: "PENDING", source: "PORTAL", exportedAt: null } : {}),
            }));
            scoped.data = Array.isArray(input.data) ? safeRows : safeRows[0];
          } else if (operation === "update" || operation === "updateMany") {
            if (model === "Client") {
              const allowedFields = new Set(["kycStatus", "stripeIdentitySessionId", "stripeCustomerId", "sepaMandateStatus"]);
              for (const field of Object.keys(input.data ?? {})) {
                if (!allowedFields.has(field)) throw new Error("Champ client non modifiable depuis le portail.");
              }
              if (input.data?.kycStatus && !["valid", "invalid"].includes(input.data.kycStatus)) throw new Error("Statut KYC invalide.");
              if (input.data?.sepaMandateStatus && !["pending", "active", "failed"].includes(input.data.sepaMandateStatus)) throw new Error("Statut SEPA invalide.");
            }
            scoped.data = { ...input.data, ...(model === "Client" ? {} : { clientId: portal.clientId }), cabinetId: portal.cabinetId };
          } else if (operation === "upsert") {
            scoped.where = { ...scoped.where, clientId_type: { clientId: portal.clientId, type: "PORTAL_DASHBOARD" } };
            scoped.create = { ...input.create, clientId: portal.clientId, cabinetId: portal.cabinetId, type: "PORTAL_DASHBOARD" };
            scoped.update = { ...input.update, clientId: portal.clientId, cabinetId: portal.cabinetId, type: "PORTAL_DASHBOARD" };
          }
          return query(scopeQuerySelections(model, scoped, portal.cabinetId) as typeof args);
        }

        if (sharedModels.has(model)) {
          if (!lecturesScoped.has(operation)) throw new Error("Écriture sur un catalogue partagé refusée.");
          if (!cabinetId) throw new Error("Contexte cabinet absent pour lire le catalogue partagé.");
          await validateSessionOwner(clientSystem, entetes, cabinetId);
          return query(scopeQuerySelections(model, input, cabinetId) as typeof args);
        }

        if (model === "Cabinet") {
          if (!cabinetId && contexte === "auth" && operation === "findUnique") {
            if (typeof input.where?.id !== "string") throw new Error("Recherche de cabinet hors contexte refusée.");
            if (input.include || input.select) throw new Error("Sélection relationnelle refusée pendant l'authentification.");
            return query(args);
          }
          if (!cabinetId || !lecturesScoped.has(operation)) throw new Error("Accès global aux cabinets refusé.");
          await validateSessionOwner(clientSystem, entetes, cabinetId);
          const cabinetArgs = { ...input, where: { ...(input.where ?? {}), id: cabinetId } };
          return query(scopeQuerySelections(model, cabinetArgs, cabinetId) as typeof args);
        }

        if (!cabinetId && contexte === "auth" && model === "User" && operation === "findUnique") {
          if (typeof input.where?.email !== "string") throw new Error("Recherche utilisateur hors contexte refusée.");
          if (input.include || input.select) throw new Error("Sélection relationnelle refusée pendant l'authentification.");
          return query(args);
        }
        if (!cabinetId && contexte === "health" && model === "User" && operation === "count") return query(args);

        if (!tenantModels.has(model)) throw new Error("Modèle sans règle d'accès explicite : " + model);
        if (!cabinetId) throw new Error("Contexte cabinet absent : accès aux données refusé.");
        await validateSessionOwner(clientSystem, entetes, cabinetId);
        if (!scopedOperations.has(operation)) throw new Error("Opération Prisma non cloisonnée refusée : " + operation);

        // Once a TPE journal line has been exported to production it is an
        // accounting record. Generic handlers may not silently edit or delete
        // it; corrections must be represented by a separate reversal entry.
        if (
          model === "TpeJournal" &&
          ["update", "updateMany", "delete", "deleteMany", "upsert"].includes(operation)
        ) {
          const posted = await clientSystem.tpeJournal.findFirst({
            where: { ...(input.where ?? {}), cabinetId, status: "EXPORTED" },
            select: { id: true },
          });
          if (posted) {
            throw new Error("Écriture comptabilisée immuable : créez une contrepassation motivée.");
          }
        }

        const scoping = { ...input };
        if (operation !== "create" && operation !== "createMany") {
          scoping.where = { ...(input.where ?? {}), cabinetId };
        }
        if (scopedWriteOperations.has(operation)) {
          const prepared = await prepareData(operation, input, cabinetId, model, clientSystem);
          Object.assign(scoping, prepared);
        }
        return query(scopeQuerySelections(model, scoping, cabinetId) as typeof args);
      },
    },
  });
}

const prismaSystemSingleton = () => new PrismaClient();
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
  // eslint-disable-next-line no-var
  var prismaSystemGlobal: undefined | PrismaClient;
}

const prismaSystem = globalThis.prismaSystemGlobal ?? prismaSystemSingleton();
const prismaClientSingleton = () => construireClient(prismaSystem);
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
// Client système réservé aux tâches de maintenance explicitement contrôlées.
export { prismaSystem };
export default prisma;
export { prisma };

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
  globalThis.prismaSystemGlobal = prismaSystem;
}
