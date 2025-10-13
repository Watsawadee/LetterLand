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
    let prompt = `
You are an expert English teacher and CEFR-certified linguist working for an AI word game system.

Your task is to analyze the given input and generate vocabulary items and clues suitable for an English word game.

Generate a crossword puzzle based on this extracted text: "${extractedText}".

────────────────────────────
IMPORTANT NOTE FOR THE MODEL:
When the CEFR level is A1 or A2, you must switch to "child-friendly mode."
All output should be extremely simple, like vocabulary taught to very young children.
Do NOT use adult-level beginner vocabulary.
If a word feels too hard for a 6–9 year old, replace it with an easier one.

────────────────────────────
A1 (Kindergarten / Very Beginner)
• Use only the simplest, most common English words — things children at kindergarten see every day.
• One or two syllables only.
• Avoid abstract or hard words.
• Use short, clear example sentences (max 4 words).
• Hints and definitions must be simple, concrete, and visual (e.g., “It says meow” for “cat”).
• Think of what a child learning their first 100 English words could understand.

────────────────────────────
A2 (Early Primary)
• Still very simple, but may include basic daily actions, places, or feelings.
• Avoid long or abstract words.
• Sentences can be a bit longer (max 6 words).
• Hints should feel natural for a 7–9-year-old learner.
• Words should describe real, visible, or common things.

────────────────────────────
For higher levels (B1–C2)
• Gradually increase vocabulary complexity and abstractness, but not technicality.
• Use natural, real-world English, not domain-specific or scientific jargon.
• Focus on nuance, precision, or abstract meaning (e.g., “help” → “assist” → “facilitate” → “empower”), not rare or academic words.

────────────────────────────
For ALL levels
• Do NOT repeat the same answer for different CEFR levels — each must be unique.
• Use real-world, general English vocabulary — not academic, scientific, or obscure terms.
• Avoid technical, Latin, or biology-related words (e.g., "homoiothermic", "limnetic").
• All answers must contain only English letters (A–Z, a–z). No numbers or symbols.
• Clues must directly define or describe the word’s meaning — no riddles or metaphors.
• Every answer must be a real English word or proper noun that is a semantically correct, logical answer to its clue. Do NOT use random, unrelated, or out-of-context words. For example, for the clue "Top of your body," only answers like "head" or "hair" are valid; "rule" is NOT valid.
• If you cannot find a suitable answer that fits the clue, leave that clue out.
• Do NOT invent new words.
• Answer length limits by CEFR level:
    - A1–A2: 3–8 letters (simple words)
    - B1–B2: 5–10 letters (moderate)
    - C1–C2: 6–12 letters (advanced but natural)
• Generate exactly 6 question–answer pairs (no more, no less).
• If an answer is too long, replace it with a shorter real synonym.
• Each answer must be unique (case-insensitive).
• If you cannot find a suitable answer, skip it — do not fill with nonsense.
────────────────────────────
🚫 IMPORTANT CLUE RULE
- The **answer word must NEVER appear inside its own question or hint**.  
- Do NOT copy the answer directly into the clue text (e.g., avoid “A simple word related to phones: call” → answer “call”).  
- Instead, describe its meaning or use a simple, visual or conceptual definition (e.g., for “call”: “You talk on the phone”).  
────────────────────────────
Image Prompt
Include an imagePrompt — a creative description for generating an image that represents the crossword’s topic 
(e.g., “A detailed digital illustration of outer space featuring Earth and Moon.”)

────────────────────────────
Output Format
Return ONLY a valid JSON object — no Markdown, no explanations, no code fences.

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

    async function isRealEnglishWord(word: string): Promise<boolean> {
      // Accept proper nouns (capitalized) and common words
      if (/^[A-Z][a-z]+$/.test(word)) return true;
      try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        return Array.isArray(res.data) && res.data.length > 0;
      } catch {
        return false;
      }
    }

    function isAlphabetic(word: string): boolean {
      return /^[a-zA-Z]+$/.test(word);
    }
    // Apply CEFR choice → sanitize → strict length filter (drop if invalid/too long)
    const processed = (gameData.game.questions as Array<any>)
      .map((q) => {
        const original = q.answer ?? "";
        // Prefer ranked CEFR word; fallback to original
        const picked = rankedWords?.[original]?.[userCEFR] ?? original;
        let sanitized = sanitizeAnswer(picked);

        // If synonym is too long, fallback to original
        if (!sanitized || sanitized.length > maxLen) {
          sanitized = sanitizeAnswer(original);
        }

        // If still invalid, drop
        if (
          !sanitized ||
          sanitized.length > maxLen ||
          !isAlphabetic(sanitized)
        ) {
          console.log(
            `Dropping clue — invalid answer: "${original}" → "${picked}" → "${sanitized}" (max ${maxLen})`
          );
          return null;
        }

        return { ...q, answer: sanitized };
      })
      .filter(Boolean) as Array<any>;

    const realWordProcessed = [];
    for (const q of processed) {
      if (await isRealEnglishWord(q.answer)) {
        realWordProcessed.push(q);
      } else {
        console.log(`Dropping hallucinated/non-dictionary word: "${q.answer}"`);
      }
    }

    // Remove duplicates AFTER strict length filtering (case-insensitive on sanitized answers)
    let deduped = dedupeQuestions(realWordProcessed);
    deduped = deduped.slice(0, 6);

    // Optional: enforce minimum question count to accept a puzzle
    const MIN_QUESTIONS = 6;
    if (deduped.length < MIN_QUESTIONS) {
      console.warn(`Only ${deduped.length} valid clues — refilling with fallback simple words.`);
      const fillerWords = ["phone", "call", "text", "app", "chat", "wifi"]
        .slice(0, MIN_QUESTIONS - deduped.length)
        .map((w) => ({
          question: `A simple word related to phones: ${w}`,
          answer: w,
          hint: "Basic filler word"
        }));
      deduped.push(...fillerWords);
    }


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

async function rankWordsByCEFR(
  wordSynonyms: { [key: string]: string[] },
  userCEFR: string
) {
  try {
    const prompt = `
