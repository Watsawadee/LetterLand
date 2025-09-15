import { EnglishLevel } from "@prisma/client";

const levelPoints: Record<EnglishLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

function getCEFRLevelFromScore(avg: number): EnglishLevel {
  if (avg <= 1.5) return "A1";
  if (avg <= 2.5) return "A2";
  if (avg <= 3.5) return "B1";
  if (avg <= 4.5) return "B2";
  if (avg <= 5.5) return "C1";
  else {
    return "C2";
  }
}

export function calculateCEFRLevelFromSelectedWords(
  words: { headword: string; CEFR: EnglishLevel }[]
): EnglishLevel {
  const totalPoints = words.reduce((sum, word) => {
    return sum + (levelPoints[word.CEFR] || 0);
  }, 0);

  const avg = totalPoints / words.length;
  return getCEFRLevelFromScore(avg);
}
