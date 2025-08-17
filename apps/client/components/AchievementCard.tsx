import React from 'react';
import { View, Text } from 'react-native';
import { AchievementCardProps } from '../types/achievementTypes';
import { Typography } from '../theme/Font';
import { achievementCardStyles as styles } from '../theme/achievement';

export const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  coin,
  progress,
  status,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={Typography.header13}>{title}</Text>
        <Text style={Typography.body13}>{description}</Text>
        <Text style={styles.coin}>🪙 {coin}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};
