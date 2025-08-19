import express from "express";
import { setupProfile, getWords } from "../controllers/setupProfileController";

const router = express.Router();

router.post("/setup-profile", setupProfile);
router.get("/getwords", getWords)

export default router;
