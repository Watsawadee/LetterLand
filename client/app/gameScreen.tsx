import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import SharedGameScreen from "../components/SharedGameScreen";
import { useLocalSearchParams } from "expo-router";
import { GameData } from "../types/type";
import { getGameData } from "../services/gameService";

// Route example: /gameScreen?gameId=123
export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [mode, setMode] = useState<"WORD_SEARCH" | "CROSSWORD_SEARCH" | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    (async () => {
      try {
        const data: GameData = await getGameData(String(gameId));
        const questionsWithUppercase = data.gameTemplate.questions.map((q) => ({
          ...q,
          answer: q.answer.toUpperCase(),
        }));
        const finalData = {
          ...data,
          gameTemplate: {
            ...data.gameTemplate,
            questions: questionsWithUppercase,
          },
        };
        setGameData(finalData);

        const gameType = finalData.gameTemplate.gameType as
          | "WORD_SEARCH"
          | "CROSSWORD_SEARCH";
        setMode(gameType);
      } catch (e) {
        setError("Failed to load game data");
      } finally {
        setLoading(false);
      }
    })();
  }, [gameId]);

  if (loading) return <Text>Loading game...</Text>;
  if (error) return <Text>{error}</Text>;
  if (!gameData || !mode) return <Text>No game data</Text>;

  return (
    <SharedGameScreen
      mode={mode}
      title={gameData.gameTemplate.gameTopic}
      CELL_SIZE={55}
      GRID_SIZE={12}
      questionsAndAnswers={gameData.gameTemplate.questions}
      gameData={gameData}
    />
  );
}
