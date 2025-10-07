import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;


export const getSynonyms = async (word: string): Promise<string[]> => {
  try {
    const res = await axios.get("https://api.datamuse.com/words", {
      params: { rel_syn: word },
    });
    const topSynonym = res.data
      .slice(0, 5)
      .map((entry: { word: string }) => entry.word);
    return topSynonym.length ? topSynonym : [word];
  } catch (error) {
    console.error(`Cannot fetching synonyms for ${word}`, error);
    return [word];
  }
};

export const generateCrosswordHints = async (
  extractedText: string,
  userId: number,
  userCEFR: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
) => {
  try {
    console.log("Gemini URL:", GEMINI_API_URL);
    console.log(
      "Gemini key loaded:",
      process.env.GEMINI_API_KEY ? "yes" : "NO!"
    );
    let prompt = `Generate a crossword puzzle based on this extracted text: "${extractedText}".  
Your task:
- Choose clue–answer pairs suitable for CEFR level: ${userCEFR} (A1 to C2).
- Use **real-world, general English vocabulary**, not academic, technical, or scientific terms — even at C2.
- Avoid taxonomy, scientific classifications, Latin-based biology terms (e.g., "homoiothermic", "limnetic", "cnidarian", etc.).
- Use words commonly found in general articles, spoken language, and popular media.
- Do **not** include words that would confuse an advanced English learner unfamiliar with biology or science.
- Clues should be clear and accessible for the target CEFR level.
- The answer for each clue must not exceed the following character limits:
  - A1, A2: 8 characters
  - B1, B2: 10 characters
  - C1, C2: 12 characters
- If a suitable answer cannot be found within the limit, use a shorter synonym or a simpler word.
Also include an **imagePrompt** — a creative description for generating an image that represents the crossword’s topic. It should work for AI image generation tools.
- Do not repeat the same word (case-sensitive) for more than one clue.
- Every answer in the "questions" array must be unique (case-insensitive). Do NOT repeat the same answer for different clues, even if the casing is different (e.g., "EARTH" and "earth" are considered the same).
- If any answer is repeated (case-insensitive), the game will fail and your response will be rejected.

Respond only with the following strict JSON format:
\`\`\`json
{
  "success": true,
  "game": {
    "gameTopic": "Space",
    "questions": [
      {
        "question": "The planet we live on.",
        "answer": "EARTH",
        "hint": "Our home planet"
      },
      {
        "question": "The bright object that provides light during the night.",
        "answer": "MOON",
        "hint": "Earth's satellite"
      }
    ],
    "userId": ${userId}
  },
  "imagePrompt": "A detailed digital illustration of outer space featuring Earth and Moon."
}
\`\`\`
`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    if (!response.data?.candidates?.length) {
      throw new Error("No valid response from Gemini API.");
    }

    // ---- Parse + normalize AI response ----
    let geminiResponse = response.data.candidates[0].content.parts?.[0]?.text ?? "";
    geminiResponse = looseJsonFix(stripCodeFences(geminiResponse));
    let gameData = JSON.parse(geminiResponse);

    // Normalize "topic" → "gameTopic"
    if (gameData.game?.topic && !gameData.game.gameTopic) {
      gameData.game.gameTopic = gameData.game.topic;
      delete gameData.game.topic;
    }

    // Ensure questions are in {question, answer, hint} format
    gameData.game.questions = (gameData.game.questions ?? []).map((q: any) => ({
      question: q.question,
      answer: q.answer,
      hint: q.hint ?? "",
    }));

    console.log("Transformed Game Format:", gameData);

    // Extract answers for synonym/CEFR ranking
    const words: string[] = gameData.game.questions.map((q: any) => q.answer);
    console.log("Extracted Words:", words);

    // Build synonyms map using Datamuse
    const synonymMap: { [key: string]: string[] } = {};
    for (const word of words) {
      let synonyms = await getSynonyms((word ?? "").toLowerCase());
      // Remove spaces for grid-friendliness
      synonyms = synonyms.map((s) => s.replace(/\s+/g, ""));
      synonymMap[word] = synonyms;
    }
    console.log("🔹 Retrieved Synonyms:", synonymMap);

    // Ask Gemini to rank/choose synonyms across CEFR levels
    const rankedWords = await rankWordsByCEFR(synonymMap, userCEFR as string);
    console.log(
      "CEFR-Filtered Words from Gemini API:",
      JSON.stringify(rankedWords, null, 2)
    );

    // ---- Strict answer length limits by CEFR ----
    const gridLengths: Record<string, number> = {
      A1: 8,
      A2: 8,
      B1: 10,
      B2: 10,
      C1: 12,
      C2: 12,
    };
    const maxLen = gridLengths[userCEFR];

    // Apply CEFR choice → sanitize → strict length filter (drop if invalid/too long)
    const processed = (gameData.game.questions as Array<any>)
      .map((q) => {
        const original = q.answer ?? "";
        // Prefer ranked CEFR word; fallback to original
        const picked = rankedWords?.[original]?.[userCEFR] ?? original;
        const sanitized = sanitizeAnswer(picked);

        // STRICT RULE: drop clue if empty or exceeds maxLen
        if (!sanitized || sanitized.length > maxLen) {
          console.log(
            `Dropping clue — length limit: "${original}" → "${picked}" → "${sanitized}" (max ${maxLen})`
          );
          return null;
        }

        return { ...q, answer: sanitized };
      })
      .filter(Boolean) as Array<any>;

    // Remove duplicates AFTER strict length filtering (case-insensitive on sanitized answers)
    const deduped = dedupeQuestions(processed);

    // Optional: enforce minimum question count to accept a puzzle
    // const MIN_QUESTIONS = 6;
    // if (deduped.length < MIN_QUESTIONS) {
    //   throw new Error(`Not enough unique, within-limit answers (need ${MIN_QUESTIONS}).`);
    // }

    const finalPayload = {
      success: true,
      game: {
        id: gameData.game.id ?? Math.floor(Math.random() * 1_000_000),
        gameTopic: gameData.game.gameTopic,
        questions: deduped,
        userId: gameData.game.userId ?? userId,
      },
      imagePrompt: gameData.imagePrompt ?? "",
    };

    console.log("Final Processed Game:", finalPayload);
    return finalPayload;
  } catch (error: any) {
    console.error("Error generating crossword hints:", error?.message ?? error);
    throw new Error("Failed to generate crossword hints.");
  }
};

