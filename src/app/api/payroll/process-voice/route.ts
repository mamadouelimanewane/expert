import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { clientId, transcript } = await req.json();

    if (!clientId || !transcript) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Récupérer les employés du client pour le matching
    const employees = await prisma.employee.findMany({
      where: { clientId }
    });

    if (employees.length === 0) {
      return NextResponse.json({ error: "Aucun employé trouvé pour ce client" }, { status: 404 });
    }

    // 2. Simuler l'analyse par le LLM (Extraction de variables)
    // En production, on enverrait le transcript + la liste des noms des employés à DeepSeek/Mistral
    // avec un prompt pour retourner du JSON structuré.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // MOCK du résultat LLM basé sur des mots clés simples (pour la démo)
    const text = transcript.toLowerCase();
    const variablesExtraites = [];

    for (const emp of employees) {
      let absencesDays = 0;
      let overtimeHours = 0;
      let bonuses = 0;

      const firstName = emp.firstName.toLowerCase();
      
      // Si le nom de l'employé est mentionné dans le texte
      if (text.includes(firstName)) {
        // Extraction grossière de variables pour simuler l'IA
        if (text.includes("absent") || text.includes("malade")) absencesDays = 2; // Mock
        if (text.includes("heures sup")) overtimeHours = 5; // Mock
        if (text.includes("prime")) bonuses = 50000; // Mock

        if (absencesDays > 0 || overtimeHours > 0 || bonuses > 0) {
          variablesExtraites.push({
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            baseSalary: emp.baseSalary,
            absencesDays,
            overtimeHours,
            bonuses
          });
        }
      }
    }

    // Si aucune variable spécifique, on prépare quand même des variables par défaut 
    // (tout à 0) pour tous les employés afin de générer une paie normale.
    const finalVariables = employees.map(emp => {
      const extracted = variablesExtraites.find(v => v.employeeId === emp.id);
      return extracted || {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        baseSalary: emp.baseSalary,
        absencesDays: 0,
        overtimeHours: 0,
        bonuses: 0
      };
    });

    return NextResponse.json({ 
      success: true, 
      variables: finalVariables,
      message: "Analyse vocale terminée"
    });

  } catch (error) {
    console.error("[Payroll Voice API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
