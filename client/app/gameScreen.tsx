import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import SharedGameScreen from "../components/SharedGameScreen";
import { useLocalSearchParams } from "expo-router";
import { GameData } from "../types/type";
import { getGameData, getBGImage } from "../services/gameService";
import { ImageBackground } from "react-native";

// Route example: /gameScreen?gameId=123
export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [mode, setMode] = useState<"WORD_SEARCH" | "CROSSWORD_SEARCH" | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

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

        try {
          const imageUrl = await getBGImage(
            String(gameId),
            finalData.gameTemplate.gameTopic
          );
          setImageUri(imageUrl);
        } catch {
          console.warn("Background image not found, continuing without it.");
          setImageUri(null);
        }
      } catch (e) {
        setError("Failed to load game data");
      } finally {
        setLoading(false);
      }
    })();
  }, [gameId]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading game...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );

  if (!gameData || !mode)
    return (
      <View style={styles.center}>
        <Text>No game data</Text>
      </View>
    );

  return (
    <ImageBackground
      source={{ uri: imageUri || "" }}
      style={{ flex: 1 }}
      resizeMode="stretch"
    >
      <SharedGameScreen
        mode={mode}
        title={gameData.gameTemplate.gameTopic}
        CELL_SIZE={55}
        GRID_SIZE={12}
        questionsAndAnswers={gameData.gameTemplate.questions}
        gameData={gameData}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});