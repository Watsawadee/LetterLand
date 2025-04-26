import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

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
    let prompt = `Generate a crossword puzzle based on this extracted text: "${extractedText}".  
    Ensure that the words and definitions used align with CEFR level: ${userCEFR} except if the named entities is the person name, album titles, band names.  
    Use vocabulary appropriate for this level and provide a suitable topic based on the extracted text.  
    Respond **only** with the JSON object in the following format:
  \`\`\`json
{
  "success": true,
  "game": {
    "id": 1,
    "topic": "Space",
    "questions": [
      {
        "question": "The planet we live on.",
        "answer": "EARTH"
      },
      {
        "question": "The bright object that provides light during the night.",
        "answer": "MOON"
      }
    ],
    "userId": ${userId}
  }
}
\`\`\``;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    if (!response.data?.candidates?.length)
      throw new Error("No valid response from Gemini API.");

    let geminiResponse = response.data.candidates[0].content.parts[0].text;
    geminiResponse = geminiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    geminiResponse = geminiResponse.replace(/,\s*([\]}])/g, "$1");

    let gameData = JSON.parse(geminiResponse);

    if (gameData.game?.clues) {
      gameData = transformGameFormat(gameData, userId);
    }

    console.log("Transformed Game Format:", gameData);

    const words = gameData.game.questions.map((q: any) => q.answer);
    console.log("Extracted Words:", words);

    const synonymMap: { [key: string]: string[] } = {};
    for (const word of words) {
      let synonyms = await getSynonyms(word.toLowerCase());
      synonymMap[word] = synonyms;
    }
    console.log("🔹 Retrieved Synonyms:", synonymMap);

    const rankedWords = await rankWordsByCEFR(synonymMap, userCEFR);
    console.log(
      "CEFR-Filtered Words from Gemini API:",
      JSON.stringify(rankedWords, null, 2)
    );

    gameData.game.questions = gameData.game.questions.map((q: any) => {
      const originalWord = q.answer;

      const userWordChoice =
        rankedWords?.[originalWord]?.[userCEFR] || originalWord;

      console.log(
        `Replacing word: "${originalWord}" → "${userWordChoice}" for CEFR Level: ${userCEFR}`
      );

      return { ...q, answer: userWordChoice };
    });

    console.log("Final Processed Game:", gameData);
    return gameData;
  } catch (error: any) {
    console.error("Error generating crossword hints:", error.message);
    throw new Error("Failed to generate crossword hints.");
  }
};

function transformGameFormat(geminiResponse: any, userId: number) {
  const transformedGame = {
    success: true,
    game: {
      id: geminiResponse.game?.id || Math.floor(Math.random() * 1000),
      topic: geminiResponse.game?.topic || "Unknown Topic",
      questions: [] as Array<{ question: string; answer: string }>,
      userId: userId,
    },
  };

  const { across = {}, down = {} } = geminiResponse.game.clues || {};
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
    
    Words and their synonyms:
    ${Object.entries(wordSynonyms)
      .map(([word, synonyms]) => `"${word}": ["${synonyms.join('", "')}"]`)
      .join(",\n")}
    `;

    console.log("🔍 Sending request to Gemini for CEFR ranking...");
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    if (!response.data?.candidates?.length)
      throw new Error("No valid response from Gemini API.");

    let rankedResponse = response.data.candidates[0].content.parts[0].text;
    rankedResponse = rankedResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    rankedResponse = rankedResponse.replace(/,\s*([\]}])/g, "$1");

    return JSON.parse(rankedResponse);
  } catch (error) {
    if (error instanceof Error) {
      console.error(" Error generating crossword hints:", error.message);
    } else {
      console.error(" Unknown error occurred:", error);
    }
  }
}