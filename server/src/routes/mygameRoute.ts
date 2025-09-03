import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import { getUserGames } from "../controllers/mygameController";

const router = express.Router();

router.get("/user/:userId/mygame", authenticatedUser, getUserGames);

export default router;