// types/achievementTypes.ts
export interface Achievement {
  id: number;
  name: string;
  description: string;
  coinReward: number;
  imageUrl: string | null;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  earnedAt: string | null;
  isClaimed: boolean;     // <- always present
  claimedAt?: string | null;
  rank?: number;          // <- backend may send this
}

export interface AchievementResponse {
  message: string;
  data: Achievement[];
}
