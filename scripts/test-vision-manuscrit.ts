/**
 * Test réel de la lecture par IA des documents manuscrits.
 *
 *   npx tsx scripts/test-vision-manuscrit.ts            # les 3 documents
 *   npx tsx scripts/test-vision-manuscrit.ts cahier     # un seul : cahier | balance | facture
 *
 * Génère des images imitant l'écriture manuscrite (police cursive, lignes
 * désalignées, une ligne raturée), les soumet à src/lib/ocr-vision.ts et
 * compare la transcription aux valeurs attendues. Nécessite
 * ANTHROPIC_API_KEY dans .env et des crédits sur le compte Anthropic.
 * Coût : ≈ 0,03 $ par document.
 */
import "dotenv/config";
import { createCanvas } from "@napi-rs/canvas";
import { lireDocumentParVision, lireFactureParVision, normaliserLecture, ocrDataDepuisFacture, visionConfiguree } from "../src/lib/ocr-vision";

const POLICE = 'bold 26px "Segoe Script", "Comic Sans MS", "Bradley Hand", cursive';
const alea = (amp: number) => (Math.random() - 0.5) * amp;

function papier(w: number, h: number) {
    const cv = createCanvas(w, h);
    const g = cv.getContext("2d");
    g.fillStyle = "#f7f3e8"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#cfd8e6"; g.lineWidth = 1;
    for (let y = 80; y < h; y += 44) { g.beginPath(); g.moveTo(40, y); g.lineTo(w - 40, y); g.stroke(); }
    g.fillStyle = "#1a2a6c";
    return { cv, g };
}
function ecrire(g: ReturnType<ReturnType<typeof createCanvas>["getContext"]>, texte: string, x: number, y: number, taille = 24, gras = false) {
    g.save(); g.translate(alea(4), alea(6)); g.rotate(alea(0.012));
    g.font = `${gras ? "bold " : ""}${taille}px "Segoe Script", "Comic Sans MS", "Bradley Hand", cursive`;
    g.fillText(texte, x, y); g.restore();
}

const CAHIER = [
    ["02/09", "Vente pagnes wax (3 pièces)", 45000, 0], ["02/09", "Transport marchandises Sandaga", 0, 7500],
    ["03/09", "Vente tissus bazin Mme Diop", 120000, 0], ["04/09", "Achat fil et boutons", 0, 12500],
    ["05/09", "Loyer boutique", 0, 50000], ["06/09", "Vente foulards", 18000, 0],
    ["08/09", "Paiement Wave - client Ndiaye", 65000, 0], ["09/09", "Electricité Senelec", 0, 23400], ["10/09", "Vente rideaux", 32000, 0],
] as const;
const BALANCE = [
    ["101000", "Capital social", 0, 5000000], ["241000", "Matériel", 3500000, 0], ["411100", "Clients", 2100000, 0],
    ["401100", "Fournisseurs", 0, 1800000], ["521000", "Banque CBAO", 4200000, 0], ["571000", "Caisse", 300000, 0],
    ["601000", "Achats marchandises", 9800000, 0], ["661000", "Salaires", 3600000, 0], ["701000", "Ventes", 0, 16100000],
] as const;

function imageCahier() {
    const { cv, g } = papier(1200, 900);
    ecrire(g, "Cahier de caisse - Boutique Awa - Septembre 2026", 60, 60, 32, true);
    ecrire(g, "Date", 60, 110, 22, true); ecrire(g, "Libellé", 200, 110, 22, true); ecrire(g, "Entrée", 760, 110, 22, true); ecrire(g, "Sortie", 980, 110, 22, true);
    let y = 155;
    CAHIER.forEach((r, i) => {
        ecrire(g, r[0], 60, y); ecrire(g, r[1], 200, y);
        if (r[2]) ecrire(g, r[2].toLocaleString("fr-FR"), 760, y);
        if (r[3]) ecrire(g, r[3].toLocaleString("fr-FR"), 980, y);
        if (i === 3) { g.strokeStyle = "#1a2a6c"; g.lineWidth = 3; g.beginPath(); g.moveTo(195, y - 8); g.lineTo(1140, y - 12); g.stroke(); } // ligne raturée
        y += 44;
    });
    ecrire(g, "Total", 200, y + 30, 26, true); ecrire(g, "280 000", 760, y + 30, 26, true); ecrire(g, "93 400", 980, y + 30, 26, true);
    return cv.toBuffer("image/jpeg", 90);
}
function imageBalance() {
    const { cv, g } = papier(1200, 700);
    ecrire(g, "Balance au 31/12/2025 - Teranga Tech", 60, 60, 32, true);
    ecrire(g, "Compte", 60, 110, 22, true); ecrire(g, "Intitulé", 240, 110, 22, true); ecrire(g, "Débit", 720, 110, 22, true); ecrire(g, "Crédit", 960, 110, 22, true);
    let y = 155;
    for (const r of BALANCE) { ecrire(g, r[0], 60, y); ecrire(g, r[1], 240, y); ecrire(g, r[2] ? r[2].toLocaleString("fr-FR") : "-", 720, y); ecrire(g, r[3] ? r[3].toLocaleString("fr-FR") : "-", 960, y); y += 44; }
    ecrire(g, "TOTAL", 240, y + 30, 26, true); ecrire(g, "23 500 000", 720, y + 30, 26, true); ecrire(g, "22 900 000", 960, y + 30, 26, true);
    return cv.toBuffer("image/jpeg", 90);
}
function imageFacture() {
    const { cv, g } = papier(1000, 900);
    ecrire(g, "Quincaillerie Diop & Fils - Dakar Pikine", 60, 60, 30, true);
    ecrire(g, "Reçu N° 0417", 60, 120, 26); ecrire(g, "Date : 05/09/2026", 600, 120, 26);
    ecrire(g, "Client : Sahel Construction", 60, 170, 24);
    const lignes = [["Ciment 3 sacs", "3 x 12 500", "37 500"], ["Clous 5 kg", "1 x 10 000", "10 000"], ["Fer à béton", "2 x 15 000", "30 000"]];
    let y = 250;
    for (const l of lignes) { ecrire(g, l[0], 60, y); ecrire(g, l[1], 480, y); ecrire(g, l[2], 780, y); y += 50; }
    ecrire(g, "Total à payer : 77 500 FCFA", 60, y + 60, 30, true);
    ecrire(g, "Payé en espèces - merci", 60, y + 120, 24);
    return cv.toBuffer("image/jpeg", 90);
}

