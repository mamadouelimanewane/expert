import { redirect } from "next/navigation";

// Doublon orphelin d'un module réel lié au menu — voir /library.
export default function OhadaLibraryRedirect() {
    redirect("/library");
}
