import { calculateCEFRLevelFromSelectedWords } from "../cefrScoreService";
import { EnglishLevel } from "@prisma/client";

type Word = { headword: string; CEFR: EnglishLevel };

describe("calculateCEFRLevelFromSelectedWords", () => {
    it("returns A1 when all words are A1", () => {
        const words: Word[] = [
            { headword: "cat", CEFR: "A1" },
            { headword: "dog", CEFR: "A1" },
            { headword: "car", CEFR: "A1" },
        ];
        expect(calculateCEFRLevelFromSelectedWords(words)).toBe("A1");
    });

    it("returns B1 when average falls in B1 range", () => {
        const words: Word[] = [
            { headword: "holiday", CEFR: "B1" },
            { headword: "museum", CEFR: "B1" },
            { headword: "traffic", CEFR: "B1" },
        ];
        expect(calculateCEFRLevelFromSelectedWords(words)).toBe("B1");
    });

    it("returns higher levels when harder words are selected", () => {
        const words: Word[] = [
            { headword: "nevertheless", CEFR: "C1" },
            { headword: "sustainable", CEFR: "B2" },
            { headword: "innovation", CEFR: "C1" },
        ];
        const level = calculateCEFRLevelFromSelectedWords(words);

        expect(["C1", "C2"]).toContain(level);
    });
});