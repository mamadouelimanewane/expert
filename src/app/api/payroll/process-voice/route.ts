import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePayroll, estPaysSupporte, PAYS_SUPPORTES } from "@/lib/payroll/engines";
import { isLLMConfigured } from "@/lib/llm";

import { requireStaff } from "@/lib/api-auth";
type ExtractedVars = { absencesDays: number; overtimeHours: number; bonuses: number };

async function extractPayrollVariables(transcript: string, employeeNames: string[]): Promise<Record<string, ExtractedVars>> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY non configurée");
  }

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Tu extrais des variables de paie à partir d'une transcription vocale en français, pour un cabinet comptable en zone OHADA.
Employés concernés (prénoms) : ${employeeNames.join(", ")}.
Pour chaque employé mentionné, détermine : absencesDays (nombre de jours d'absence, entier), overtimeHours (heures supplémentaires, nombre), bonuses (prime en FCFA, nombre).
Si un employé n'est pas mentionné ou qu'une info n'est pas donnée, mets 0 pour la valeur correspondante.
Réponds UNIQUEMENT avec un objet JSON de la forme {"Prénom": {"absencesDays": 0, "overtimeHours": 0, "bonuses": 0}, ...}, sans texte autour.`,
        },
        { role: "user", content: transcript },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur DeepSeek (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { clientId, transcript } = await req.json();

    if (!clientId || !transcript) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

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

    if (!isLLMConfigured()) {
      return NextResponse.json({
        error: "La saisie vocale nécessite l'assistant IA (DEEPSEEK_API_KEY non configurée). Utilisez la saisie manuelle des variables de paie en attendant.",
        notConfigured: true,
      }, { status: 503 });
    }

    let extracted: Record<string, ExtractedVars>;
    try {
      extracted = await extractPayrollVariables(transcript, employees.map(e => e.firstName));
    } catch (llmError) {
      console.error("[Payroll Voice] LLM extraction error:", llmError);
      return NextResponse.json({ error: "Échec de l'analyse IA de la transcription. Réessayez ou saisissez manuellement." }, { status: 502 });
    }

    const finalVariables = employees.map(emp => {
      const vars = extracted[emp.firstName] || { absencesDays: 0, overtimeHours: 0, bonuses: 0 };

      const payrollParams = {
        baseSalary: emp.baseSalary || 0,
        absencesDays: Number(vars.absencesDays) || 0,
        overtimeHours: Number(vars.overtimeHours) || 0,
        bonuses: Number(vars.bonuses) || 0,
        transportAllowance: emp.transportAllowance || 0,
        maritalStatus: emp.maritalStatus || "CELIBATAIRE",
        childrenCount: emp.childrenCount || 0,
        isCadre: emp.isCadre || false
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
      message: "Analyse vocale (IA) et calculs pays terminés — vérifiez les valeurs extraites avant validation."
    });

  } catch (error) {
    console.error("[Payroll Voice API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
