import { UserAchievement } from '../types/achievementTypes';

export const achievementMock: UserAchievement[] = [
  {
    id: 1,
    userId: 1,
    achievementId: 101,
    isCompleted: true,
    earnedAt: '2025-07-01T10:00:00Z',
    achievement: {
      id: 101,
      name: 'First Puzzle Solved',
      description: 'Complete your first game',
      coinReward: 10,
    },
  },
  {
    id: 2,
    userId: 1,
    achievementId: 102,
    isCompleted: true,
    earnedAt: '2025-07-03T10:00:00Z',
    achievement: {
      id: 102,
      name: 'Consistency',
      description: 'Continue playing for three days straight.',
      coinReward: 30,
    },
  },
  {
    id: 3,
    userId: 1,
    achievementId: 103,
    isCompleted: true,
    earnedAt: '2025-07-06T10:00:00Z',
    achievement: {
      id: 103,
      name: 'Hard Puzzle',
      description: 'Solve the difficult question',
      coinReward: 50,
    },
  },
];
