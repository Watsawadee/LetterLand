const express = require('express');
import { GeminiAPI } from '../controllers/geminiController';

const router = express.Router();

router.post('/gemini', GeminiAPI);

export default router;