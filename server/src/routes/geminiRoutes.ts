const express = require("express");
import { GeminiAPI } from "../controllers/geminiController";
import { saveGameFromGemini } from "../controllers/saveGameFromGemini";
import multer from "multer";

const router = express.Router();
const upload = multer();


router.post("/gemini", upload.single("file"), GeminiAPI);
router.post("/gemini/save", saveGameFromGemini);

export default router;
