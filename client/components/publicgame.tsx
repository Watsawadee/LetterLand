
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/theme/Font";
import { getCardBGImage } from "@/services/mygameService";
import { getPublicGames, startPublicGame } from "@/services/publicgameService";
import { PublicGameItem } from "@/types/publicgametypes";
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

type Props = { title?: string; limit?: number; offset?: number };

export default function PublicGames({ title = "Public Games", limit = 10, offset = 0 }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<PublicGameItem[]>([]);
    
    // Remove pagination parameters temporarily for testing
    const fetchPublic = useCallback(async () => {
      try {
        setLoading(true);
        const list = await getPublicGames();  // No limit and offset here
  
        const withImages = await Promise.all(
          list.map(async (g: PublicGameItem) => {
            if (g.imageUrl) {
              try {
                const full = await getCardBGImage(g.imageUrl);
                return { ...g, imageUrl: full };
              } catch {
                return g;
              }
            }
            return g;
          })
        );
    
        setItems(withImages);
      } catch (err: any) {
        console.error("[PublicGamesRow] load failed:", err?.response?.data || err?.message || err);
        Alert.alert("Couldn’t load public games", err?.response?.data?.error ?? "Please try again.");
      } finally {
        setLoading(false);
      }
    }, []);
    
    useEffect(() => { fetchPublic(); }, [fetchPublic]);
  
    const cards: CardProps[] = items.map((g: PublicGameItem) => ({
        id: g.id, 
        title: g.title,
        subtitle: g.gameType,
        level: g.difficulty,
        image: g.imageUrl,
      }));
      
      console.log("Cards to display:", cards);  // Log cards to check if all are mapped correctly
      
  
    const handlePress = async (templateId: number) => {
      try {
        const started = await startPublicGame(templateId);
        router.push({ pathname: "/gameScreen", params: { gameId: String(started.id) } });
      } catch (err: any) {
        console.error("[PublicGamesRow] start failed:", err?.response?.data || err?.message || err);
        Alert.alert("Couldn’t start game", err?.response?.data?.error ?? "Please try again.");
      }
    };
  
    return (
      <View style={{ marginTop: 24 }}>
        <Text style={[Typography.header20, { marginBottom: 8 }]}>{title}</Text>
        {loading ? (
          <ActivityIndicator size="small" />
        ) : cards.length > 0 ? (
          <FlatList<CardProps>
            data={cards}
            numColumns={3} 
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <MyCard {...item} onPress={() => handlePress(item.id)} />}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
          />
        ) : (
          <Text style={{ color: "gray", textAlign: "center", marginTop: 10 }}>No public games found.</Text>
        )}
      </View>
    );
  }
  