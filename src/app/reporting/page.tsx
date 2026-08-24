import { redirect } from "next/navigation";

// Doublon orphelin — voir /reporting/pdf-generator (générateurs réels).
export default function ReportingRedirect() {
    redirect("/reporting/pdf-generator");
}
