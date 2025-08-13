import { UserAchievement, AchievementCardProps } from '../types/achievementTypes';

export function mapUserAchievementToCard(ua: UserAchievement): AchievementCardProps {
  return {
    id: ua.id.toString(),
    title: ua.achievement.name,
    description: ua.achievement.description,
    coin: ua.achievement.coinReward,
    progress: ua.isCompleted ? 100 : 0,
    status: ua.isCompleted ? '1/1' : '0/1',
  };
}
