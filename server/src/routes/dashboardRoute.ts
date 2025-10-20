import express from "express";
import {
  getAverageGamesByLevelPerPeriod,
  getUserGamesPlayedMultiplePeriod,
  getUserGameStreak,
  getUserProgress,
  getUserTotalPlaytime,
  getUserWordLearned,
} from "../controllers/dashboardController";
import { authenticatedUser } from "../middleware/authMiddleware";
const router = express.Router();
router.get("/user/:userId/playtime", authenticatedUser, getUserTotalPlaytime);
router.get("/user/:userId/wordlearned", authenticatedUser, getUserWordLearned);
router.get(
  "/user/:userId/gameplayedmultipleperiod",
  authenticatedUser,
  getUserGamesPlayedMultiplePeriod
);

router.get("/user/gameplayedstreak", authenticatedUser, getUserGameStreak);

// router.get(
//   "/user/averagebylevel",
//   authenticatedUser,
//   getAverageGamesPlayedByLevel
// );
router.get("/average/eachperiod", authenticatedUser, getAverageGamesByLevelPerPeriod);

router.get("/user/gameprogress", authenticatedUser, getUserProgress)

export default router;
