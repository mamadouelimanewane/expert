/**
 * Backfills legacy records to the only Cabinet in the database.
 *
 * Dry run by default. Apply only after a database backup and after confirming
 * the workspace is truly a single-cabinet installation:
 *   npx tsx scripts/migrate-single-cabinet.ts --apply
 *
 * This script refuses to guess ownership when the database has zero or more
 * than one cabinet. It does not enable SaaS access or tenant isolation.
 */
import { PrismaClient } from "@prisma/client";
import { TENANT_PRISMA_MODELS } from "../src/lib/tenant-models";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

// Derived from every model carrying cabinetId in the generated Prisma schema;
// keep new tenant data covered automatically as the schema evolves.
const MODELS = TENANT_PRISMA_MODELS.map((model) => model.delegate);

async function main() {
  const cabinets = await prisma.cabinet.findMany({
    select: { id: true, nom: true, slug: true },
    take: 2,
  });
  if (cabinets.length !== 1) {
    throw new Error(
      `Migration arrêtée : ${cabinets.length === 0 ? "aucun" : "plusieurs"} cabinet(s) détecté(s). ` +
      "Attribuez manuellement chaque dossier avant de lancer un backfill.",
    );
  }

  const [cabinet] = cabinets;
  console.log(`${APPLY ? "APPLICATION" : "SIMULATION"} — ${cabinet.nom} (${cabinet.id})`);
  const totals: { model: string; count: number; foreignOwnerCount: number }[] = [];

  for (const modelName of MODELS) {
    const delegate = (prisma as any)[modelName];
    if (!delegate?.count || !delegate?.updateMany) {
      throw new Error(`Delegate Prisma introuvable pour le modèle ${modelName}.`);
    }
    const count = await delegate.count({ where: { cabinetId: null } });
    const foreignOwnerCount = await delegate.count({
      where: {
        AND: [
          { cabinetId: { not: null } },
          { cabinetId: { not: cabinet.id } },
        ],
      },
    });
    totals.push({ model: modelName, count, foreignOwnerCount });
    if (foreignOwnerCount > 0) {
      throw new Error(
        `Migration arrêtée : ${modelName} contient ${foreignOwnerCount} enregistrement(s) rattaché(s) à un autre cabinet.`,
      );
    }
  }

  for (const row of totals) console.log(`${row.model}: ${row.count} sans cabinet; ${row.foreignOwnerCount} autre cabinet`);
  const total = totals.reduce((sum, row) => sum + row.count, 0);
  console.log(`Total à attribuer: ${total}`);
  if (APPLY) {
    for (const row of totals) {
      if (row.count === 0) continue;
      await (prisma as any)[row.model].updateMany({
        where: { cabinetId: null },
        data: { cabinetId: cabinet.id },
      });
    }
    for (const row of totals) {
      const remaining = await (prisma as any)[row.model].count({ where: { cabinetId: null } });
      if (remaining > 0) throw new Error(`Backfill incomplet pour ${row.model}: ${remaining} restant(s).`);
    }
    console.log(`Backfill terminé: ${total} enregistrement(s) attribué(s).`);
  } else {
    console.log("Aucune donnée modifiée. Relancez avec --apply après sauvegarde et validation.");
  }
}

main()
  .catch((error) => {
    console.error("Échec du backfill cabinetId:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
