import { redirect } from "next/navigation";

// Doublon orphelin — voir /legal/drafting (rédaction assistée réelle).
export default function NexusLegalRedirect() {
    redirect("/legal/drafting");
}
