import { redirect } from "next/navigation";

// Doublon orphelin d'un module réel lié au menu — voir /compliance/kyc-screening.
export default function KycRedirect() {
    redirect("/compliance/kyc-screening");
}
