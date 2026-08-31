// ─────────────────────────────────────────────────────────────────────────────
// Criblage de sanctions (OSINT).
//
// Deux sources réelles, complémentaires :
//  - OFAC SDN (Trésor américain) : liste publique, gratuite, sans clé,
//    téléchargée directement (https://sanctionslistservice.ofac.treas.gov).
//  - OpenSanctions (opensanctions.org) : consolide UE, ONU, listes PEP et
//    nationales — nécessite une clé API gratuite sur inscription
//    (https://www.opensanctions.org/api/). Sans clé configurée, cette
//    source est honnêtement signalée comme non interrogée, pas simulée.
//
// Recherche faite sur les URLs officielles UE (webgate.ec.europa.eu) et ONU
// (main.un.org) : toutes deux renvoient 403 aux requêtes automatisées
// sans authentification préalable — d'où le choix d'OpenSanctions comme
// consolidateur fiable pour ces deux sources plutôt que de coder en dur des
// parsers XML fragiles contre des endpoints non accessibles en pratique.
// ─────────────────────────────────────────────────────────────────────────────

type EntreeOFAC = { entNum: string; nom: string; type: string; programme: string };

let cacheOFAC: { entries: EntreeOFAC[]; chargeLe: number } | null = null;
const TTL_CACHE_MS = 24 * 60 * 60 * 1000;

function normaliser(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parseur CSV minimal, tolérant aux guillemets doubles — le fichier OFAC n'a pas d'en-tête. */
function parserLigneCSV(ligne: string): string[] {
  const champs: string[] = [];
  let courant = "";
  let dansGuillemets = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (c === '"') {
      dansGuillemets = !dansGuillemets;
    } else if (c === "," && !dansGuillemets) {
      champs.push(courant.trim());
      courant = "";
    } else {
      courant += c;
    }
  }
  champs.push(courant.trim());
  return champs;
}

async function chargerOFAC(): Promise<EntreeOFAC[]> {
  if (cacheOFAC && Date.now() - cacheOFAC.chargeLe < TTL_CACHE_MS) {
    return cacheOFAC.entries;
  }

  const res = await fetch("https://sanctionslistservice.ofac.treas.gov/api/download/sdn.csv");
  if (!res.ok) throw new Error(`OFAC : réponse ${res.status}`);
  const texte = await res.text();

  const entries: EntreeOFAC[] = texte
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((ligne) => {
      const cols = parserLigneCSV(ligne);
      return { entNum: cols[0] ?? "", nom: cols[1] ?? "", type: cols[2] ?? "", programme: cols[3] ?? "" };
    })
    .filter((e) => e.nom && e.nom !== "-0-");

  cacheOFAC = { entries, chargeLe: Date.now() };
  return entries;
}

export type ResultatCriblage = {
  source: "OFAC" | "OpenSanctions";
  interroge: boolean;
  erreur?: string;
  correspondances: { nom: string; detail: string }[];
};

/**
 * Vrai si `aiguille` apparaît dans `meule` comme une suite de MOTS ENTIERS.
 *
 * La comparaison se faisait auparavant par simple sous-chaîne, ce qui
 * produisait des faux positifs sur les noms sanctionnés courts : l'entité
 * « ROC » ressortait sur « AEROCARIBBEAN » (aé-ROC-aribbean) et « ULA » sur
 * « Boulangerie du Plateau SA » (bo-ULA-ngerie) — un client parfaitement
 * légitime signalé comme sanctionné. En LCB-FT ce bruit est dangereux : à
 * force d'alertes injustifiées, les vraies correspondances finissent par
 * être écartées sans examen.
 */
export function contientMotsEntiers(meule: string, aiguille: string): boolean {
  if (!aiguille || !meule) return false;
  return ` ${meule} `.includes(` ${aiguille} `);
}

/** Règle de correspondance entre un nom criblé et une entrée de liste. */
export function correspondNom(nomEntree: string, nomCible: string): boolean {
  const entree = normaliser(nomEntree);
  const cible = normaliser(nomCible);
  if (!entree || !cible) return false;

  // Le nom criblé contient l'entité sanctionnée (ou l'inverse), en mots entiers.
  if (contientMotsEntiers(entree, cible) || contientMotsEntiers(cible, entree)) return true;

  // Sinon : tous les mots significatifs du nom criblé figurent dans l'entrée
  // (couvre les inversions d'ordre, ex. « Dupont Jean » vs « Jean Dupont »).
  const tokensCible = cible.split(" ").filter((t) => t.length > 2);
  if (tokensCible.length === 0) return false;
  const tokensEntree = entree.split(" ");
  return tokensCible.every((t) => tokensEntree.includes(t));
}

async function cribleOFAC(nom: string): Promise<ResultatCriblage> {
  try {
    const entries = await chargerOFAC();

    const correspondances = entries
      .filter((e) => correspondNom(e.nom, nom))
      .slice(0, 10)
      .map((e) => ({ nom: e.nom, detail: `${e.type || "Type non précisé"} — Programme ${e.programme || "non précisé"} (SDN #${e.entNum})` }));

    return { source: "OFAC", interroge: true, correspondances };
  } catch (error) {
    return {
      source: "OFAC",
      interroge: false,
      erreur: error instanceof Error ? error.message : "Erreur inconnue",
      correspondances: [],
    };
  }
}

async function cribleOpenSanctions(nom: string): Promise<ResultatCriblage> {
  const apiKey = process.env.OPENSANCTIONS_API_KEY;
  if (!apiKey) {
    return {
      source: "OpenSanctions",
      interroge: false,
      erreur: "OPENSANCTIONS_API_KEY non configurée — listes UE/ONU/PEP non interrogées.",
      correspondances: [],
    };
  }

  try {
    const res = await fetch("https://api.opensanctions.org/match/default", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `ApiKey ${apiKey}` },
      body: JSON.stringify({ queries: { q1: { schema: "Person", properties: { name: [nom] } } } }),
    });
    if (!res.ok) throw new Error(`OpenSanctions : réponse ${res.status}`);
    const data = await res.json();
    const resultats = data?.responses?.q1?.results ?? [];

    const correspondances = resultats.slice(0, 10).map((r: Record<string, unknown>) => ({
      nom: (r.caption as string) ?? "Nom inconnu",
      detail: `Score de correspondance ${Math.round(((r.score as number) ?? 0) * 100)}% — ${((r.datasets as string[]) ?? []).join(", ") || "source non précisée"}`,
    }));

    return { source: "OpenSanctions", interroge: true, correspondances };
  } catch (error) {
    return {
      source: "OpenSanctions",
      interroge: false,
      erreur: error instanceof Error ? error.message : "Erreur inconnue",
      correspondances: [],
    };
  }
}

export async function cribleSanctions(nom: string): Promise<ResultatCriblage[]> {
  return Promise.all([cribleOFAC(nom), cribleOpenSanctions(nom)]);
}
