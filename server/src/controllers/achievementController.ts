import { Request, Response, NextFunction } from "express";
import prisma from "../configs/db";
import axios from "axios";
import dotenv from "dotenv";
import { getFileFromDrive } from "../services/ggDriveService";
import { AuthenticatedRequest } from "../types/authenticatedRequest";

dotenv.config();
const ACHIEVEMENT_IMAGE_FOLDERID = process.env.ACHIEVEMENT_IMAGE_FOLDERID!;

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
  rank: number;
}

// Use this any time you need typed params together with your AuthenticatedRequest
type WithParams<P> = AuthenticatedRequest & { params: P };

/* ----------------------------- Ranking & Rules ---------------------------- */
type Metric = "TOTAL_FINISHED" | "UNIQUE_WORDS" | "EXTRA_WORDS" | "FINISHED_BY_TYPE";
type Rule = {
  name: string;
  descriptionStartsWith: string;
  metric: Metric;
  goal: number;
  rank: number;
  gameType?: "WORD_SEARCH" | "CROSSWORD_SEARCH";
};

const RULES: Rule[] = [
  { name: "First Puzzle Solved", descriptionStartsWith: "Welcome", metric: "TOTAL_FINISHED", goal: 1, rank: 1 },
  { name: "Curious Finder", descriptionStartsWith: "Find your first extra", metric: "EXTRA_WORDS", goal: 1, rank: 2 },
  { name: "Bonus Hunter", descriptionStartsWith: "Find 5 extra", metric: "EXTRA_WORDS", goal: 5, rank: 3 },
  { name: "Puzzle Solver", descriptionStartsWith: "Complete 3", metric: "TOTAL_FINISHED", goal: 3, rank: 4 },


  { name: "Vocabulary Master", descriptionStartsWith: "Learn 10", metric: "UNIQUE_WORDS", goal: 10, rank: 4 },
  { name: "Puzzle Solver", descriptionStartsWith: "Complete 5", metric: "TOTAL_FINISHED", goal: 5, rank: 5 },
  { name: "Word Explorer", descriptionStartsWith: "Find 20 extra", metric: "EXTRA_WORDS", goal: 20, rank: 6 },

  { name: "Puzzle Expert", descriptionStartsWith: "Complete 15", metric: "TOTAL_FINISHED", goal: 15, rank: 7 },
  { name: "Crossword Beginner", descriptionStartsWith: "Finish your first crossword", metric: "FINISHED_BY_TYPE", goal: 1, rank: 8, gameType: "CROSSWORD_SEARCH" },
  { name: "Wordsearch Beginner", descriptionStartsWith: "Finish your first word search", metric: "FINISHED_BY_TYPE", goal: 1, rank: 9, gameType: "WORD_SEARCH" },

  { name: "Hidden Word Master", descriptionStartsWith: "Find 50 extra", metric: "EXTRA_WORDS", goal: 50, rank: 10 },
  { name: "Vocabulary Collector", descriptionStartsWith: "Find 40", metric: "UNIQUE_WORDS", goal: 40, rank: 11 },
  { name: "Puzzle Master", descriptionStartsWith: "Complete 30", metric: "TOTAL_FINISHED", goal: 30, rank: 12 },
  { name: "Crossword Solver", descriptionStartsWith: "Finish 10 crossword", metric: "FINISHED_BY_TYPE", goal: 10, rank: 13, gameType: "CROSSWORD_SEARCH" },
  { name: "Wordsearch Solver", descriptionStartsWith: "Finish 10 word search", metric: "FINISHED_BY_TYPE", goal: 10, rank: 14, gameType: "WORD_SEARCH" },

  { name: "Lexicon Legend", descriptionStartsWith: "Find 100", metric: "UNIQUE_WORDS", goal: 100, rank: 15 },
  { name: "Super Vocabulary", descriptionStartsWith: "Find 200", metric: "UNIQUE_WORDS", goal: 200, rank: 16 },
  { name: "Puzzle Super", descriptionStartsWith: "Complete 50", metric: "TOTAL_FINISHED", goal: 50, rank: 17 },
  { name: "Crossword Prodigy", descriptionStartsWith: "Finish 20 crossword", metric: "FINISHED_BY_TYPE", goal: 20, rank: 18, gameType: "CROSSWORD_SEARCH" },
  { name: "Wordsearch Prodigy", descriptionStartsWith: "Finish 20 word search", metric: "FINISHED_BY_TYPE", goal: 20, rank: 19, gameType: "WORD_SEARCH" },
];

/* ----------------------------- Helper Functions ---------------------------- */
function findRule(name: string, description: string | null | undefined): Rule | undefined {
  const d = (description ?? "").trim();
  return RULES.find(r => r.name === name && d.startsWith(r.descriptionStartsWith));
}

async function countFinishedAll(userId: number) {
  return prisma.game.count({ where: { userId, isFinished: true } });
}
async function countFinishedByType(userId: number, gameType: "WORD_SEARCH" | "CROSSWORD_SEARCH") {
  return prisma.game.count({ where: { userId, isFinished: true, gameType } });
}
async function countUniqueWords(userId: number) {
  const rows = await prisma.wordFound.findMany({ where: { userId }, select: { word: true } });
  return new Set(rows.map(r => r.word)).size;
}
async function countExtraWords(userId: number) {
  return prisma.extraWordFound.count({ where: { userId } });
}

