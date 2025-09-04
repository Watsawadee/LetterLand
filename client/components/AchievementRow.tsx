import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import AchievementCard from "./AchievementCard";
import { fetchUserAchievements, syncAchievementProgress } from "@/services/achievementService";
import type { Achievement } from "@/types/achievementTypes";

type Props = { title?: string };

export default function AchievementsRow({ title = "Achievement" }: Props) {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ Ensure DB flags (isCompleted) are up-to-date before reading
      await syncAchievementProgress();
      const data = await fetchUserAchievements();
      setAchievements(data);
    } catch (err: any) {
      console.error("[AchievementsRow] load failed:", err?.response?.data || err?.message || err);
      const msg = err?.response?.data?.message || err?.message || "Please try again.";
      Alert.alert("Couldn’t load achievements", msg);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={{ marginBottom: 70 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>{title}</Text>

      {loading ? (
        <ActivityIndicator size="small" />
      ) : achievements.length > 0 ? (
        <FlatList
          data={achievements}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <AchievementCard
              achievement={item}
              onClaimed={(id) => {
                // Quick local patch; or call load() to re-fetch canonical data
                setAchievements((prev) =>
                  prev.map((a) => (a.id === id ? { ...a, isClaimed: true } : a))
                );
              }}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          contentContainerStyle={{ paddingRight: 4 }}
        />
      ) : (
        <Text style={{ color: "gray" }}>No achievements yet.</Text>
      )}
    </View>
  );
}