async function testCahier() {
    console.log("\n── Cahier de caisse manuscrit ──");
    const r = await lireDocumentParVision(imageCahier(), "image/jpeg", "cahier-caisse-awa.jpg");
    if (!r.ok) { console.log("ÉCHEC :", r.message); return false; }
    const n = normaliserLecture(r.lecture);
    console.log(`document=${r.lecture.document} · ${n.journal.length} opérations · coût ≈ ${r.usage.coutEstimeUSD} $`);
    let ok = 0;
    for (const attendu of CAHIER) {
        const lu = n.journal.find((l) => l.libelle.toLowerCase().includes(attendu[1].toLowerCase().slice(0, 12)));
        const bon = lu && lu.entree === attendu[2] && lu.sortie === attendu[3];
        if (bon) ok++;
        console.log(`${bon ? "✓" : "✗"} ${attendu[1].padEnd(34)} attendu E${attendu[2]} S${attendu[3]} → ${lu ? `E${lu.entree} S${lu.sortie} (${lu.confiance}${lu.illisible ? ", illisible" : ""})` : "non trouvé"}`);
    }
    if (r.lecture.remarques.length) console.log("remarques :", r.lecture.remarques.join(" | "));
    console.log(`Résultat : ${ok}/${CAHIER.length} (la ligne raturée peut légitimement être signalée illisible)`);
    return ok >= CAHIER.length - 1;
}
async function testBalance() {
    console.log("\n── Balance manuscrite ──");
    const r = await lireDocumentParVision(imageBalance(), "image/jpeg", "balance-manuscrite.jpg");
    if (!r.ok) { console.log("ÉCHEC :", r.message); return false; }
    const n = normaliserLecture(r.lecture);
    console.log(`document=${r.lecture.document} · ${n.lignes.length} comptes · totaux écrits ${n.controleTotaux} · coût ≈ ${r.usage.coutEstimeUSD} $`);
    let ok = 0;
    for (const attendu of BALANCE) {
        const lu = n.lignes.find((l) => l.numero === attendu[0]);
        const bon = lu && lu.debit === attendu[2] && lu.credit === attendu[3];
        if (bon) ok++;
        console.log(`${bon ? "✓" : "✗"} ${attendu[0]} ${attendu[1].padEnd(22)} attendu D${attendu[2]} C${attendu[3]} → ${lu ? `D${lu.debit} C${lu.credit} (${lu.confiance})` : "non trouvé"}`);
    }
    console.log(`Résultat : ${ok}/${BALANCE.length}`);
    return ok === BALANCE.length;
}
async function testFacture() {
    console.log("\n── Reçu manuscrit ──");
    const r = await lireFactureParVision(imageFacture(), "image/jpeg", "recu-quincaillerie.jpg");
    if (!r.ok) { console.log("ÉCHEC :", r.message); return false; }
    const o = ocrDataDepuisFacture(r.lecture, "achat");
    const d = o.invoiceData;
    console.log(`document=${r.lecture.document} manuscrite=${r.lecture.manuscrite} · coût ≈ ${r.usage.coutEstimeUSD} $`);
    const checks: [string, unknown, unknown][] = [["fournisseur", d.supplier, "Quincaillerie Diop & Fils"], ["numéro", d.invoiceNumber, "0417"], ["date", d.date, "05/09/2026"], ["TTC", d.totalTTC, 77500], ["TVA (non écrite → absente)", d.tva, undefined], ["lignes", d.items?.length, 3]];
    let ok = 0;
    for (const [nom, lu, attendu] of checks) {
        const bon = typeof attendu === "string" ? String(lu ?? "").toLowerCase().includes(attendu.toLowerCase().slice(0, 12)) : lu === attendu;
        if (bon) ok++;
        console.log(`${bon ? "✓" : "✗"} ${nom.padEnd(28)} attendu ${String(attendu)} → ${String(lu)}`);
    }
    console.log("confiance :", JSON.stringify(r.lecture.confiance), r.lecture.remarques.length ? "· remarques : " + r.lecture.remarques.join(" | ") : "");
    console.log(`Résultat : ${ok}/${checks.length}`);
    return ok >= checks.length - 1;
}

(async () => {
    if (!visionConfiguree()) { console.error("ANTHROPIC_API_KEY absente de .env"); process.exit(1); }
    const cible = process.argv[2];
    const resultats: boolean[] = [];
    if (!cible || cible === "cahier") resultats.push(await testCahier());
    if (!cible || cible === "balance") resultats.push(await testBalance());
    if (!cible || cible === "facture") resultats.push(await testFacture());
    console.log(`\n${resultats.every(Boolean) ? "TOUS LES TESTS PASSENT" : "DES TESTS ÉCHOUENT"} (${resultats.filter(Boolean).length}/${resultats.length})`);
    process.exit(resultats.every(Boolean) ? 0 : 1);
})();
