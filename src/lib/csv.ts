/** Parse les fichiers CSV séparés par des points-virgules ou des virgules. */
export function parseCsv(text: string): string[][] {
    const source = text.replace(/^\uFEFF/, "");
    const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
    const semicolons = (firstLine.match(/;/g) ?? []).length;
    const commas = (firstLine.match(/,/g) ?? []).length;
    const delimiter = semicolons >= commas ? ";" : ",";
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let quoted = false;

    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];
        if (quoted) {
            if (char === '"' && source[index + 1] === '"') {
                field += '"';
                index += 1;
            } else if (char === '"') {
                quoted = false;
            } else {
                field += char;
            }
        } else if (char === '"' && field.length === 0) {
            quoted = true;
        } else if (char === delimiter) {
            row.push(field);
            field = "";
        } else if (char === "\n" || char === "\r") {
            if (char === "\r" && source[index + 1] === "\n") index += 1;
            row.push(field);
            field = "";
            if (row.some((value) => value.trim())) rows.push(row);
            row = [];
        } else {
            field += char;
        }
    }

    if (quoted) throw new Error("Fichier CSV invalide : un champ entre guillemets n’est pas fermé.");
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
    return rows;
}

export function normaliserEnteteCsv(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
