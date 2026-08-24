import { redirect } from "next/navigation";

// Doublon orphelin — voir /valorisation/transmission (réel).
export default function ValorisationRedirect() {
    redirect("/valorisation/transmission");
}
