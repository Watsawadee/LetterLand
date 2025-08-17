const express = require("express");
import { createGameFromGemini } from "../controllers/createGameFromGeminiController";
import { saveGameFromGemini } from "../controllers/saveGameFromGemini";
import multer from "multer";

const router = express.Router();
const upload = multer();


router.post("/gemini", upload.single("file"), createGameFromGemini);
router.post("/gemini/save", saveGameFromGemini);

export default router;
