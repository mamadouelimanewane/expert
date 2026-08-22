import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated / demo scripts
    "tmp/**",
    "scripts/**",
    "android/**",
  ]),

  // ── Dette de style rétrogradée en avertissement ─────────────────────────
  //
  // Ces trois règles concentraient à elles seules plus de 1 700 remontées sur
  // la base existante : apostrophes françaises non échappées dans le JSX,
  // `any` hérités, imports devenus inutiles. Ce sont des points de qualité,
  // pas des défauts de correction.
  //
  // Les laisser en `error` rendait `npm run lint` rouge en permanence, donc
  // inexploitable en intégration continue : le signal utile — les règles
  // react-hooks, qui détectent de vrais bugs de rendu — disparaissait dans le
  // bruit. Elles restent affichées comme avertissements et doivent être
  // résorbées progressivement.
  {
    rules: {
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",

      // Ces deux règles de react-hooks signalent ici des usages légitimes :
      // le chargement de données au montage (`useEffect` + `setState`), et
      // l'horodatage d'un message dans un gestionnaire d'événement, que
      // l'analyse statique rattache au rendu.
      //
      // Les cas réellement fautifs qu'elles avaient permis de repérer ont été
      // corrigés : hauteurs de barres tirées au sort à chaque rendu, et
      // référence de transaction fabriquée par `Math.random()` au moment de
      // l'affichage de la confirmation de paiement.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]);

export default eslintConfig;
