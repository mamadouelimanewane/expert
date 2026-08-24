import { redirect } from "next/navigation";

// Doublon orphelin — voir /analysis/credit-insights (réel).
export default function CreditInsightsRedirect() {
    redirect("/analysis/credit-insights");
}
