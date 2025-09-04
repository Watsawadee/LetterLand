import prisma from "../configs/db";

export class AchievementService {
  static async onGameCompleted(userId: number, gameId: number): Promise<void> {
    try {
      await this.checkFirstPuzzleSolved(userId);
      await this.checkPuzzleSolver(userId);
      console.log(`Achievement check completed for user ${userId} after game ${gameId}`);
    } catch (error) {
      console.error("Error in onGameCompleted achievement check:", error);
    }
  }

  static async onWordFound(userId: number, word: string): Promise<void> {
    try {
      await this.checkVocabularyMaster(userId);
      console.log(`Achievement check completed for user ${userId} after finding word: ${word}`);
    } catch (error) {
      console.error("Error in onWordFound achievement check:", error);
    }
  }

  private static async checkFirstPuzzleSolved(userId: number): Promise<void> {
    const achievement = await prisma.achievement.findFirst({
      where: { name: "First Puzzle Solved" },
    });
    if (!achievement) return;

    const existingUA = await prisma.userAchievement.findFirst({
      where: { userId, achievementId: achievement.id },
    });

    const completedGamesCount = await prisma.game.count({
      where: { userId, isFinished: true },
    });
    const isCompleted = completedGamesCount >= 1;

    if (existingUA) {
      if (isCompleted && !existingUA.isCompleted) {
        await prisma.userAchievement.update({
          where: { id: existingUA.id },
          data: {
            isCompleted: true,
            // If you make earnedAt nullable (recommended), set it here:
            earnedAt: new Date(),
            // do NOT set isClaimed here; it stays false until user claims
          },
        });
      }
    } else {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          isCompleted,
          // If earnedAt is nullable (recommended), set only when completed:
          earnedAt: isCompleted ? new Date() : undefined,
          // isClaimed defaults to false – no need to set it
        },
      });
    }
  }

  private static async checkPuzzleSolver(userId: number): Promise<void> {
    const achievement = await prisma.achievement.findFirst({
      where: { name: "Puzzle Solver" },
    });
    if (!achievement) return;

    const existingUA = await prisma.userAchievement.findFirst({
      where: { userId, achievementId: achievement.id },
    });

    const completedGamesCount = await prisma.game.count({
      where: { userId, isFinished: true },
    });
    const isCompleted = completedGamesCount >= 3;

    if (existingUA) {
      if (isCompleted && !existingUA.isCompleted) {
        await prisma.userAchievement.update({
          where: { id: existingUA.id },
          data: {
            isCompleted: true,
            earnedAt: new Date(),
          },
        });
      }
    } else {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          isCompleted,
          earnedAt: isCompleted ? new Date() : undefined,
        },
      });
    }
  }

  private static async checkVocabularyMaster(userId: number): Promise<void> {
    const achievement = await prisma.achievement.findFirst({
      where: { name: "Vocabulary Master" },
    });
    if (!achievement) return;

    const existingUA = await prisma.userAchievement.findFirst({
      where: { userId, achievementId: achievement.id },
    });

    const words = await prisma.wordFound.findMany({
      where: { userId },
      select: { word: true },
    });
    const uniqueCount = new Set(words.map((w) => w.word)).size;
    const isCompleted = uniqueCount >= 10;

    if (existingUA) {
      if (isCompleted && !existingUA.isCompleted) {
        await prisma.userAchievement.update({
          where: { id: existingUA.id },
          data: {
            isCompleted: true,
            earnedAt: new Date(),
          },
        });
      }
    } else {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          isCompleted,
          earnedAt: isCompleted ? new Date() : undefined,
        },
      });
    }
  }

  // ⬇️ Deprecated in the "claim to get coins" design; no longer used.
  // Keeping it here is harmless, but it's not called by checkers anymore.
  private static async awardCoins(userId: number, coinAmount: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { coin: { increment: coinAmount } },
    });
    console.log(`Awarded ${coinAmount} coins to user ${userId}`);
  }

  static async getUserAchievementStats(userId: number) {
    const totalAchievements = await prisma.achievement.count();

    const completedAchievements = await prisma.userAchievement.count({
      where: { userId, isCompleted: true },
    });

    // ⬇️ Change to isClaimed to reflect actually granted coins
    const claimedData = await prisma.userAchievement.findMany({
      where: { userId, isClaimed: true },
      include: { achievement: { select: { coinReward: true } } },
    });

    const totalCoinsEarned = claimedData.reduce(
      (sum, ua) => sum + ua.achievement.coinReward,
      0
    );

    const completionRate =
      totalAchievements > 0
        ? (completedAchievements / totalAchievements) * 100
        : 0;

    return {
      totalAchievements,
      completedAchievements,
      totalCoinsEarned,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }
}
