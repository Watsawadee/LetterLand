import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AchievementCard from "./AchievementCard";
import {
  fetchUserAchievements,
  syncAchievementProgress,
  selectActiveTop3,
} from "@/services/achievementService";
import type { Achievement } from "@/types/achievementTypes";
import { useRouter } from "expo-router";

type Props = {
  title?: string;
  onCoinsUpdated?: (newBalance: number) => void;
  showAll?: boolean; // if true => show all achievements in grid
};

export default function AchievementsRow({
  title = "Achievement",
  onCoinsUpdated,
  showAll = false,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await syncAchievementProgress();
      const all = await fetchUserAchievements();
      setAchievements(showAll ? all : selectActiveTop3(all));
    } catch (err: any) {
      console.error(
        "[AchievementsRow] load failed:",
        err?.response?.data || err?.message || err
      );
      const msg =
        err?.response?.data?.message || err?.message || "Please try again.";
      Alert.alert("Couldn't load achievements", msg);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => {
    load();
  }, [load]);

  const COLUMNS = showAll ? 3 : 1;
  const GRID_GAP = 24; // Changed to match your desired gap

  return (
    <View style={{ marginBottom: 70 }}>
      {/* Header Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >


        {/* View All link (only when showing top 3) */}
        {!showAll && (
          <TouchableOpacity onPress={() => router.push("/Achievementboard")}>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading / List */}
      {loading ? (
        <ActivityIndicator size="small" />
      ) : achievements.length > 0 ? (
        <FlatList
          key={showAll ? `grid-${COLUMNS}` : "row"}
          data={achievements}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View
              style={
                showAll
                  ? {
                      width: `${100 / COLUMNS - 2}%`, // Calculate width accounting for gap
                      marginBottom: GRID_GAP,
                    }
                  : { marginRight: GRID_GAP/2 }
              }
            >
              <AchievementCard
                achievement={item}
                onClaimed={async (_id, newBalance) => {
                  onCoinsUpdated?.(newBalance);
                  await load();
                }}
              />
            </View>
          )}
          horizontal={!showAll} // top 3 scrolls horizontally
          numColumns={COLUMNS} // grid mode for full page
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={showAll}
          columnWrapperStyle={
            showAll ? { 
              justifyContent: "flex-start",
              gap: GRID_GAP,
            } : undefined
          }
          contentContainerStyle={{
            paddingRight: showAll ? 0 : 4,
            paddingBottom: showAll ? 40 : 0, // Added your marginBottom value
          }}
          initialNumToRender={showAll ? 9 : 3}
          windowSize={showAll ? 7 : 5}
        />
      ) : (
        <Text style={{ color: "gray" }}>No achievements yet.</Text>
      )}
    </View>
  );
}