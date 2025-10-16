import React, { useEffect, useState, useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";
import SharedGameScreen from "../components/SharedGameScreen";
import { useLocalSearchParams } from "expo-router";
import { GameData } from "../types/type";
import { getGameData, getBGImage } from "../services/gameService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { Color } from "@/theme/Color";

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { show, update, hide } = useGlobalLoading();

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
        setError(null);
        setLoadingData(true);
        show({ message: "Loading game…" });

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
        setMode(finalData.gameType as "WORD_SEARCH" | "CROSSWORD_SEARCH");

        // Prepare background
        if (finalData.gameTemplate.imageUrl) {
          try {
            update({ message: "Preparing background…" });
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
      hide();
    };
  }, [gameId, show, update, hide]);

  const blocking = loadingData || !imageReady;

  useEffect(() => {
    if (blocking) {
      show({
        message: loadingData ? "Loading game…" : "Preparing background…",
      });
    } else {
      hide();
    }
  }, [blocking, loadingData, show, hide]);

  const { CELL_SIZE, GRID_SIZE } = useMemo(() => {
    const level = gameData?.gameTemplate?.difficulty?.toUpperCase().trim();
    if (level === "A1" || level === "A2")
      return { CELL_SIZE: 75, GRID_SIZE: 8 };
    if (level === "B1" || level === "B2")
      return { CELL_SIZE: 65, GRID_SIZE: 10 };
    return { CELL_SIZE: 55, GRID_SIZE: 12 };
  }, [gameData?.gameTemplate?.difficulty]);

  const lettersOnlyLen = (s?: string | null) =>
    String(s ?? "").replace(/[^A-Za-z]/g, "").length;
  const filteredQuestions = useMemo(() => {
    const qa = gameData?.gameTemplate?.questions ?? [];
    return qa.filter((q) => {
      const L = lettersOnlyLen(q?.answer);
      return L > 0 && L <= GRID_SIZE;
    });
  }, [gameData?.gameTemplate?.questions, GRID_SIZE]);

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
            questionsAndAnswers={filteredQuestions}
            gameData={gameData}
          />
        ) : null}
      </View>

      {blocking && imageUri ? (
        <ExpoImage
          source={{ uri: imageUri }}
          style={{ width: 1, height: 1, opacity: 0, position: "absolute" }}
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

      {error && !blocking && (
        <View style={styles.errorOverlay}>
          <Text>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Color.white,
  },
});
