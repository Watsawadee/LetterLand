import express from "express";
import {
  getAverageGamesByLevelPerPeriod,
  getUserGamesPlayedPerPeriod,
  getUserTotalPlaytime,
  getUserWordLearned,
} from "../controllers/dashboardController";
import { authenticatedUser } from "../middleware/authMiddleware";
const router = express.Router();
router.get("/user/:userId/playtime", authenticatedUser, getUserTotalPlaytime);
router.get("/user/:userId/wordlearned", authenticatedUser, getUserWordLearned);
router.get(
  "/user/:userId/gameplayedperperiod",
  authenticatedUser,
  getUserGamesPlayedPerPeriod
);

// router.get(
//   "/user/averagebylevel",
//   authenticatedUser,
//   getAverageGamesPlayedByLevel
// );
router.get("/average/eachperiod", authenticatedUser, getAverageGamesByLevelPerPeriod);

export default router;
