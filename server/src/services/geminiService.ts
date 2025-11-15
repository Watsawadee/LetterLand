import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
function cleanApiResponse(rawText: string): string {
  let cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
  return cleaned;
}

async function callGeminiWithRetry(prompt: string, maxRetries = 3) {
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.post(GEMINI_API_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      return response;

    } catch (error: any) {
      if (error.response && error.response.status >= 500) {
        console.warn(`Gemini API error ${error.response.status}. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);

        await new Promise(res => setTimeout(res, delay));

        delay *= 2;

      } else {
        console.error("Non-retryable Gemini API error:", error.message);
        throw error;
      }
    }
  }

  throw new Error(`Failed to call Gemini API after ${maxRetries} attempts.`);
}



// async function isDictionaryWord(word: string): Promise<boolean> {
//   try {
//     await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
//     return true;
//   } catch (error) {
//     return false;
//   }
// }


// export async function isDictionaryWord(word: string): Promise<boolean> {
//   if (!word) return false;
//   try {
//     const res = await axios.get(
//       `${OXFORD_BASE_URL}/words/en-gb`,
//       {
//         params: { q: word.toLowerCase() },
//         headers: {
//           Accept: "application/json",
//           app_id: process.env.OXFORD_APP_ID!,
//           app_key: process.env.OXFORD_APP_KEY!,
//         },
//       }
//     );
//     // Check if results array contains the word
//     return Array.isArray(res.data.results) &&
//       res.data.results.some((item: any) => item.word?.toLowerCase() === word.toLowerCase());
//   } catch (error: any) {
//     if (error.response?.status === 404) return false;
//     console.error(`Oxford lookup failed for ${word}:`, error.message);
//     return false;
//   }
// }


// async function isDictionaryWord(word: string): Promise<boolean> {
//   try {
//     const res = await axios.get(
//       "https://api.datamuse.com/words",
//       { params: { sp: word.toLowerCase(), max: 1 } }
//     );
//     return Array.isArray(res.data) && res.data.length > 0 && res.data[0].word.toLowerCase() === word.toLowerCase();
//   } catch (error) {
//     return false;
//   }
// }

const wordCache = new Map<string, boolean>();
// ...existing code...
export async function validateAnswer(
  rawAnswer: string | undefined | null,
  maxLen: number
): Promise<string | null> {
  if (!rawAnswer) return null;

  const sanitized = rawAnswer.trim().toUpperCase().replace(/[^A-Z]/g, "");

  if (sanitized.length === 0 || sanitized.length > maxLen) {
    console.warn(`'${rawAnswer}' discarded (invalid length).`);
    return null;
  }

  if (wordCache.has(sanitized)) {
    return wordCache.get(sanitized)! ? sanitized : null;
  }
  // const valid = await isDictionaryWord(sanitized);
  const valid = true;

  wordCache.set(sanitized, valid);

  if (valid) {
    return sanitized;
  } else {
    console.warn(`'${rawAnswer}' discarded (not in dictionary).`);
    return null;
  }
}

export const generateCrosswordHints = async (
  extractedText: string,
  userId: number,
  userCEFR: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
) => {
  try {
    const cefrInstructions = {
      A1: `
**A1 (Beginner / Kindergarten):**
* **Focus:** 
- Use only the simplest, most common English words , concrete nouns (e.g., *egg, ship, star*) and very basic adjectives(e.g., *big, dark, cold*) , everyday things a child sees or does.
- Avoid abstract, emotional, or long words.
- Clue Sentences: max 5 words.
- Hints and definitions must be visual, concrete, and playful (“It says meow”).
- Think of the first 100 English words learned by a kindergartener.
* **Goal:** Use the most common, everyday words a 4-6 year old would know. Clues must be extremely simple.
**CRITICAL RULE FOR A1/A2:** If the topic is too advanced, you must use broader, child-friendly words related to the general theme.`,

      A2: `
**A2 (Elementary / Early Primary):**
* **Focus:**
- Simple verbs (e.g., *run, hide, fight*) and basic emotions or descriptive words (e.g., *scary, alone, space*) or basic daily actions, places, or feelings.
  Examples: school, kitchen, play, happy, clean, chair.
- Focus on visible, real-world objects or simple experiences.
- Clue Sentences: max 6 words.
* **Goal:** Broaden vocabulary to what a 7-9 year old would know. The word list must be clearly different from A1.
**CRITICAL RULE FOR A1/A2:** If the topic is too advanced, you must use broader, child-friendly words related to the general theme.`,


      B1: `
**B1 (Intermediate / Threshold):**
* **Focus:** Common abstract nouns related to experiences, opinions, and storytelling (e.g., *adventure, character, horror, decision*).
- Mix simple abstract words with concrete ones.
- Clue Sentences: up to 10 words. 
* **Goal:** Use vocabulary needed to describe events and give simple opinions on familiar topics.`,

      B2: `
**B2 (Upper-Intermediate / Fluent Conversation):**
* **Focus:** Use refined and layered vocabulary, more precise words to describe systems, people, and outcomes (e.g., strategy, framework, catalyst, protagonist, formidable).
 Include broader or academic terms like advantage, behavior, influence, pressure, global, improvement.
- Clue Sentences: up to 12 words.
* **Goal:** Use vocabulary for fluent, detailed discussions on a variety of subjects.`,

      C1: `
**C1 (Advanced / Effective Proficiency):**
* **Focus:** Sophisticated, professional, or academic vocabulary used for precise description and formal analysis and Include advanced academic or professional vocabulary: interpretation, efficiency, sustainable, hypothesis. (e.g., *atmospheric, interwoven, juggernaut, innovative*).

- Clue Sentences: up to 12 words.
* **Goal:** Use precise language suitable for academic or professional settings.`,

      C2: `
**C2 (Mastery / Proficient):**
* **Focus:** Rare, literary, or highly academic words that demonstrate a near-native command of the language (e.g., *culminated, avarice, hegemony, ubiquitous*).
- Use nuanced, idiomatic, or literary vocabulary: meticulous, by contrast, in retrospect, beyond doubt.

- Clue Sentences: up to 12 words.
* **Goal:** Use vocabulary that allows for expressing fine shades of meaning.
**CRITICAL C2 RULE: STRICTLY AVOID SIMPLE WORDS.**
- You MUST NOT use words that are common, general, or would be appropriate for B2 or C1 levels.
- **FOR EXAMPLE:** For a topic on health, 'longevity' is C1. A C2 word would be 'pathogenesis' or 'prophylactic'. Simple words like 'risk' or 'omega' are B2 level and are ABSOLUTELY FORBIDDEN.
`
    };


    let prompt = `
You are an expert English teacher and CEFR-certified linguist working for an AI word game.

Your task is to generate a complete crossword puzzle game based on the topic of the following text. The vocabulary and clues MUST be appropriate for a user at the CEFR level: ${userCEFR}.

Text for Topic Analysis: "${extractedText}"".

────────────────────────────
CEFR-LEVEL INSTRUCTIONS (Current Target: ${userCEFR}):  
${cefrInstructions[userCEFR]}
────────────────────────────
**CRITICAL RULE FOR ALL LEVELS:**
* Each level's word list must be unique. A word appropriate for a lower level should not be the primary choice for a higher level (e.g., do not use a B1 word like 'horror' in a C2 list).
────────────────────────────
GENERAL RULES FOR ALL LEVELS:
1.  **Word Selection:** All answers must be real, dictionary-valid English words. They must be logically related to the topic of the provided text.
2.  **Clue Quality:** The clue must NEVER contain the answer word. Describe its meaning or provide a clear definition. No riddles.
3.  **Uniqueness:** Generate exactly 6 unique question-answer pairs. The answers must not be duplicates (case-insensitive).
4.  **Formatting:** All answers must contain only English letters (A-Z).
5.  **Answer Length:**
   -A1: 3–4 letters
   -A2: 4-6 letters
   -B1: 6-8 letters
   -B2: 8–10 letters
   -C1: 8-12 letters
   -C2: 8–12 letters
6.  **Image Prompt:** Include a creative 'imagePrompt' description for generating an image that represents the crossword’s main topic.
7.  **Topic Length:** The "gameTopic" string MUST be a concise phrase or title, no more than 15 characters. If the topic is longer, shorten it to a clear, short phrase.
────────────────────────────
OUTPUT FORMAT:
Return ONLY a valid JSON object. Do not include markdown fences or any other text.

{
  "success": true,
  "game": {
    "gameTopic": "The main topic derived from the text",
    "questions": [
      {
        "question": "A clue appropriate for level ${userCEFR}.",
        "answer": "ANSWERWORD",
        "hint": "A simple hint for the answer."
      }
    ],
    "userId": ${userId}
  },
  "imagePrompt": "A creative description for an image about the game's topic."
}
`;

    const response = await callGeminiWithRetry(prompt, 4);

    if (!response.data?.candidates?.length) {
      throw new Error("No valid response from Gemini API.");
    }

    const gridLengths: Record<string, number> = {
      A1: 4,
      A2: 6,
      B1: 8,
      B2: 10,
      C1: 12,
      C2: 12,
    };
    const maxLen = gridLengths[userCEFR];
    const rawResponse = response.data.candidates[0].content.parts?.[0]?.text ?? "";
    const cleanedResponse = cleanApiResponse(rawResponse);
    const gameData = JSON.parse(cleanedResponse);
    let questions: { question: string; answer: string; hint: string }[] = [];
    for (const q of gameData.game.questions ?? []) {
      const validAnswer = await validateAnswer(q.answer, maxLen);
      if (validAnswer && q.question) {
        questions.push({
          question: q.question ?? "",
          answer: validAnswer,
          hint: q.hint ?? "",
        });
      }
    }
    // Deduplicate answers to ensure a valid crossword
    const seenAnswers = new Set<string>();
    questions = questions.filter((q: any) => {
      if (seenAnswers.has(q.answer)) {
        return false;
      }
      seenAnswers.add(q.answer);
      return true;
    });

    if (questions.length < 6) {
      console.warn(`API generated only ${questions.length} valid clues. The game may be incomplete.`);
    }
    const finalPayload = {
      success: true,
      game: {
        id: gameData.game.id ?? Math.floor(Math.random() * 1_000_000),
        gameTopic: gameData.game.gameTopic,
        questions: questions.slice(0, 6),
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