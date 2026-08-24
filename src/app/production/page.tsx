import { redirect } from "next/navigation";

// Doublon orphelin d'un module réel lié au menu — voir /comptabilite/production.
export default function ProductionRedirect() {
    redirect("/comptabilite/production");
}
