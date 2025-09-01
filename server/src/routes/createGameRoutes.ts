import { createGameFromGemini } from "../controllers/createGameController";
import express from "express"
import multer from "multer";

const router = express.Router();
const upload = multer();


router.post("/gemini", createGameFromGemini);
router.post("/gemini/pdf", upload.single("file"), createGameFromGemini);

export default router;
