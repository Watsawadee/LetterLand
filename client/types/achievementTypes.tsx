export interface Achievement {
    id: number;
    name: string;
    description: string;
    coinReward: number;
  }
  
  export interface UserAchievement {
    id: number;
    userId: number;
    achievementId: number;
    isCompleted: boolean;
    earnedAt: string | null;
    achievement: Achievement;
  }
  
  export interface AchievementCardProps {
    id: string;
    title: string;
    description: string;
    coin: number;
    progress: number; // in percent (e.g. 100)
    status: string;   // e.g., "1/1"
  }
  