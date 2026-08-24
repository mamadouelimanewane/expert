import { redirect } from "next/navigation";

// Doublon orphelin d'un module réel lié au menu — voir /banking.
export default function BankReconciliationRedirect() {
    redirect("/banking");
}
