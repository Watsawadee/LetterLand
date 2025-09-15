import express from "express";
import {
  getAverageGamesPlayedByLevel,
  getUserGamesPlayedPerWeek,
  getUserTotalPlaytime,
  getUserWordLearned,
} from "../controllers/dashboardController";
import { authenticatedUser } from "../middleware/authMiddleware";
const router = express.Router();
router.get("/user/:userId/playtime", authenticatedUser, getUserTotalPlaytime);
router.get("/user/:userId/wordlearned", authenticatedUser, getUserWordLearned);
router.get(
  "/user/:userId/gameplayedperweek",
  authenticatedUser,
  getUserGamesPlayedPerWeek
);

router.get(
  "/user/:userId/averagebylevel",
  authenticatedUser,
  getAverageGamesPlayedByLevel
);

export default router;
