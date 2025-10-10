import React, { useEffect, useState, useMemo } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";
import SharedGameScreen from "../components/SharedGameScreen";
import { useLocalSearchParams } from "expo-router";
import { GameData } from "../types/type";
import { getGameData, getBGImage } from "../services/gameService";

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [mode, setMode] = useState<"WORD_SEARCH" | "CROSSWORD_SEARCH" | null>(
    null
  );
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;

    (async () => {
      try {
        const data: GameData = await getGameData(String(gameId));

        const questionsWithUppercase = data.gameTemplate.questions.map((q) => ({
          ...q,
          answer: q.answer.toUpperCase(),
        }));

        const finalData: GameData = {
          ...data,
          gameTemplate: {
            ...data.gameTemplate,
            questions: questionsWithUppercase,
          },
        };

        if (cancelled) return;

        setGameData(finalData);
        setMode(
          finalData.gameType as "WORD_SEARCH" | "CROSSWORD_SEARCH"
        );

        if (finalData.gameTemplate.imageUrl) {
          try {
            const resolved = await getBGImage(finalData.gameTemplate.imageUrl);
            if (cancelled) return;
            setImageUri(resolved);
            setImageReady(false);
          } catch {
            if (!cancelled) setError("Failed to load background image.");
          }
        } else {
          setImageUri(null);
          setImageReady(true);
        }
      } catch (e) {
        console.error("Failed to load game data:", e);
        if (!cancelled) setError("Failed to load game data.");
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const { CELL_SIZE, GRID_SIZE } = useMemo(() => {
    const level = gameData?.gameTemplate?.difficulty?.toUpperCase().trim();
    if (level === "A1" || level === "A2")
      return { CELL_SIZE: 75, GRID_SIZE: 8 };
    if (level === "B1" || level === "B2")
      return { CELL_SIZE: 65, GRID_SIZE: 10 };
    return { CELL_SIZE: 55, GRID_SIZE: 12 };
  }, [gameData?.gameTemplate?.difficulty]);

  const blocking = loadingData || !imageReady;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, opacity: imageReady ? 1 : 0 }}>
        {imageUri ? (
          <ExpoImage
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
            priority="high"
            onLoadEnd={() => setImageReady(true)}
            onError={() => setImageReady(true)}
          />
        ) : null}

        {gameData && mode ? (
          <SharedGameScreen
            mode={mode}
            title={gameData.gameTemplate.gameTopic}
            CELL_SIZE={CELL_SIZE}
            GRID_SIZE={GRID_SIZE}
            questionsAndAnswers={gameData.gameTemplate.questions}
            gameData={gameData}
          />
        ) : null}
      </View>

      {blocking && (
        <View style={styles.centerOverlay}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>
            {loadingData ? "Loading game…" : "Preparing background…"}
          </Text>

          {imageUri ? (
            <ExpoImage
              source={{ uri: imageUri }}
              style={{ width: 1, height: 1, opacity: 0 }}
              contentFit="cover"
              transition={0}
              cachePolicy="memory-disk"
              priority="high"
              onLoadEnd={() => setImageReady(true)}
              onError={() => setImageReady(true)}
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          ) : null}
        </View>
      )}

      {error && !blocking && (
        <View style={styles.centerOverlay}>
          <Text>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
