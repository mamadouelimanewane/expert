import { redirect } from "next/navigation";

// Doublon orphelin d'un module réel lié au menu — voir /supervision/timeline.
export default function SupervisionRedirect() {
    redirect("/supervision/timeline");
}
