import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/theme/Font";
import { getUserGames, getCardBGImage } from "@/services/mygameService";
import { GetUserGamesResponse } from "../../server/src/types/mygame";
import { getLoggedInUserId } from "@/utils/auth";

/* ====================== SIZE TUNING ====================== */
const CARD_RADIUS = 18;
const CARD_WIDTH_ROW = 220;
const CARD_WIDTH_GRID = 200;
const IMAGE_HEIGHT_ROW = 120;
const IMAGE_HEIGHT_GRID = 110;
/* ========================================================= */

const cefrPillColor: Record<string, string> = {
  A1: "#F2B9DD",
  A2: "#FB7FC7",
  B1: "#F19DB8",
  B2: "#FB6C97",
  C1: "#C8A8E0",
  C2: "#AE7EDF",
};

// FIX: Make this function more robust
const prettyGameType = (t?: string | null) => {
  // Add detailed logging to debug
  console.log("[prettyGameType] Input:", t, "Type:", typeof t);
  
  if (!t) return "Unknown";
  
  const normalized = t.trim().toUpperCase();
  
  const map: Record<string, string> = {
    WORD_SEARCH: "Word Search",
    CROSSWORD_SEARCH: "Crossword Search",
  };
  
  const result = map[normalized] ?? `Unknown (${t})`;
  console.log("[prettyGameType] Output:", result);
  return result;
};

const formatTimerPill = (seconds: number | null | undefined) => {
  if (seconds == null) return null;
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} Mins`;
};

/* -------------------- Card -------------------- */
type CardProps = {
  id: number;
  image: string | null | undefined;
  title: string;
  subtitle?: string;
  level?: string;
  timerSeconds?: number | null;
  onPress?: () => void;
  isGrid?: boolean;
};

const MyCard: React.FC<CardProps> = ({
  id,
  image,
  title,
  subtitle,
  level,
  timerSeconds,
  onPress,
  isGrid = false,
}) => {
  const W = isGrid ? CARD_WIDTH_GRID : CARD_WIDTH_ROW;
  const H = isGrid ? IMAGE_HEIGHT_GRID : IMAGE_HEIGHT_ROW;
  const timerLabel = formatTimerPill(timerSeconds);
  const levelBg =
    level && cefrPillColor[level] ? cefrPillColor[level] : "#EAEAEA";

  return (
    <TouchableOpacity
      style={[styles.card, { width: W, borderRadius: CARD_RADIUS }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Top image area */}
      <View
        style={[
          styles.imageWrap,
          {
            borderTopLeftRadius: CARD_RADIUS,
            borderTopRightRadius: CARD_RADIUS,
          },
        ]}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: H }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[{ width: "100%", height: H }, styles.imagePlaceholder]}
          />
        )}
        {!!timerLabel && (
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>{timerLabel}</Text>
          </View>
        )}
      </View>

      {/* Bottom info panel */}
      <View
        style={[
          styles.bottomPanel,
          {
            borderBottomLeftRadius: CARD_RADIUS,
            borderBottomRightRadius: CARD_RADIUS,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {!!level && (
            <View style={[styles.levelPill, { backgroundColor: levelBg }]}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          )}
        </View>

        {/* Game Type subtitle */}
        {!!subtitle && (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

/* -------------------- List -------------------- */
type Props = {
  title?: string;
  scrollDirection?: "horizontal" | "vertical";
};

export default function MyGamesRow({
  title = "My Games",
  scrollDirection = "horizontal",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GetUserGamesResponse["items"]>([]);

  const fetchMyGames = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getLoggedInUserId();
      if (!userId) {
        setItems([]);
        setLoading(false);
        return;
      }

      const games = await getUserGames(Number(userId));
      
      // FIX: Log each game's gameType
      console.log("[MyGamesRow] All games with gameType:", 
        games.map(g => ({ 
          id: g.id, 
          title: g.title, 
          gameType: g.gameType,
          hasGameType: !!g.gameType 
        }))
      );

      const withImages: GetUserGamesResponse["items"] = await Promise.all(
        games.map(async (game) => {
          if (game.imageUrl) {
            try {
              const full = await getCardBGImage(game.imageUrl);
              return { ...game, imageUrl: full };
            } catch {
              return game;
            }
          }
          return game;
        })
      );

      setItems(withImages);
    } catch (err: any) {
      console.error(
        "[MyGamesRow] Failed to fetch games:",
        err?.response?.data || err?.message || err
      );
      const msg =
        err?.response?.data?.error ?? err?.message ?? "Please try again.";
      Alert.alert("Couldn't load games", msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyGames();
  }, [fetchMyGames]);

  const isGrid = scrollDirection === "vertical";

  // FIX: Improved card mapping with better debugging
  const cards: CardProps[] = items.map((item) => {
    const safeTitle =
      item.title ??
      (item as any).gameTopic ??
      (item as any).templateTitle ??
      (item as any).name ??
      "(Untitled)";

    // FIX: Better extraction of gameType
    const rawType = item.gameType;
    
    // Debug each card
    console.log(`[Card ${item.id}] gameType:`, rawType, "| title:", safeTitle);

    return {
      id: item.id,
      title: safeTitle,
      subtitle: prettyGameType(rawType), // This will now show detailed logs
      level: item.difficulty,
      image: item.imageUrl,
      timerSeconds: item.timer ?? null,
      isGrid,
    };
  });

  if (loading) {
    return (
      <View style={{ marginTop: 24 }}>
        <Text style={[Typography.header20, { marginBottom: 8 }]}>{title}</Text>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View
        style={{ marginTop: 24, alignItems: "center", paddingHorizontal: 16 }}
      >
        <Text style={[Typography.header20, { marginBottom: 16 }]}>{title}</Text>
        <Text
          style={{
            fontSize: 18,
            color: "#555",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          You haven't created any games yet. Let's create your dream game!
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[Typography.header20,]}>{title}</Text>
      {scrollDirection === "horizontal" ? (
        <FlatList<CardProps>
          data={cards}
          horizontal
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MyCard
              {...item}
              onPress={() =>
                router.push({
                  pathname: "/GameScreen",
                  params: { gameId: String(item.id) },
                })
              }
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        />
      ) : (
        <FlatList<CardProps>
          data={cards}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MyCard
              {...item}
              onPress={() =>
                router.push({
                  pathname: "/GameScreen",
                  params: { gameId: String(item.id) },
                })
              }
              isGrid
            />
          )}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 25,
            marginBottom: 40,
          }}
        />
      )}
    </View>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginRight: 22,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: "rgba(0,0,0,0.10)",
        shadowOpacity: 1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
    overflow: "hidden",
  },
  imageWrap: {
    overflow: "hidden",
    position: "relative",
  },
  imagePlaceholder: {
    backgroundColor: "#E8EEF5",
  },
  timerPill: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  timerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#656565",
  },
  bottomPanel: {
    backgroundColor: "#F7F9FB",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    minHeight: 52,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#2A2A2A",
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12.5,
    color: "#8D8D8D",
    fontWeight: "600",
  },
});