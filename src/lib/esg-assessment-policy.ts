import type { InputESG } from "@/lib/ohada/reporting-esg";

const CHAMPS_NUMERIQUES = [
  "ca_XOF", "effectifTotal", "consommationCarburantLitres", "consommationElectriciteKWh",
  "nbContratsFormels", "nbFemmes", "nbAffiliesSante", "accidentsWork", "masseSalariale_XOF",
  "administrateursIndependants_pct",
] as const;
const ENTiers = ["effectifTotal", "nbContratsFormels", "nbFemmes", "nbAffiliesSante", "accidentsWork"] as const;
const BOOLEENS = ["lcbftConforme", "registreBeneficiairesEffectifs", "comiteAudit", "codeEthiqueAdopte"] as const;
const estObjet = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));

export function validerDonneesESG(value: unknown, raisonSociale: string, pays: string): { ok: true; input: InputESG } | { ok: false; message: string } {
  if (!estObjet(value)) return { ok: false, message: "Les données ESG sont invalides." };
  const exercice = Number(value.exercice);
  if (!Number.isInteger(exercice) || exercice < 2000 || exercice > 2100) return { ok: false, message: "L’exercice doit être une année valide." };
  for (const key of CHAMPS_NUMERIQUES) {
    const number = value[key];
    if (typeof number !== "number" || !Number.isFinite(number) || number < 0 || number > 1_000_000_000_000_000) return { ok: false, message: `Valeur invalide ou hors limites pour ${key}.` };
  }
  const effectif = value.effectifTotal as number;
  if (effectif < 1) return { ok: false, message: "L’effectif total doit être supérieur à zéro." };
  for (const key of ENTiers) if (!Number.isInteger(value[key])) return { ok: false, message: `La valeur ${key} doit être un nombre entier.` };
  for (const [key, label] of [["nbContratsFormels", "contrats formels"], ["nbFemmes", "femmes recensées"], ["nbAffiliesSante", "affiliés sociaux"]] as const) {
    if ((value[key] as number) > effectif) return { ok: false, message: `Le nombre de ${label} ne peut dépasser l’effectif total.` };
  }
  if (!(value.ca_XOF as number > 0)) return { ok: false, message: "Le chiffre d’affaires doit être supérieur à zéro pour calculer l’intensité carbone." };
  if ((value.administrateursIndependants_pct as number) > 100) return { ok: false, message: "Le taux d’administrateurs indépendants ne peut dépasser 100 %." };
  for (const key of BOOLEENS) if (typeof value[key] !== "boolean") return { ok: false, message: `Indicateur invalide : ${key}.` };
  const purchaseMWh = value.achatEnergieMWh;
  if (purchaseMWh !== undefined && (typeof purchaseMWh !== "number" || !Number.isFinite(purchaseMWh) || purchaseMWh < 0 || purchaseMWh > 1_000_000_000_000_000)) return { ok: false, message: "La quantité d’énergie achetée est invalide." };

  return { ok: true, input: {
    raisonSociale, pays, exercice,
    ca_XOF: value.ca_XOF as number, effectifTotal: effectif,
    consommationCarburantLitres: value.consommationCarburantLitres as number,
    consommationElectriciteKWh: value.consommationElectriciteKWh as number,
    achatEnergieMWh: purchaseMWh as number | undefined,
    nbContratsFormels: value.nbContratsFormels as number, nbFemmes: value.nbFemmes as number,
    nbAffiliesSante: value.nbAffiliesSante as number, accidentsWork: value.accidentsWork as number,
    masseSalariale_XOF: value.masseSalariale_XOF as number,
    lcbftConforme: value.lcbftConforme as boolean,
    registreBeneficiairesEffectifs: value.registreBeneficiairesEffectifs as boolean,
    administrateursIndependants_pct: value.administrateursIndependants_pct as number,
    comiteAudit: value.comiteAudit as boolean, codeEthiqueAdopte: value.codeEthiqueAdopte as boolean,
  } };
}
