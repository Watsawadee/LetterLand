import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import { getUserWordBankUnique } from "../controllers/wordbankController";

const router = express.Router();
router.get("/user/:userId/wordbank", authenticatedUser, getUserWordBankUnique);
export default router;