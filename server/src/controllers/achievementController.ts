// server/src/controllers/achievementController.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../configs/db";
import axios from "axios";
import dotenv from "dotenv";
import { getFileFromDrive } from "../services/ggDriveService";
import { AuthenticatedRequest } from "../types/authenticatedRequest";


dotenv.config();
const ACHIEVEMENT_IMAGE_FOLDER_ID = process.env.ACHIEVEMENT_IMAGE_FOLDER_ID!;

interface AchievementProgress {
  id: number;
  name: string;
  description: string;
  coinReward: number;
  imageUrl: string | null;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  earnedAt: Date | null;
  isClaimed: boolean;
}

// helper to add params typing while keeping req.user from AuthenticatedRequest
type WithParams<P> = AuthenticatedRequest & { params: P };

enum AchievementType {
  FIRST_PUZZLE_SOLVED = "First Puzzle Solved",
  VOCABULARY_MASTER = "Vocabulary Master",
  PUZZLE_SOLVER = "Puzzle Solver",
}

/** Calculate live progress for each achievement type */
async function calculateAchievementProgress(
  userId: number,
  achievementType: AchievementType
): Promise<{ progress: number; maxProgress: number }> {
  switch (achievementType) {
    case AchievementType.FIRST_PUZZLE_SOLVED: {
      const completedGames = await prisma.game.count({
        where: { userId, isFinished: true },
      });
      return { progress: Math.min(completedGames, 1), maxProgress: 1 };
    }
    case AchievementType.VOCABULARY_MASTER: {
      const words = await prisma.wordFound.findMany({
        where: { userId },
        select: { word: true },
      });
      const unique = new Set(words.map((w) => w.word)).size;
      return { progress: unique, maxProgress: 10 };
    }
    case AchievementType.PUZZLE_SOLVER: {
      const totalCompleted = await prisma.game.count({
        where: { userId, isFinished: true },
      });
      return { progress: totalCompleted, maxProgress: 3 };
    }
    default:
      return { progress: 0, maxProgress: 1 };
  }
}

/** GET /achievement – list with progress + claim state */
export const getUserAchievements = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const achievements = await prisma.achievement.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        coinReward: true,
        imageUrl: true,
        userAchievements: {
          where: { userId },
          select: {
            isCompleted: true,
            earnedAt: true,
            isClaimed: true,
          },
        },
      },
    });

    const achievementsWithProgress: AchievementProgress[] = await Promise.all(
      achievements.map(async (achievement) => {
        const ua = achievement.userAchievements[0];
        const { progress, maxProgress } = await calculateAchievementProgress(
          userId,
          achievement.name as AchievementType
        );

        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          coinReward: achievement.coinReward,
          imageUrl: achievement.imageUrl,
          progress,
          maxProgress,
          isCompleted: ua?.isCompleted || false,
          earnedAt: ua?.isCompleted ? ua.earnedAt : null, // hide timestamp if not completed
          isClaimed: ua?.isClaimed ?? false,
        };
      })
    );

    res
      .status(200)
      .json({ message: "User achievements retrieved successfully", data: achievementsWithProgress });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
};

/** Internal helper: check/update completion (NO coin award here) */
export const checkAndUpdateAchievements = async (
  userId: number,
  achievementType?: AchievementType
): Promise<void> => {
  const whereClause = achievementType ? { name: achievementType } : {};
  const achievements = await prisma.achievement.findMany({
    where: whereClause,
    select: { id: true, name: true },
  });

  for (const achievement of achievements) {
    const { progress, maxProgress } = await calculateAchievementProgress(
      userId,
      achievement.name as AchievementType
    );
    const isCompleted = progress >= maxProgress;

    const existingUA = await prisma.userAchievement.findFirst({
      where: { userId, achievementId: achievement.id },
    });

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
          earnedAt: isCompleted ? new Date() : undefined, // (DB default may set now(); fine)
        },
      });
    }
  }
};

/** Middleware to check achievements after a request finishes */
export const checkAchievementsMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      setImmediate(() => {
        checkAndUpdateAchievements(userId).catch((e) =>
          console.error("Achievement middleware error:", e)
        );
      });
    }
  } catch (e) {
    console.error("Achievement middleware error:", e);
  } finally {
    next();
  }
};

/** POST /achievement/:achievementId/claim – award coins and mark claimed */
export const claimAchievement: RequestHandler<{ userId: string; achievementId: string }> = async (req, res) => {
  try {
    const authUserId = (req as AuthenticatedRequest).user?.id; // trusted from middleware
    const achievementId = Number(req.params.achievementId);

    if (!authUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!Number.isFinite(achievementId)) {
      res.status(400).json({ message: "Invalid achievementId" });
      return;
    }

    const ua = await prisma.userAchievement.findFirst({
      where: { userId: authUserId, achievementId },
      include: { achievement: { select: { coinReward: true } } },
    });

    if (!ua) {
      res.status(404).json({ message: "Achievement progress not found" });
      return;
    }
    if (!ua.isCompleted) {
      res.status(400).json({ message: "Achievement not completed yet" });
      return;
    }
    if (ua.isClaimed) {
      res.status(400).json({ message: "Already claimed" });
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: authUserId },
        data: { coin: { increment: ua.achievement.coinReward } },
      }),
      prisma.userAchievement.update({
        where: { id: ua.id },
        data: { isClaimed: true },
      }),
    ]);

    res.status(200).json({
      message: "Reward claimed",
      data: { achievementId, coinReward: ua.achievement.coinReward },
    });
    return;
  } catch (error) {
    console.error("Error claiming achievement:", error);
    res.status(500).json({ message: "Failed to claim achievement" });
  }
};

/** GET /achievement/image/:fileName – proxy Google Drive image */
export const getAchievementImage = async (req: Request, res: Response) => {
  const { fileName } = req.params;
  if (!fileName) {
    res.status(400).json({ message: "fileName is required" });
    return;
  }

  try {
    const file = await getFileFromDrive(fileName, ACHIEVEMENT_IMAGE_FOLDER_ID);
    if (!file) {
      res.status(404).json({ message: "Achievement image not found" });
      return;
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
    const response = await axios.get(downloadUrl, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", file.mimeType || "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(response.data);
  } catch (err) {
    console.error("Error fetching achievement image:", err);
    res.status(500).json({ message: "Failed to fetch achievement image" });
  }
};

/** GET /achievement/coins – current coins */
export const getUserCoins = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coin: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User coins retrieved successfully",
      data: { coins: user.coin || 0 },
    });
  } catch (error) {
    console.error("Error fetching user coins:", error);
    res.status(500).json({ message: "Failed to fetch user coins" });
  }
};

/** POST /achievement/check – manual trigger (useful for testing) */
export const triggerAchievementCheck = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await checkAndUpdateAchievements(userId);

    res.status(200).json({ message: "Achievement check completed successfully" });
  } catch (error) {
    console.error("Error triggering achievement check:", error);
    res.status(500).json({ message: "Failed to check achievements" });
  }
};
