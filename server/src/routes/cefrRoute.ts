import express from "express";
import { getUserCEFR } from "../controllers/getCEFRDefaultController";
import { authenticatedUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/user/:userId/cefr", authenticatedUser, getUserCEFR);

export default router;
