import { Router } from "express";
import {
  getUserAchievements,
  getAchievementImage,
  getUserCoins,
  triggerAchievementCheck,
  claimAchievement,
} from "../controllers/achievementController";
import { authenticatedUser } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticatedUser, getUserAchievements);
router.get("/achievementimage/:fileName", getAchievementImage);
router.get("/coins", authenticatedUser, getUserCoins);
router.post("/:achievementId/claim", authenticatedUser, claimAchievement);
router.post("/check", authenticatedUser, triggerAchievementCheck);

export default router;
