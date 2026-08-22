import { FlaskConical } from "lucide-react";

/**
 * Bandeau signalant qu'un écran affiche des données d'illustration figées dans
 * le code, et non les données du cabinet.
 *
 * Ces écrans existent pour présenter une maquette fonctionnelle ; le risque
 * n'est pas qu'ils existent, mais qu'un collaborateur prenne un chiffre affiché
 * pour une donnée réelle et le reporte dans un dossier. Le bandeau lève
 * l'ambiguïté sans rien masquer.
 */
export default function DonneesDemo({
    module,
    precision,
}: {
    /** Nom du module concerné, pour situer la portée. */
    module?: string;
    /** Détail éventuel : ce qui est réel, ce qui ne l'est pas. */
    precision?: string;
}) {
    return (
        <div
            role="note"
            className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/30"
        >
            <FlaskConical
                size={16}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
            />
            <p className="text-amber-900 dark:text-amber-200">
                <strong className="font-semibold">Données d&apos;illustration.</strong>{" "}
                {module ? `Le module « ${module} » n'est pas encore relié à la base : les` : "Les"}{" "}
                chiffres affichés ici sont figés dans le code et ne proviennent pas de votre
                cabinet. Ne les reportez pas dans un dossier client.
                {precision ? ` ${precision}` : ""}
            </p>
        </div>
    );
}