async function calculateByRule(userId: number, rule: Rule): Promise<{ progress: number; maxProgress: number }> {
  switch (rule.metric) {
    case "TOTAL_FINISHED":
      return { progress: await countFinishedAll(userId), maxProgress: rule.goal };
    case "UNIQUE_WORDS":
      return { progress: await countUniqueWords(userId), maxProgress: rule.goal };
    case "EXTRA_WORDS":
      return { progress: await countExtraWords(userId), maxProgress: rule.goal };
    case "FINISHED_BY_TYPE":
      return { progress: await countFinishedByType(userId, rule.gameType!), maxProgress: rule.goal };
    default:
      return { progress: 0, maxProgress: 1 };
  }
}

export const getAllAchievements = async (userId: number) => {
  const achievements = await prisma.achievement.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      coinReward: true,
      imageUrl: true,
      userAchievements: { where: { userId }, select: { isCompleted: true, earnedAt: true, isClaimed: true } },
    },
  });

  const enriched: AchievementProgress[] = await Promise.all(
    achievements.map(async (a) => {
      const ua = a.userAchievements[0];
      const rule = findRule(a.name, a.description);
      let progress = 0, maxProgress = 1, rank = 9999;
      if (rule) {
        const p = await calculateByRule(userId, rule);
        progress = p.progress;
        maxProgress = p.maxProgress;
        rank = rule.rank;
      }
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        coinReward: a. coinReward,
        imageUrl: a.imageUrl,
        progress,
        maxProgress,
        isCompleted: !!ua?.isCompleted,
        earnedAt: ua?.isCompleted ? ua.earnedAt : null,
        isClaimed: !!ua?.isClaimed,
        rank,
      };
    })
  );

  return enriched.sort((a, b) => a.rank - b.rank);
};

/* ------------------------------- API HANDLERS ------------------------------ */

// matches: router.get("/", authenticatedUser, getUserAchievements);
export const getUserAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const data = await getAllAchievements(userId);
    res.status(200).json({ message: "Achievements retrieved", data });
  } catch (err) {
    console.error("getUserAchievements error:", err);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
};

// matches: router.get("/coins", authenticatedUser, getUserCoins);
export const getUserCoins = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { coin: true } });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User coins", data: { coins: user.coin || 0 } });
  } catch (err) {
    console.error("getUserCoins error:", err);
    res.status(500).json({ message: "Failed to fetch user coins" });
  }
};

// matches: router.post("/check", authenticatedUser, triggerAchievementCheck);
export const triggerAchievementCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const all = await getAllAchievements(userId);

    for (const a of all) {
      const shouldBeCompleted = a.progress >= a.maxProgress;
      const existing = await prisma.userAchievement.findFirst({
        where: { userId, achievementId: a.id },
      });

      if (existing) {
        if (shouldBeCompleted && !existing.isCompleted) {
          await prisma.userAchievement.update({
            where: { id: existing.id },
            data: { isCompleted: true, earnedAt: new Date() },
          });
        }
      } else {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: a.id,
            isCompleted: shouldBeCompleted,
            earnedAt: shouldBeCompleted ? new Date() : undefined,
          },
        });
      }
    }

    res.status(200).json({ message: "Achievements checked" });
  } catch (err) {
    console.error("triggerAchievementCheck error:", err);
    res.status(500).json({ message: "Failed to check achievements" });
  }
};

// matches: router.post("/:achievementId/claim", authenticatedUser, claimAchievement);
export const claimAchievement = async (req: WithParams<{ achievementId: string }>, res: Response) => {
  try {
    const userId = req.user?.id;
    const achievementId = Number(req.params.achievementId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!Number.isFinite(achievementId)) return res.status(400).json({ message: "Invalid achievementId" });

    const ua = await prisma.userAchievement.findFirst({
      where: { userId, achievementId },
      include: { achievement: { select: { coinReward: true } } },
    });

    if (!ua) return res.status(404).json({ message: "Achievement progress not found" });
    if (!ua.isCompleted) return res.status(400).json({ message: "Achievement not completed yet" });
    if (ua.isClaimed) return res.status(400).json({ message: "Already claimed" });

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coin: { increment: ua.achievement.coinReward } },
        select: { coin: true },
      }),
      prisma.userAchievement.update({
        where: { id: ua.id },
        data: { isClaimed: true },
      }),
    ]);

    res.status(200).json({
      message: "Reward claimed",
      data: {
        achievementId,
        coinReward: ua.achievement.coinReward,
        newCoinBalance: updatedUser.coin,
      },
    });
  } catch (err) {
    console.error("claimAchievement error:", err);
    res.status(500).json({ message: "Failed to claim achievement" });
  }
};

// matches: router.get("/achievementimage/:fileName", getAchievementImage);
export const getAchievementImage = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    if (!fileName) return res.status(400).json({ message: "fileName is required" });

    const file = await getFileFromDrive(fileName, ACHIEVEMENT_IMAGE_FOLDERID);
    if (!file) return res.status(404).json({ message: "Image not found" });

    const response = await axios.get(`https://drive.google.com/uc?export=download&id=${file.id}`, { responseType: "arraybuffer" });
    res.setHeader("Content-Type", file.mimeType || "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(response.data);
  } catch (err) {
    console.error("getAchievementImage error:", err);
    res.status(500).json({ message: "Failed to fetch image" });
  }
};