/* =========================
   Utilities / Internals
   ========================= */

/** Remove ```json fences and trim. */
function stripCodeFences(s: string): string {
  return s.replace(/```json/gi, "").replace(/```/g, "").trim();
}

/** Remove trailing commas before ] or } */
function looseJsonFix(s: string): string {
  return s.replace(/,\s*([\]}])/g, "$1");
}

/** Sanitize an answer for grid use (letters & digits only, lowercase). */
function sanitizeAnswer(s: string): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Keep first occurrence of each unique answer (case-insensitive) AFTER sanitization. */
function dedupeQuestions<T extends { answer: string }>(qs: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const q of qs) {
    const key = (q.answer ?? "").trim().toLowerCase();
    if (!key) continue;          // drop empty
    if (seen.has(key)) continue; // drop duplicate
    seen.add(key);
    out.push(q);
  }
  return out;
}

/** Legacy helper – not used in main flow, kept for compatibility/reference. */
function transformGameFormat(geminiResponse: any, userId: number) {
  const transformedGame = {
    success: true,
    game: {
      id: geminiResponse.game?.id || Math.floor(Math.random() * 1000),
      topic: geminiResponse.game?.topic || "Unknown Topic",
      questions: [] as Array<{ question: string; answer: string }>,
      userId,
    },
  };

  const { across = {}, down = {} } = geminiResponse.game?.clues || {};
  Object.entries({ ...across, ...down }).forEach(([_, clueObj]) => {
    transformedGame.game.questions.push({
      question: (clueObj as { clue: string }).clue,
      answer: (clueObj as { answer: string }).answer,
    });
  });

  return transformedGame;
}

async function rankWordsByCEFR(
  wordSynonyms: { [key: string]: string[] },
  userCEFR: string
) {
  try {
    const prompt = `For each word below, choose the best synonym based on:
1. Its contextual fit with the original clue.
2. Its appropriateness for CEFR levels A1 to C2 where user CEFR level is ${userCEFR}.
Return a JSON object in this exact structure:
      "word1": {
    "A1": "easiest synonym",
    "A2": "slightly harder synonym",
    "B1": "medium difficulty synonym",
    "B2": "more advanced synonym",
    "C1": "complex synonym",
    "C2": "most difficult synonym"
  },
  ...
}
Ensure each word has **one synonym per CEFR level**. Do not add any explanations or extra text.
Guidelines:
- Avoid overly academic, rare, or scientific terms (e.g., "homoiothermic", "limnetic") even at C2.
- Favor real-world, commonly understood words instead.
- Prefer general English over discipline-specific vocabulary.

Words and their synonyms:
${Object.entries(wordSynonyms)
        .map(([word, syns]) => `"${word}": ["${syns.join('", "')}"]`)
        .join(",\n")}
`;

    console.log("🔍 Sending request to Gemini for CEFR ranking...");
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    if (!response.data?.candidates?.length) {
      throw new Error("No valid response from Gemini API.");
    }

    let rankedResponse = response.data.candidates[0].content.parts?.[0]?.text ?? "";
    rankedResponse = looseJsonFix(stripCodeFences(rankedResponse));
    return JSON.parse(rankedResponse);
  } catch (error) {
    if (error instanceof Error) {
      console.error(" Error generating crossword hints:", error.message);
    } else {
      console.error(" Unknown error occurred:", error);
    }
  }
}