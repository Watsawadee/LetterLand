import express from 'express';
import { genImageAPI } from '../controllers/genImageController';
const router = express.Router();

router.post('/genimage', genImageAPI);

export default router;
