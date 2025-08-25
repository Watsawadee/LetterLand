import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import SharedGameScreen from "../components/SharedGameScreen";
import { GameData } from "../types/type";
import { useLocalSearchParams } from "expo-router";
import { getGameData } from "../services/gameService";

export default function WordSearchGame() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameData = async () => {
      try {
        const data: GameData = await getGameData(gameId);

        const questionsWithUppercase = data.gameTemplate.questions.map((q) => ({
          ...q,
          answer: q.answer.toUpperCase(),
        }));

        setGameData({
          ...data,
          gameTemplate: {
            ...data.gameTemplate,
            questions: questionsWithUppercase,
          },
        });
      } catch (err) {
        setError("Failed to load game data");
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  if (loading) return <Text>Loading game...</Text>;
  if (error) return <Text>{error}</Text>;
  if (!gameData) return <Text>No game data</Text>;

  return (
    <SharedGameScreen
      mode="WORD_SEARCH"
      title={gameData.gameTemplate.gameTopic}
      CELL_SIZE={55}
      GRID_SIZE={12}
      questionsAndAnswers={gameData.gameTemplate.questions}
      gameData={gameData}
    />
  );
}
