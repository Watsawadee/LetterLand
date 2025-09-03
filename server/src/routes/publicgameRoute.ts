import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import { listPublicGames, startPublicGame } from "../controllers/publicgameController";

const router = express.Router();

router.get("/games", authenticatedUser, listPublicGames);
router.post("/games/:templateId/start", authenticatedUser, startPublicGame);

export default router;