import { Prisma, PrismaClient } from "@prisma/client";

const modelsWithCabinet = new Set(
  Prisma.dmmf.datamodel.models
    .filter((model) => model.fields.some((field) => field.name === "cabinetId"))
    .map((model) => model.name),
);

/**
 * Creates a Prisma client extension that scopes maintenance queries and writes
 * to one cabinet. Prisma 6 removed `$use`; extensions are the supported API.
 */
export function scopedPrismaForCabinet(prisma: PrismaClient, cabinetId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !modelsWithCabinet.has(model)) return query(args);

          const scopedArgs = { ...(args as Record<string, any>) };
          const addCabinet = (value: any) => Array.isArray(value)
            ? value.map((record) => ({ ...record, cabinetId }))
            : { ...value, cabinetId };

          if (["findUnique", "findFirst", "findMany", "count", "aggregate", "groupBy", "update", "updateMany", "delete", "deleteMany", "upsert"].includes(operation)) {
            scopedArgs.where = { ...(scopedArgs.where ?? {}), cabinetId };
          }
          if (["create", "createMany", "update", "updateMany"].includes(operation)) {
            scopedArgs.data = addCabinet(scopedArgs.data);
          }
          if (operation === "upsert") {
            scopedArgs.create = addCabinet(scopedArgs.create);
            scopedArgs.update = addCabinet(scopedArgs.update);
          }
          return query(scopedArgs as typeof args);
        },
      },
    },
  });
}

export type PrismaSeedScopeClient = ReturnType<typeof scopedPrismaForCabinet>;

/** Resolves an explicit/unique cabinet, then returns its scoped client. */
export async function installerPorteeSeed(prisma: PrismaClient, options: { willWrite?: boolean } = {}) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Les scripts de données de démonstration sont interdits en production.");
  }
  if (options.willWrite !== false && process.env.ALLOW_DEMO_DATA_WRITES !== "true") {
    throw new Error("Définissez ALLOW_DEMO_DATA_WRITES=true pour autoriser explicitement l'écriture des données de démonstration.");
  }

  const cabinetIdConfigure = process.env.CABINET_ID?.trim();
  let cabinet = cabinetIdConfigure
    ? await prisma.cabinet.findUnique({ where: { id: cabinetIdConfigure } })
    : null;

  if (cabinetIdConfigure && !cabinet) throw new Error("CABINET_ID ne correspond à aucun cabinet.");
  if (!cabinetIdConfigure) {
    const cabinets = await prisma.cabinet.findMany({ take: 2 });
    if (cabinets.length > 1) {
      throw new Error("Plusieurs cabinets détectés : définissez CABINET_ID pour cibler le cabinet de seed.");
    }
    cabinet = cabinets[0] ?? null;
  }
  if (!cabinet) {
    throw new Error("Aucun cabinet trouvé. Créez d'abord un cabinet, puis définissez CABINET_ID si plusieurs cabinets existent.");
  }

  return scopedPrismaForCabinet(prisma, cabinet.id);
}
