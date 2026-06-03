import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePayroll } from "@/lib/payroll/engines";

export async function POST(req: Request) {
  try {
    const { clientId, transcript } = await req.json();

    if (!clientId || !transcript) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Récupérer le client et ses employés
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

    // 2. Simuler l'analyse par le LLM (Extraction de variables)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // MOCK du résultat LLM basé sur des mots clés simples (pour la démo)
    const text = transcript.toLowerCase();
    
    const finalVariables = employees.map(emp => {
      let absencesDays = 0;
      let overtimeHours = 0;
      let bonuses = 0;

      const firstName = emp.firstName.toLowerCase();
      
      // Si le nom de l'employé est mentionné dans le texte
      if (text.includes(firstName)) {
        if (text.includes("absent") || text.includes("malade")) absencesDays = 2; // Mock
        if (text.includes("heures sup")) overtimeHours = 5; // Mock
        if (text.includes("prime")) bonuses = 50000; // Mock
      }

      // 3. Calcul de la paie via le Moteur Multi-Pays
      const payrollParams = {
        baseSalary: emp.baseSalary || 0, // Fallback on baseSalary or salary depending on Prisma map
        absencesDays,
        overtimeHours,
        bonuses,
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
        ...result // Contient netSalary, taxes, socialSecurity, etc.
      };
    });

    return NextResponse.json({ 
      success: true, 
      country: client.country,
      variables: finalVariables,
      message: "Analyse vocale et calculs pays terminés"
    });

  } catch (error) {
    console.error("[Payroll Voice API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