You are an expert CEFR linguist helping an AI word game system choose correct vocabulary difficulty levels.

For each word below, provide appropriate synonyms across CEFR levels (A1 to C2), while keeping them related to the same **semantic theme** and **topic** as the original word list.
If the topic is entertainment, art, or horror (e.g., "Art the Clown"), avoid unrelated academic or random verbs like “do” or “go.”

────────────────────────────
RULES:
- Each level’s synonym must make sense in the same context as the original word.
- For A1–A2, use **child-friendly, visual, concrete** words that a 6–9-year-old can easily understand.
- For B1–B2, use general intermediate English words known to teens or casual learners.
- For C1–C2, use natural, advanced, or thematic vocabulary that fits academic or creative writing.
- Avoid invented, rare, or scientific words (e.g., “homoiothermic”, “limnetic”).
- Avoid random or meaningless replacements like “do”, “go”, “thing”, “nice”.
- Never use words unrelated to the topic or emotion of the source material.
- All outputs must be real, dictionary-valid English words.
- If you cannot find a suitable synonym, leave that CEFR slot blank or repeat the closest valid one.
- Every answer must be a real English word or proper noun that is a semantically correct, logical answer to its clue. Do NOT use random, unrelated, or out-of-context words. For example, for the clue "Top of your body," only answers like "head" or "hair" are valid; "rule" is NOT valid.
- If you cannot find a suitable answer that fits the clue, leave that clue out.
────────────────────────────
Return a JSON object in this exact structure:
{
  "word1": {
    "A1": "easiest synonym",
    "A2": "slightly harder synonym",
    "B1": "medium difficulty synonym",
    "B2": "more advanced synonym",
    "C1": "complex synonym",
    "C2": "most difficult synonym"
  },
  "word2": { ... },
  ...
}

Each word below represents the ANSWER to a crossword clue about the same topic.
Do not select synonyms that change its meaning or make the clue nonsense.
For example, if the clue was "Top of your body", the answer must stay semantically correct ("head" → "face", "hair"), not random words ("rule", "law").

Words and their synonyms (keep topic and meaning consistent):
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