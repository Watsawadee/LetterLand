import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import { updateUserSetting } from "../controllers/settingController";
const router = express.Router();
router.put("/updateUserProfile", authenticatedUser, updateUserSetting);

export default router;