import { redirect } from "next/navigation";

// Doublon orphelin — voir /strategy/simulator (réel).
export default function SimulatorRedirect() {
    redirect("/strategy/simulator");
}
