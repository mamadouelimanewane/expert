import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePayroll, estPaysSupporte, PAYS_SUPPORTES } from "@/lib/payroll/engines";
import { completer, isLLMConfigured, MESSAGE_LLM_NON_CONFIGURE } from "@/lib/llm";

import { requireStaff } from "@/lib/api-auth";
type ExtractedVars = { absencesDays: number; overtimeHours: number; bonuses: number };

async function extractPayrollVariables(transcript: string, employeeNames: string[]): Promise<Record<string, ExtractedVars>> {
  const systeme = `Tu extrais des variables de paie à partir d'une transcription vocale en français, pour un cabinet comptable en zone OHADA.
Employés concernés (prénoms) : ${employeeNames.join(", ")}.
Pour chaque employé mentionné, détermine : absencesDays (nombre de jours d'absence, entier), overtimeHours (heures supplémentaires, nombre), bonuses (prime en FCFA, nombre).
Si un employé n'est pas mentionné ou qu'une info n'est pas donnée, mets 0 pour la valeur correspondante.
Réponds UNIQUEMENT avec un objet JSON de la forme {"Prénom": {"absencesDays": 0, "overtimeHours": 0, "bonuses": 0}, ...}, sans texte autour.`;

  const content = await completer(systeme, transcript, { json: true, maxTokens: 800 });
  return JSON.parse(content || "{}");
}

export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { clientId, transcript, manualVariables } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }
    // Variables saisies à la main : { [employeeId]: { absencesDays, overtimeHours, bonuses } }.
    // Elles priment sur l'extraction IA et permettent de calculer la paie sans
    // aucun moteur de langage — la paie ne doit jamais dépendre d'une clé API.
    const manuelles: Record<string, Partial<ExtractedVars>> =
      manualVariables && typeof manualVariables === "object" ? manualVariables : {};
    const texte = typeof transcript === "string" ? transcript.trim() : "";

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { employees: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    const employees = client.employees;

    if (employees.length === 0) {
      return NextResponse.json({ error: "Aucun employé trouvé pour ce client" }, { status: 404 });
    }

    // Refuser avant tout calcul si le barème du pays n'est pas implémenté :
    // mieux vaut pas de bulletin qu'un bulletin calculé avec le droit d'un
    // autre pays.
    if (!estPaysSupporte(client.country)) {
      return NextResponse.json({
        error: `Le calcul de paie n'est pas disponible pour « ${client.country} ». ` +
          `Pays implémentés : ${PAYS_SUPPORTES.join(", ")}.`,
        paysNonSupporte: true,
        pays: client.country,
      }, { status: 422 });
    }

    const avertissementsGlobaux: string[] = [];
    let extracted: Record<string, ExtractedVars> = {};
    if (texte) {
      if (!isLLMConfigured()) {
        avertissementsGlobaux.push(
          `Transcription ignorée : ${MESSAGE_LLM_NON_CONFIGURE} Saisissez les absences, heures et primes dans le tableau.`
        );
      } else {
        try {
          extracted = await extractPayrollVariables(texte, employees.map(e => e.firstName));
        } catch (llmError) {
          console.error("[Payroll Voice] LLM extraction error:", llmError);
          avertissementsGlobaux.push(
            "L'analyse IA de la transcription a échoué : variables à zéro, à compléter dans le tableau."
          );
        }
      }
    }

    const finalVariables = employees.map(emp => {
      const ia = extracted[emp.firstName] || { absencesDays: 0, overtimeHours: 0, bonuses: 0 };
      const vars = { ...ia, ...(manuelles[emp.id] ?? {}) };

      const payrollParams = {
        baseSalary: emp.baseSalary || 0,
        absencesDays: Number(vars.absencesDays) || 0,
        overtimeHours: Number(vars.overtimeHours) || 0,
        bonuses: Number(vars.bonuses) || 0,
        transportAllowance: emp.transportAllowance || 0,
        maritalStatus: emp.maritalStatus || "CELIBATAIRE",
        childrenCount: emp.childrenCount || 0,
        isCadre: emp.isCadre || false,
        conjointsSansRevenu: emp.conjointsSansRevenu || 0,
        sexe: emp.sexe === "F" ? ("F" as const) : ("M" as const),
        benefitsInKind: emp.avantagesNature || 0,
        // Paramètres employeur : laissés undefined pour prendre le défaut du moteur.
        ...(client.paieAccidentRate != null ? { accidentRate: client.paieAccidentRate } : {}),
        ...(client.paieIpmSalarial != null ? { ipmRateSalarial: client.paieIpmSalarial } : {}),
        ...(client.paieIpmPatronal != null ? { ipmRatePatronal: client.paieIpmPatronal } : {}),
      };

      const result = calculatePayroll(client.country, payrollParams);

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        ...payrollParams,
        ...result
      };
    });

    return NextResponse.json({
      success: true,
      country: client.country,
      variables: finalVariables,
      avertissements: avertissementsGlobaux,
      message: texte
        ? "Analyse vocale (IA) et calculs pays terminés — vérifiez les valeurs extraites avant validation."
        : "Bulletins calculés — ajustez absences, heures et primes dans le tableau si nécessaire.",
    });

  } catch (error) {
    console.error("[Payroll Voice API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
