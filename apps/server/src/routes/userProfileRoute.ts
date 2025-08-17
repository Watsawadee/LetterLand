import express from "express";
import { getUserProfile } from "../controllers/getUserProfileController";
import { authenticatedUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me/profile", authenticatedUser, getUserProfile);
// router.put("/user/:userId/cefr/update", authenticatedUser);


export default router;
