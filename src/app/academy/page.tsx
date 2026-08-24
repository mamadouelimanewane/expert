import { redirect } from "next/navigation";

// Doublon orphelin d'un module réel — voir /training/academy.
export default function AcademyRedirect() {
    redirect("/training/academy");
}
