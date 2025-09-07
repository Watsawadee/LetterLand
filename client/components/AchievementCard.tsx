import React, { useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { AchievementCardStyles as styles } from "@/theme/achievement";
import { claimAchievementAPI } from "@/services/achievementService";
import coinImg from "@/assets/images/coin.png";
import { Achievement } from "@/types/achievementTypes";

type Props = {
  achievement: Achievement;
  onClaimed?: (id: number, newBalance: number) => void; 
};

export default function AchievementCard({ achievement, onClaimed }: Props) {
  const pct = useMemo(() => {
    const denom = Math.max(achievement.maxProgress, 1);
    const raw = (achievement.progress / denom) * 100;
    return Math.max(0, Math.min(100, raw));
  }, [achievement.progress, achievement.maxProgress]);

  const canClaim =
    achievement.progress >= achievement.maxProgress &&
    achievement.isCompleted === true &&
    achievement.isClaimed !== true;

  const alreadyClaimed = achievement.isClaimed === true;

  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    try {
      setClaiming(true);
      const result = await claimAchievementAPI(achievement.id);
  
      // Pass both id and balance up
      onClaimed?.(achievement.id, result.newCoinBalance);
  
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to claim";
      Alert.alert("Oops", msg);
      console.error("Claim failed:", e?.response?.data || e);
    } finally {
      setClaiming(false);
    }
  };
  // Hide these when claim is available or already claimed
  const showProgressAndBadge = !canClaim && !alreadyClaimed;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        {achievement.imageUrl ? (
          <Image
            source={{ uri: achievement.imageUrl }} // Use the URL from backend
            style={styles.iconImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.iconFallback}>
            <Text style={styles.iconFallbackText}>🏅</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{achievement.name}</Text>
      <Text style={styles.description}>{achievement.description}</Text>

      {showProgressAndBadge && (
        <>
          {/* coin centered */}
          <View style={styles.coinRow}>
            <Image source={coinImg} style={styles.coinIcon} resizeMode="contain" />
            <Text style={styles.coinText}>{achievement.coinReward}</Text>
          </View>

          {/* progress bar with label on the right */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {achievement.progress}/{achievement.maxProgress}
            </Text>
          </View>
        </>
      )}

      {/* When complete & not claimed -> big Claim button */}
      {canClaim && (
        <TouchableOpacity
          style={[styles.claimPill, claiming && { opacity: 0.7 }]}
          onPress={handleClaim}
          disabled={claiming}
        >
          {claiming ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <Text style={styles.claimTextStrong}>Claim</Text>
              <View style={styles.claimCoinWrap}>
                <Image source={coinImg} style={styles.coinIcon} resizeMode="contain" />
                <Text style={styles.claimCoinValue}>{achievement.coinReward}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* After claimed -> show subtle "Claimed" pill (no bar/badge) */}
      {alreadyClaimed && (
        <View style={styles.claimedPill}>
          <Text style={styles.claimedText}>Claimed</Text>
        </View>
      )}
    </View>
  );
}
