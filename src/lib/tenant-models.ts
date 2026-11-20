import { Prisma } from "@prisma/client";

/**
 * Single source of truth for tenant-owned Prisma models. Deriving this from
 * the generated schema prevents the isolation layer and migration scripts
 * from silently missing newly added models that carry `cabinetId`.
 */
export const TENANT_PRISMA_MODELS = Prisma.dmmf.datamodel.models
  .filter((model) => model.fields.some((field) => field.name === "cabinetId"))
  .map((model) => ({
    name: model.name,
    delegate: model.name[0].toLowerCase() + model.name.slice(1),
  }));

export const TENANT_MODEL_NAMES = new Set(TENANT_PRISMA_MODELS.map((model) => model.name));
