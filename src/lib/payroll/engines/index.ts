import { calculateSenegalPayroll, PayrollParams, PayrollResult } from "./senegal";

export function calculatePayroll(countryCode: string, params: PayrollParams): PayrollResult {
  switch (countryCode.toUpperCase()) {
    case "SN":
    case "SENEGAL":
      return calculateSenegalPayroll(params);
    // Ajoutez d'autres pays ici (CI, CM, etc.) plus tard
    default:
      // Fallback ou pays par défaut (on prend le Sénégal par défaut pour la démo si "SN")
      // Si autre pays non implémenté, on fait un calcul simple
      if (countryCode === "CI") {
         // Exemple Côte d'Ivoire (simplifié)
         const gross = params.baseSalary - (params.absencesDays * (params.baseSalary/30)) + (params.overtimeHours * (params.baseSalary/173.33 * 1.15)) + params.bonuses + params.transportAllowance;
         return {
           grossSalary: Math.round(gross),
           taxableIncome: Math.round(gross * 0.8),
           socialSecurity: Math.round(gross * 0.063), // CNPS CI approx
           taxes: Math.round(gross * 0.05), // IGR/IS approx
           netSalary: Math.round(gross - (gross*0.063) - (gross*0.05)),
           employerContributions: Math.round(gross * 0.16)
         };
      }

      // Par défaut
      return calculateSenegalPayroll(params);
  }
}
