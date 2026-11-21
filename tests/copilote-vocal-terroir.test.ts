import { describe, it, expect } from "vitest";
import {
  interpreterNoteVocaleTerroir,
  type NoteVocaleBrute,
} from "../src/lib/ohada/copilote-vocal-terroir";

describe("Copilote Vocal Terroir — Inclusion Informel & SMT OHADA", () => {
  it("interprète un achat en Wolof avec mise à jour du livre de caisse", () => {
    const noteWolof: NoteVocaleBrute = {
      idNote: "VOC-01",
      commercantNom: "Modou Boutique Sandaga",
      telephone: "+221 77 111 22 33",
      dateReception: "2024-11-20 10:15",
      langueDetectee: "WOLOF",
      transcriptionPhonetique: "Dama jënd 5 sacu ceeb ci 35000 f cfa",
      dureeSecondes: 4,
    };

    const res = interpreterNoteVocaleTerroir(noteWolof, 100_000);
    expect(res.ecriture.nature).toBe("DEPENSE_ACHAT");
    expect(res.ecriture.categorieMarchandise).toBe("Riz");
    expect(res.ecriture.montant_XOF).toBe(35_000);
    expect(res.ecriture.compteDebit).toBe("601100");
    expect(res.ecriture.compteCredit).toBe("571100");
    expect(res.soldeCaisseEstimeApres_XOF).toBe(65_000); // 100k - 35k
    expect(res.ecriture.confirmationVocaleRetour).toContain("Jërëjëf");
  });

  it("interprète une vente en Dioula/Nouchi (Côte d'Ivoire)", () => {
    const noteDioula: NoteVocaleBrute = {
      idNote: "VOC-02",
      commercantNom: "Bakary Marché Adjamé",
      telephone: "+225 07 22 33 44",
      dateReception: "2024-11-20 11:30",
      langueDetectee: "DIOULA_NOUCHI",
      transcriptionPhonetique: "N'ye feere malo 50000 cfa",
      dureeSecondes: 3,
    };

    const res = interpreterNoteVocaleTerroir(noteDioula, 80_000);
    expect(res.ecriture.nature).toBe("RECETTE_VENTE");
    expect(res.ecriture.categorieMarchandise).toBe("Riz");
    expect(res.ecriture.montant_XOF).toBe(50_000);
    expect(res.ecriture.compteDebit).toBe("571100");
    expect(res.ecriture.compteCredit).toBe("701100");
    expect(res.soldeCaisseEstimeApres_XOF).toBe(130_000); // 80k + 50k
  });

  it("interprète un achat en Bambara (Mali/Burkina)", () => {
    const noteBambara: NoteVocaleBrute = {
      idNote: "VOC-03",
      commercantNom: "Ousmane Marché Dibida",
      telephone: "+223 66 12 34 56",
      dateReception: "2024-11-20 14:00",
      langueDetectee: "BAMBARA",
      transcriptionPhonetique: "I ni ce, n'ye sanni sogo 20000 cfa la",
      dureeSecondes: 5,
    };

    const res = interpreterNoteVocaleTerroir(noteBambara, 50_000);
    expect(res.ecriture.nature).toBe("DEPENSE_ACHAT");
    expect(res.ecriture.categorieMarchandise).toBe("Viande");
    expect(res.ecriture.montant_XOF).toBe(20_000);
    expect(res.soldeCaisseEstimeApres_XOF).toBe(30_000);
  });

  it("interprète une vente en Haoussa avec bénédiction de commerce locale", () => {
    const noteHaoussa: NoteVocaleBrute = {
      idNote: "VOC-04",
      commercantNom: "Ibrahim Grand Marché Niamey",
      telephone: "+227 90 12 34 56",
      dateReception: "2024-11-20 16:45",
      langueDetectee: "HAOUSSA",
      transcriptionPhonetique: "Mun yi ciniki, na sayar da shinkafa 45000",
      dureeSecondes: 4,
    };

    const res = interpreterNoteVocaleTerroir(noteHaoussa, 100_000);
    expect(res.ecriture.nature).toBe("RECETTE_VENTE");
    expect(res.ecriture.montant_XOF).toBe(45_000);
    expect(res.ecriture.confirmationVocaleRetour).toContain("Allah ya albarkaci ciniki");
  });
});
