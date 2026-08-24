import { redirect } from "next/navigation";

// Doublon orphelin d'un module réel — voir /audit/fraud-detection.
export default function AuditForensiqueRedirect() {
    redirect("/audit/fraud-detection");
}
