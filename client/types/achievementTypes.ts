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
  isClaimed?: boolean;
  claimedAt?: string | null;
}

export interface AchievementResponse {
  message: string;
  data: Achievement[];
}
