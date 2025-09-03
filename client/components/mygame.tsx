
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/theme/Font";
import { getUserGames, getCardBGImage } from "@/services/mygameService";
import { GetUserGamesResponse } from "../../server/src/types/mygame";
import { getLoggedInUserId } from "@/utils/auth";
import { cardStyles as styles } from "@/theme/CardStyles";

// ---- Inline MyCard (no import needed here) ----
type CardProps = {
  id: number;
  image: string | null | undefined;
  title: string;
  subtitle?: string;
  level?: string;
  onPress?: () => void;
};
const MyCard: React.FC<CardProps> = ({ id, image, title, subtitle, level, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {!!image && <Image source={{ uri: image }} style={styles.image} />}
    <View style={styles.content}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {!!level && <Text style={styles.level}>{level}</Text>}
      </View>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  </TouchableOpacity>
);
// -----------------------------------------------

type Props = { title?: string };

export default function MyGamesRow({ title = "My Games" }: Props) {
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

      // only normalize image URLs; NO filtering
      const withImages: GetUserGamesResponse["items"] = await Promise.all(
        games.map(async (game: GetUserGamesResponse["items"][number]) => {
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
      console.error("[MyGamesRow] Failed to fetch games:", err?.response?.data || err?.message || err);
      const msg = err?.response?.data?.error ?? err?.message ?? "Please try again.";
      Alert.alert("Couldn’t load games", msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyGames(); }, [fetchMyGames]);

  const cards: CardProps[] = items.map((item: GetUserGamesResponse["items"][number]) => ({
    id: item.id,
    title: item.title,
    subtitle: item.gameType,
    level: item.difficulty,
    image: item.imageUrl,
  }));

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={[Typography.header20, { marginBottom: 8 }]}>{title}</Text>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : cards.length > 0 ? (
        <FlatList<CardProps>
          data={cards}
          horizontal
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MyCard
              {...item}
              onPress={() =>
                router.push({ pathname: "/gameScreen", params: { gameId: String(item.id) } })
              }
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Text style={{ color: "gray", textAlign: "center", marginTop: 10 }}>No games found.</Text>
      )}
    </View>
  );
}