/** Serialize the structured output stored in Document.ocrData for virtual documents. */
export function lireContenuDocumentGenere(ocrData: unknown): Buffer | null {
    if (ocrData === null || ocrData === undefined) return null;

    if (typeof ocrData === "object" && !Array.isArray(ocrData)) {
        const record = ocrData as Record<string, unknown>;
        if (typeof record.contenu === "string") return Buffer.from(record.contenu, "utf8");
    }
    if (typeof ocrData === "string") return Buffer.from(ocrData, "utf8");

    try {
        return Buffer.from(JSON.stringify(ocrData, null, 2), "utf8");
    } catch {
        return null;
    }
}
