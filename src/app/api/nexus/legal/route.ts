import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { analyserContratOHADA, genererConsultationFiscaleSync } from "@/lib/ohada/nexus-legal-core";
import { isLLMConfigured, askNexus, MESSAGE_LLM_NON_CONFIGURE } from "@/lib/llm";
import { AuditService } from "@/lib/audit";
import type { PaysFiscal } from "@/lib/tax-simulator";

const DISCLAIMER = "\n\n---\n⚠️ *Cette réponse est fournie à titre informatif et ne constitue pas un avis juridique ou fiscal opposable. Elle ne remplace pas la consultation d'un professionnel qualifié (avocat, expert-comptable, conseiller fiscal).*";

const SYSTEM_PROMPT_LEGAL = `Tu es Nexus Legal & Tax Co-Counsel, un assistant juridique et fiscal OHADA de haut niveau.
Tu maîtrises :
- Les 17 Actes Uniformes OHADA (AUSCGIE, AUPSRVE, AUS, AUC, AUDA-EF…)
- Les CGI de chaque État UEMOA (Sénégal, Côte d'Ivoire, Cameroun, Bénin…)
- La directive TVA UEMOA n°01/2008, les conventions fiscales bilatérales
- La jurisprudence CCJA et les cours d'appel nationales

Règles absolues :
1. Cite TOUJOURS l'article exact (ex: "AUSCGIE art. 54 al. 2")
2. Distingue ce qui est certain de ce qui est interprétatif
3. Termine TOUJOURS par : "⚠️ Avis informatif non opposable – consulter un professionnel"
4. Ne jamais inventer un article ou une décision de jurisprudence
5. Si tu n'es pas certain, dis-le explicitement`;

export async function POST(req: NextRequest) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      mode: "ANALYSE_CONTRAT" | "CONSULTATION" | "RECHERCHE";
      message?: string;
      payload?: { texteContrat?: string; pays?: PaysFiscal; sujet?: string; contexte?: string };
    };

    const mode = body.mode || "CONSULTATION";
    const pays = body.payload?.pays ?? "SN";

    await AuditService.log(session.id, `NEXUS_LEGAL_${mode}`, "nexus-legal", { mode, pays });

    // Mode 1: ANALYSE_CONTRAT (déterministe, fonctionne toujours)
    if (mode === "ANALYSE_CONTRAT") {
      const texte = body.payload?.texteContrat ?? body.message ?? "";
      if (!texte.trim()) {
        return NextResponse.json({ error: "Texte du contrat requis" }, { status: 400 });
      }
      const resultat = analyserContratOHADA(texte, pays);
      return NextResponse.json({ ok: true, mode: "ANALYSE_CONTRAT", resultat });
    }

    // Mode 2: Sans LLM configuré -> fallback déterministe
    if (!isLLMConfigured()) {
      if (mode === "CONSULTATION") {
        const consultation = genererConsultationFiscaleSync(
          body.payload?.sujet ?? body.message ?? "Consultation fiscale",
          body.payload?.contexte ?? "",
          pays
        );
        return NextResponse.json({
          ok: true,
          mode: "CONSULTATION_SYNC",
          reponse: consultation.reponse + DISCLAIMER,
          consultation,
          notConfigured: true,
        });
      }
      return NextResponse.json({
        ok: false,
        error: `${MESSAGE_LLM_NON_CONFIGURE} Utilisez l'onglet Analyse de contrat ou consultez la documentation.`,
        mode,
        notConfigured: true,
      }, { status: 200 });
    }

    // Mode 3: Avec LLM configuré
    const question = body.message ?? body.payload?.sujet ?? "Consultation";
    const contexteComplet = body.payload?.contexte ? `\nContexte : ${body.payload.contexte}` : "";
    const prompt = `[Mode: ${mode}] [Pays: ${pays}]\n${question}${contexteComplet}`;

    const reponse = await askNexus(prompt, SYSTEM_PROMPT_LEGAL);
    return NextResponse.json({ ok: true, mode, reponse: reponse + DISCLAIMER });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
