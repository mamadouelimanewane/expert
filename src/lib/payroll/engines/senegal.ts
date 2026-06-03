export interface PayrollParams {
  baseSalary: number;
  absencesDays: number;
  overtimeHours: number;
  bonuses: number;
  transportAllowance: number;
  maritalStatus: string;
  childrenCount: number;
  isCadre: boolean;
}

export interface PayrollResult {
  grossSalary: number; // Salaire brut (Base - Absences + Heures Sup + Primes)
  taxableIncome: number; // Brut Imposable (Brut - parts non imposables)
  socialSecurity: number; // Part Salariale (IPRES, CSS n'a pas de part salariale)
  taxes: number; // IR + TRIMF
  netSalary: number; // Net à payer
  employerContributions: number; // IPRES patronal + CSS + CFCE
}

export function calculateSenegalPayroll(params: PayrollParams): PayrollResult {
  const {
    baseSalary, absencesDays, overtimeHours, bonuses, transportAllowance,
    maritalStatus, childrenCount, isCadre
  } = params;

  // 1. Calcul du Salaire Brut
  const dailyRate = baseSalary / 30;
  const hourlyRate = (baseSalary / 173.33) * 1.15; // Majoration 15% pour HS
  const grossSalary = baseSalary - (absencesDays * dailyRate) + (overtimeHours * hourlyRate) + bonuses + transportAllowance;

  // 2. Calcul des Cotisations Sociales (IPRES)
  // Plafonds IPRES Mensuels (2024)
  const PLAFOND_RG = 360000;
  const PLAFOND_RC = 1080000;

  // Assiette Sociale (Le transport est généralement plafonné à 20800 pour être non imposable/non cotisable)
  const transportSoumis = Math.max(0, transportAllowance - 20800);
  const brutSocial = grossSalary - transportAllowance + transportSoumis;

  // Part Salariale IPRES
  const ipresRGSalarial = Math.min(brutSocial, PLAFOND_RG) * 0.056; // 5.6%
  let ipresRCSalarial = 0;
  
  // Part Patronale IPRES + CSS + CFCE
  const ipresRGPatronal = Math.min(brutSocial, PLAFOND_RG) * 0.084; // 8.4%
  let ipresRCPatronal = 0;
  
  if (isCadre) {
    ipresRCSalarial = Math.min(brutSocial, PLAFOND_RC) * 0.024; // 2.4%
    ipresRCPatronal = Math.min(brutSocial, PLAFOND_RC) * 0.036; // 3.6%
  }

  const cssPatronal = Math.min(brutSocial, 63000) * 0.07 + Math.min(brutSocial, 63000) * 0.01; // PF (7%) + AT (approx 1% à 3%)
  const cfcePatronal = brutSocial * 0.03; // CFCE 3%

  const totalSocialSalarial = ipresRGSalarial + ipresRCSalarial;
  const totalSocialPatronal = ipresRGPatronal + ipresRCPatronal + cssPatronal + cfcePatronal;

  // 3. Calcul de l'Assiette Fiscale
  const brutFiscal = grossSalary - transportAllowance + transportSoumis - totalSocialSalarial;

  // Abattement de 30% (limité à 900,000 / an soit 75,000 / mois)
  const abattement = Math.min(brutFiscal * 0.30, 75000);
  const baseImposableMensuelle = brutFiscal - abattement;

  // 4. Calcul des Parts Fiscales
  let parts = maritalStatus === "MARIE" ? 2 : 1;
  parts += childrenCount * 0.5;
  if (parts > 5) parts = 5; // Plafond légal à 5 parts

  // 5. Calcul de l'IR (Barème Mensuel Simplifié)
  // Base ramenée à 1 part
  const baseParPart = baseImposableMensuelle / parts;
  let irParPart = 0;

  if (baseParPart > 52500 && baseParPart <= 125000) {
    irParPart = (baseParPart - 52500) * 0.20;
  } else if (baseParPart > 125000 && baseParPart <= 333333) {
    irParPart = 14500 + (baseParPart - 125000) * 0.30;
  } else if (baseParPart > 333333 && baseParPart <= 666666) {
    irParPart = 77000 + (baseParPart - 333333) * 0.35;
  } else if (baseParPart > 666666) {
    irParPart = 193666 + (baseParPart - 666666) * 0.37; // Approx 37% (max)
  }

  // TRIMF (Forfaitaire)
  let trimf = 0;
  if (baseImposableMensuelle < 100000) trimf = 900;
  else if (baseImposableMensuelle < 250000) trimf = 3000;
  else if (baseImposableMensuelle < 400000) trimf = 6000;
  else trimf = 12000; // Simplified max

  const totalIR = irParPart * parts;
  const totalTaxes = totalIR + trimf;

  // 6. Net à Payer
  const netSalary = grossSalary - totalSocialSalarial - totalTaxes;

  return {
    grossSalary: Math.round(grossSalary),
    taxableIncome: Math.round(baseImposableMensuelle),
    socialSecurity: Math.round(totalSocialSalarial),
    taxes: Math.round(totalTaxes),
    netSalary: Math.round(netSalary),
    employerContributions: Math.round(totalSocialPatronal)
  };
}
