/**
 * Vérifie que le token d'accès WhatsApp est valide, sans jamais l'afficher.
 *
 * Le token reste dans le fichier .env : le script l'utilise pour interroger
 * l'API Meta et ne restitue que le verdict. Aucun secret n'est imprimé.
 *
 *   npx tsx scripts/verifier-token-whatsapp.ts
 */
import { readFileSync } from "fs";
import { join } from "path";

/** Lecture minimale du .env : `dotenv` n'est pas une dependance du projet. */
function lireEnv(cle: string): string | undefined {
    if (process.env[cle]) return process.env[cle];
    try {
        const contenu = readFileSync(join(process.cwd(), ".env"), "utf8");
        for (const ligne of contenu.split(SEPARATEUR_LIGNES)) {
            const egal = ligne.indexOf("=");
            if (egal === -1 || ligne.trimStart().startsWith("#")) continue;
            if (ligne.slice(0, egal).trim() !== cle) continue;
            return ligne.slice(egal + 1).trim().replace(/^["']|["']$/g, "");
        }
    } catch {
        return undefined;
    }
    return undefined;
}

const SEPARATEUR_LIGNES = new RegExp("\r?\n");
const VERSION_API = "v21.0";

type ReponseMeta = {
    display_phone_number?: string;
    verified_name?: string;
    quality_rating?: string;
    error?: { message?: string; type?: string; code?: number; error_subcode?: number };
};

/**
 * Nature et durée de vie du token, par introspection.
 *
 * `expires_at: 0` signifie « n'expire jamais » : c'est ce que produit un token
 * d'utilisateur système. Un token temporaire porte une date d'expiration.
 */
async function decrireToken(token: string) {
    try {
        const url = `https://graph.facebook.com/${VERSION_API}/debug_token`
            + `?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`;
        const rep = await fetch(url);
        const json = (await rep.json()) as {
            data?: { type?: string; expires_at?: number; scopes?: string[] };
        };
        const d = json.data;
        if (!d) {
            console.log("");
            console.log("   (Nature du token : introspection non autorisée avec ce token.)");
            return;
        }

        console.log("");
        console.log("   Nature du token :");
        console.log(`     type        : ${d.type ?? "—"}`);
        if (d.expires_at === 0) {
            console.log("     expiration  : AUCUNE — token permanent, rien à renouveler.");
        } else if (typeof d.expires_at === "number") {
            const date = new Date(d.expires_at * 1000);
            const restant = Math.round((date.getTime() - Date.now()) / 3600000);
            console.log(`     expiration  : ${date.toISOString().replace("T", " ").substring(0, 16)} (dans ${restant} h)`);
        }
        if (d.scopes?.length) {
            console.log(`     permissions : ${d.scopes.join(", ")}`);
        }
    } catch {
        console.log("");
        console.log("   (Nature du token : introspection indisponible.)");
    }
}

async function main() {
    const token = lireEnv("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = lireEnv("WHATSAPP_PHONE_NUMBER_ID");

    if (!token) {
        console.error("✖ WHATSAPP_ACCESS_TOKEN absent du fichier .env.");
        process.exitCode = 1;
        return;
    }
    if (!phoneNumberId) {
        console.error("✖ WHATSAPP_PHONE_NUMBER_ID absent du fichier .env.");
        process.exitCode = 1;
        return;
    }

    console.log(`Token présent (${token.length} caractères), non affiché.`);
    console.log(`Numéro interrogé : Phone Number ID ${phoneNumberId}\n`);

    const url = `https://graph.facebook.com/${VERSION_API}/${phoneNumberId}`
        + `?fields=display_phone_number,verified_name,quality_rating`;

    let reponse: Response;
    try {
        reponse = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        console.error(`✖ Impossible de joindre l'API Meta : ${(e as Error).message}`);
        process.exitCode = 1;
        return;
    }

    const corps = (await reponse.json()) as ReponseMeta;

    if (reponse.ok && corps.display_phone_number) {
        console.log("✔ Token VALIDE.");
        console.log(`   Numéro          : ${corps.display_phone_number}`);
        console.log(`   Nom vérifié     : ${corps.verified_name ?? "—"}`);
        console.log(`   Qualité         : ${corps.quality_rating ?? "—"}`);
        console.log("");
        console.log("   Les confirmations « ✅ Écriture enregistrée » peuvent partir vers les clients.");
        await decrireToken(token);
        return;
    }

    console.error(`✖ Token REFUSÉ par Meta (HTTP ${reponse.status}).`);
    if (corps.error) {
        console.error(`   Message  : ${corps.error.message ?? "—"}`);
        console.error(`   Type     : ${corps.error.type ?? "—"}`);
        console.error(`   Code     : ${corps.error.code ?? "—"}${corps.error.error_subcode ? ` / ${corps.error.error_subcode}` : ""}`);
        console.error("");
        if (corps.error.code === 190) {
            console.error("   Code 190 = token expiré ou invalide. Les tokens de test Meta");
            console.error("   expirent au bout de 24 h ; générez un token d'utilisateur système.");
        } else if (corps.error.code === 200 || corps.error.code === 10) {
            console.error("   Autorisation manquante : le token doit porter");
            console.error("   whatsapp_business_messaging et whatsapp_business_management,");
            console.error("   et l'utilisateur système doit avoir le compte WhatsApp en actif.");
        }
    }
    process.exitCode = 1;
}

main().catch((e) => {
    console.error("Échec :", e);
    process.exitCode = 1;
});
